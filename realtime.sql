-- Execute once in Supabase SQL Editor if atm_reports was created via SQL.
-- This adds the table to Supabase Realtime publication.
alter publication supabase_realtime add table public.atm_reports;
