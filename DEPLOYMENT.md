# Deployment Checklist

## ✅ Completed Steps

- [x] Code pushed to GitHub
- [x] CORS configured for production
- [x] Sample CSV files created
- [x] Local testing completed (10/10 records processed)

## 🔄 Pending Deployment Steps

### 1. MongoDB Atlas Setup
- [ ] Sign up at: https://www.mongodb.com/cloud/atlas/register
- [ ] Create FREE M0 cluster (name: SmartReconciliation)
- [ ] Create database user (username: reconciliation_admin)
- [ ] Setup network access (IP: 0.0.0.0/0)
- [ ] Copy connection string

**Connection String Format:**
```
mongodb+srv://reconciliation_admin:<password>@smartreconciliation.xxxxx.mongodb.net/smart_reconciliation?retryWrites=true&w=majority
```

### 2. Render Backend Deployment
- [ ] Go to: https://dashboard.render.com
- [ ] Create new Web Service
- [ ] Connect GitHub repo: DHEERAJSONKAR/Smart_Reconciliation
- [ ] Configure:
  - Name: smart-reconciliation-backend
  - Root Directory: backend
  - Build Command: `npm install && npm run build`
  - Start Command: `npm start`

**Environment Variables:**
```
NODE_ENV=production
PORT=5000
MONGODB_URI=<paste_your_mongodb_uri>
JWT_SECRET=your_32_character_random_secret_key_here_123456789012
JWT_EXPIRES_IN=7d
MAX_FILE_SIZE=10485760
WORKER_CONCURRENCY=5
RECONCILIATION_CHUNK_SIZE=1000
PARTIAL_MATCH_VARIANCE=0.02
```

**Expected URL:** `https://smart-reconciliation-backend.onrender.com`

### 3. Render Worker Deployment
- [ ] Create new Background Worker on Render
- [ ] Same GitHub repo
- [ ] Configure:
  - Name: smart-reconciliation-worker
  - Root Directory: backend
  - Build Command: `npm install && npm run build`
  - Start Command: `node dist/workers/uploadWorker.js`
- [ ] Add same environment variables as backend

### 4. Vercel Frontend Deployment
- [ ] Go to: https://vercel.com/new
- [ ] Import GitHub repo: DHEERAJSONKAR/Smart_Reconciliation
- [ ] Configure:
  - Framework: Vite
  - Root Directory: frontend
  - Build Command: `npm run build`
  - Output Directory: dist

**Environment Variable:**
```
VITE_API_URL=https://smart-reconciliation-backend.onrender.com/api
```

**Expected URL:** `https://smart-reconciliation-xxxx.vercel.app`

### 5. Final Configuration
- [ ] Get Vercel frontend URL
- [ ] Add to Render backend environment:
  ```
  FRONTEND_URL=https://smart-reconciliation-xxxx.vercel.app
  ```
- [ ] Redeploy backend on Render

### 6. Testing
- [ ] Test backend: `https://your-backend.onrender.com/api/health`
- [ ] Test frontend: Open your Vercel URL
- [ ] Login with: admin@test.com / Admin@123
- [ ] Upload test file: `backend/uploads/sample_transactions.csv`
- [ ] Verify processing completes (status changes to COMPLETED)

## 📝 Important Notes

1. **First Load:** Render free tier spins down after 15 minutes. First request takes 30-50 seconds.

2. **Keep Alive:** Use UptimeRobot to ping your backend every 14 minutes to keep it alive.

3. **File Storage:** Uploads are ephemeral on Render. For production, consider AWS S3.

4. **Worker Required:** Make sure worker service is deployed, otherwise files won't process!

5. **CORS:** Already configured to accept requests from your frontend domain.

## 🔐 Change Default Credentials

After deployment, create new admin user and delete default one.

## 📊 Monitoring

- Backend Logs: Render dashboard → your service → Logs
- Worker Logs: Render dashboard → worker service → Logs
- MongoDB: Atlas dashboard → Collections

## 🆘 Troubleshooting

**File stuck in PROCESSING:**
- Check worker logs on Render
- Verify worker service is running
- Check MongoDB connection

**CORS Error:**
- Verify FRONTEND_URL is set correctly
- Check Render environment variables
- Redeploy backend after changes

**Database Connection Failed:**
- Check MongoDB URI is correct
- Verify password has no special characters (or is URL encoded)
- Check IP whitelist includes 0.0.0.0/0

## 📞 Quick Links

- GitHub Repo: https://github.com/DHEERAJSONKAR/Smart_Reconciliation
- MongoDB Atlas: https://www.mongodb.com/cloud/atlas
- Render Dashboard: https://dashboard.render.com
- Vercel Dashboard: https://vercel.com/dashboard

---

**Estimated Total Time:** 30-40 minutes
