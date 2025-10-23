-- Migration: Enable trigger on auth.users
-- Fix trigger that's disabled

-- Step 1: Drop existing trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Step 2: Recreate trigger with proper settings
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Step 3: Verify trigger is enabled
SELECT tgname, tgenabled 
FROM pg_trigger 
WHERE tgname = 'on_auth_user_created';
