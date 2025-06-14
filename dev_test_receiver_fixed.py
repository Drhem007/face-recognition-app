#!/usr/bin/env python3
"""
DEVELOPMENT TEST VERSION - FIXED HEARTBEAT TIMING
Use this to test with your local development server
"""

import requests
import os
import time
from datetime import datetime

# FOR DEVELOPMENT TESTING - uses localhost
NETLIFY_URL = "http://localhost:3000"  # Your dev server
DEVICE_IP = "192.168.100.31"  # Your Pi's IP (change this)

UPLOAD_FOLDER = r"D:\raspbery_testing\students"
ABSENTEES_FOLDER = r"D:\raspbery_testing\absentlist"

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(ABSENTEES_FOLDER, exist_ok=True)

# Track last heartbeat time
last_heartbeat_time = 0

def send_heartbeat():
    """Tell dev server we're online"""
    global last_heartbeat_time
    try:
        response = requests.post(f"{NETLIFY_URL}/api/devices/heartbeat", 
                               json={'deviceIp': DEVICE_IP}, timeout=10)
        if response.status_code == 200:
            last_heartbeat_time = time.time()
            print(f"💓 Heartbeat sent successfully at {datetime.now().strftime('%H:%M:%S')}")
            return True
        else:
            print(f"⚠️ Heartbeat failed: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"❌ Heartbeat error: {e}")
        return False

def check_for_tasks():
    """Check dev server for new tasks"""
    try:
        response = requests.get(f"{NETLIFY_URL}/api/devices/poll", 
                               params={'deviceIp': DEVICE_IP}, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            tasks = data.get('tasks', [])
            if tasks:
                print(f"📋 Found {len(tasks)} task(s)")
                for task in tasks:
                    process_task(task)
        else:
            print(f"⚠️ Poll failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Failed to check tasks: {e}")

def process_task(task):
    """Process a single task"""
    task_id = task.get('id')
    file_url = task.get('file_url')
    file_name = task.get('file_name')
    
    print(f"📥 Processing task {task_id}: {file_name}")
    
    try:
        # Download file
        print(f"📥 Downloading from: {file_url}")
        response = requests.get(file_url, timeout=30)
        response.raise_for_status()
        
        file_path = os.path.join(UPLOAD_FOLDER, file_name)
        
        with open(file_path, 'wb') as f:
            f.write(response.content)
        
        print(f"✅ File saved: {file_path}")
        
        # Simulate processing
        print("🎭 Simulating face recognition...")
        time.sleep(2)
        
        # Mark task complete
        complete_response = requests.post(f"{NETLIFY_URL}/api/devices/poll",
                                        json={'taskId': task_id, 'status': 'completed'}, 
                                        timeout=10)
        
        if complete_response.status_code == 200:
            print(f"✅ Task {task_id} marked as completed")
        else:
            print(f"⚠️ Failed to mark task complete: {complete_response.status_code}")
        
    except Exception as e:
        print(f"❌ Task {task_id} failed: {e}")
        # Mark as failed
        try:
            requests.post(f"{NETLIFY_URL}/api/devices/poll",
                         json={'taskId': task_id, 'status': 'failed', 'result': {'error': str(e)}}, 
                         timeout=10)
        except:
            pass

def main():
    if DEVICE_IP == "192.168.1.100":
        print("⚠️ Remember to update DEVICE_IP with your actual Pi IP!")
    
    print("🧪 DEVELOPMENT TEST RECEIVER - FIXED VERSION")
    print(f"🌐 Testing with: {NETLIFY_URL}")
    print(f"📱 Device IP: {DEVICE_IP}")
    print("=" * 50)
    
    # Send initial heartbeat
    send_heartbeat()
    
    print("\n🔄 Starting polling loop (Press Ctrl+C to stop)...")
    
    try:
        while True:
            current_time = time.time()
            
            # Send heartbeat every 30 seconds (more reliable)
            if current_time - last_heartbeat_time >= 30:
                send_heartbeat()
            
            # Check for tasks
            check_for_tasks()
            
            # Wait 10 seconds before next iteration
            time.sleep(10)
                
    except KeyboardInterrupt:
        print("\n🛑 Test stopped by user")

if __name__ == '__main__':
    main() 