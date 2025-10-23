-- Migration: Create notification_settings table
-- Purpose: Store user notification preferences for Discord and Telegram
-- Date: 2025-10-23

-- Step 1: Create notification_settings table
CREATE TABLE IF NOT EXISTS public.notification_settings (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Discord settings
  discord_webhook_url TEXT,
  notify_discord BOOLEAN DEFAULT false,
  
  -- Telegram settings
  telegram_chat_id VARCHAR(255),
  telegram_token VARCHAR(255),
  notify_telegram BOOLEAN DEFAULT false,
  
  -- Notification type preferences
  notify_order_created BOOLEAN DEFAULT true,
  notify_order_updated BOOLEAN DEFAULT true,
  notify_order_status_changed BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT notification_settings_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
) TABLESPACE pg_default;

-- Step 2: Create indexes
CREATE INDEX IF NOT EXISTS idx_notification_settings_user_id 
  ON public.notification_settings USING BTREE (user_id) TABLESPACE pg_default;

-- Step 3: Create function to handle updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_notification_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 4: Create trigger for updated_at
DROP TRIGGER IF EXISTS notification_settings_updated_at ON public.notification_settings;
CREATE TRIGGER notification_settings_updated_at
  BEFORE UPDATE ON public.notification_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_notification_settings_updated_at();

-- Step 5: Add comments
COMMENT ON TABLE public.notification_settings IS 'Stores user notification preferences for Discord and Telegram';
COMMENT ON COLUMN public.notification_settings.user_id IS 'Foreign key to auth.users';
COMMENT ON COLUMN public.notification_settings.discord_webhook_url IS 'Discord webhook URL for notifications';
COMMENT ON COLUMN public.notification_settings.telegram_chat_id IS 'Telegram chat ID (can be user ID or group ID)';
COMMENT ON COLUMN public.notification_settings.telegram_token IS 'Telegram bot token';
