# 🔐 Environment Variables Template

**Copy this to `.env` file for local development**

```env
# ============================================
# FIREBASE CONFIGURATION
# ============================================
FIREBASE_API_KEY=your_firebase_api_key_here
FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
FIREBASE_DATABASE_URL=https://your-project-id-default-rtdb.region.firebasedatabase.app
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id_here
FIREBASE_APP_ID=your_app_id_here
FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# ============================================
# GOOGLE MAPS API KEY
# ============================================
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# ============================================
# KICKBOX EMAIL VERIFICATION
# ============================================
KICKBOX_KEY=your_kickbox_api_key_here

# ============================================
# EMAILJS CONFIGURATION
# ============================================
EMAILJS_SERVICE_ID=your_service_id_here
EMAILJS_TEMPLATE_ID=your_template_id_here
EMAILJS_USER_ID=your_public_key_here

# ============================================
# FLASK CONFIGURATION
# ============================================
FLASK_ENV=development
FLASK_DEBUG=True
PORT=5000
HOST=127.0.0.1

# ============================================
# CORS CONFIGURATION
# ============================================
# For local development:
ALLOWED_ORIGINS=http://localhost:*,http://127.0.0.1:*

# For production:
# ALLOWED_ORIGINS=https://your-app.web.app,https://yourdomain.com
```

---

## 🚀 For Cloud Run Deployment

Set environment variables using `gcloud` command:

```bash
gcloud run deploy mabros-backend \
  --image gcr.io/PROJECT_ID/mabros-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080 \
  --set-env-vars="FIREBASE_API_KEY=your_key" \
  --set-env-vars="FIREBASE_AUTH_DOMAIN=your_domain" \
  --set-env-vars="FIREBASE_DATABASE_URL=your_url" \
  --set-env-vars="FIREBASE_PROJECT_ID=your_project" \
  --set-env-vars="FIREBASE_STORAGE_BUCKET=your_bucket" \
  --set-env-vars="FIREBASE_MESSAGING_SENDER_ID=your_sender_id" \
  --set-env-vars="FIREBASE_APP_ID=your_app_id" \
  --set-env-vars="FIREBASE_MEASUREMENT_ID=your_measurement_id" \
  --set-env-vars="GOOGLE_MAPS_API_KEY=your_maps_key" \
  --set-env-vars="KICKBOX_KEY=your_kickbox_key" \
  --set-env-vars="EMAILJS_SERVICE_ID=your_service_id" \
  --set-env-vars="EMAILJS_TEMPLATE_ID=your_template_id" \
  --set-env-vars="EMAILJS_USER_ID=your_user_id" \
  --set-env-vars="FLASK_ENV=production" \
  --set-env-vars="FLASK_DEBUG=False" \
  --set-env-vars="ALLOWED_ORIGINS=https://your-app.web.app"
```

See **FIREBASE_DEPLOYMENT_GUIDE.md** for complete instructions.


