import pandas as pd
import os

# Create sample data with correct format
data = {
    'Student_Name': ['John Smith', 'Sarah Johnson', 'Mike Brown', 'Emily Davis', 'Alex Wilson'],
    'Status': ['Present', 'Present', 'Absent', 'Present', 'Absent'],
    'Date': ['2024-01-15', '2024-01-15', '2024-01-15', '2024-01-15', '2024-01-15']
}

df = pd.DataFrame(data)

# Create directory if it doesn't exist
os.makedirs('D:/exel files for app tests', exist_ok=True)

# Save to Excel
df.to_excel('D:/exel files for app tests/test_attendance.xlsx', index=False)
print('✅ Created test_attendance.xlsx with correct format')
print('Columns:', list(df.columns))
print('Sample data:')
print(df.head()) 