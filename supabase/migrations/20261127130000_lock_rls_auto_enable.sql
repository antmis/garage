-- Supabase's "auto-enable RLS on new tables" option installs public.rls_auto_enable(), a SECURITY DEFINER event
-- trigger function that the API roles can reach via /rest/v1/rpc. Event triggers run without EXECUTE, so revoking
-- it closes the endpoint without changing what the trigger does. Guarded: projects without the option lack it.
do $$
begin
  if to_regprocedure('public.rls_auto_enable()') is not null then
    revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
  end if;
end
$$;
