-- Production-ready schema for device polling system
-- Run this in your Supabase SQL editor

-- Device tasks queue
CREATE TABLE IF NOT EXISTS device_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_ip text NOT NULL,
  task_type text NOT NULL, -- 'upload_file', 'status_check'
  file_url text,
  file_name text,
  payload jsonb,
  created_at timestamp DEFAULT now(),
  completed_at timestamp,
  status text DEFAULT 'pending' -- 'pending', 'completed', 'failed'
);

-- Device heartbeats (for online status)
CREATE TABLE IF NOT EXISTS device_heartbeats (
  device_ip text PRIMARY KEY,
  last_seen timestamp DEFAULT now(),
  status text DEFAULT 'online',
  device_info jsonb -- For storing additional device info
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_device_tasks_device_ip_status ON device_tasks(device_ip, status);
CREATE INDEX IF NOT EXISTS idx_device_tasks_created_at ON device_tasks(created_at);
CREATE INDEX IF NOT EXISTS idx_device_heartbeats_last_seen ON device_heartbeats(last_seen);

-- Enable RLS (Row Level Security)
ALTER TABLE device_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_heartbeats ENABLE ROW LEVEL SECURITY;

-- RLS Policies for device_tasks
CREATE POLICY "Users can manage tasks for their devices" ON device_tasks
  FOR ALL USING (
    device_ip IN (
      SELECT ip_address FROM devices WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for device_heartbeats  
CREATE POLICY "Users can view heartbeats for their devices" ON device_heartbeats
  FOR ALL USING (
    device_ip IN (
      SELECT ip_address FROM devices WHERE user_id = auth.uid()
    )
  );

-- Allow service role to bypass RLS for device polling
CREATE POLICY "Service role can manage all tasks" ON device_tasks
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role can manage all heartbeats" ON device_heartbeats
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role'); 