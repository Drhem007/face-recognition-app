-- Add test attendance reports
-- First, let's see what devices exist
-- SELECT id, name FROM devices;

-- Then insert test data using actual device IDs
-- Replace 'DEVICE_ID_HERE' with actual device IDs from your devices table

-- Example: If you have a device with ID 'abc123-def456-ghi789'
-- INSERT INTO attendance_reports (device_id, total_students, present_students, absent_students, attendance_rate, file_name, exam_date, exam_time) VALUES
-- ('abc123-def456-ghi789', 45, 42, 3, 93.33, 'attendance_lab101_20240115.xlsx', '2024-01-15', '09:30:00');

-- To get your actual device IDs, run this query first:
SELECT id, name FROM devices WHERE user_id = auth.uid();

-- Then use those IDs in INSERT statements like this:
-- INSERT INTO attendance_reports (device_id, total_students, present_students, absent_students, attendance_rate, file_name, exam_date, exam_time) VALUES
-- ('YOUR_ACTUAL_DEVICE_ID_1', 45, 42, 3, 93.33, 'attendance_lab101_20240115.xlsx', '2024-01-15', '09:30:00'),
-- ('YOUR_ACTUAL_DEVICE_ID_2', 120, 115, 5, 95.83, 'attendance_hallA_20240115.xlsx', '2024-01-15', '14:00:00'),
-- ('YOUR_ACTUAL_DEVICE_ID_1', 38, 35, 3, 92.11, 'attendance_lab101_20240114.xlsx', '2024-01-14', '10:15:00'); 