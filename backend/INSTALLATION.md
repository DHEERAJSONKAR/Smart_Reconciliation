# 🚀 Installation & Setup Guide

## Quick Setup (5 minutes)

### Step 1: Install Dependencies

```bash
cd backend
npm install
```

This will install all required packages:
- express (web framework)
- mongoose (MongoDB ODM)
- typescript (TypeScript compiler)
- And all other dependencies (~50 packages)

### Step 2: Setup Environment

```bash
# Copy example environment file
cp .env.example .env

# Edit .env file (use your preferred editor)
nano .env
```

**Minimum Required Configuration:**
```env
MONGODB_URI=mongodb://localhost:27017/smart_reconciliation
JWT_SECRET=your_super_secret_key_here
```

### Step 3: Ensure MongoDB is Running

```bash
# Check if MongoDB is running
mongo --eval "db.version()"

# Or start MongoDB (macOS with Homebrew)
brew services start mongodb-community

# Or start MongoDB (Linux)
sudo systemctl start mongod

# Or start MongoDB (Docker)
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### Step 4: Build TypeScript

```bash
npm run build
```

This compiles TypeScript to JavaScript in the `dist/` folder.

### Step 5: Run the Application

**Development Mode (with hot reload):**

Terminal 1 - API Server:
```bash
npm run dev
```

Terminal 2 - Worker Process:
```bash
npm run worker
```

**Production Mode:**

Terminal 1 - API Server:
```bash
npm start
```

Terminal 2 - Worker Process:
```bash
node dist/workers/index.js
```

### Step 6: Verify Installation

```bash
# Test health endpoint
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "success": true,
  "message": "System is healthy",
  "data": {
    "uptime": 0.123,
    "timestamp": "2026-01-26T10:00:00.000Z",
    "status": "OK",
    "database": "Connected"
  }
}
```

---

## Detailed Setup Instructions

### Prerequisites

#### 1. Node.js (v18 or higher)

**macOS:**
```bash
brew install node
```

**Linux:**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**Windows:**
Download from https://nodejs.org/

**Verify:**
```bash
node --version  # Should show v18.x.x or higher
npm --version   # Should show 9.x.x or higher
```

#### 2. MongoDB (v6 or higher)

**macOS:**
```bash
brew tap mongodb/brew
brew install mongodb-community@6.0
brew services start mongodb-community@6.0
```

**Linux (Ubuntu/Debian):**
```bash
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod
```

**Windows:**
Download from https://www.mongodb.com/try/download/community

**Docker (easiest):**
```bash
docker run -d \
  --name mongodb \
  -p 27017:27017 \
  -v mongodb_data:/data/db \
  mongo:latest
```

**Verify:**
```bash
mongo --version  # Should show v6.x.x or higher
```

---

## Environment Configuration

### Full .env Configuration

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/smart_reconciliation

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=7d

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads

# Reconciliation Configuration
RECONCILIATION_CHUNK_SIZE=1000
PARTIAL_MATCH_VARIANCE=0.02

# Worker Configuration
WORKER_CONCURRENCY=5
WORKER_RETRY_ATTEMPTS=3
WORKER_RETRY_DELAY=5000
```

### Configuration Explanations

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | development | Environment mode (development/production) |
| `PORT` | 5000 | Port for API server |
| `MONGODB_URI` | mongodb://localhost:27017/smart_reconciliation | MongoDB connection string |
| `JWT_SECRET` | (required) | Secret key for JWT tokens - MUST BE CHANGED |
| `JWT_EXPIRES_IN` | 7d | Token expiration time |
| `MAX_FILE_SIZE` | 10485760 | Max upload size in bytes (10MB) |
| `UPLOAD_DIR` | ./uploads | Directory for uploaded files |
| `RECONCILIATION_CHUNK_SIZE` | 1000 | Records per batch during processing |
| `PARTIAL_MATCH_VARIANCE` | 0.02 | Amount variance for partial matches (2%) |
| `WORKER_CONCURRENCY` | 5 | Number of concurrent jobs |
| `WORKER_RETRY_ATTEMPTS` | 3 | Max retry attempts for failed jobs |
| `WORKER_RETRY_DELAY` | 5000 | Delay between retries (ms) |

---

## Troubleshooting

### Issue: npm install fails

**Solution 1: Clear cache**
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

**Solution 2: Use specific registry**
```bash
npm install --registry=https://registry.npmjs.org/
```

### Issue: MongoDB connection failed

**Check if MongoDB is running:**
```bash
mongo --eval "db.version()"
```

**Check MongoDB logs:**
```bash
# macOS
tail -f /usr/local/var/log/mongodb/mongo.log

# Linux
tail -f /var/log/mongodb/mongod.log
```

