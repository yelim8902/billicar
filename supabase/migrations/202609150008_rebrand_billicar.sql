-- 프로젝트명이 MobiTrust에서 BilliCar로 변경됨에 따라, 신규 가입자 기본 표시 이름도 갱신.
-- (이미 가입한 기존 사용자의 display_name은 그대로 두고, 앞으로 새로 가입하는 사용자부터 적용됨)
create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name) values (new.id, coalesce(new.raw_user_meta_data->>'display_name', 'BilliCar 사용자'));
  return new;
end; $$;
