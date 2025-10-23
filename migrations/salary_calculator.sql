-- Drop trigger first
DROP TRIGGER IF EXISTS trigger_sync_commission ON orders;
DROP FUNCTION IF EXISTS sync_employee_commission();

-- Drop tables
DROP TABLE IF EXISTS employee_salary CASCADE;
DROP TABLE IF EXISTS employee_commission CASCADE;

-- Commission tracking (auto-populated via trigger)
CREATE TABLE IF NOT EXISTS employee_commission (
                                     id BIGSERIAL PRIMARY KEY,
                                     order_id BIGINT NOT NULL UNIQUE REFERENCES orders(id) ON DELETE CASCADE,
                                     order_date DATE NOT NULL,
                                     actual_ship_date DATE NOT NULL,

    -- Artist commission
                                     artist_employee_id BIGINT REFERENCES employees(id) ON DELETE SET NULL,
                                     artist_commission_rate NUMERIC(5,2) DEFAULT 0, -- 0-100%
                                     artist_commission_amount_vnd NUMERIC(15,2) DEFAULT 0,

    -- Seller commission
                                     seller_employee_id BIGINT REFERENCES employees(id) ON DELETE SET NULL,
                                     seller_commission_rate NUMERIC(5,2) DEFAULT 3, -- 0-100%
                                     seller_commission_amount_vnd NUMERIC(15,2) DEFAULT 0,

    -- Financial data (snapshot from order)
                                     profit_vnd NUMERIC(15,2) DEFAULT 0,
                                     order_earnings_vnd NUMERIC(15,2) DEFAULT 0,

                                     created_at TIMESTAMPTZ DEFAULT NOW(),
                                     updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Salary records (manually approved/calculated)
CREATE TABLE IF NOT EXISTS employee_salary (
                                 id BIGSERIAL PRIMARY KEY,
                                 employee_id BIGINT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,

    -- Period
                                 salary_period_year INT NOT NULL,
                                 salary_period_month INT CHECK (salary_period_month BETWEEN 1 AND 12),

    -- Salary components
                                 base_salary NUMERIC(15,2) DEFAULT 0,
                                 artist_commission_total NUMERIC(15,2) DEFAULT 0,
                                 seller_commission_total NUMERIC(15,2) DEFAULT 0,
                                 other_costs NUMERIC(15,2) DEFAULT 0, -- From employee_monthly_cost
                                 bonus NUMERIC(15,2) DEFAULT 0,
                                 deduction NUMERIC(15,2) DEFAULT 0,
                                 total_salary NUMERIC(15,2) DEFAULT 0,

    -- Metadata
                                 status VARCHAR(20) DEFAULT 'draft', -- draft, approved, paid
                                 approved_by BIGINT REFERENCES employees(id),
                                 approved_at TIMESTAMPTZ,
                                 paid_at TIMESTAMPTZ,
                                 notes TEXT,

                                 created_at TIMESTAMPTZ DEFAULT NOW(),
                                 updated_at TIMESTAMPTZ DEFAULT NOW(),

                                 UNIQUE(employee_id, salary_period_year, salary_period_month)
);

-- Indexes
CREATE INDEX idx_commission_artist ON employee_commission(artist_employee_id, actual_ship_date);
CREATE INDEX idx_commission_seller ON employee_commission(seller_employee_id, actual_ship_date);
CREATE INDEX idx_commission_ship_date ON employee_commission(actual_ship_date);
CREATE INDEX idx_salary_period ON employee_salary(salary_period_year, salary_period_month);
CREATE INDEX idx_salary_employee ON employee_salary(employee_id);

-- Trigger to auto-populate employee_commission
CREATE OR REPLACE FUNCTION sync_employee_commission()
RETURNS TRIGGER AS $$
BEGIN
  -- Only process if order has actual_ship_date
  IF NEW.actual_ship_date IS NOT NULL THEN
    -- Delete existing commission record for this order (if any)
    DELETE FROM employee_commission WHERE order_id = NEW.id;
    
    -- Insert new commission record
    INSERT INTO employee_commission (
      order_id,
      order_date,
      actual_ship_date,
      artist_employee_id,
      artist_commission_rate,
      artist_commission_amount_vnd,
      seller_employee_id,
      seller_commission_rate,
      seller_commission_amount_vnd,
      profit_vnd,
      order_earnings_vnd
    ) VALUES (
      NEW.id::BIGINT,
      NEW.order_date::DATE,
      NEW.actual_ship_date::DATE,
      NEW.artist_employee_id::BIGINT,
      NEW.artist_commission_rate::NUMERIC(5,2),
      ROUND((COALESCE(NEW.profit_vnd, 0) * COALESCE(NEW.artist_commission_rate, 0) / 100)::NUMERIC, 2),
      NEW.seller_employee_id::BIGINT,
      3::NUMERIC(5,2), -- Default seller commission rate
      ROUND((COALESCE(NEW.order_earnings_vnd, 0) * 3 / 100)::NUMERIC, 2),
      COALESCE(NEW.profit_vnd, 0)::NUMERIC(15,2),
      COALESCE(NEW.order_earnings_vnd, 0)::NUMERIC(15,2)
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_sync_commission
    AFTER INSERT OR UPDATE OF actual_ship_date, artist_employee_id, seller_employee_id,
                        artist_commission_rate, profit_vnd, order_earnings_vnd
                    ON orders
                        FOR EACH ROW
                        EXECUTE FUNCTION sync_employee_commission();