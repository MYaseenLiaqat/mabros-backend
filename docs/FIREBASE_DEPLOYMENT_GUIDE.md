# 🚀 Firebase Hosting + Cloud Run Deployment Guide

**Complete guide to deploy Mabros Couriers to Google Cloud**

---

## 📋 **Prerequisites**

### 1. Install Required Tools

```bash
# Install Google Cloud CLI
# Download from: https://cloud.google.com/sdk/docs/install

# Install Firebase CLI
npm install -g firebase-tools

# Verify installations
gcloud --version
firebase --version
```

### 2. Accounts & Authentication

```bash
# Login to Google Cloud
gcloud auth login

# Login to Firebase
firebase login

# Set your project
gcloud config set project astute-lyceum-454820-d8
```

---

## 🎯 **Deployment Overview**

```
┌─────────────────────────────────────────────┐
│  ARCHITECTURE                               │
├─────────────────────────────────────────────┤
│                                             │
│  Frontend (Static Files)                    │
│  ├─ Firebase Hosting                        │
│  └─ CDN (Automatic)                         │
│                                             │
│  Backend (Flask API)                        │
│  ├─ Cloud Run (Serverless Container)       │
│  ├─ Auto-scaling                            │
│  └─ HTTPS (Automatic)                       │
│                                             │
│  Database                                   │
│  └─ Firebase Realtime Database              │
│                                             │
│  Domain                                     │
│  └─ Custom domain via Firebase Hosting     │
└─────────────────────────────────────────────┘
```

---

## 🔧 **STEP 1: Deploy Backend to Cloud Run**

### 1.1 Configure Environment Variables

Cloud Run needs your API keys. You'll set them via command line (never in code!).

**Option A: Using Secret Manager (Recommended for Production)**

```bash
# Create secrets
echo -n "AIzaSyDqDlYv-PKWMweItm_i77dR3nA1KIayU8M" | gcloud secrets create FIREBASE_API_KEY --data-file=-
echo -n "astute-lyceum-454820-d8.firebaseapp.com" | gcloud secrets create FIREBASE_AUTH_DOMAIN --data-file=-
# ... (create all secrets from .env file)
```

**Option B: Using Environment Variables (Easier for Testing)**

We'll use this method below.

---

### 1.2 Build and Deploy to Cloud Run

```bash
cd DMT

# Build Docker image and push to Google Container Registry
gcloud builds submit --tag gcr.io/astute-lyceum-454820-d8/mabros-backend

# Deploy to Cloud Run with environment variables
gcloud run deploy mabros-backend \
  --image gcr.io/astute-lyceum-454820-d8/mabros-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080 \
  --set-env-vars="FIREBASE_API_KEY=AIzaSyDqDlYv-PKWMweItm_i77dR3nA1KIayU8M" \
  --set-env-vars="FIREBASE_AUTH_DOMAIN=astute-lyceum-454820-d8.firebaseapp.com" \
  --set-env-vars="FIREBASE_DATABASE_URL=https://astute-lyceum-454820-d8-default-rtdb.europe-west1.firebasedatabase.app" \
  --set-env-vars="FIREBASE_PROJECT_ID=astute-lyceum-454820-d8" \
  --set-env-vars="FIREBASE_STORAGE_BUCKET=astute-lyceum-454820-d8.firebasestorage.app" \
  --set-env-vars="FIREBASE_MESSAGING_SENDER_ID=1052600983418" \
  --set-env-vars="FIREBASE_APP_ID=1:1052600983418:web:f8affd483f23ad89c600c3" \
  --set-env-vars="FIREBASE_MEASUREMENT_ID=G-8Q8L71BR6Z" \
  --set-env-vars="GOOGLE_MAPS_API_KEY=AIzaSyDXwXHiHeFur7TnStWzhc9bgyyIoKvvVRg" \
  --set-env-vars="KICKBOX_KEY=live_b21de619b0971ec1c7713ad275c66114a35b1bafb7505b1bf195db0c05e065f9" \
  --set-env-vars="EMAILJS_SERVICE_ID=service_3s79mls" \
  --set-env-vars="EMAILJS_TEMPLATE_ID=template_3m36jl2" \
  --set-env-vars="EMAILJS_USER_ID=hVUMZE_T7k3MZ72nB" \
  --set-env-vars="FLASK_ENV=production" \
  --set-env-vars="FLASK_DEBUG=False" \
  --set-env-vars="ALLOWED_ORIGINS=https://astute-lyceum-454820-d8.web.app,https://astute-lyceum-454820-d8.firebaseapp.com"
```

