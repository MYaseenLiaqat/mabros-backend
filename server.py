from flask import Flask, jsonify, request
import requests
from flask_cors import CORS, cross_origin  
import os
from dotenv import load_dotenv


load_dotenv()

app = Flask(__name__)






ALLOWED_ORIGINS = os.environ.get('ALLOWED_ORIGINS', 'http://localhost:5500,http://127.0.0.1:5500,http://localhost:3000,http://127.0.0.1:3000').split(',')

CORS(app, 
     resources={r"/*": {"origins": "*"}},
     methods=['GET', 'POST', 'OPTIONS'],
     allow_headers=['Content-Type', 'X-Client-Token'],
     supports_credentials=True)



API_KEY = os.environ.get('GOOGLE_MAPS_API_KEY')
KICKBOX_KEY = os.environ.get('KICKBOX_KEY')


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


EMAILJS_CONFIG = {
    'serviceId': os.environ.get('EMAILJS_SERVICE_ID'),
    'templateId': os.environ.get('EMAILJS_TEMPLATE_ID'),
    'userId': os.environ.get('EMAILJS_USER_ID')
}

def is_allowed_request(req):
    """Check if request comes from an allowed origin/referer."""
    referer = req.headers.get('Referer')
    origin = req.headers.get('Origin')
    
    # Block direct access (no Referer/Origin)
    if not referer and not origin:
        return False
        
    check_urls = []
    if referer: check_urls.append(referer)
    if origin: check_urls.append(origin)
    
    for url in check_urls:
        for allowed in ALLOWED_ORIGINS:
            # Handle simple wildcard at end
            prefix = allowed.replace('*', '')
            if url.startswith(prefix):
                return True
    
    return False

# Simple API token to prevent casual browsing of /api/config
# This is NOT for security (Firebase keys are public anyway)
# This is just to prevent people from easily viewing the config in a browser
CONFIG_ACCESS_TOKEN = os.environ.get('CONFIG_ACCESS_TOKEN', 'mabros-client-v1')

@app.route("/")
def home():
    print("Hello from Flask")
    return {"message" : "Running on port 5000"}

@app.route('/api/config', methods=['GET'])
def get_config():
    """
    Serve public configuration to frontend (Firebase, Google Maps, EmailJS)
    
    Security Note: Firebase and EmailJS keys are DESIGNED to be public.
    The token below just prevents casual browsing, not actual security attacks.
    Real security comes from Firebase Rules and EmailJS rate limiting.
    """
    # Check for API token in header or query param
    token_header = request.headers.get('X-Client-Token')
    token_param = request.args.get('token')
    provided_token = token_header or token_param
    
    # Require token to prevent casual browser access
    if provided_token != CONFIG_ACCESS_TOKEN:
        return jsonify({
            'error': 'Access denied',
            'message': 'This endpoint is for application use only'
        }), 403

    return jsonify({
        'firebase': FIREBASE_CONFIG,
        'googleMaps': {
            'apiKey': API_KEY
        },
        'emailjs': EMAILJS_CONFIG
    })

from flask_cors import CORS, cross_origin

# ... (existing imports)

# ... (existing code)

