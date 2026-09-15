import { supabase } from '../lib/supabase';

function imageUrl(path) {
  if (!path) return '/images/vehicles/ioniq-5.jpg';
  if (path.startsWith('/') || path.startsWith('http')) return path;
  return supabase.storage.from('vehicle-images').getPublicUrl(path).data.publicUrl;
}

function mapBooking(row) {
  const photos = [...(row.vehicles?.vehicle_photos || [])].sort((a, b) => Number(b.is_primary) - Number(a.is_primary));
  return {
    id: row.id,
    status: row.status,
    startDate: row.starts_at,
    endDate: row.ends_at,
    rentalFee: Number(row.rental_fee),
    insuranceFee: Number(row.insurance_fee),
    depositAmount: Number(row.deposit_amount),
    totalAmount: Number(row.total_amount),
    pickupType: row.pickup_type,
    insuranceName: row.insurance_plans?.name || '보험 없음',
    vehicle: {
      id: row.vehicles?.id,
      hostId: row.vehicles?.host_id || null,
      name: `${row.vehicles?.make || ''} ${row.vehicles?.model || ''}`.trim(),
      location: row.vehicles?.location_name,
      image: imageUrl(photos[0]?.storage_path),
    },
  };
}

/// 차주의 기본 지갑 주소를 찾음. 데모 차량(host_id 없음)이거나 차주가 아직 지갑을
/// 연결 안 한 경우 null을 반환 — 호출하는 쪽에서 플랫폼 지갑으로 대체해야 함 (해커톤 MVP 간소화).
export async function getHostWalletAddress(hostId) {
  if (!supabase || !hostId) return null;
  const { data, error } = await supabase
    .from('wallets')
    .select('address')
    .eq('user_id', hostId)
    .eq('is_primary', true)
    .maybeSingle();
  if (error) throw error;
  return data?.address || null;
}

/// 온체인 예치(RentalEscrow.deposit)가 이미 성공한 뒤 호출하는 함수.
/// `id`는 온체인 bookingId로 쓴 것과 같은 UUID를 그대로 넘겨서 bookings.id로 씀 (연결고리 유지).
/// txHash가 있으면 payments row도 같이 남김.
/// 간소화: 호스트 승인 단계 없이 바로 status='confirmed'로 생성하고,
/// rental/insurance/deposit을 나눠서 기록해야 하는 payments도 지금은 kind='rental' 한 건으로 합쳐서 기록함
/// (원래 스키마는 kind별로 나누게 되어있음 — 시간 없어서 스킵, HANDOFF에 기록).
export async function createBooking({ id, userId, vehicle, startDate, endDate, insurance, txHash, pickupType = 'self' }) {
  if (!supabase || !userId) throw new Error('로그인이 필요합니다.');

  const hours = Math.ceil((new Date(endDate) - new Date(startDate)) / 3600000);
  if (hours <= 0) throw new Error('대여 시간을 확인해주세요.');

  const { data: plan, error: planError } = await supabase
    .from('insurance_plans')
    .select('id, fee')
    .eq('code', insurance.key)
    .single();
  if (planError) throw planError;

  const rentalFee = hours * vehicle.pricePerHour;
  const insuranceFee = Number(plan.fee);
  const depositAmount = Number(vehicle.depositAmount || 0);

  const { data, error } = await supabase
    .from('bookings')
    .insert({
      ...(id ? { id } : {}),
      vehicle_id: vehicle.id,
      renter_id: userId,
      insurance_plan_id: plan.id,
      status: txHash ? 'confirmed' : 'pending',
      starts_at: new Date(startDate).toISOString(),
      ends_at: new Date(endDate).toISOString(),
      rental_fee: rentalFee,
      insurance_fee: insuranceFee,
      deposit_amount: depositAmount,
      pickup_type: pickupType,
    })
    .select('id,status,starts_at,ends_at,rental_fee,insurance_fee,deposit_amount,total_amount')
    .single();

  if (error?.code === '23P01') throw new Error('선택한 시간에 이미 예약이 있어요. 다른 시간을 선택해주세요.');
  if (error) throw error;

  if (txHash) {
    const { error: paymentError } = await supabase.from('payments').insert({
      booking_id: data.id,
      payer_id: userId,
      kind: 'rental',
      status: 'escrowed',
      amount: rentalFee + insuranceFee + depositAmount,
      chain_id: 1001,
      tx_hash: txHash,
    });
    // 온체인 예치는 이미 성공했는데 여기서 실패하면 돈은 묶여있고 기록만 안 남는 상태가 됨.
    // 시간 없어서 재시도/알림 처리는 안 붙였고, 실패해도 예약 자체는 막지 않음 (HANDOFF 참고).
    if (paymentError) console.error('payments insert 실패 (예치는 성공함):', paymentError);
  }

  return data;
}

