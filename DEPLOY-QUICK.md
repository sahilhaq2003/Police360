# Quick Deployment Checklist

## ✅ Pre-Deployment (DONE)
- [x] Code pushed to GitHub
- [x] Backend configured for serverless
- [x] Frontend configured with env variables
- [x] vercel.json added to backend
- [x] README files updated

## 📋 Deploy Now - Follow These Steps

### 1️⃣ Deploy Backend First

1. Open: https://vercel.com/new
2. Sign in with GitHub
3. Click "Import Git Repository"
4. Select: `sahilhaq2003/Police360`
5. Settings:
   - Root Directory: **`backend`**
   - Framework: **Other**
   - Leave build/output empty
6. Environment Variables (click "Add"):
   ```
   MONGO_URI = (your MongoDB connection string)
   JWT_SECRET = (random 32+ character string)
   CLIENT_URL = https://TEMP-VALUE.com
   NODE_ENV = production
   ```
7. Click **Deploy**
8. ⚠️ **SAVE THE URL** (e.g., `https://police360-backend-abc123.vercel.app`)

### 2️⃣ Deploy Frontend Second

1. Open: https://vercel.com/new (again)
2. Click "Import Git Repository"
3. Select: `sahilhaq2003/Police360` (same repo)
4. Settings:
   - Root Directory: **`frontend`**
   - Framework: **Vite** (auto-detected)
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Environment Variables:
   ```
   VITE_API_URL = https://YOUR-BACKEND-URL.vercel.app/api
   ```
   (Use URL from step 1.8, add `/api`)
6. Click **Deploy**
7. ⚠️ **SAVE THE URL** (e.g., `https://police360-frontend-xyz789.vercel.app`)

### 3️⃣ Update Backend CORS

1. Go to backend project in Vercel dashboard
2. Settings → Environment Variables
3. Edit **`CLIENT_URL`**
4. Set to: (frontend URL from step 2.7)
5. Deployments → Latest → Three dots → **Redeploy**

### 4️⃣ Test It!

Visit your frontend URL and test:
- [ ] Homepage loads
- [ ] Login works
- [ ] API calls succeed
- [ ] No CORS errors in console

## 🔑 MongoDB Setup (if needed)

If you don't have a cloud MongoDB:

1. https://www.mongodb.com/cloud/atlas/register
2. Create FREE cluster
3. Database Access → Add User (username/password)
4. Network Access → Add IP → **`0.0.0.0/0`** (allow all)
5. Clusters → Connect → Connect Application
6. Copy connection string
7. Replace `<password>` with your actual password
8. Use this as `MONGO_URI` in backend

## 📝 Example Values

Backend `.env` (for Vercel):
```
MONGO_URI=mongodb+srv://admin:MyPass123@cluster0.abc.mongodb.net/police360?retryWrites=true&w=majority
JWT_SECRET=super_secret_key_min_32_characters_long_abc123xyz
CLIENT_URL=https://police360-frontend-xyz789.vercel.app
NODE_ENV=production
```

Frontend `.env` (for Vercel):
```
VITE_API_URL=https://police360-backend-abc123.vercel.app/api
```

## ⚠️ Common Issues

**"Cannot find module 'dist.js'"**
→ Delete `node_modules`, run `npm install`, redeploy

**CORS error**
→ Verify `CLIENT_URL` exactly matches frontend URL (no trailing slash)

**API 404**
→ Ensure `VITE_API_URL` ends with `/api`

**Upload fails**
→ Expected on Vercel. Need cloud storage (S3/Cloudinary) - ask me to implement

## 🎯 Success Criteria

✅ Backend health check: `https://YOUR-BACKEND.vercel.app/api/health` returns `{"ok":true}`
✅ Frontend loads without console errors
✅ Login succeeds and redirects to dashboard
✅ API requests show in Network tab with 200 status

---

**Need help?** Check full guide in `DEPLOYMENT.md`