@app.route('/api/fetchDistance', methods=['GET'])
@cross_origin()
def fetch_distance():
    try:
        pickup = request.args.get('pickup')
        destination = request.args.get('destination')

        print(f"Received pickup: {pickup}, destination: {destination}")

        if not pickup or not destination:
            return jsonify({'error': 'Please provide both pickup and destination postcodes.'}), 400

        url = f"https://maps.googleapis.com/maps/api/distancematrix/json?origins={pickup}&destinations={destination}&key={API_KEY}"
        
        response = requests.get(url)
        data = response.json()

        if data['status'] == 'OK':
            # Check if rows/elements exist and have status OK
            if data['rows'] and data['rows'][0]['elements'] and data['rows'][0]['elements'][0]['status'] == 'OK':
                distance_in_meters = data['rows'][0]['elements'][0]['distance']['value']
                distance_in_miles = distance_in_meters / 1609.34
                return jsonify({'distance': distance_in_miles})
            else:
                # Handle cases where API returns OK but no route found
                return jsonify({'error': 'No route found between these locations.'}), 400
        else:
            return jsonify({'error': 'Unable to fetch distance. Google Maps API error.'}), 400
            
    except Exception as e:
        print(f"Error in fetch_distance: {str(e)}")
        return jsonify({'error': 'Internal server error fetching distance', 'details': str(e)}), 500


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
        
        result = {
            'result': data.get('result'),              
            'reason': data.get('reason'),              
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

# ===== SECURE FARE CALCULATION (Server-Side) =====
# All pricing rates are kept secret on the server

# Vehicle rates per mile (after 20 miles)
VEHICLE_RATES = {
    'smallVan': 1.20,
    'transitVan': 1.50,
    'lwbVan': 1.65
}

# Minimum fares (for trips under 20 miles)
MIN_FARE_STANDARD = {
    'smallVan': 45.00,
    'transitVan': 65.00,
    'lwbVan': 75.00
}

MIN_FARE_LONDON = {
    'smallVan': 60.00,
    'transitVan': 80.00,
    'lwbVan': 100.00
}

# Delivery charges
DELIVERY_CHARGES = {
    'sameDay': 10,
    'scheduled': 5
}

# London center coordinates
LONDON_CENTER_LAT = 51.5074
LONDON_CENTER_LNG = -0.1278
INNER_LONDON_RADIUS_MILES = 10

# UK Bank Holidays 2025
UK_BANK_HOLIDAYS = {
    '2025-01-01', '2025-04-18', '2025-04-21', '2025-05-05',
    '2025-05-26', '2025-08-25', '2025-12-25', '2025-12-26'
}

def haversine_miles(lat1, lon1, lat2, lon2):
    """Calculate distance between two lat/lng points in miles"""
    from math import radians, sin, cos, sqrt, atan2
    R = 3958.7613  # Earth radius in miles
    
    lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    c = 2 * atan2(sqrt(a), sqrt(1-a))
    return R * c

def geocode_to_latlng(address):
    """Convert address to lat/lng using Google Maps API"""
    url = f"https://maps.googleapis.com/maps/api/geocode/json?address={address}&key={API_KEY}"
    try:
        response = requests.get(url, timeout=10)
        data = response.json()
        if data['status'] == 'OK' and data['results']:
            location = data['results'][0]['geometry']['location']
            return location['lat'], location['lng']
    except:
        pass
    return None, None

def is_within_inner_london(address):
    """Check if address is within 10 miles of London center"""
    lat, lng = geocode_to_latlng(address)
    if lat is None or lng is None:
        return False
    distance = haversine_miles(LONDON_CENTER_LAT, LONDON_CENTER_LNG, lat, lng)
    return distance <= INNER_LONDON_RADIUS_MILES

def get_congestion_charge(pickup_date, pickup_time):
    """Calculate congestion charge based on date/time"""
    try:
        from datetime import datetime
        
        # Parse date and time
        dt = datetime.strptime(f"{pickup_date} {pickup_time}", "%Y-%m-%d %H:%M")
        
        # No charge on bank holidays
        if pickup_date in UK_BANK_HOLIDAYS:
            return 0
        
        # Get day of week (0=Monday, 6=Sunday)
        weekday = dt.weekday()
        hour = dt.hour
        
        # Weekdays (Mon-Fri) between 07:00-18:00
        if weekday <= 4 and 7 <= hour < 18:
            return 18
        
        return 0
    except:
        return 0

@app.route('/api/calculateFare', methods=['POST'])
def calculate_fare():
    """
    Secure server-side fare calculation
    All pricing rates are kept secret on the server
    """
    try:
        data = request.get_json()
        
        # Extract parameters
        pickup = data.get('pickup')
        destination = data.get('destination')
        vehicle_type = data.get('vehicleType')
        pickup_date = data.get('pickupDate')
        pickup_time = data.get('pickupTime')
        destination_date = data.get('destinationDate')
        destination_time = data.get('destinationTime')
        distance_miles = data.get('distance')  # Already calculated by frontend
        
        # Validate inputs
        if not all([pickup, destination, vehicle_type, pickup_date, pickup_time, distance_miles]):
            return jsonify({'error': 'Missing required parameters'}), 400
        
        if vehicle_type not in VEHICLE_RATES:
            return jsonify({'error': 'Invalid vehicle type'}), 400
        
        # Determine if same-day or scheduled
        from datetime import datetime
        today = datetime.now().strftime('%Y-%m-%d')
        is_same_day = (pickup_date == today)
        additional_charge = DELIVERY_CHARGES['sameDay'] if is_same_day else DELIVERY_CHARGES['scheduled']
        charge_type = 'Same-Day' if is_same_day else 'Scheduled'
        
        # Check London zone for both pickup and destination
        pickup_in_london = is_within_inner_london(pickup)
        dest_in_london = is_within_inner_london(destination)
        use_london_mins = pickup_in_london or dest_in_london
        
        # Select minimum fare table
        min_table = MIN_FARE_LONDON if use_london_mins else MIN_FARE_STANDARD
        
        # Calculate congestion charges (only if in London zone)
        pickup_congestion = 0
        dest_congestion = 0
        if pickup_in_london:
            pickup_congestion = get_congestion_charge(pickup_date, pickup_time)
        if dest_in_london:
            dest_congestion = get_congestion_charge(destination_date, destination_time)
        
        congestion_charge = max(pickup_congestion, dest_congestion)
        
        # Calculate base fare
        vehicle_rate = VEHICLE_RATES[vehicle_type]
        min_fare = min_table[vehicle_type]
        
        if distance_miles <= 20:
            base_fare = min_fare
        else:
            extra_miles = distance_miles - 20
            base_fare = min_fare + (extra_miles * vehicle_rate)
        
        # Calculate totals
        combined_extra = additional_charge + congestion_charge
        subtotal = base_fare + combined_extra
        vat = subtotal * 0.20
        total = subtotal + vat
        
        # Return comprehensive fare breakdown
        return jsonify({
            'success': True,
            'distance': round(distance_miles, 2),
            'subtotal': round(subtotal, 2),
            'vat': round(vat, 2),
            'total': round(total, 2),
            'additionalCharge': additional_charge,
            'chargeType': charge_type,
            'londonZone': 'Yes' if use_london_mins else 'No',
            'congestionCharge': congestion_charge,
            'congestionApplied': 'Yes' if congestion_charge > 0 else 'No',
            'pickupCongestion': pickup_congestion,
            'destinationCongestion': dest_congestion,
            'pickupInLondon': pickup_in_london,
            'destinationInLondon': dest_in_london,
            'minimumFareApplied': min_fare,
            'fareTableUsed': 'London' if use_london_mins else 'Standard'
        })
        
    except Exception as e:
        print(f"Error calculating fare: {str(e)}")
        return jsonify({'error': 'Error calculating fare', 'details': str(e)}), 500


if __name__ == "__main__":
    
    debug_mode = os.environ.get('FLASK_DEBUG', 'False').lower() == 'true'
    
    port = int(os.environ.get('PORT', 5000))
    
    host = os.environ.get('HOST', '0.0.0.0')
    
    if debug_mode:
        print("⚠️  WARNING: Running in DEBUG mode. Not for production!")
    
    print(f"🚀 Starting server on {host}:{port}")
    app.run(debug=debug_mode, host=host, port=port)

