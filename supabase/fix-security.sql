-- ============================================================
-- Lumio: Fix all Supabase security warnings
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- 1. Enable RLS on ALL public tables
-- Prisma connects as postgres (superuser) which bypasses RLS,
-- so the app keeps working. This blocks direct access via anon/authenticated keys.

ALTER TABLE public."User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Account" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Session" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."VerificationToken" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Habit" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."HabitLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Task" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Goal" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Milestone" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."JournalEntry" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."CalendarEvent" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."XpLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."DevCode" ENABLE ROW LEVEL SECURITY;

-- 2. Deny all access via anon/authenticated roles (app uses service_role/postgres only)
-- No policies = no access for non-superuser roles. That's exactly what we want.
-- Prisma (postgres superuser) bypasses RLS automatically.

-- 3. Fix handle_new_user function (Supabase default trigger)
-- Set immutable search_path and revoke public execute

DO $$
BEGIN
  -- Check if the function exists before altering
  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' AND p.proname = 'handle_new_user'
  ) THEN
    -- Fix mutable search path
    ALTER FUNCTION public.handle_new_user() SET search_path = public;
    -- Revoke public execute
    REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM public;
    REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM authenticated;
    REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon;
  END IF;
END
$$;

-- 4. Enable leaked password protection (via Supabase Auth config)
-- This must be done in Dashboard > Authentication > Settings > Enable "Leaked Password Protection"
-- It cannot be set via SQL. See note below.

-- ============================================================
-- DONE. After running this:
-- 1. Go to Authentication > Settings and enable "Leaked Password Protection"
-- 2. All RLS warnings should be resolved
-- ============================================================
