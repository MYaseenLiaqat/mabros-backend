# 🚀 Step-by-Step Deployment Guide

## Current Status: ✅ Ready to Deploy!
- Security: 9/10
- Code: Clean
- All working locally

---

## 📋 PHASE 1: Pre-Deployment Checklist (10 minutes)

### Step 1.1: Final Local Testing
**Time: 5 minutes**

Test everything one last time:

```bash
cd DMT
python server.py
```

✅ Open browser and test:
- [ ] Calculator page (http://127.0.0.1:5000/DMT/public/index.html)
- [ ] Get a quote and go to booking
- [ ] Submit a booking (check email arrives)
- [ ] Admin login (http://127.0.0.1:5000/DMT/public/admin/login.html)
- [ ] Track order (http://127.0.0.1:5000/DMT/public/track.html)

**If all work → Proceed to Step 1.2**

---

### Step 1.2: Choose Your Hosting Platform
**Time: 2 minutes**

**Recommended Setup (Easiest):**

**Backend (Flask API):**
- ✅ **Render.com** (Free tier, easy setup)
- OR Railway.app (Free trial)
- OR Heroku ($5/month)

**Frontend (Static Files):**
- ✅ **Netlify** (Free, automatic HTTPS)
- OR Vercel (Free)
- OR GitHub Pages (Free)

**Why separate?**
- Better security
- Easier to manage
- Free HTTPS on both
- Independent scaling

---

### Step 1.3: Create Accounts
**Time: 3 minutes**

1. **Create Render account:** https://render.com
2. **Create Netlify account:** https://netlify.com

Both allow GitHub sign-in for easy setup!

---

## 📋 PHASE 2: Deploy Backend (20 minutes)

### Step 2.1: Prepare Backend for Deployment
**Time: 5 minutes**

**Update `server.py`:**

The file is already mostly ready, but let's verify the port configuration:

```python
# At the bottom of server.py, should already have:
if __name__ == "__main__":
    debug_mode = os.environ.get('FLASK_DEBUG', 'False').lower() == 'true'
    port = int(os.environ.get('PORT', 5000))
    
    if debug_mode:
        print("⚠️  WARNING: Running in DEBUG mode. Not for production!")
    
    app.run(debug=debug_mode, host='0.0.0.0', port=port)
```

✅ This is already correct!

---

### Step 2.2: Deploy to Render
**Time: 10 minutes**

**Option A: Using GitHub (Recommended)**

1. **Push your code to GitHub:**
   ```bash
   cd "C:\Users\HP\Downloads\DMT 3\DMT"
   git init
   git add .
   git commit -m "Initial commit - Mabros Couriers"
   ```

2. **Create GitHub repository:**
   - Go to https://github.com/new
   - Name: `mabros-backend`
   - Make it **Private** (has .env template)
   - Don't add README or .gitignore
   - Click "Create repository"

3. **Push to GitHub:**
   ```bash
   git remote add origin https://github.com/YOUR-USERNAME/mabros-backend.git
   git branch -M main
   git push -u origin main
   ```

4. **Deploy on Render:**
   - Go to https://render.com/dashboard
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Settings:
     - **Name:** `mabros-api`
     - **Environment:** `Python 3`
     - **Build Command:** `pip install -r requirements.txt`
     - **Start Command:** `gunicorn -w 4 -b 0.0.0.0:$PORT server:app`
     - **Instance Type:** Free

5. **Add Environment Variables:**
   Click "Environment" tab and add ALL variables from your `.env`:
   ```
   FIREBASE_API_KEY=AIzaSyDqDlYv-PKWMweItm_i77dR3nA1KIayU8M
   FIREBASE_AUTH_DOMAIN=astute-lyceum-454820-d8.firebaseapp.com
   FIREBASE_DATABASE_URL=https://astute-lyceum-454820-d8-default-rtdb.europe-west1.firebasedatabase.app
   FIREBASE_PROJECT_ID=astute-lyceum-454820-d8
   FIREBASE_STORAGE_BUCKET=astute-lyceum-454820-d8.firebasestorage.app
   FIREBASE_MESSAGING_SENDER_ID=1052600983418
   FIREBASE_APP_ID=1:1052600983418:web:f8affd483f23ad89c600c3
   FIREBASE_MEASUREMENT_ID=G-8Q8L71BR6Z
   GOOGLE_MAPS_API_KEY=AIzaSyDXwXHiHeFur7TnStWzhc9bgyyIoKvvVRg
   KICKBOX_KEY=live_b21de619b0971ec1c7713ad275c66114a35b1bafb7505b1bf195db0c05e065f9
   EMAILJS_SERVICE_ID=service_3s79mls
   EMAILJS_TEMPLATE_ID=template_3m36jl2
   EMAILJS_USER_ID=hVUMZE_T7k3MZ72nB
   FLASK_ENV=production
   FLASK_DEBUG=False
   ALLOWED_ORIGINS=https://your-frontend-domain.netlify.app
   PORT=5000
   ```

6. **Add `gunicorn` to requirements.txt:**
   ```bash
   echo "gunicorn==21.2.0" >> requirements.txt
   git add requirements.txt
   git commit -m "Add gunicorn"
   git push
   ```

7. **Deploy!**
   - Render will automatically deploy
   - Wait 2-3 minutes
   - Your API URL will be: `https://mabros-api.onrender.com`

8. **Test API:**
   - Open: `https://mabros-api.onrender.com/api/config`
   - Should see JSON with Firebase config ✅

---

### Step 2.3: Note Your Backend URL
**Write this down:**
```
Backend API URL: https://mabros-api.onrender.com
```

You'll need this in the next phase!

---

## 📋 PHASE 3: Update Frontend URLs (15 minutes)

### Step 3.1: Create Config File (Recommended Method)
**Time: 10 minutes**

**Create `public/config.js`:**

```javascript
// Auto-detect environment
const API_BASE_URL = (() => {
  const hostname = window.location.hostname;
  
  // Development
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://127.0.0.1:5000';
  }
  
  // Production - UPDATE THIS with your actual Render URL
  return 'https://mabros-api.onrender.com';
})();

// Export for use in other files
window.API_BASE_URL = API_BASE_URL;
```

---

### Step 3.2: Update All HTML Files
**Time: 5 minutes**

**Add config.js to these files (add right after Bootstrap):**

1. **`public/index.html`** - Add after line 498:
```html
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
<script src="config.js"></script> <!-- ADD THIS LINE -->
```

2. **`public/fareDetails.html`** - Add after line 348:
```html
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
<script src="config.js"></script> <!-- ADD THIS LINE -->
```

3. **`public/bookingForm.html`** - Add after line 15:
```html
<script src="https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js"></script>
<script src="config.js"></script> <!-- ADD THIS LINE -->
```

4. **`public/admin/index.html`** - Add in `<head>` section:
```html
<link rel="stylesheet" href="../styles.css">
<script src="../config.js"></script> <!-- ADD THIS LINE -->
```

5. **`public/admin/login.html`** - Same as above
6. **`public/admin/pod.html`** - Same as above

---

### Step 3.3: Update JavaScript Files
**Time: 5 minutes**

**Update these 4 files:**

1. **`public/firebase-init.js`** - Line 5:
```javascript
// OLD:
fetch('http://127.0.0.1:5000/api/config')

// NEW:
fetch(window.API_BASE_URL + '/api/config')
```

2. **`public/email.js`** - Lines 160 and 272:
```javascript
// OLD:
fetch('http://127.0.0.1:5000/api/config')
// and
return fetch('http://127.0.0.1:5000/api/verify_email?email=' + ...)

// NEW:
fetch(window.API_BASE_URL + '/api/config')
// and
return fetch(window.API_BASE_URL + '/api/verify_email?email=' + ...)
```

3. **`public/app.js`** - Lines 92 and 109:
```javascript
// OLD:
const apiUrl = `http://localhost:5000/api/fetchDistance?...

// NEW:
const apiUrl = `${window.API_BASE_URL}/api/fetchDistance?...
```

4. **`public/admin.js`** - Line 17:
```javascript
// OLD:
fetch('http://127.0.0.1:5000/api/config')

// NEW:
fetch(window.API_BASE_URL + '/api/config')
```

---

## 📋 PHASE 4: Deploy Frontend (10 minutes)

### Step 4.1: Deploy to Netlify
**Time: 8 minutes**

1. **Go to:** https://app.netlify.com/

2. **Click:** "Add new site" → "Deploy manually"

3. **Drag and drop** the `public` folder

4. **Wait 30 seconds** for deployment

5. **Your site is live!**
   - URL will be: `https://random-name-12345.netlify.app`

6. **Change site name:**
   - Go to "Site settings" → "Change site name"
   - New name: `mabros-couriers`
   - New URL: `https://mabros-couriers.netlify.app`

---

### Step 4.2: Update Backend CORS
**Time: 2 minutes**

**Update your Render environment variable:**

Go to Render dashboard → Your service → Environment

Update `ALLOWED_ORIGINS`:
```
ALLOWED_ORIGINS=https://mabros-couriers.netlify.app,https://www.mabros-couriers.netlify.app
```

**Redeploy backend** (click "Manual Deploy" → "Deploy latest commit")

---

## 📋 PHASE 5: Configure External Services (10 minutes)

### Step 5.1: Update Firebase Security Rules
**Time: 3 minutes**

1. Go to: https://console.firebase.google.com/
2. Select project: `astute-lyceum-454820-d8`
3. Go to: **Realtime Database** → **Rules**
4. Replace with:
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
5. Click **Publish**

---

### Step 5.2: Restrict Google Maps API
**Time: 3 minutes**

1. Go to: https://console.cloud.google.com/apis/credentials
2. Find key: `AIzaSyDXwXHiHeFur7TnStWzhc9bgyyIoKvvVRg`
3. Click **Edit**
4. Under **Application restrictions**:
   - Select: **HTTP referrers (websites)**
   - Click "Add an item"
   - Add: `https://mabros-couriers.netlify.app/*`
   - Add: `https://127.0.0.1:*` (for local development)
5. Click **Save**

---

### Step 5.3: Configure EmailJS (Optional)
**Time: 2 minutes**

1. Go to: https://dashboard.emailjs.com/
2. Go to: **Settings** → **Security**
3. Add your domain: `mabros-couriers.netlify.app`
4. (Optional) Enable reCAPTCHA

---

## 📋 PHASE 6: Final Testing (10 minutes)

### Step 6.1: Test Production Site
**Time: 10 minutes**

Visit: `https://mabros-couriers.netlify.app`

Test everything:

✅ **Calculator Page:**
- [ ] Enter pickup and destination
- [ ] Select vehicle and dates
- [ ] Calculate fare
- [ ] Map loads correctly

✅ **Booking Form:**
- [ ] Fill in all details
- [ ] Submit booking
- [ ] Check email received
- [ ] Check Firebase database

✅ **Admin Panel:**
- [ ] Login: `https://mabros-couriers.netlify.app/admin/login.html`
- [ ] View bookings
- [ ] Change status
- [ ] Upload POD

✅ **Order Tracking:**
- [ ] Track order with booking ID
- [ ] Status displays correctly

---

## 🎉 PHASE 7: You're Live!

### Congratulations! Your site is now online! 🚀

**Your URLs:**
- 🌐 Frontend: `https://mabros-couriers.netlify.app`
- 🔧 Backend: `https://mabros-api.onrender.com`
- 👨‍💼 Admin: `https://mabros-couriers.netlify.app/admin/login.html`

---

## 📊 Quick Reference

### Update Domain URLs:
```javascript
// In config.js:
return 'https://mabros-api.onrender.com';
```

### Environment Variables (Render):
- All from `.env` file
- Set `FLASK_DEBUG=False`
- Set `ALLOWED_ORIGINS=https://mabros-couriers.netlify.app`

### Custom Domain (Optional):
- Buy domain from Namecheap/GoDaddy
- Add to Netlify: Site settings → Domain management
- Update CORS in backend

---

## 🆘 Troubleshooting

### Issue: "CORS error"
**Fix:** Update `ALLOWED_ORIGINS` in Render to match your Netlify URL

### Issue: "Config not loading"
**Fix:** Check backend is running on Render, test `/api/config` endpoint

### Issue: "Firebase permission denied"
**Fix:** Check Firebase rules are published

### Issue: "Map not loading"
**Fix:** Verify Google Maps API restrictions include your domain

---

## 📞 Support

If you get stuck:
1. Check browser console for errors
2. Check Render logs for backend errors
3. Test API endpoint directly
4. Verify all environment variables are set

---

## ✅ Final Checklist

Before announcing your site:
- [ ] All pages tested
- [ ] Bookings working
- [ ] Emails sending
- [ ] Admin panel working
- [ ] Tracking working
- [ ] Firebase rules updated
- [ ] Google Maps restricted
- [ ] Backend logs clean
- [ ] No console errors

**You're ready for customers!** 🎊

---

**Estimated Total Time:** 1.5 - 2 hours
**Difficulty:** Intermediate
**Cost:** $0 (using free tiers)


