# Deployment Fix Guide - हिंदी में

## समस्या क्या थी?
आपका frontend Vercel पर deploy था लेकिन वो `localhost:5000` को call कर रहा था, जो production में काम नहीं करता।

## क्या Fixed किया गया

### 1. Frontend Configuration
- ✅ `.env.production` - Render backend URL के साथ
- ✅ `.env.local` - Development के लिए localhost
- ✅ `.gitignore` - Environment files को protect करने के लिए

### 2. Backend Configuration  
- ✅ CORS में Vercel URL add किया
- ✅ `.env.production` - Production settings के साथ
- ✅ `.gitignore` - Environment files को protect करने के लिए

## अब क्या करें?

### Step 1: Backend को Re-deploy करें (Render)

1. **Render Dashboard** पर जाएं: https://dashboard.render.com
2. अपनी service select करें
3. **Environment** tab पर जाएं
4. ये environment variables add/update करें:

```
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/smart_reconciliation?retryWrites=true&w=majority
JWT_SECRET=your_very_secure_random_string_min_32_chars
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://smartreconciliation-mouf.vercel.app
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads
WORKER_CONCURRENCY=5
RECONCILIATION_CHUNK_SIZE=1000
PARTIAL_MATCH_VARIANCE=0.02
```

5. **Manual Deploy** button click करें

### Step 2: Frontend को Re-deploy करें (Vercel)

Option A - Git Push (Recommended):
```bash
cd /Users/apple/Documents/Smart_Reconciliation
git add .
git commit -m "Fix CORS and environment configuration"
git push
```
Vercel automatically redeploy कर देगा।

Option B - Manual:
1. Vercel Dashboard: https://vercel.com/dashboard
2. अपना project select करें
3. **Deployments** tab से latest को redeploy करें

### Step 3: Test करें

1. Browser में जाएं: https://smartreconciliation-mouf.vercel.app/login
2. Login credentials use करें:
   - Email: admin@test.com
   - Password: Admin@123
3. Browser Console check करें (F12) - अब CORS errors नहीं होने चाहिए

## Troubleshooting

### अगर अभी भी CORS error आए:

1. **Backend logs check करें**:
   - Render dashboard → Logs tab
   - देखें कि `FRONTEND_URL` properly set है

2. **Environment variables verify करें**:
   - Render: `FRONTEND_URL=https://smartreconciliation-mouf.vercel.app`
   - Vercel: `VITE_API_URL=https://smart-reconciliation.onrender.com/api`

3. **Hard refresh करें**:
   - Browser में: Ctrl+Shift+R (Windows) या Cmd+Shift+R (Mac)

### अगर MongoDB connection fail हो:

1. MongoDB Atlas में:
   - Network Access → IP Whitelist
   - `0.0.0.0/0` add करें (सभी IPs को allow करने के लिए)

2. Connection string verify करें:
   - Username और password में special characters हैं तो encode करें
   - Example: `p@ssw0rd` → `p%40ssw0rd`

## Important Files

### Frontend
- `/frontend/.env.production` - Vercel के लिए
- `/frontend/.env.local` - Local development के लिए
- `/frontend/src/api/client.ts` - API client

### Backend  
- `/backend/.env.production` - Production settings template
- `/backend/src/app.ts` - CORS configuration (line 21-42)

## Commands for Deployment

### Local Testing
```bash
# Backend
cd backend
npm run build
npm start

# Frontend  
cd frontend
npm run build
npm run preview
```

### Git Deployment
```bash
# Repository root से
git add .
git commit -m "Fix deployment configuration"
git push origin main
```

## Security Notes

⚠️ **IMPORTANT**: 
- `.env` files को NEVER git में push न करें
- Production में `JWT_SECRET` को strong random string use करें
- MongoDB में proper authentication enable रखें
- Rate limiting enabled है (15 min में 100 requests per IP)

## Next Steps

1. ✅ Backend redeploy करें with correct environment variables
2. ✅ Frontend automatically redeploy हो जाएगा (अगर git push किया)
3. ✅ Test login functionality
4. ✅ Check all features काम कर रहे हैं
5. ✅ Monitor logs for any errors

## Support

अगर कोई problem हो तो check करें:
- Render logs: https://dashboard.render.com → Your Service → Logs
- Vercel logs: https://vercel.com/dashboard → Your Project → Deployments → Latest → Logs
- Browser console (F12)
