alter table public.vehicles alter column host_id drop not null;
alter table public.vehicles add column is_demo boolean not null default false;

insert into public.vehicles (
  id, host_id, status, vin_hash, plate_number_masked, make, model, year, seat_count,
  fuel_type, price_per_hour, deposit_amount, location_name, latitude, longitude, is_demo
) values
  ('00000000-0000-4000-8000-000000000001', null, 'available', 'demo-vin-001', '12**01', '현대', '아이오닉 5', 2025, 5, 'electric', 15000, 100000, '서울 강남구 역삼동', 37.500700, 127.036500, true),
  ('00000000-0000-4000-8000-000000000002', null, 'available', 'demo-vin-002', '12**02', '기아', 'EV6', 2025, 5, 'electric', 18000, 100000, '서울 강남구 논현동', 37.508800, 127.030200, true),
  ('00000000-0000-4000-8000-000000000003', null, 'rented', 'demo-vin-003', '12**03', '테슬라', '모델 3', 2024, 5, 'electric', 25000, 150000, '서울 송파구 잠실동', 37.513300, 127.100100, true),
  ('00000000-0000-4000-8000-000000000004', null, 'available', 'demo-vin-004', '12**04', 'BMW', 'iX3', 2024, 5, 'electric', 30000, 200000, '서울 서초구 서초동', 37.492400, 127.029000, true),
  ('00000000-0000-4000-8000-000000000005', null, 'available', 'demo-vin-005', '12**05', '볼보', 'EX40', 2025, 5, 'electric', 22000, 150000, '서울 강남구 삼성동', 37.511200, 127.059800, true),
  ('00000000-0000-4000-8000-000000000006', null, 'rented', 'demo-vin-006', '12**06', '포르쉐', '타이칸', 2024, 4, 'electric', 55000, 300000, '서울 용산구 한남동', 37.534500, 127.000000, true),
  ('00000000-0000-4000-8000-000000000007', null, 'available', 'demo-vin-007', '12**07', '현대', '코나 일렉트릭', 2025, 5, 'electric', 13500, 80000, '서울 성동구 성수동', 37.544600, 127.055700, true),
  ('00000000-0000-4000-8000-000000000008', null, 'available', 'demo-vin-008', '12**08', '기아', '니로 EV', 2025, 5, 'electric', 14500, 80000, '서울 광진구 자양동', 37.535200, 127.071600, true),
  ('00000000-0000-4000-8000-000000000009', null, 'available', 'demo-vin-009', '12**09', '폴스타', '2', 2024, 5, 'electric', 23500, 150000, '서울 마포구 합정동', 37.549500, 126.913800, true),
  ('00000000-0000-4000-8000-000000000010', null, 'available', 'demo-vin-010', '12**10', '제네시스', 'GV60', 2025, 5, 'electric', 28000, 180000, '서울 서대문구 연희동', 37.568800, 126.930200, true),
  ('00000000-0000-4000-8000-000000000011', null, 'available', 'demo-vin-011', '12**11', 'MINI', '쿠퍼 SE', 2024, 4, 'electric', 19500, 100000, '서울 중구 신당동', 37.565700, 127.013100, true),
  ('00000000-0000-4000-8000-000000000012', null, 'available', 'demo-vin-012', '12**12', '벤츠', 'EQE', 2025, 5, 'electric', 38000, 250000, '서울 동작구 흑석동', 37.508800, 126.963100, true)
on conflict (id) do nothing;

insert into public.vehicle_photos (vehicle_id, storage_path, is_primary, sort_order) values
  ('00000000-0000-4000-8000-000000000001', '/images/vehicles/ioniq-5.jpg', true, 0),
  ('00000000-0000-4000-8000-000000000002', '/images/vehicles/ev6.jpg', true, 0),
  ('00000000-0000-4000-8000-000000000003', '/images/vehicles/model-3.jpg', true, 0),
  ('00000000-0000-4000-8000-000000000004', '/images/vehicles/ix3.jpg', true, 0),
  ('00000000-0000-4000-8000-000000000005', '/images/vehicles/ex40.jpg', true, 0),
  ('00000000-0000-4000-8000-000000000006', '/images/vehicles/taycan.jpg', true, 0),
  ('00000000-0000-4000-8000-000000000007', '/images/vehicles/ioniq-5.jpg', true, 0),
  ('00000000-0000-4000-8000-000000000008', '/images/vehicles/ev6.jpg', true, 0),
  ('00000000-0000-4000-8000-000000000009', '/images/vehicles/ex40.jpg', true, 0),
  ('00000000-0000-4000-8000-000000000010', '/images/vehicles/ix3.jpg', true, 0),
  ('00000000-0000-4000-8000-000000000011', '/images/vehicles/model-3.jpg', true, 0),
  ('00000000-0000-4000-8000-000000000012', '/images/vehicles/taycan.jpg', true, 0);