### 1.3 Get Your Backend URL

After deployment, Cloud Run will give you a URL like:
```
https://mabros-backend-XXXX-uc.a.run.app
```

**✅ Test your backend:**
```bash
curl https://mabros-backend-XXXX-uc.a.run.app/api/config
```

Should return JSON with Firebase config.

---

## 🌐 **STEP 2: Update Firebase Hosting Configuration**

### 2.1 Update firebase.json

Open `firebase.json` and update the `serviceId` to match your Cloud Run service:

```json
{
  "hosting": {
    "public": "public",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "/api/**",
        "run": {
          "serviceId": "mabros-backend",
          "region": "us-central1"
        }
      }
    ]
  }
}
```

**Important:** The `serviceId` must exactly match your Cloud Run service name!

---

## 🚀 **STEP 3: Deploy Frontend to Firebase Hosting**

### 3.1 Initialize Firebase (if not done)

```bash
cd DMT
firebase init hosting

# Choose these options:
# ? What do you want to use as your public directory? public
# ? Configure as a single-page app? No
# ? Set up automatic builds and deploys with GitHub? No
# ? Overwrite existing files? No
```

### 3.2 Deploy Frontend

```bash
# Deploy to Firebase Hosting
firebase deploy --only hosting
```

### 3.3 Get Your Website URL

Firebase will provide URLs like:
```
✔  Deploy complete!

Hosting URL: https://astute-lyceum-454820-d8.web.app
```

---

## 🔒 **STEP 4: Update CORS Settings**

### 4.1 Update Backend CORS

After you know your Firebase Hosting URL, update the Cloud Run service:

```bash
gcloud run services update mabros-backend \
  --region us-central1 \
  --update-env-vars="ALLOWED_ORIGINS=https://astute-lyceum-454820-d8.web.app,https://astute-lyceum-454820-d8.firebaseapp.com,https://yourdomain.com"
```

---

## 🌍 **STEP 5: Connect Custom Domain**

### 5.1 Add Domain to Firebase Hosting

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: `astute-lyceum-454820-d8`
3. Go to **Hosting** → **Add custom domain**
4. Enter your domain (e.g., `mabroscouriers.com`)
5. Firebase will provide DNS records

### 5.2 Update DNS Records (Google Domains)

