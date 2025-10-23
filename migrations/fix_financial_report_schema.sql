-- Fix Financial Report Schema Types
-- This migration updates column types to match TypeScript definitions

-- 1. Update financial_report_periods status to ENUM
ALTER TABLE financial_report_periods 
ALTER COLUMN status TYPE VARCHAR(20);

-- Add constraint if not exists
ALTER TABLE financial_report_periods
ADD CONSTRAINT check_status CHECK (status IN ('draft', 'approved', 'finalized'));

-- 2. Update money_on_etsy type to ENUM
ALTER TABLE money_on_etsy 
ALTER COLUMN type TYPE VARCHAR(20);

-- Add constraint if not exists
ALTER TABLE money_on_etsy
ADD CONSTRAINT check_money_type CHECK (type IN ('balance', 'pending', 'available'));

-- 3. Update incoming_money status to ENUM
ALTER TABLE incoming_money 
ALTER COLUMN status TYPE VARCHAR(20);

-- Add constraint if not exists
ALTER TABLE incoming_money
ADD CONSTRAINT check_incoming_status CHECK (status IN ('pending', 'processing', 'received'));

-- 4. Update received_money created_at to timestamp
ALTER TABLE received_money 
ALTER COLUMN created_at TYPE timestamp with time zone USING created_at::timestamp with time zone;

-- 5. Update expenses created_at to timestamp
ALTER TABLE expenses 
ALTER COLUMN created_at TYPE timestamp with time zone USING created_at::timestamp with time zone;

-- 6. Update transferred_money created_at to timestamp
ALTER TABLE transferred_money 
ALTER COLUMN created_at TYPE timestamp with time zone USING created_at::timestamp with time zone;

-- Add default values for created_at columns
ALTER TABLE received_money ALTER COLUMN created_at SET DEFAULT now();
ALTER TABLE expenses ALTER COLUMN created_at SET DEFAULT now();
ALTER TABLE transferred_money ALTER COLUMN created_at SET DEFAULT now();
