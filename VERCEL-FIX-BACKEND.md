# URGENT: Fix Vercel Backend Deployment

## Problem
Backend is returning 404 errors and CORS failures because it's not deploying correctly on Vercel.

## Solution: Follow These Exact Steps

### Step 1: Check Backend Deployment Status

1. Go to https://vercel.com/dashboard
2. Click on your **backend project** (police360-backend or similar)
3. Go to **Deployments** tab
4. Click on the **latest deployment**
5. Check the **Build Logs** and **Function Logs**
   - Look for any errors (red text)
   - Screenshot them if you see errors

### Step 2: Verify Root Directory

1. In your backend project, go to **Settings** → **General**
2. Find **Root Directory**
3. It MUST be set to: **`backend`**
4. If it's empty or wrong:
   - Click **Edit**
   - Type: `backend`
   - Click **Save**

### Step 3: Verify Build Settings

Still in **Settings** → **General**:

- **Framework Preset**: Other (or leave as detected)
- **Build Command**: (leave empty)
- **Output Directory**: (leave empty)  
- **Install Command**: `npm install`
- **Node.js Version**: 18.x or 20.x

### Step 4: Set Environment Variables

Go to **Settings** → **Environment Variables**

Click **Add** for each of these (if not already added):

**Variable 1:**
```
Name: MONGO_URI
Value: mongodb+srv://sahilhaq2003:Police360%40123@police360.iu6mls8.mongodb.net/Police360?retryWrites=true&w=majority
Environment: Production
```

**Variable 2:**
```
Name: JWT_SECRET
Value: 7eca249b16d1173b38495cb6f15d06a7a3363f005368ddac97456e2768e3b8951fc6c9b75aee431b0e4083a1f4d0c1e8650a4f23e9ea822c4431e80c585f892a
Environment: Production
```

**Variable 3:**
```
Name: CLIENT_URL
Value: https://police360-frontend.vercel.app
Environment: Production
```

**Variable 4:**
```
Name: NODE_ENV
Value: production
Environment: Production
```

Click **Save** after adding each one.

### Step 5: Force Clean Redeploy

1. Go to **Deployments** tab
2. Find the latest deployment
3. Click the **three dots menu (⋯)**
4. Select **"Redeploy"**
5. **CHECK THE BOX**: "Clear build cache and redeploy"
6. Click **"Redeploy"**

### Step 6: Wait and Monitor

1. Watch the deployment progress (2-3 minutes)
2. When it says "Ready", click on the deployment
3. Check **Build Logs** - should show:
   ```
   Installing dependencies...
   Running "npm install"
   Build Completed
   ```
4. Check **Function Logs** - should show your server starting

### Step 7: Test Backend

Open in browser: `https://police360-backend.vercel.app/api/health`

**Expected Response:**
```json
{"ok":true}
```

**If you get 404:**
- Backend didn't deploy correctly
- Go back to Step 1 and check logs for errors
- Share the error messages with me

### Step 8: Test Frontend

1. Go to: `https://police360-frontend.vercel.app`
2. Try to login
3. Check browser console (F12)

**Expected:** Login should work, no CORS errors

---

## Common Issues & Fixes

### Issue: "Root Directory" keeps resetting
**Fix:** Make sure you're editing the backend project, not frontend

### Issue: Environment variables not saving
**Fix:** Make sure you click "Add" then "Save" for each variable

### Issue: Still getting 404
**Fix:** 
1. Check deployment logs for errors
2. Verify Root Directory is `backend`
3. Try deleting and re-importing the project with correct settings

### Issue: MongoDB connection failed
**Fix:** 
1. Go to MongoDB Atlas
2. Network Access → Add IP Address → `0.0.0.0/0`
3. Redeploy backend

---

## Quick Checklist

- [ ] Root Directory = `backend`
- [ ] All 4 environment variables added
- [ ] Cleared cache and redeployed
- [ ] Build logs show success
- [ ] `/api/health` returns `{"ok":true}`
- [ ] Frontend can make requests without CORS errors

---

**If still not working after following all steps, share:**
1. Screenshot of your backend project's Settings → General page
2. Screenshot of deployment Build Logs
3. Any error messages you see
