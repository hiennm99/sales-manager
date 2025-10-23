-- Migration: Add CSV Documents Table for Financial Reports
-- Description: Store multiple CSV files per financial report period

-- Create csv_documents table
CREATE TABLE IF NOT EXISTS csv_documents (
    id SERIAL PRIMARY KEY,
    report_period_id INTEGER NOT NULL REFERENCES financial_report_periods(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    uploaded_by_employee_id INTEGER REFERENCES employees(id),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster queries
CREATE INDEX idx_csv_documents_report_period_id ON csv_documents(report_period_id);
CREATE INDEX idx_csv_documents_uploaded_at ON csv_documents(uploaded_at DESC);

-- Add comments
COMMENT ON TABLE csv_documents IS 'Stores CSV files uploaded for financial report periods';
COMMENT ON COLUMN csv_documents.report_period_id IS 'Foreign key to financial_report_periods';
COMMENT ON COLUMN csv_documents.file_name IS 'Original filename of the CSV';
COMMENT ON COLUMN csv_documents.file_url IS 'Supabase Storage URL';
COMMENT ON COLUMN csv_documents.file_size IS 'File size in bytes';
COMMENT ON COLUMN csv_documents.uploaded_by_employee_id IS 'Employee who uploaded the file';

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_csv_documents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_csv_documents_updated_at
    BEFORE UPDATE ON csv_documents
    FOR EACH ROW
    EXECUTE FUNCTION update_csv_documents_updated_at();
