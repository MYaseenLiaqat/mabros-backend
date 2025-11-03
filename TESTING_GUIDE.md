# 🧪 Testing Guide - Verify Everything Works

## 📋 **TESTING CHECKLIST**

Use this guide to verify everything works before and after deployment.

---

## 🏠 **PHASE 1: Local Testing (Before Deployment)**

### **Step 1: Start the Backend**

```bash
cd DMT
python server.py
```

**✅ Expected Output:**
```
🚀 Starting server on 0.0.0.0:5000
 * Serving Flask app 'server'
 * Debug mode: on
WARNING: This is a development server. Do not use it in production.
 * Running on all addresses (0.0.0.0)
 * Running on http://127.0.0.1:5000
```

**❌ If you see errors:**
- **"Module not found"** → Run: `pip install -r requirements.txt`
- **"Port already in use"** → Kill other process or change PORT in .env
- **"Missing API keys"** → Check your `.env` file exists and has values

---

### **Step 2: Open the Website**

Open in your browser:
```
http://127.0.0.1:5000/DMT/public/index.html
```

Or navigate directly to the file in your file system and open `public/index.html`

---

### **Step 3: Check Browser Console**

**Press F12** to open Developer Tools, then click **Console** tab.

**✅ Expected Messages:**
```
🔧 Config loaded - API URL: http://127.0.0.1:5000
Firebase initialized successfully
Email.js: Config loaded successfully
Email.js: EmailJS initialized successfully
Email.js: Firebase is ready
```

**❌ Common Issues:**

| Error | Cause | Solution |
|-------|-------|----------|
| `Failed to fetch config` | Backend not running | Start `python server.py` |
| `Config loaded - API URL: undefined` | config.js not loaded | Check HTML has `<script src="config.js"></script>` |
| `CORS error` | CORS misconfigured | Check `ALLOWED_ORIGINS` in .env |
| `Firebase: Firebase App named '[DEFAULT]' already exists` | Duplicate init | Already fixed, shouldn't happen |

---

## ✅ **PHASE 2: Feature Testing**

### **Test 1: Calculator Page** ⭐

**Location:** `index.html`

1. **Enter Pickup Address:**
   - Type: `London, UK`
   - Should see autocomplete suggestions
   - Select a suggestion

2. **Enter Destination Address:**
   - Type: `Manchester, UK`
   - Select a suggestion

3. **Select Vehicle:**
   - Choose: Small Van

4. **Select Date & Time:**
   - Choose tomorrow's date
   - Choose a time

5. **Click "Get a Quote"**

**✅ Expected Result:**
- Page redirects to `fareDetails.html`
- Shows fare calculation
- Map displays route
- All details visible

**❌ Troubleshooting:**
| Issue | Solution |
|-------|----------|
| Autocomplete doesn't work | Check Google Maps API key in .env |
| "Error fetching distance" | Check backend is running |
| No map on fare page | Check console for Google Maps errors |

---

### **Test 2: Fare Details Page** ⭐

**Location:** `fareDetails.html`

**✅ Check These:**
- [ ] Fare amount displayed correctly
- [ ] Pickup address shown
- [ ] Destination address shown
- [ ] Vehicle type shown
- [ ] Date and time shown
- [ ] **Map shows route** (important!)
- [ ] "Proceed to Booking" button works

**Console Check:**
```
🔧 Config loaded - API URL: http://127.0.0.1:5000
Google Maps API loaded successfully
```

---

### **Test 3: Booking Form** ⭐⭐⭐

**Location:** `bookingForm.html`

1. **Fill in all required fields:**
   - Name: Test User
   - Email: your-real-email@gmail.com (use real email to test!)
   - Phone: Valid UK number
   - Company: Test Company
   - Vehicle needs: Check some boxes
   - Notes: Test booking

2. **Accept Terms & Conditions**

3. **Click "Confirm & Submit Booking"**

**✅ Expected Result:**
- Loading spinner appears
- Success message shows
- **You receive 2 emails:**
  1. Booking confirmation (to customer)
  2. Admin notification (if configured)
- Redirects to `thankyou.html`
- **Check Firebase Database:**
  - Go to: https://console.firebase.google.com/
  - Realtime Database → Data
  - Should see new booking entry

**❌ Troubleshooting:**
| Issue | Solution |
|-------|----------|
| "Email service not ready" | Wait 2-3 seconds after page loads |
| "Database not ready" | Check Firebase config in .env |
| Email not received | Check EmailJS dashboard & spam folder |
| Email validation fails | Check KICKBOX_KEY in .env |

