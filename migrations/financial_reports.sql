-- Financial Reports Migration
-- Creates tables for managing financial reports from Etsy and other platforms

-- Main financial report periods table
CREATE TABLE IF NOT EXISTS financial_report_periods (
    id BIGSERIAL PRIMARY KEY,
    shop_id BIGINT NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
    year INTEGER NOT NULL,
    month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    
    -- Summary from platform (Etsy)
    total_sales DECIMAL(15, 2) NOT NULL DEFAULT 0,
    total_fees DECIMAL(15, 2) NOT NULL DEFAULT 0,
    net_profit DECIMAL(15, 2) NOT NULL DEFAULT 0,
    
    -- Marketing/Seller services
    marketing_fees DECIMAL(15, 2) NOT NULL DEFAULT 0,
    
    -- VAT reporting
    vat_statement_url TEXT,
    credit_notes TEXT,
    
    -- Upload info
    uploaded_by_employee_id BIGINT REFERENCES employees(id) ON DELETE SET NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE,
    
    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'finalized')),
    notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Unique constraint: one report per shop per month
    CONSTRAINT unique_shop_period UNIQUE (shop_id, year, month)
);

-- Money on Etsy (Tiền còn trên Etsy)
CREATE TABLE IF NOT EXISTS money_on_etsy (
    id BIGSERIAL PRIMARY KEY,
    report_period_id BIGINT NOT NULL REFERENCES financial_report_periods(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    description TEXT NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    type VARCHAR(20) NOT NULL CHECK (type IN ('balance', 'pending', 'available')),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Incoming Money (Tiền đang về)
CREATE TABLE IF NOT EXISTS incoming_money (
    id BIGSERIAL PRIMARY KEY,
    report_period_id BIGINT NOT NULL REFERENCES financial_report_periods(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    order_id VARCHAR(100),
    description TEXT NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    expected_date DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'received')),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Received Money (Tiền đã về)
CREATE TABLE IF NOT EXISTS received_money (
    id BIGSERIAL PRIMARY KEY,
    report_period_id BIGINT NOT NULL REFERENCES financial_report_periods(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    order_id VARCHAR(100),
    description TEXT NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    received_date DATE NOT NULL,
    payment_method VARCHAR(100),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Expenses (Các chi phí)
CREATE TABLE IF NOT EXISTS expenses (
    id BIGSERIAL PRIMARY KEY,
    report_period_id BIGINT NOT NULL REFERENCES financial_report_periods(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    payment_method VARCHAR(100),
    receipt_url TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transferred Money (Tiền đã CK)
CREATE TABLE IF NOT EXISTS transferred_money (
    id BIGSERIAL PRIMARY KEY,
    report_period_id BIGINT NOT NULL REFERENCES financial_report_periods(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    description TEXT NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    transfer_date DATE NOT NULL,
    bank_account VARCHAR(100),
    reference_number VARCHAR(100),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_financial_report_periods_shop_date ON financial_report_periods(shop_id, year, month);
CREATE INDEX IF NOT EXISTS idx_financial_report_periods_status ON financial_report_periods(status);
CREATE INDEX IF NOT EXISTS idx_money_on_etsy_report ON money_on_etsy(report_period_id);
CREATE INDEX IF NOT EXISTS idx_incoming_money_report ON incoming_money(report_period_id);
CREATE INDEX IF NOT EXISTS idx_received_money_report ON received_money(report_period_id);
CREATE INDEX IF NOT EXISTS idx_expenses_report ON expenses(report_period_id);
CREATE INDEX IF NOT EXISTS idx_transferred_money_report ON transferred_money(report_period_id);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_financial_report_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_financial_report_periods_updated_at
    BEFORE UPDATE ON financial_report_periods
    FOR EACH ROW
    EXECUTE FUNCTION update_financial_report_updated_at();

CREATE TRIGGER update_money_on_etsy_updated_at
    BEFORE UPDATE ON money_on_etsy
    FOR EACH ROW
    EXECUTE FUNCTION update_financial_report_updated_at();

CREATE TRIGGER update_incoming_money_updated_at
    BEFORE UPDATE ON incoming_money
    FOR EACH ROW
    EXECUTE FUNCTION update_financial_report_updated_at();

CREATE TRIGGER update_received_money_updated_at
    BEFORE UPDATE ON received_money
    FOR EACH ROW
    EXECUTE FUNCTION update_financial_report_updated_at();

CREATE TRIGGER update_expenses_updated_at
    BEFORE UPDATE ON expenses
    FOR EACH ROW
    EXECUTE FUNCTION update_financial_report_updated_at();

CREATE TRIGGER update_transferred_money_updated_at
    BEFORE UPDATE ON transferred_money
    FOR EACH ROW
    EXECUTE FUNCTION update_financial_report_updated_at();

-- Comments
COMMENT ON TABLE financial_report_periods IS 'Main financial report periods from Etsy or other platforms';
COMMENT ON TABLE money_on_etsy IS 'Money currently on Etsy platform';
COMMENT ON TABLE incoming_money IS 'Money that is incoming/pending';
COMMENT ON TABLE received_money IS 'Money that has been received';
COMMENT ON TABLE expenses IS 'All expenses and fees';
COMMENT ON TABLE transferred_money IS 'Money that has been transferred to bank accounts';
