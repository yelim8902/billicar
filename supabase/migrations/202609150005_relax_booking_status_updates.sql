-- 해커톤 MVP 간소화: 호스트 승인 단계 없이 렌터가 예약 전체 생애주기를 셀프서비스로 진행함
-- (pending 스킵하고 예치 성공 시 바로 confirmed 생성 -> 픽업 시 active -> 반납 시 completed)
-- 기존 정책은 status='pending'인 자기 예약만 수정 가능해서 active/completed로 못 넘어갔음.
-- 소유권 검사(renter_id)는 그대로 유지하고, 상태 제한만 풀어서 앱 로직이 전이를 통제하게 함.
drop policy if exists "renters update own pending bookings" on public.bookings;

create policy "renters update own bookings" on public.bookings
  for update to authenticated
  using (renter_id = (select auth.uid()))
  with check (renter_id = (select auth.uid()));