**Console Check:**
```
Email.js: Config loaded successfully
Email.js: EmailJS initialized successfully
Email.js: Firebase is ready
```

---

### **Test 4: Order Tracking** ⭐

**Location:** `track.html`

1. **Get a Booking ID:**
   - From the booking you just made
   - Or from Firebase Database
   - Format: `MBR-YYMMDD-XXXX`

2. **Enter Booking ID**

3. **Click "Track Order"**

**✅ Expected Result:**
- Shows booking details
- Shows current status (Pending/En Route/Delivered)
- All information matches booking

**❌ Troubleshooting:**
| Issue | Solution |
|-------|----------|
| "Booking not found" | Check booking ID is correct |
| "System is still loading" | Wait 2-3 seconds after page loads |
| No data shown | Check Firebase security rules |

**Console Check:**
```
Track.js: Firebase is ready
```

---

### **Test 5: Admin Login** ⭐⭐

**Location:** `admin/login.html`

1. **Enter Credentials:**
   - Email: `admin@mabroscouriers.com`
   - Password: Your Firebase admin password

2. **Click "Sign In"**

**✅ Expected Result:**
- Redirects to `admin/index.html`
- Shows list of all bookings

**❌ Troubleshooting:**
| Issue | Solution |
|-------|----------|
| "Invalid email or password" | Check Firebase Authentication |
| Redirects back to login | Email not in ALLOWED_EMAILS list |
| Page stays blank | Check console for errors |

**Console Check:**
```
🔧 Config loaded - API URL: http://127.0.0.1:5000
Firebase initialized successfully
```

---

### **Test 6: Admin Dashboard** ⭐⭐

**Location:** `admin/index.html`

**✅ Check These:**
- [ ] All bookings displayed in table
- [ ] Can change status (Pending → En Route → Delivered)
- [ ] Can delete bookings
- [ ] All columns show data correctly
- [ ] "Upload POD" button works

**Test Status Change:**
1. Find your test booking
2. Change status to "En Route"
3. Go to `track.html`
4. Enter booking ID
5. **Status should now show "En Route"** ✅

**Console Check:**
```
🔧 Config loaded - API URL: http://127.0.0.1:5000
```

---

### **Test 7: Proof of Delivery Upload** ⭐

**Location:** `admin/pod.html`

1. **Select a booking from dropdown**
2. **Upload an image** (any JPG/PNG)
3. **Click "Upload POD"**

**✅ Expected Result:**
- Upload progress shown
- Success message
- Image saved to Firebase Storage

---

## 🌐 **PHASE 3: Production Testing (After Deployment)**

### **Step 1: Test Backend API**

```bash
# Replace with your actual Cloud Run URL
curl https://mabros-backend-XXXX-uc.a.run.app/api/config
```

**✅ Expected Output:**
```json
{
  "firebase": {
    "apiKey": "AIza...",
    "authDomain": "...",
    ...
  },
  "googleMaps": {
    "apiKey": "AIza..."
  },
  "emailjs": {
    "serviceId": "service_...",
    ...
  }
}
```

**❌ If error:**
- **404 Not Found** → Backend not deployed correctly
- **500 Server Error** → Check Cloud Run logs: `gcloud run services logs tail mabros-backend --region us-central1`
- **CORS error** → Update `ALLOWED_ORIGINS` environment variable

---

### **Step 2: Test Frontend**

Open your Firebase Hosting URL:
```
https://astute-lyceum-454820-d8.web.app
```

**Press F12 → Console**

**✅ Expected Console Output:**
```
🔧 Config loaded - API URL: https://astute-lyceum-454820-d8.web.app
Firebase initialized successfully
Email.js: Config loaded successfully
```

**Notice:** API URL should be your Firebase domain, NOT `127.0.0.1`!

---

### **Step 3: Repeat All Feature Tests**

Go through the same checklist as Phase 2, but on the production site:

- [ ] Calculator works
- [ ] Fare calculation works
- [ ] Map displays
- [ ] Booking submission works
- [ ] **Emails are received** ⭐⭐⭐
- [ ] Order tracking works
- [ ] Admin login works
- [ ] Admin dashboard works
- [ ] Status changes work

---

## 🐛 **PHASE 4: Error Checking**

### **Check for Console Errors**

**Press F12 → Console tab**

**✅ Should NOT see:**
- ❌ CORS errors
- ❌ "Failed to fetch"
- ❌ "undefined is not a function"
- ❌ Google Maps API errors
- ❌ Firebase errors

**✅ SHOULD see:**
- ✅ "Config loaded"
- ✅ "Firebase initialized"
- ✅ "EmailJS initialized"

