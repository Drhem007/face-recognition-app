-- Create attendance_reports table
CREATE TABLE IF NOT EXISTS attendance_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    device_id UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    total_students INTEGER NOT NULL,
    present_students INTEGER NOT NULL,
    absent_students INTEGER NOT NULL,
    attendance_rate DECIMAL(5,2) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    exam_date DATE NOT NULL,
    exam_time TIME NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_attendance_reports_device_id ON attendance_reports(device_id);
CREATE INDEX IF NOT EXISTS idx_attendance_reports_exam_date ON attendance_reports(exam_date);
CREATE INDEX IF NOT EXISTS idx_attendance_reports_created_at ON attendance_reports(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE attendance_reports ENABLE ROW LEVEL SECURITY;

-- Create RLS policy to ensure users can only see reports from their own devices
CREATE POLICY "Users can only see attendance reports from their own devices" ON attendance_reports
    FOR ALL USING (
        device_id IN (
            SELECT id FROM devices WHERE user_id = auth.uid()
        )
    );

-- Create RLS policy for inserting attendance reports
CREATE POLICY "Users can only insert attendance reports for their own devices" ON attendance_reports
    FOR INSERT WITH CHECK (
        device_id IN (
            SELECT id FROM devices WHERE user_id = auth.uid()
        )
    );

-- Create RLS policy for updating attendance reports
CREATE POLICY "Users can only update attendance reports from their own devices" ON attendance_reports
    FOR UPDATE USING (
        device_id IN (
            SELECT id FROM devices WHERE user_id = auth.uid()
        )
    );

-- Create RLS policy for deleting attendance reports
CREATE POLICY "Users can only delete attendance reports from their own devices" ON attendance_reports
    FOR DELETE USING (
        device_id IN (
            SELECT id FROM devices WHERE user_id = auth.uid()
        )
    );

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_attendance_reports_updated_at 
    BEFORE UPDATE ON attendance_reports 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample data (optional - remove if you don't want sample data)
-- Note: Replace the device_id values with actual device IDs from your devices table
/*
INSERT INTO attendance_reports (device_id, total_students, present_students, absent_students, attendance_rate, file_name, exam_date, exam_time) VALUES
    ('your-device-id-1', 45, 42, 3, 93.33, 'attendance_lab101_20240115.xlsx', '2024-01-15', '09:30:00'),
    ('your-device-id-2', 120, 115, 5, 95.83, 'attendance_hallA_20240115.xlsx', '2024-01-15', '14:00:00'),
    ('your-device-id-1', 38, 35, 3, 92.11, 'attendance_lab101_20240114.xlsx', '2024-01-14', '10:15:00');
*/ 