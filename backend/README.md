# Police360 Backend

Express API served as a Vercel Serverless Function (via `api/index.js`).

## Environment Variables
Create an `.env` file (see `.env.example`):

- `MONGO_URI` (required)
- `JWT_SECRET` (required)
- `CLIENT_URL` (required, set to your frontend URL)
- `PORT` (optional for local run; default 8000)

## Local Development
```
npm install
npm run dev
```
Backend will start on http://localhost:8000. Health check: `GET /api/health`.

## Vercel Deployment
Create a Vercel project pointing to the `backend` directory. Vercel uses `api/index.js` as the entry. Set env vars in Vercel dashboard.

Note: Disk uploads are disabled on Vercel serverless. Use a remote storage provider (S3/Cloudinary) in production.