---

### **Check Network Requests**

**Press F12 → Network tab → Reload page**

**✅ Check these requests succeed (Status 200):**
- `config.js` → 200 OK
- `/api/config` → 200 OK (returns JSON)
- `/api/fetchDistance?...` → 200 OK (when calculating fare)
- `/api/verify_email?...` → 200 OK (when validating email)
- Google Maps API calls → 200 OK

**❌ Common Issues:**
| Status | Meaning | Solution |
|--------|---------|----------|
| 404 | Not found | File missing or wrong path |
| 403 | Forbidden | Firebase security rules or API restrictions |
| 500 | Server error | Check backend logs |
| CORS error | CORS blocked | Update ALLOWED_ORIGINS |

---

## 📊 **PHASE 5: Performance Check**

### **Test Page Load Speed**

1. **Press F12 → Network tab**
2. **Reload page (Ctrl+Shift+R)**
3. **Check "Finish" time** at bottom

**✅ Good Performance:**
- Local: < 1 second
- Production: < 3 seconds

**❌ Slow Loading:**
- Check image sizes (should be optimized)
- Check number of external scripts
- Check Cloud Run cold start (first request after idle)

---

## 🎯 **QUICK TEST SCRIPT**

### **30-Second Sanity Check:**

```bash
# 1. Check backend is running
curl http://127.0.0.1:5000/api/config

# 2. Open browser console (F12)
# 3. Visit: http://127.0.0.1:5000/DMT/public/index.html
# 4. Look for: "Config loaded - API URL: http://127.0.0.1:5000"
# 5. Enter addresses and get quote
# 6. If fare calculates → ✅ Working!
```

---

## 📝 **TESTING CHECKLIST SUMMARY**

Print this and check off as you test:

### **Local Testing:**
- [ ] Backend starts without errors
- [ ] Browser console shows "Config loaded"
- [ ] Calculator autocomplete works
- [ ] Fare calculation works
- [ ] Map displays on fare page
- [ ] Booking submission works
- [ ] Email received
- [ ] Firebase database updated
- [ ] Order tracking works
- [ ] Admin login works
- [ ] Admin dashboard loads bookings
- [ ] Status changes reflect in tracking
- [ ] No console errors

### **Production Testing (After Deploy):**
- [ ] Backend API responds
- [ ] Frontend loads
- [ ] Console shows production URL (not localhost)
- [ ] All features work same as local
- [ ] Emails send
- [ ] No CORS errors
- [ ] Performance is good

---

## 🆘 **Common Problems & Solutions**

### **Problem: "Config not loading"**
```bash
# Solution:
# 1. Check backend is running: curl http://127.0.0.1:5000/api/config
# 2. Check browser console for errors
# 3. Verify config.js is loaded: View Page Source → search for "config.js"
```

### **Problem: "Map not showing"**
```bash
# Solution:
# 1. Check console for Google Maps errors
# 2. Verify GOOGLE_MAPS_API_KEY in .env
# 3. Check API key restrictions (should allow your domain)
# 4. Wait 2-3 seconds after page load
```

### **Problem: "Emails not sending"**
```bash
# Solution:
# 1. Check EmailJS dashboard: https://dashboard.emailjs.com/
# 2. Verify EMAILJS_USER_ID, SERVICE_ID, TEMPLATE_ID in .env
# 3. Check spam folder
# 4. Check EmailJS quota (200 emails/month free)
```

### **Problem: "Database not updating"**
```bash
# Solution:
# 1. Check Firebase console: https://console.firebase.google.com/
# 2. Verify Firebase config in .env
# 3. Check security rules allow writes
# 4. Check browser console for Firebase errors
```

---

## ✅ **SUCCESS CRITERIA**

**You know everything works when:**

1. ✅ Can calculate a fare
2. ✅ Can submit a booking
3. ✅ Receive booking confirmation email
4. ✅ Booking appears in Firebase database
5. ✅ Can track order by booking ID
6. ✅ Admin can login
7. ✅ Admin can see all bookings
8. ✅ Admin can change status
9. ✅ Status change reflects in tracking
10. ✅ **No errors in console**

**All 10 checked? You're ready to deploy! 🚀**

---

## 📞 **Need More Help?**

- **Backend issues:** Check `server.py` logs
- **Frontend issues:** Check browser console (F12)
- **Deployment issues:** See `FIREBASE_DEPLOYMENT_GUIDE.md`
- **API issues:** Check `.env` file has correct values

---

**Happy Testing! 🧪**


