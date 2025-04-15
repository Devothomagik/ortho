-- Create a settings table to track application state
CREATE TABLE IF NOT EXISTS app_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert admin_signup_completed flag (false by default)
INSERT INTO app_settings (key, value)
VALUES ('admin_signup_completed', 'false')
ON CONFLICT (key) DO NOTHING;

-- Enable realtime
alter publication supabase_realtime add table app_settings;