import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { SEED_VEHICLES } from '../data/seedVehicles';

function resolveImage(photo) {
  const path = photo?.storage_path;
  if (!path) return '/images/vehicles/ioniq-5.jpg';
  if (path.startsWith('/') || path.startsWith('http')) return path;
  return supabase.storage.from('vehicle-images').getPublicUrl(path).data.publicUrl;
}

function toVehicle(row) {
  const photos = [...(row.vehicle_photos || [])].sort((a, b) => Number(b.is_primary) - Number(a.is_primary) || a.sort_order - b.sort_order);
  return {
    id: row.id,
    hostId: row.host_id,
    name: `${row.make} ${row.model}`,
    make: row.make,
    model: row.model,
    year: row.year,
    location: row.location_name,
    distance: row.distance_label || '거리 계산 중',
    coords: [Number(row.latitude), Number(row.longitude)],
    pricePerHour: Number(row.price_per_hour),
    depositAmount: Number(row.deposit_amount),
    status: row.status,
    image: resolveImage(photos[0]),
    tags: [row.fuel_type === 'electric' ? '전기' : row.fuel_type, `${row.seat_count}인승`],
    isDemo: Boolean(row.is_demo),
  };
}

export async function listVehicles() {
  if (!isSupabaseConfigured) return { vehicles: SEED_VEHICLES, source: 'seed' };

  const { data, error } = await supabase
    .from('vehicles')
    .select('id,host_id,status,make,model,year,seat_count,fuel_type,price_per_hour,deposit_amount,location_name,latitude,longitude,is_demo,vehicle_photos(storage_path,is_primary,sort_order)')
    .in('status', ['available', 'rented'])
    .order('created_at', { ascending: false });

  if (error) throw error;
  return { vehicles: data.map(toVehicle), source: 'supabase' };
}

const STATUS_LABEL = {
  draft: '등록 대기', pending_review: '검토 중', available: '대여 가능',
  reserved: '예약됨', rented: '대여 중', maintenance: '점검 중', inactive: '비활성',
};

export async function listMyVehicles(userId) {
  if (!supabase || !userId) return [];
  const { data, error } = await supabase
    .from('vehicles')
    .select('id,make,model,status,price_per_hour,location_name,vehicle_photos(storage_path,is_primary,sort_order)')
    .eq('host_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data.map(row => {
    const photos = [...(row.vehicle_photos || [])].sort((a, b) => Number(b.is_primary) - Number(a.is_primary));
    return {
      id: row.id,
      name: `${row.make} ${row.model}`,
      location: row.location_name,
      pricePerHour: Number(row.price_per_hour),
      status: row.status,
      statusLabel: STATUS_LABEL[row.status] || row.status,
      image: resolveImage(photos[0]),
    };
  });
}

async function sha256(value) {
  const bytes = new TextEncoder().encode(value.trim().toUpperCase());
  const digest = await window.crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, '0')).join('');
}

function maskPlateNumber(value) {
  const normalized = value.replace(/\s/g, '');
  if (normalized.length < 4) return '****';
  return `${normalized.slice(0, 2)}**${normalized.slice(-2)}`;
}

function imageExtension(file) {
  const byType = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };
  return byType[file.type] || 'jpg';
}

export async function createVehicle({ userId, vehicle, imageFile }) {
  if (!supabase || !isSupabaseConfigured) throw new Error('Supabase 연결이 필요합니다.');
  if (!userId) throw new Error('로그인이 필요합니다.');
  if (!imageFile) throw new Error('대표 차량 사진을 추가해주세요.');

  const vehicleId = window.crypto.randomUUID();
  const storagePath = `${userId}/${vehicleId}/primary.${imageExtension(imageFile)}`;
  let imageUploaded = false;
  let vehicleCreated = false;

  try {
    const { error: uploadError } = await supabase.storage
      .from('vehicle-images')
      .upload(storagePath, imageFile, { contentType: imageFile.type, upsert: false });
    if (uploadError) throw uploadError;
    imageUploaded = true;

    const payload = {
      id: vehicleId,
      host_id: userId,
      status: 'available',
      vin_hash: await sha256(vehicle.vin),
      plate_number_masked: maskPlateNumber(vehicle.plateNumber),
      make: vehicle.make.trim(),
      model: vehicle.model.trim(),
      year: Number(vehicle.year),
      seat_count: Number(vehicle.seats),
      fuel_type: vehicle.fuelType,
      price_per_hour: Number(vehicle.pricePerHour),
      deposit_amount: Number(vehicle.depositAmount),
      location_name: vehicle.location.trim(),
      latitude: Number(vehicle.latitude),
      longitude: Number(vehicle.longitude),
    };

    const { data, error: vehicleError } = await supabase
      .from('vehicles')
      .insert(payload)
      .select('id, make, model, status')
      .single();
    if (vehicleError) throw vehicleError;
    vehicleCreated = true;

    const { error: photoError } = await supabase.from('vehicle_photos').insert({
      vehicle_id: vehicleId,
      storage_path: storagePath,
      is_primary: true,
      sort_order: 0,
    });
    if (photoError) throw photoError;

    return data;
  } catch (error) {
    if (vehicleCreated) await supabase.from('vehicles').delete().eq('id', vehicleId);
    if (imageUploaded) await supabase.storage.from('vehicle-images').remove([storagePath]);
    if (error.code === '23505') throw new Error('이미 등록된 차량이거나 지갑 정보가 중복되었습니다.');
    throw error;
  }
}