export async function listMyBookings(userId) {
  if (!supabase || !userId) return [];
  const { data, error } = await supabase
    .from('bookings')
    .select('id,status,starts_at,ends_at,rental_fee,insurance_fee,deposit_amount,total_amount,pickup_type,insurance_plans(name),vehicles(id,host_id,make,model,location_name,vehicle_photos(storage_path,is_primary))')
    .eq('renter_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data.map(mapBooking);
}

export async function cancelBooking(bookingId) {
  const { error } = await supabase
    .from('bookings')
    .update({ status: 'cancelled' })
    .eq('id', bookingId)
    .eq('status', 'pending');
  if (error) throw error;
}

/// 픽업 완료 — 렌터가 셀프로 "이용 시작" 누르면 호출 (호스트 승인 단계 없는 MVP 간소화 버전)
export async function startBooking(bookingId) {
  if (!supabase) return;
  const { error } = await supabase.from('bookings').update({ status: 'active' }).eq('id', bookingId);
  if (error) throw error;
}

/// 반납 완료 — 온체인 release() 성공 후 호출
export async function completeBooking(bookingId) {
  if (!supabase) return;
  const { error } = await supabase.from('bookings').update({ status: 'completed' }).eq('id', bookingId);
  if (error) throw error;
}

/// 온체인 release() 성공 후, 그 결과(Released 이벤트 값)를 settlements에 기록.
/// 렌터(반납 버튼을 누른 사람)가 기록하는 구조라 RLS에서 booking의 renter_id/vehicle의 host_id를
/// 대조해서 검증함 (202609150006 마이그레이션). 데모 차량처럼 host가 없는 경우엔 호출하는 쪽에서
/// 애초에 부르지 않으면 됨 — host_id가 not null 제약이라 여기서도 막힘.
export async function recordSettlement({ bookingId, hostId, grossAmount, platformFee, txHash }) {
  if (!supabase || !hostId) return;
  const { error } = await supabase.from('settlements').insert({
    booking_id: bookingId,
    host_id: hostId,
    gross_amount: grossAmount,
    platform_fee: platformFee,
    status: 'completed',
    tx_hash: txHash,
    settled_at: new Date().toISOString(),
  });
  // 정산 자체(온체인 송금)는 이미 끝났고 이건 기록용이라, 실패해도 반납 흐름 자체를 막지 않음.
  if (error) console.error('settlements insert 실패 (온체인 정산은 이미 완료됨):', error);
}

export async function listMyEarnings(userId) {
  if (!supabase || !userId) return [];
  const { data, error } = await supabase
    .from('settlements')
    .select('id,gross_amount,platform_fee,host_amount,status,tx_hash,settled_at,bookings(starts_at,vehicles(make,model))')
    .eq('host_id', userId)
    .order('settled_at', { ascending: false });
  if (error) throw error;
  return data.map(row => ({
    id: row.id,
    vehicleName: `${row.bookings?.vehicles?.make || ''} ${row.bookings?.vehicles?.model || ''}`.trim() || '차량 정보 없음',
    rentedAt: row.bookings?.starts_at,
    grossAmount: Number(row.gross_amount),
    platformFee: Number(row.platform_fee),
    hostAmount: Number(row.host_amount),
    status: row.status,
    txHash: row.tx_hash,
    settledAt: row.settled_at,
  }));
}
