#!/usr/bin/env python3
"""
Simple test script to send Excel files to your Next.js app
Use this to test the connection between your Raspberry Pi and web app
"""

import requests
import pandas as pd
import os
from datetime import datetime

def create_test_excel(filename):
    """Create a test Excel file with sample attendance data"""
    
    # Sample attendance data
    test_data = [
        {"Student_Name": "John Smith", "Status": "Present", "Date": "2024-01-15"},
        {"Student_Name": "Sarah Johnson", "Status": "Present", "Date": "2024-01-15"},
        {"Student_Name": "Mike Brown", "Status": "Absent", "Date": "2024-01-15"},
        {"Student_Name": "Emily Davis", "Status": "Present", "Date": "2024-01-15"},
        {"Student_Name": "Alex Wilson", "Status": "Absent", "Date": "2024-01-15"},
        {"Student_Name": "Lisa Chen", "Status": "Present", "Date": "2024-01-15"},
        {"Student_Name": "David Rodriguez", "Status": "Present", "Date": "2024-01-15"},
        {"Student_Name": "Anna Taylor", "Status": "Absent", "Date": "2024-01-15"},
    ]
    
    # Create DataFrame and save to Excel
    df = pd.DataFrame(test_data)
    df.to_excel(filename, index=False)
    print(f"✅ Test Excel file created: {filename}")
    return filename

def send_attendance_file(web_app_url, device_ip, excel_file_path):
    """Send Excel file to the web application"""
    
    upload_url = f"{web_app_url.rstrip('/')}/api/attendance/upload"
    
    try:
        print(f"📤 Sending file to: {upload_url}")
        print(f"📱 Device IP: {device_ip}")
        print(f"📊 File: {excel_file_path}")
        
        with open(excel_file_path, 'rb') as file:
            files = {
                'file': (os.path.basename(excel_file_path), file, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
            }
            
            data = {
                'deviceIp': device_ip
            }
            
            response = requests.post(upload_url, files=files, data=data, timeout=30)
            
            if response.status_code == 200:
                result = response.json()
                print("✅ SUCCESS! File sent successfully!")
                print(f"📊 Statistics:")
                print(f"   - Device Name: {result['data']['deviceName']}")
                print(f"   - Device IP: {result['data']['deviceIp']}")
                print(f"   - Total Students: {result['data']['totalStudents']}")
                print(f"   - Present: {result['data']['presentStudents']}")
                print(f"   - Absent: {result['data']['absentStudents']}")
                print(f"   - Attendance Rate: {result['data']['attendanceRate']}%")
                print(f"   - File Name: {result['data']['fileName']}")
                print(f"   - Exam Date: {result['data']['examDate']}")
                print(f"   - Exam Time: {result['data']['examTime']}")
                return True
            else:
                try:
                    error_response = response.json()
                    error_msg = error_response.get('error', 'Unknown error')
                except:
                    error_msg = response.text or f"HTTP {response.status_code}"
                
                print(f"❌ FAILED! Error: {error_msg}")
                return False
                
    except requests.exceptions.ConnectionError:
        print("❌ CONNECTION ERROR! Could not connect to web app.")
        print("   - Check if your Next.js app is running")
        print("   - Check the web app URL")
        print("   - Check network connection")
        return False
        
    except requests.exceptions.Timeout:
        print("❌ TIMEOUT ERROR! Request took too long.")
        return False
        
    except Exception as e:
        print(f"❌ UNEXPECTED ERROR: {str(e)}")
        return False

def main():
    """Main function to test the attendance file sending"""
    
    print("🧪 Raspberry Pi to Next.js App - Attendance File Test")
    print("=" * 60)
    
    # Configuration - UPDATE THESE VALUES
    WEB_APP_URL = "http://localhost:3000"  # Change to your actual web app URL
    DEVICE_IP = "192.168.1.100"            # Change to your Raspberry Pi's IP address
    
    print("⚙️  Configuration:")
    print(f"   Web App URL: {WEB_APP_URL}")
    print(f"   Device IP: {DEVICE_IP}")
    print()
    
    # Validate configuration
    if DEVICE_IP == "192.168.1.100":
        print("⚠️  WARNING: Please update DEVICE_IP with your actual Raspberry Pi IP address!")
        print("   1. Find your Raspberry Pi's IP address (use 'hostname -I' command)")
        print("   2. Make sure this IP matches the one you registered in your web app")
        print("   3. Update the DEVICE_IP variable in this script")
        print()
        print("   Continuing with default IP for testing...")
    
    # Generate test filename with current timestamp
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    test_filename = f"attendance_test_device_{timestamp}.xlsx"
    
    try:
        # Create test Excel file
        create_test_excel(test_filename)
        
        # Send the file
        success = send_attendance_file(WEB_APP_URL, DEVICE_IP, test_filename)
        
        if success:
            print("\n🎉 TEST COMPLETED SUCCESSFULLY!")
            print("   Check your web app's Lists page to see the new attendance report.")
        else:
            print("\n💥 TEST FAILED!")
            print("   Please check the error messages above and fix any issues.")
            
    except Exception as e:
        print(f"\n💥 TEST FAILED WITH ERROR: {str(e)}")
        
    finally:
        # Clean up test file
        if os.path.exists(test_filename):
            os.remove(test_filename)
            print(f"🧹 Cleaned up test file: {test_filename}")

if __name__ == "__main__":
    main() 