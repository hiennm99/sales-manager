-- Create order_previews table to track preview versions with images and customer feedback
-- Consolidated table combining preview pictures and version tracking
-- Each order can have multiple previews, each with different feedback until customer confirms

CREATE TABLE IF NOT EXISTS public.order_previews (
  id SERIAL NOT NULL,
  order_id INTEGER NOT NULL,
  
  -- Image/Picture information
  picture_url TEXT NOT NULL,
  picture_name TEXT NOT NULL,
  file_size INTEGER NULL,
  mime_type TEXT NULL,
  
  -- Customer feedback and confirmation
  customer_feedback TEXT NULL,
  customer_confirmed BOOLEAN NOT NULL DEFAULT FALSE,
  confirmed_at TIMESTAMP WITH TIME ZONE NULL,
  
  -- Internal tracking
  internal_notes TEXT NULL,
  version_number INTEGER NOT NULL DEFAULT 1,
  
  -- Metadata
  uploaded_by_employee_id BIGINT NULL,
  created_by_employee_id BIGINT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  CONSTRAINT order_previews_pkey PRIMARY KEY (id),
  CONSTRAINT order_previews_order_id_fkey FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE,
  CONSTRAINT order_previews_uploaded_by_fkey FOREIGN KEY (uploaded_by_employee_id) REFERENCES employees (id) ON DELETE SET NULL,
  CONSTRAINT order_previews_created_by_fkey FOREIGN KEY (created_by_employee_id) REFERENCES employees (id) ON DELETE SET NULL,
  CONSTRAINT order_previews_version_positive CHECK (version_number > 0),
  CONSTRAINT order_previews_confirmed_at_check CHECK (
    (confirmed_at IS NULL AND customer_confirmed = FALSE) OR
    (confirmed_at IS NOT NULL AND customer_confirmed = TRUE)
  ),
  CONSTRAINT order_previews_picture_url_not_empty CHECK (picture_url != '')
) TABLESPACE pg_default;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_order_previews_order_id 
  ON public.order_previews USING BTREE (order_id) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_order_previews_picture_url 
  ON public.order_previews USING BTREE (picture_url) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_order_previews_confirmed 
  ON public.order_previews USING BTREE (order_id, customer_confirmed) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_order_previews_created_at 
  ON public.order_previews USING BTREE (created_at DESC) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_order_previews_version 
  ON public.order_previews USING BTREE (order_id, version_number DESC) TABLESPACE pg_default;

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_order_previews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS order_previews_updated_at_trigger ON public.order_previews;

CREATE TRIGGER order_previews_updated_at_trigger
BEFORE UPDATE ON public.order_previews
FOR EACH ROW
EXECUTE FUNCTION update_order_previews_updated_at();