1. Go to [Google Domains](https://domains.google.com/)
2. Select your domain
3. Go to **DNS** → **Manage custom records**
4. Add the records provided by Firebase:
   ```
   Type: A
   Name: @
   Value: [IP provided by Firebase]
   
   Type: A
   Name: @
   Value: [IP provided by Firebase]
   ```

### 5.3 Wait for Propagation

DNS changes can take 24-48 hours. Check status in Firebase Console.

---

## 🔐 **STEP 6: Secure Your APIs**

### 6.1 Restrict Google Maps API

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Find: `AIzaSyDXwXHiHeFur7TnStWzhc9bgyyIoKvvVRg`
3. Click **Edit API key**
4. Under **Application restrictions**:
   - Select: **HTTP referrers (websites)**
   - Add:
     ```
     https://astute-lyceum-454820-d8.web.app/*
     https://astute-lyceum-454820-d8.firebaseapp.com/*
     https://yourdomain.com/*
     ```
5. Click **Save**

### 6.2 Update Firebase Security Rules

1. Go to Firebase Console → **Realtime Database** → **Rules**
2. Update rules:
```json
{
  "rules": {
    "bookings": {
      ".read": true,
      ".write": "auth != null && auth.token.email == 'admin@mabroscouriers.com'"
    },
    ".read": "auth != null && auth.token.email == 'admin@mabroscouriers.com'",
    ".write": "auth != null && auth.token.email == 'admin@mabroscouriers.com'"
  }
}
```
3. Click **Publish**

---

## 🧪 **STEP 7: Test Everything**

### 7.1 Test Frontend

Visit: `https://astute-lyceum-454820-d8.web.app`

✅ **Test checklist:**
- [ ] Calculator loads
- [ ] Can get a fare quote
- [ ] Map displays correctly
- [ ] Can submit booking
- [ ] Email arrives
- [ ] Admin login works
- [ ] Can track orders
- [ ] No console errors

### 7.2 Test API Endpoints

```bash
# Test config endpoint
curl https://astute-lyceum-454820-d8.web.app/api/config

# Test distance endpoint
curl "https://astute-lyceum-454820-d8.web.app/api/fetchDistance?pickup=London&destination=Manchester"
```

---

## 📊 **Monitoring & Logs**

### View Cloud Run Logs

```bash
# Real-time logs
gcloud run services logs tail mabros-backend --region us-central1

# Or view in console
# https://console.cloud.google.com/run/detail/us-central1/mabros-backend/logs
```

### View Firebase Hosting Analytics

1. Go to Firebase Console
2. Navigate to **Hosting** → **Dashboard**
3. View traffic, bandwidth, and performance metrics

---

## 💰 **Cost Estimation**

### Free Tier Limits:
- **Cloud Run:** 2 million requests/month, 360,000 GB-seconds/month
- **Firebase Hosting:** 10 GB storage, 360 MB/day transfer
- **Firebase Realtime Database:** 1 GB storage, 50k reads/day, 20k writes/day
- **Google Maps:** $200 credit/month (~28k map loads)

**Estimated cost for moderate traffic:** $0-5/month

---

## 🔄 **Updates & Redeployment**

### Update Backend

```bash
cd DMT
gcloud builds submit --tag gcr.io/astute-lyceum-454820-d8/mabros-backend
gcloud run deploy mabros-backend \
  --image gcr.io/astute-lyceum-454820-d8/mabros-backend \
  --region us-central1
```

### Update Frontend

```bash
cd DMT
firebase deploy --only hosting
```

---

## 🆘 **Troubleshooting**

### Issue: "CORS error"
**Solution:** Update `ALLOWED_ORIGINS` in Cloud Run environment variables

```bash
gcloud run services update mabros-backend \
  --region us-central1 \
  --update-env-vars="ALLOWED_ORIGINS=https://your-new-domain.com"
```

### Issue: "Config not loading"
**Solution:** Check Cloud Run logs

```bash
gcloud run services logs tail mabros-backend --region us-central1
```

### Issue: "Firebase permission denied"
**Solution:** Check Firebase security rules are published

### Issue: "Map not loading"
**Solution:** Verify Google Maps API key restrictions include your domain

---

## ✅ **Success Checklist**

Before going live:
- [ ] Backend deployed to Cloud Run
- [ ] Frontend deployed to Firebase Hosting
- [ ] Custom domain connected
- [ ] SSL certificate active (automatic)
- [ ] CORS configured correctly
- [ ] Google Maps API restricted
- [ ] Firebase security rules updated
- [ ] All features tested
- [ ] Monitoring set up

---

## 📞 **Support Resources**

- **Cloud Run Docs:** https://cloud.google.com/run/docs
- **Firebase Hosting:** https://firebase.google.com/docs/hosting
- **Google Maps API:** https://developers.google.com/maps/documentation

---

## 🎉 **You're Live!**

Congratulations! Your Mabros Couriers website is now:
- ✅ Deployed to Google Cloud
- ✅ Auto-scaling
- ✅ HTTPS enabled
- ✅ Globally distributed via CDN
- ✅ Production-ready!

**Share your website:** `https://yourdomain.com` 🚀


