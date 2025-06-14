#!/usr/bin/env python3
"""
SIMPLIFIED Production Python Receiver
Much shorter version - only essential features
"""

import requests
import os
import time
import threading
from datetime import datetime

# ⚠️ UPDATE THESE VALUES ⚠️
NETLIFY_URL = "https://your-app-name.netlify.app"  # CHANGE THIS
DEVICE_IP = "192.168.1.100"  # CHANGE THIS

UPLOAD_FOLDER = r"D:\raspbery_testing\students"
ABSENTEES_FOLDER = r"D:\raspbery_testing\absentlist"

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(ABSENTEES_FOLDER, exist_ok=True)

def send_heartbeat():
    """Tell cloud we're online"""
    try:
        requests.post(f"{NETLIFY_URL}/api/devices/heartbeat", 
                     json={'deviceIp': DEVICE_IP}, timeout=10)
        print(f"💓 Heartbeat sent at {datetime.now().strftime('%H:%M:%S')}")
    except:
        print("❌ Heartbeat failed")

def check_for_tasks():
    """Check cloud for new tasks"""
    try:
        response = requests.get(f"{NETLIFY_URL}/api/devices/poll", 
                               params={'deviceIp': DEVICE_IP}, timeout=10)
        
        if response.status_code == 200:
            tasks = response.json().get('tasks', [])
            for task in tasks:
                process_task(task)
    except:
        print("❌ Failed to check tasks")

def process_task(task):
    """Process a single task"""
    task_id = task.get('id')
    file_url = task.get('file_url')
    file_name = task.get('file_name')
    
    print(f"📥 Processing: {file_name}")
    
    try:
        # Download file
        response = requests.get(file_url, timeout=30)
        file_path = os.path.join(UPLOAD_FOLDER, file_name)
        
        with open(file_path, 'wb') as f:
            f.write(response.content)
        
        print(f"✅ File saved: {file_path}")
        
        # TODO: Add your face recognition code here
        time.sleep(2)  # Simulate processing
        
        # Mark task complete
        requests.post(f"{NETLIFY_URL}/api/devices/poll",
                     json={'taskId': task_id, 'status': 'completed'}, timeout=10)
        
    except Exception as e:
        print(f"❌ Task failed: {e}")

def main():
    print("🚀 Simple Production Receiver Started")
    print(f"🌐 URL: {NETLIFY_URL}")
    print(f"📱 IP: {DEVICE_IP}")
    
    while True:
        send_heartbeat()
        check_for_tasks()
        time.sleep(30)  # Wait 30 seconds

if __name__ == '__main__':
    main() 