from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from datetime import datetime

app = Flask(__name__)
CORS(app)  # Enable CORS for React app

UPLOAD_FOLDER = r"D:\raspbery_testing\students"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route('/status', methods=['HEAD', 'GET'])
def status():
    """Status check endpoint for React app"""
    if request.method == 'HEAD':
        return '', 200
    return jsonify({"status": "online", "timestamp": datetime.now().isoformat()})

@app.route('/upload', methods=['POST'])
def upload_excel():
    if 'file' not in request.files:
        return {'error': 'No file part'}, 400

    file = request.files['file']
    if file.filename == '':
        return {'error': 'No selected file'}, 400

    filepath = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(filepath)
    print(f"✅ Received and saved: {filepath}")
    return {'status': 'success', 'path': filepath}, 200

if __name__ == '__main__':
    print("Starting server on port 5000...")
    app.run(host='0.0.0.0', port=5000, debug=True)
