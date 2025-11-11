# Deployment Guide - Police360

## Prerequisites
- GitHub account
- Vercel account (free tier works)
- MongoDB Atlas account (or MongoDB cloud instance)

## Step 1: Push to GitHub

If not already done, commit and push your changes:

```powershell
git add .
git commit -m "Prepare for Vercel deployment"
git push origin sahil
```

## Step 2: Deploy Backend to Vercel

### Via Vercel Dashboard (Recommended)

1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Select your `Police360` repository
4. Configure the backend project:
   - **Project Name**: `police360-backend` (or your choice)
   - **Root Directory**: `backend`
   - **Framework Preset**: Other
   - **Build Command**: (leave empty)
   - **Output Directory**: (leave empty)
   - **Install Command**: `npm install`

5. Add Environment Variables:
   ```
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/police360
   JWT_SECRET=your_super_secret_jwt_key_here_minimum_32_chars
   CLIENT_URL=https://YOUR-FRONTEND-URL.vercel.app
   NODE_ENV=production
   ```

6. Click "Deploy"

7. **Copy your backend URL** (e.g., `https://police360-backend.vercel.app`)

## Step 3: Deploy Frontend to Vercel

1. Go to https://vercel.com/new again
2. Click "Import Git Repository"
3. Select your `Police360` repository again
4. Configure the frontend project:
   - **Project Name**: `police360-frontend` (or your choice)
   - **Root Directory**: `frontend`
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

5. Add Environment Variable:
   ```
   VITE_API_URL=https://YOUR-BACKEND-URL.vercel.app/api
   ```
   (Use the URL from Step 2.7)

6. Click "Deploy"

## Step 4: Update Backend CLIENT_URL

After frontend deploys, you'll have its URL. Update the backend environment variable:

1. Go to your backend project in Vercel
2. Settings → Environment Variables
3. Edit `CLIENT_URL` to match your frontend URL
4. Redeploy the backend (Deployments tab → three dots → Redeploy)

## Step 5: Test Your Deployment

1. Visit your frontend URL
2. Try logging in
3. Check that API calls work

## MongoDB Atlas Setup (if needed)

If you don't have MongoDB in the cloud:

1. Go to https://www.mongodb.com/cloud/atlas/register
2. Create a free cluster
3. Create a database user (Database Access)
4. Whitelist all IPs: Network Access → Add IP Address → `0.0.0.0/0`
5. Get connection string: Clusters → Connect → Connect your application
6. Use this as `MONGO_URI` in backend environment variables

## Troubleshooting

### CORS Errors
The backend already accepts `*.vercel.app` domains. If you see CORS errors:
- Verify `CLIENT_URL` matches your frontend URL exactly
- Check browser console for the exact origin being rejected

### API Connection Errors
- Verify `VITE_API_URL` in frontend includes `/api` suffix
- Check backend logs in Vercel dashboard

### 404 on API Routes
- Ensure `backend/vercel.json` exists
- Check that routes in backend match your API calls

### Upload Failures
- Uploads are disabled on Vercel serverless (see backend logs)
- To enable: switch to Cloudinary/S3 (I can help implement this)

## Important Notes

- **File Uploads**: Currently disabled on Vercel. For production, implement cloud storage (Cloudinary, AWS S3, or Supabase Storage).
- **Environment Variables**: Never commit `.env` files. Always set them in Vercel dashboard.
- **Database**: Use MongoDB Atlas or another cloud MongoDB provider for production.
- **Custom Domain**: You can add a custom domain in Vercel project settings.

## Alternative: Deploy via Vercel CLI

```powershell
# Install Vercel CLI globally
npm install -g vercel

# Deploy backend
cd backend
vercel --prod

# Deploy frontend
cd ../frontend
vercel --prod
```

Then add environment variables via dashboard or CLI.
