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
  };
}

export async function listVehicles() {
  if (!isSupabaseConfigured) return { vehicles: SEED_VEHICLES, source: 'seed' };

  const { data, error } = await supabase
    .from('vehicles')
    .select('id,host_id,status,make,model,year,seat_count,fuel_type,price_per_hour,deposit_amount,location_name,latitude,longitude,vehicle_photos(storage_path,is_primary,sort_order)')
    .in('status', ['available', 'rented'])
    .order('created_at', { ascending: false });

  if (error) throw error;
  return { vehicles: data.map(toVehicle), source: 'supabase' };
}
