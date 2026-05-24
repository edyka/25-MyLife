-- Fix auth triggers that may be breaking signup
-- Run this in Supabase SQL Editor

-- 1. Check for any triggers on auth.users that might be failing
SELECT 
    trigger_name,
    event_manipulation,
    action_statement,
    action_timing
FROM information_schema.triggers 
WHERE event_object_schema = 'auth' 
AND event_object_table = 'users';

-- 2. Check for triggers that create user_profiles automatically
SELECT 
    tgname AS trigger_name,
    pg_get_triggerdef(oid) AS trigger_definition
FROM pg_trigger 
WHERE tgrelid = 'auth.users'::regclass;

-- 3. Common issue: A trigger that auto-creates user_profiles but has wrong permissions
-- Let's drop any problematic triggers and create a safe one

-- First, drop any existing triggers that might be failing
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS create_user_profile_trigger ON auth.users;
DROP TRIGGER IF EXISTS handle_new_user ON auth.users;

-- Drop the associated functions if they exist
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.create_user_profile_for_new_user() CASCADE;

-- 4. Create a SAFE trigger function that doesn't fail
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    -- Try to insert a minimal profile, but don't fail if it errors
    BEGIN
        INSERT INTO public.user_profiles (user_id, name, updated_at)
        VALUES (
            NEW.id,
            COALESCE(NEW.raw_user_meta_data->>'first_name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
            NOW()
        )
        ON CONFLICT (user_id) DO NOTHING;
    EXCEPTION WHEN OTHERS THEN
        -- Log but don't fail - profile can be created later
        RAISE NOTICE 'Could not create profile for user %, error: %', NEW.id, SQLERRM;
    END;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Create the trigger with AFTER INSERT so it doesn't block signup
CREATE TRIGGER handle_new_user
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- 6. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, service_role;
GRANT ALL ON public.user_profiles TO postgres, service_role;

-- 7. Verify triggers
SELECT 
    tgname AS trigger_name,
    tgtype,
    pg_get_triggerdef(oid) AS trigger_definition
FROM pg_trigger 
WHERE tgrelid = 'auth.users'::regclass;

-- If you see "no rows returned" above, that's fine - it means no triggers exist
-- The handle_new_user trigger should now appear
