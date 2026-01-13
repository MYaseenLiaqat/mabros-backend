# 🚀 Render.com Deployment Guide

## Step-by-Step Instructions to Deploy Your Backend

### Prerequisites
✅ Your backend is ready and tested locally
✅ All files are saved
✅ You have a GitHub account (we'll create one if needed)

---

## 📋 **STEP 1: Create GitHub Repository**

### 1.1 Create GitHub Account (if you don't have one)
- Go to: https://github.com/signup
- Create account with your email
- Verify your email

### 1.2 Create New Repository
1. Go to: https://github.com/new
2. **Repository name:** `mabros-backend`
3. **Description:** "Mabros Couriers Backend API"
4. **Visibility:** Private (recommended) or Public
5. **DO NOT** check "Initialize with README"
6. Click **"Create repository"**

### 1.3 Upload Your Code
GitHub will show you instructions. We'll use the command line:

```bash
cd "C:\Users\HP\Downloads\DMT 3\DMT"
git init
git add .
git commit -m "Initial commit - Backend ready for Render"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/mabros-backend.git
git push -u origin main
```

**Replace `YOUR_USERNAME` with your actual GitHub username!**

---

## 🌐 **STEP 2: Deploy to Render**

### 2.1 Create Render Account
1. Go to: https://render.com/
2. Click **"Get Started"**
3. **Sign up with GitHub** (recommended - easiest)
4. Authorize Render to access GitHub

### 2.2 Create New Web Service
1. Click **"New +"** button (top right)
2. Select **"Web Service"**
3. Click **"Connect account"** if needed
4. Find **"mabros-backend"** repository
5. Click **"Connect"**

### 2.3 Configure Service
Fill in these settings:

| Field | Value |
|-------|-------|
| **Name** | `mabros-backend` |
| **Region** | `Frankfurt (EU Central)` |
| **Branch** | `main` |
| **Root Directory** | (leave blank) |
| **Runtime** | `Python 3` |
| **Build Command** | `pip install -r requirements.txt` |
| **Start Command** | `gunicorn --bind 0.0.0.0:$PORT server:app` |
| **Instance Type** | `Free` |

Click **"Advanced"** and scroll to **Environment Variables**

---

## 🔐 **STEP 3: Add Environment Variables**

Click **"Add Environment Variable"** for each of these:

### Firebase Configuration
```
FIREBASE_API_KEY = AIzaSyDqDlYv-PKWMweItm_i77dR3nA1KIayU8M
FIREBASE_AUTH_DOMAIN = astute-lyceum-454820-d8.firebaseapp.com
FIREBASE_DATABASE_URL = https://astute-lyceum-454820-d8-default-rtdb.europe-west1.firebasedatabase.app
FIREBASE_PROJECT_ID = astute-lyceum-454820-d8
FIREBASE_STORAGE_BUCKET = astute-lyceum-454820-d8.firebasestorage.app
FIREBASE_MESSAGING_SENDER_ID = 1052600983418
FIREBASE_APP_ID = 1:1052600983418:web:f8affd483f23ad89c600c3
FIREBASE_MEASUREMENT_ID = G-8Q8L71BR6Z
```

### Google Maps API
```
GOOGLE_MAPS_API_KEY = AIzaSyDXwXHiHeFur7TnStWzhc9bgyyIoKvvVRg
```

### Kickbox Email Verification
```
KICKBOX_KEY = live_b21de619b0971ec1c7713ad275c66114a35b1bafb7505b1bf195db0c05e065f9
```

### EmailJS Configuration
```
EMAILJS_SERVICE_ID = service_3s79mls
EMAILJS_TEMPLATE_ID = template_3m36jl2
EMAILJS_USER_ID = hVUMZE_T7k3MZ72nB
```

### Flask Configuration
```
FLASK_DEBUG = False
HOST = 0.0.0.0
ALLOWED_ORIGINS = *
```

---

## 🚀 **STEP 4: Deploy!**

1. Click **"Create Web Service"** at the bottom
2. Wait 3-5 minutes for deployment
3. You'll see logs showing the build progress
4. When done, you'll see: **"Your service is live 🎉"**
5. Copy your backend URL (something like: `https://mabros-backend.onrender.com`)

---

## ✅ **STEP 5: Test Your Backend**

Open this URL in your browser (replace with YOUR URL):
```
https://mabros-backend.onrender.com/api/config
```

You should see JSON with your Firebase config!

---

## 🌐 **STEP 6: Update Frontend**

After backend is deployed, we need to:
1. Update `public/config.js` with your Render URL
2. Redeploy Firebase Hosting

---

## 🎉 **Done!**

Your backend is now:
- ✅ Publicly accessible
- ✅ Running on free tier
- ✅ Automatic HTTPS
- ✅ Auto-deploys when you push to GitHub

---

## 🆘 **Troubleshooting**

### Build Failed?
- Check logs in Render dashboard
- Make sure `requirements.txt` is correct
- Make sure all environment variables are set

### 503 Error?
- Render free tier sleeps after 15 min of inactivity
- First request after sleep takes 30-60 seconds
- Subsequent requests are instant

### Still not working?
- Check environment variables are correct
- Check logs for errors
- Contact me for help!

---

## 💰 **Cost**

**FREE** - Render free tier includes:
- ✅ 750 hours/month (enough for 24/7)
- ✅ Automatic HTTPS
- ✅ 100GB bandwidth/month
- ⚠️ Sleeps after 15 min inactivity (acceptable for most use cases)

To upgrade (optional):
- $7/month for always-on service
- No sleep time
- More resources

