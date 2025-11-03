# Security Setup Instructions

## Overview
All API keys and credentials have been moved to environment variables for security. This prevents sensitive information from being exposed in your code.

## Files Created

1. **`.env`** - Contains all your actual API keys (NEVER commit this to Git)
2. **`.env.example`** - Template file showing what environment variables are needed
3. **`.gitignore`** - Prevents .env and other sensitive files from being committed
4. **`requirements.txt`** - Python dependencies needed for the project

## Setup Steps

### 1. Install Python Dependencies

Open a terminal in the `DMT` folder and run:

```bash
pip install -r requirements.txt
```

This will install:
- Flask (web server)
- flask-cors (cross-origin requests)
- requests (HTTP client)
- python-dotenv (environment variable loader)

### 2. Verify Environment Variables

Make sure the `.env` file exists in the `DMT` folder with all your credentials.

### 3. Start the Backend Server

In the `DMT` folder, run:

```bash
python server.py
```

The server should start on `http://127.0.0.1:5000`

### 4. Open the Website

Open `DMT/public/index.html` in your browser or use a local server.

**Important:** The frontend needs the backend to be running to fetch configuration.

## How It Works

### Backend (server.py)
- Loads credentials from `.env` file using `python-dotenv`
- Provides `/api/config` endpoint that serves public credentials (Firebase, Google Maps, EmailJS)
- Keeps sensitive keys (Kickbox) server-side only

### Frontend (JavaScript files)
- `firebase-init.js` - Fetches Firebase config from backend
- `email.js` - Fetches config and uses it for Firebase and EmailJS
- `admin.js` - Fetches Firebase config from backend
- `index.html` & `fareDetails.html` - Load Google Maps API dynamically

## Security Benefits

✅ **No hardcoded API keys** - All credentials are in `.env` file  
✅ **Git protection** - `.gitignore` prevents accidental commits  
✅ **Easy deployment** - Just copy `.env.example` and fill in values  
✅ **Separation of concerns** - Sensitive keys stay on the backend

## Deployment Checklist

When deploying to production:

1. ✅ Copy `.env.example` to `.env` on the server
2. ✅ Fill in all environment variables with production values
3. ✅ Ensure `.env` is in `.gitignore`
4. ✅ Update API URLs in frontend files (change `http://127.0.0.1:5000` to your production URL)
5. ✅ Set `FLASK_ENV=production` in `.env`
6. ✅ Use a production WSGI server like Gunicorn instead of Flask development server

## Troubleshooting

### "Failed to load configuration" error
- Make sure the backend server (`python server.py`) is running
- Check that `.env` file exists and has all required variables

### "Module not found" error
- Run `pip install -r requirements.txt` to install dependencies

### API keys not working
- Verify all credentials in `.env` are correct
- Check console for error messages

## Environment Variables Reference

```
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_DATABASE_URL=https://your_project.firebasedatabase.app
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id
FIREBASE_MEASUREMENT_ID=your_measurement_id
GOOGLE_MAPS_API_KEY=your_google_maps_key
KICKBOX_KEY=your_kickbox_key
EMAILJS_SERVICE_ID=your_emailjs_service_id
EMAILJS_TEMPLATE_ID=your_emailjs_template_id
```

## Support

If you need to regenerate any API keys:
- Firebase: https://console.firebase.google.com/
- Google Maps: https://console.cloud.google.com/
- Kickbox: https://kickbox.com/
- EmailJS: https://www.emailjs.com/

