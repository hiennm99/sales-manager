-- Migration: Create employees table with auto-mapping to auth users
-- Purpose: Auto-create employee record when new user is created in Supabase Auth
-- Date: 2025-10-22

-- Step 1: Create employees table with all fields
CREATE TABLE IF NOT EXISTS public.employees (
  id SERIAL NOT NULL,
  uuid UUID NOT NULL UNIQUE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  avatar TEXT NOT NULL,
  role TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_admin BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  base_salary NUMERIC NULL DEFAULT 0,
  sales_commission_rate NUMERIC NULL DEFAULT 3.0,
  user_id UUID NULL,
  CONSTRAINT employees_pkey PRIMARY KEY (id),
  CONSTRAINT employees_code_key UNIQUE (code),
  CONSTRAINT unique_user_id UNIQUE (user_id),
  CONSTRAINT employees_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users (id) ON DELETE CASCADE,
  CONSTRAINT employees_code_check CHECK (LENGTH(code) = 3)
) TABLESPACE pg_default;

-- Step 2: Create indexes
CREATE INDEX IF NOT EXISTS employees_status_idx ON public.employees USING BTREE (is_active) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS employees_code_idx ON public.employees USING BTREE (code) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS employees_created_at_idx ON public.employees USING BTREE (created_at DESC) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_employees_user_id ON public.employees USING BTREE (user_id) TABLESPACE pg_default;

-- Step 3: Create function to handle updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 4: Create trigger for updated_at
DROP TRIGGER IF EXISTS employees_updated_at ON public.employees;
CREATE TRIGGER employees_updated_at
    BEFORE UPDATE ON public.employees
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Step 5: Create function to auto-create employee when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
generated_code TEXT;
  code_exists BOOLEAN;
BEGIN
  -- Generate code from email (first 3 chars of email, uppercase)
  generated_code := UPPER(SUBSTRING(NEW.email, 1, 3));
  
  -- Check if code already exists, if so add random suffix
SELECT EXISTS(SELECT 1 FROM public.employees WHERE code = generated_code) INTO code_exists;
IF code_exists THEN
    generated_code := generated_code || LPAD(FLOOR(RANDOM() * 100)::TEXT, 2, '0');
END IF;
  
  -- Auto-create employee record when user signs up
  INSERT INTO public.employees (
    uuid,
    name,
    email,
    code,
    avatar,
    role,
    is_active,
    is_admin,
    base_salary,
    sales_commission_rate,
    user_id,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,  -- uuid from auth.users (UUID type)
    COALESCE(NEW.user_metadata->>'name', SPLIT_PART(NEW.email, '@', 1)),  -- Use name from metadata or email prefix
    NEW.email,
    generated_code,  -- Generated code from email
    COALESCE(NEW.user_metadata->>'avatar', ''),  -- Avatar from metadata or empty
    COALESCE(NEW.user_metadata->>'role', 'employee'),  -- Role from metadata or default
    true,  -- Active by default
    false,  -- Not admin by default
    0,  -- Default base salary
    3.0,  -- Default commission rate
    NEW.id,  -- Link to auth user (user_id)
    NOW(),
    NOW()
  );

RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 6: Create trigger for automatic employee creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();