**Try alternative connection string:**
```env
MONGODB_URI=mongodb://127.0.0.1:27017/smart_reconciliation
```

### Issue: Port already in use

**Find and kill process:**
```bash
# Find process using port 5000
lsof -i :5000

# Kill process
kill -9 <PID>
```

**Or use different port:**
```env
PORT=3000
```

### Issue: TypeScript compilation errors

**Install TypeScript globally:**
```bash
npm install -g typescript
```

**Check TypeScript version:**
```bash
tsc --version
```

**Clean and rebuild:**
```bash
rm -rf dist
npm run build
```

### Issue: Permission denied on uploads directory

**Fix permissions:**
```bash
mkdir -p uploads
chmod 755 uploads
```

### Issue: Worker not processing jobs

**Check worker is running:**
```bash
ps aux | grep worker
```

**Check worker logs:**
```bash
tail -f logs/combined.log
```

**Restart worker:**
```bash
# Kill existing worker
pkill -f "node.*worker"

# Start worker again
npm run worker
```

---

## Production Deployment

### Using PM2 (Process Manager)

#### 1. Install PM2
```bash
npm install -g pm2
```

#### 2. Create PM2 Configuration

Create `ecosystem.config.js`:
```javascript
module.exports = {
  apps: [
    {
      name: 'api',
      script: 'dist/server.js',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
      },
    },
    {
      name: 'worker',
      script: 'dist/workers/index.js',
      instances: 1,
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
```

#### 3. Start with PM2
```bash
# Build
npm run build

# Start all processes
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on system boot
pm2 startup
```

#### 4. PM2 Commands
```bash
pm2 status          # Check status
pm2 logs            # View logs
pm2 logs api        # View API logs only
pm2 logs worker     # View worker logs only
pm2 restart all     # Restart all processes
pm2 stop all        # Stop all processes
pm2 delete all      # Delete all processes
pm2 monit           # Monitor in real-time
```

---

## Docker Deployment (Optional)

### Create Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 5000

CMD ["node", "dist/server.js"]
```

### Create docker-compose.yml

```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:6
    ports:
      - '27017:27017'
    volumes:
      - mongodb_data:/data/db

  api:
    build: .
    ports:
      - '5000:5000'
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongodb:27017/smart_reconciliation
      - JWT_SECRET=your_production_secret
    depends_on:
      - mongodb

  worker:
    build: .
    command: node dist/workers/index.js
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongodb:27017/smart_reconciliation
    depends_on:
      - mongodb

volumes:
  mongodb_data:
```

### Run with Docker Compose

```bash
docker-compose up -d
docker-compose logs -f
docker-compose down
```

---

## Verification Checklist

After installation, verify everything works:

- [ ] `npm install` completed without errors
- [ ] MongoDB is running and accessible
- [ ] `.env` file is configured
- [ ] `npm run build` succeeds
- [ ] API server starts (`npm run dev`)
- [ ] Worker starts (`npm run worker`)
- [ ] Health endpoint returns 200 OK
- [ ] Can register a user
- [ ] Can login and receive token
- [ ] Can upload a file
- [ ] Worker processes the file
- [ ] Reconciliation results appear
- [ ] Dashboard shows summary
- [ ] Logs are being written to `logs/` directory

---

## Next Steps

1. ✅ Complete installation
2. 📖 Read [README.md](README.md) for API documentation
3. 🧪 Follow [API_TESTING_GUIDE.md](API_TESTING_GUIDE.md) to test
4. 🏗️ Read [ARCHITECTURE.md](ARCHITECTURE.md) for system design
5. 🚀 Deploy to production

---

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review logs in `logs/` directory
3. Verify MongoDB connection
4. Ensure all dependencies are installed
5. Check Node.js and MongoDB versions

---

## Quick Command Reference

```bash
# Development
npm run dev                    # Start API (with hot reload)
npm run worker                 # Start worker (with hot reload)

# Production
npm run build                  # Compile TypeScript
npm start                      # Start API
node dist/workers/index.js     # Start worker

# Maintenance
npm install                    # Install dependencies
npm run build                  # Build TypeScript
rm -rf node_modules dist       # Clean everything
rm -rf uploads/* logs/*        # Clean data

# MongoDB
mongo                          # Open MongoDB shell
mongo smart_reconciliation     # Connect to database
db.dropDatabase()              # Drop database (careful!)
db.users.find()                # View users

# PM2 (Production)
pm2 start ecosystem.config.js  # Start all processes
pm2 status                     # Check status
pm2 logs                       # View logs
pm2 restart all                # Restart all
pm2 stop all                   # Stop all
```

---

**Installation complete! 🎉**

Your Smart Reconciliation & Audit System backend is now ready to use.
