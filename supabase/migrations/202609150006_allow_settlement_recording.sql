-- 해커톤 MVP 간소화: 정산을 트리거하는 쪽이 렌터(반납 버튼을 누르는 사람)라서,
-- 렌터가 자기 예약의 온체인 release 결과를 settlements에 기록할 수 있게 허용함.
-- host_id는 반드시 그 예약이 속한 차량의 실제 host_id와 일치해야만 통과되도록 검증.
create policy "renters record settlement for their own completed booking" on public.settlements
  for insert to authenticated
  with check (
    exists (
      select 1
      from public.bookings b
      join public.vehicles v on v.id = b.vehicle_id
      where b.id = booking_id
        and b.renter_id = (select auth.uid())
        and v.host_id = settlements.host_id
    )
  );
