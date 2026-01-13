# 🌐 Connect Squarespace Domain to Firebase Hosting

## Step-by-Step Guide to Connect `mabroscouriers.com` to Your Firebase Site

---

## **STEP 1: Add Domain in Firebase Hosting**

1. **Go to Firebase Console:**
   - Visit: https://console.firebase.google.com/
   - Select your project: `astute-lyceum-454820-d8`

2. **Navigate to Hosting:**
   - Click **Hosting** in the left sidebar
   - Click **"Add custom domain"** button

3. **Enter Your Domain:**
   - Type: `mabroscouriers.com`
   - Click **Continue**

4. **Firebase Will Show DNS Records:**
   - You'll see A records (IP addresses) or AAAA records
   - **Copy these values** - you'll need them in Squarespace
   - Example:
     ```
     Type: A
     Name: @
     Value: 151.101.1.195 (or similar IP addresses)
     
     Type: A
     Name: @  
     Value: 151.101.65.195 (or similar IP addresses)
     ```

5. **Firebase will also show verification:**
   - Status: "Pending" (waiting for DNS)
   - Keep this tab open or note the DNS records

---

## **STEP 2: Configure DNS in Squarespace**

1. **Go to Squarespace Domains:**
   - Visit: https://account.squarespace.com/domains
   - Click on your domain: `mabroscouriers.com`

2. **Access DNS Settings:**
   - Look for **"DNS Settings"** or **"Advanced DNS"** tab
   - Click on it

3. **Add A Records (Point to Firebase):**
   - Find **"Custom Records"** or **"DNS Records"** section
   - Click **"Add Record"** or **"+"**
   
   **For each A record from Firebase:**
   - **Type:** Select `A`
   - **Host:** Enter `@` (or leave blank if it asks for subdomain)
   - **Points to / Value:** Paste the IP address from Firebase
   - **TTL:** Leave default (usually 3600)
   - Click **Save** or **Add**

   **Repeat for all A records** Firebase provided (usually 2-4 IP addresses)

4. **Remove or Disable Conflicting Records:**
   - If Squarespace has any A records pointing to Squarespace servers, you can disable them (or they'll be overridden)
   - Check for any existing A records pointing to Squarespace IPs

5. **Save All Changes**

---

## **STEP 3: Wait for DNS Propagation**

- DNS changes can take **15 minutes to 48 hours** to propagate
- Usually takes **1-2 hours** for most users

**Check Status:**
- Go back to Firebase Console → Hosting
- You'll see status: "Pending" → "Connected" (when ready)
- Firebase will automatically provision SSL certificate once DNS is verified

---

## **STEP 4: Update Backend CORS (After Domain is Live)**

Once `mabroscouriers.com` is connected, update your backend to allow requests from the new domain:

```bash
# Update Cloud Run service
gcloud run services update mabros-backend \
  --region us-central1 \
  --update-env-vars="ALLOWED_ORIGINS=https://mabroscouriers.com,https://www.mabroscouriers.com,https://astute-lyceum-454820-d8.web.app,https://astute-lyceum-454820-d8.firebaseapp.com"
```

**Or if using Render:**
- Go to Render Dashboard → Your Service → Environment
- Add/Update: `ALLOWED_ORIGINS`
- Value: `https://mabroscouriers.com,https://www.mabroscouriers.com,https://astute-lyceum-454820-d8.web.app`

---

## **STEP 5: Update Google Maps API Restrictions**

1. **Go to Google Cloud Console:**
   - Visit: https://console.cloud.google.com/apis/credentials
   - Find your Google Maps API key

2. **Edit API Key:**
   - Click on the API key
   - Scroll to **"Application restrictions"**
   - Select: **HTTP referrers (websites)**

3. **Add Your Domain:**
   - Click **"Add an item"**
   - Add:
     ```
     https://mabroscouriers.com/*
     https://www.mabroscouriers.com/*
     https://astute-lyceum-454820-d8.web.app/*
     https://astute-lyceum-454820-d8.firebaseapp.com/*
     ```

4. **Save Changes**

---

## **STEP 6: Update Frontend Config (Optional)**

If you want to use your custom domain in production, update `public/config.js`:

```javascript
const API_BASE_URL = (() => {
  const hostname = window.location.hostname;
  
  // Local development
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://127.0.0.1:5000';
  }
  
  // Production: Use custom domain
  return 'https://mabroscouriers.com';
})();
```

**Note:** Firebase Hosting rewrites `/api/**` to your Cloud Run service automatically, so this may not be necessary.

---

## **STEP 7: Test Your Domain**

1. **Wait for DNS to propagate** (check Firebase Console status)

2. **Visit Your Site:**
   - Go to: `https://mabroscouriers.com`
   - Should redirect to Firebase Hosting

3. **Test Features:**
   - ✅ Calculator loads
   - ✅ Can get fare quotes
   - ✅ Map displays correctly
   - ✅ Can submit bookings
   - ✅ API calls work (check browser console)

---

## **Troubleshooting**

### Issue: "Domain not verifying in Firebase"
**Solution:**
- Double-check DNS records in Squarespace match Firebase exactly
- Wait longer (up to 48 hours)
- Check for typos in IP addresses

### Issue: "Site not loading"
**Solution:**
- Clear browser cache
- Check Firebase Console → Hosting for errors
- Verify DNS propagation: https://dnschecker.org

### Issue: "SSL certificate pending"
**Solution:**
- Firebase automatically provisions SSL once DNS is verified
- Wait 1-2 hours after DNS verification

### Issue: "CORS errors"
**Solution:**
- Update `ALLOWED_ORIGINS` in backend (Step 4)
- Include both `www` and non-`www` versions

---

## **✅ Success Checklist**

- [ ] Domain added in Firebase Hosting
- [ ] A records added in Squarespace DNS
- [ ] DNS status shows "Connected" in Firebase
- [ ] SSL certificate active (automatic)
- [ ] Site loads at `https://mabroscouriers.com`
- [ ] Backend CORS updated
- [ ] Google Maps API restrictions updated
- [ ] All features tested

---

## **🎉 You're Done!**

Your site is now live at: **https://mabroscouriers.com**

**Next Steps:**
- Share your website URL
- Monitor Firebase Hosting analytics
- Set up custom email (if needed)


