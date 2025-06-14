# scripts/send_absent.py
import requests
import os
import glob

def send_attendance_file(web_app_url, device_ip, excel_file_path):
    if not os.path.exists(excel_file_path):
        print(f"❌ File not found: {excel_file_path}")
        return False

    upload_url = f"{web_app_url.rstrip('/')}/api/attendance/upload-public"

    with open(excel_file_path, 'rb') as file:
        files = {
            'file': (os.path.basename(excel_file_path), file, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        }

        data = {'deviceIp': device_ip}

        response = requests.post(upload_url, files=files, data=data)
        if response.status_code == 200:
            print("✅ Sent absentees successfully.")
            return True
        else:
            print(f"❌ Failed to send file: {response.text}")
            return False

if __name__ == "__main__":
    web_app_url = "http://192.168.100.31:3000"
    device_ip = "192.168.100.31"
    
    # Find any Excel file in the absentlist folder
    folder_path = r"D:\raspbery_testing\absentlist"
    excel_files = glob.glob(os.path.join(folder_path, "*.xlsx")) + glob.glob(os.path.join(folder_path, "*.xls"))
    
    if excel_files:
        excel_file_path = excel_files[0]  # Use the first Excel file found
        send_attendance_file(web_app_url, device_ip, excel_file_path)
    else:
        print("❌ No Excel files found in absentlist folder")
