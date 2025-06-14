-- Create devices table
CREATE TABLE IF NOT EXISTS devices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    ip_address INET NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_devices_user_id ON devices(user_id);
CREATE INDEX IF NOT EXISTS idx_devices_ip_address ON devices(ip_address);
CREATE INDEX IF NOT EXISTS idx_devices_created_at ON devices(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE devices ENABLE ROW LEVEL SECURITY;

-- Create RLS policy to ensure users can only see their own devices
CREATE POLICY "Users can only see their own devices" ON devices
    FOR ALL USING (user_id = auth.uid());

-- Create RLS policy for inserting devices
CREATE POLICY "Users can only insert their own devices" ON devices
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Create RLS policy for updating devices
CREATE POLICY "Users can only update their own devices" ON devices
    FOR UPDATE USING (user_id = auth.uid());

-- Create RLS policy for deleting devices
CREATE POLICY "Users can only delete their own devices" ON devices
    FOR DELETE USING (user_id = auth.uid());

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_devices_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_devices_updated_at 
    BEFORE UPDATE ON devices 
    FOR EACH ROW 
    EXECUTE FUNCTION update_devices_updated_at_column(); 