from flask import Flask, jsonify, request
import requests
from flask_cors import CORS  # Import CORS
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)

# CORS Configuration
# For development: Allow localhost
# For production: Replace with your actual domain
ALLOWED_ORIGINS = os.environ.get('ALLOWED_ORIGINS', 'http://localhost:*,http://127.0.0.1:*').split(',')

CORS(app, 
     origins=ALLOWED_ORIGINS,
     methods=['GET', 'POST', 'OPTIONS'],
     allow_headers=['Content-Type'])

# Load API keys from environment variables
API_KEY = os.environ.get('GOOGLE_MAPS_API_KEY')
KICKBOX_KEY = os.environ.get('KICKBOX_KEY')

# Firebase configuration from environment variables
FIREBASE_CONFIG = {
    'apiKey': os.environ.get('FIREBASE_API_KEY'),
    'authDomain': os.environ.get('FIREBASE_AUTH_DOMAIN'),
    'databaseURL': os.environ.get('FIREBASE_DATABASE_URL'),
    'projectId': os.environ.get('FIREBASE_PROJECT_ID'),
    'storageBucket': os.environ.get('FIREBASE_STORAGE_BUCKET'),
    'messagingSenderId': os.environ.get('FIREBASE_MESSAGING_SENDER_ID'),
    'appId': os.environ.get('FIREBASE_APP_ID'),
    'measurementId': os.environ.get('FIREBASE_MEASUREMENT_ID')
}

# EmailJS configuration from environment variables
EMAILJS_CONFIG = {
    'serviceId': os.environ.get('EMAILJS_SERVICE_ID'),
    'templateId': os.environ.get('EMAILJS_TEMPLATE_ID'),
    'userId': os.environ.get('EMAILJS_USER_ID')
}

@app.route("/")
def home():
    print("Hello from Flask")
    return {"message" : "Running on port 5000"}

@app.route('/api/config', methods=['GET'])
def get_config():
    """Serve public configuration to frontend (Firebase, Google Maps, EmailJS)"""
    return jsonify({
        'firebase': FIREBASE_CONFIG,
        'googleMaps': {
            'apiKey': API_KEY
        },
        'emailjs': EMAILJS_CONFIG
    })

@app.route('/api/fetchDistance', methods=['GET'])
def fetch_distance():
    pickup = request.args.get('pickup')
    destination = request.args.get('destination')

    # Log the pickup and destination values to verify they're being received
    print(f"Received pickup: {pickup}, destination: {destination}")

    if not pickup or not destination:
        return jsonify({'error': 'Please provide both pickup and destination postcodes.'}), 400

    # Request to Google Maps Distance Matrix API
    url = f"https://maps.googleapis.com/maps/api/distancematrix/json?origins={pickup}&destinations={destination}&key={API_KEY}"
    
    response = requests.get(url)
    data = response.json()

    if data['status'] == 'OK':
        distance_in_meters = data['rows'][0]['elements'][0]['distance']['value']
        distance_in_miles = distance_in_meters / 1609.34  # Convert meters to miles
        return jsonify({'distance': distance_in_miles})
    else:
        return jsonify({'error': 'Unable to fetch distance. Please check the postcodes and try again.'}), 400


@app.route('/api/verify_email', methods=['GET'])
def verify_email():
    """Proxy to Kickbox single-email verification to keep API key server-side."""
    email = request.args.get('email', '').strip()
    if not email:
        return jsonify({"error": "Missing email parameter"}), 400
    if not KICKBOX_KEY:
        return jsonify({"error": "Kickbox API key not configured on server"}), 500

    try:
        resp = requests.get(
            'https://api.kickbox.com/v2/verify',
            params={'email': email, 'apikey': KICKBOX_KEY},
            timeout=10
        )
        data = resp.json()
        # Normalize a concise result for the frontend
        result = {
            'result': data.get('result'),              # deliverable, undeliverable, risky, unknown
            'reason': data.get('reason'),              # e.g., invalid_email, invalid_domain, rejected_email, accepted_email
            'disposable': data.get('disposable'),
            'role': data.get('role'),
            'free': data.get('free'),
            'accept_all': data.get('accept_all'),
            'did_you_mean': data.get('did_you_mean'),
            'success': data.get('success', True)
        }
        return jsonify(result), resp.status_code
    except Exception as e:
        return jsonify({"error": "Verification failed", "details": str(e)}), 502

if __name__ == "__main__":
    # Get debug mode from environment (default False for safety)
    debug_mode = os.environ.get('FLASK_DEBUG', 'False').lower() == 'true'
    # Cloud Run uses PORT=8080, local dev uses 5000
    port = int(os.environ.get('PORT', 5000))
    # Use 0.0.0.0 to allow external connections (required for Cloud Run)
    host = os.environ.get('HOST', '0.0.0.0')
    
    if debug_mode:
        print("⚠️  WARNING: Running in DEBUG mode. Not for production!")
    
    print(f"🚀 Starting server on {host}:{port}")
    app.run(debug=debug_mode, host=host, port=port)

