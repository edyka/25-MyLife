-- CRITICAL FIX: RLS policy for user_profiles INSERT
-- Run this ENTIRE script in Supabase SQL Editor

-- Step 1: Drop ALL existing policies on user_profiles (clean slate)
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'user_profiles' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.user_profiles', pol.policyname);
        RAISE NOTICE 'Dropped policy: %', pol.policyname;
    END LOOP;
END $$;

-- Step 2: Make sure RLS is enabled
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Step 3: Create a PERMISSIVE INSERT policy
-- This allows ANY authenticated user to insert a row WHERE user_id matches their auth.uid()
CREATE POLICY "Users can insert their own profile"
ON public.user_profiles
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Step 4: Create SELECT policy
CREATE POLICY "Users can view their own profile"
ON public.user_profiles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Step 5: Create UPDATE policy
CREATE POLICY "Users can update their own profile"
ON public.user_profiles
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Step 6: Also allow service_role to bypass RLS (for triggers)
ALTER TABLE public.user_profiles FORCE ROW LEVEL SECURITY;

-- Grant service_role full access (this is for the trigger function)
GRANT ALL ON public.user_profiles TO service_role;
GRANT ALL ON public.user_profiles TO authenticated;

-- Step 7: Verify the new policies
SELECT 
    policyname, 
    cmd,
    roles,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'user_profiles' AND schemaname = 'public';
