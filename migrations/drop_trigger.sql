-- Migration: Drop problematic trigger
-- The trigger on auth.users is causing issues when creating users
-- We'll handle employee creation from the app instead

-- Drop the trigger that's causing user creation to fail
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Verify trigger is dropped
SELECT COUNT(*) as remaining_triggers
FROM pg_trigger 
WHERE tgname = 'on_auth_user_created';
