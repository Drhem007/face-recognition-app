-- Migration script to add student_attendance table
-- This adds individual student record storage to preserve actual student names like "AKRAM AYOUB"
-- Run this script in your Supabase SQL editor

-- Create new table for individual student attendance records
CREATE TABLE IF NOT EXISTS student_attendance (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    attendance_report_id UUID NOT NULL REFERENCES attendance_reports(id) ON DELETE CASCADE,
    student_name VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('Present', 'Absent')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_student_attendance_report_id ON student_attendance(attendance_report_id);
CREATE INDEX IF NOT EXISTS idx_student_attendance_status ON student_attendance(status);

-- Enable Row Level Security (RLS)
ALTER TABLE student_attendance ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for student attendance records
CREATE POLICY "Users can only see student attendance from their own devices" ON student_attendance
    FOR ALL USING (
        attendance_report_id IN (
            SELECT ar.id FROM attendance_reports ar
            JOIN devices d ON ar.device_id = d.id
            WHERE d.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can only insert student attendance for their own devices" ON student_attendance
    FOR INSERT WITH CHECK (
        attendance_report_id IN (
            SELECT ar.id FROM attendance_reports ar
            JOIN devices d ON ar.device_id = d.id
            WHERE d.user_id = auth.uid()
        )
    );

-- Success message
SELECT 'Student attendance table migration completed successfully!' as message; 