create or replace function public.link_primary_wallet(
  p_address text,
  p_chain_id integer default 1001
)
returns public.wallets
language plpgsql
security invoker
set search_path = ''
as $$
declare
  linked_wallet public.wallets;
  current_user_id uuid := auth.uid();
  normalized_address text := lower(p_address);
begin
  if current_user_id is null then
    raise exception 'Authentication required';
  end if;
  if p_chain_id <> 1001 then
    raise exception 'Only Kaia Kairos is supported';
  end if;
  if normalized_address !~ '^0x[0-9a-f]{40}$' then
    raise exception 'Invalid wallet address';
  end if;

  delete from public.wallets
  where user_id = current_user_id and is_primary = true;

  insert into public.wallets (user_id, chain_id, address, is_primary)
  values (current_user_id, p_chain_id, normalized_address, true)
  returning * into linked_wallet;
  return linked_wallet;
end;
$$;

revoke all on function public.link_primary_wallet(text, integer) from public;
revoke all on function public.link_primary_wallet(text, integer) from anon;
grant execute on function public.link_primary_wallet(text, integer) to authenticated;
