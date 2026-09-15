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
      name: `${row.vehicles?.make || ''} ${row.vehicles?.model || ''}`.trim(),
      location: row.vehicles?.location_name,
      image: imageUrl(photos[0]?.storage_path),
    },
  };
}

export async function createBooking({ userId, vehicle, startDate, endDate, insurance, pickupType = 'self' }) {
  if (!supabase || !userId) throw new Error('로그인이 필요합니다.');

  const hours = Math.ceil((new Date(endDate) - new Date(startDate)) / 3600000);
  if (hours <= 0) throw new Error('대여 시간을 확인해주세요.');

  const { data: plan, error: planError } = await supabase
    .from('insurance_plans')
    .select('id, fee')
    .eq('code', insurance.key)
    .single();
  if (planError) throw planError;

  const { data, error } = await supabase
    .from('bookings')
    .insert({
      vehicle_id: vehicle.id,
      renter_id: userId,
      insurance_plan_id: plan.id,
      status: 'pending',
      starts_at: new Date(startDate).toISOString(),
      ends_at: new Date(endDate).toISOString(),
      rental_fee: hours * vehicle.pricePerHour,
      insurance_fee: Number(plan.fee),
      deposit_amount: Number(vehicle.depositAmount || 0),
      pickup_type: pickupType,
    })
    .select('id,status,starts_at,ends_at,rental_fee,insurance_fee,deposit_amount,total_amount')
    .single();

  if (error?.code === '23P01') throw new Error('선택한 시간에 이미 예약이 있어요. 다른 시간을 선택해주세요.');
  if (error) throw error;
  return data;
}

export async function listMyBookings(userId) {
  if (!supabase || !userId) return [];
  const { data, error } = await supabase
    .from('bookings')
    .select('id,status,starts_at,ends_at,rental_fee,insurance_fee,deposit_amount,total_amount,pickup_type,insurance_plans(name),vehicles(id,make,model,location_name,vehicle_photos(storage_path,is_primary))')
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
