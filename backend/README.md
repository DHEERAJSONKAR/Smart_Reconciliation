# Smart Reconciliation & Audit System - Backend

## 🚀 Overview

Enterprise-grade backend system for financial reconciliation and audit trail management. Built with Node.js, Express, TypeScript, and MongoDB.

## 📋 Features

- **Authentication & Authorization**: JWT-based auth with role-based access control (ADMIN, ANALYST, VIEWER)
- **File Upload System**: Async processing of CSV/Excel files with idempotency
- **Worker-Based Processing**: Queue system for scalable background job processing
- **Reconciliation Engine**: Configurable rules engine (exact match, partial match, duplicate detection)
- **Audit Trail**: Immutable audit logs for all critical operations
- **REST APIs**: Comprehensive API endpoints with validation and error handling

## 🛠️ Tech Stack

- **Runtime**: Node.js + TypeScript
- **Framework**: Express.js
- **Database**: MongoDB + Mongoose
- **Authentication**: JWT + bcrypt
- **File Processing**: Multer, csv-parser, xlsx
- **Security**: Helmet, CORS, Rate Limiting
- **Validation**: Joi
- **Logging**: Winston

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/              # Configuration files
│   │   ├── index.ts
│   │   └── reconciliationRules.ts
│   ├── database/            # Database connection
│   │   └── connection.ts
│   ├── models/              # Mongoose schemas
│   │   ├── User.model.ts
│   │   ├── UploadJob.model.ts
│   │   ├── Record.model.ts
│   │   ├── ReconciliationResult.model.ts
│   │   └── AuditLog.model.ts
│   ├── controllers/         # Request handlers
│   │   ├── auth.controller.ts
│   │   ├── upload.controller.ts
│   │   ├── reconciliation.controller.ts
│   │   ├── dashboard.controller.ts
│   │   └── audit.controller.ts
│   ├── services/            # Business logic
│   │   ├── auth.service.ts
│   │   ├── upload.service.ts
│   │   ├── fileParser.service.ts
│   │   ├── record.service.ts
│   │   ├── reconciliation.service.ts
│   │   └── audit.service.ts
│   ├── routes/              # API routes
│   │   ├── health.routes.ts
│   │   ├── auth.routes.ts
│   │   ├── upload.routes.ts
│   │   ├── reconciliation.routes.ts
│   │   ├── dashboard.routes.ts
│   │   └── audit.routes.ts
│   ├── middleware/          # Express middleware
│   │   ├── errorHandler.ts
│   │   ├── asyncHandler.ts
│   │   ├── auth.middleware.ts
│   │   ├── upload.middleware.ts
│   │   ├── validate.middleware.ts
│   │   └── sanitize.middleware.ts
│   ├── workers/             # Background workers
│   │   ├── uploadWorker.ts
│   │   └── index.ts
│   ├── queues/              # Queue management
│   │   ├── Queue.ts
│   │   └── upload.queue.ts
│   ├── utils/               # Utilities
│   │   ├── logger.ts
│   │   ├── apiResponse.ts
│   │   ├── fileUtils.ts
│   │   └── security.ts
│   ├── validations/         # Input validation schemas
│   │   ├── auth.validation.ts
│   │   ├── reconciliation.validation.ts
│   │   └── common.validation.ts
│   ├── app.ts              # Express app setup
│   └── server.ts           # Server entry point
├── uploads/                # File upload directory
├── logs/                   # Application logs
├── package.json
├── tsconfig.json
├── .env.example
└── .gitignore
```

## 🚦 Getting Started

### Prerequisites

- Node.js >= 18.x
- MongoDB >= 6.x
- npm or yarn

### Installation

1. Clone the repository and navigate to backend:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Configure environment variables in `.env`:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/smart_reconciliation
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=7d
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads
RECONCILIATION_CHUNK_SIZE=1000
PARTIAL_MATCH_VARIANCE=0.02
WORKER_CONCURRENCY=5
WORKER_RETRY_ATTEMPTS=3
WORKER_RETRY_DELAY=5000
```

5. Build TypeScript:
```bash
npm run build
```

### Running the Application

#### Development Mode

Terminal 1 - Main Server:
```bash
npm run dev
```

Terminal 2 - Worker Process:
```bash
npm run worker
```

#### Production Mode

```bash
npm run build
npm start
```

Run worker separately:
```bash
node dist/workers/index.js
```

## 📡 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123",
  "role": "ANALYST"  // Optional: ADMIN | ANALYST | VIEWER
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123"
}

Response:
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "email": "user@example.com",
      "role": "ANALYST"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Get Profile
```http
GET /api/auth/profile
Authorization: Bearer {token}
```

### File Upload

#### Upload File
```http
POST /api/uploads
Authorization: Bearer {token}
Content-Type: multipart/form-data

file: [CSV or Excel file]

Response:
{
  "success": true,
  "data": {
    "jobId": "...",
    "fileName": "transactions.csv",
    "status": "PROCESSING"
  }
}
```

#### Get Upload Job Status
```http
GET /api/uploads/:jobId
Authorization: Bearer {token}
```

#### List Upload Jobs
```http
GET /api/uploads?status=COMPLETED&page=1&limit=20
Authorization: Bearer {token}
```

### Reconciliation

#### Get Reconciliation Results
```http
GET /api/reconciliation/:uploadJobId/results?status=UNMATCHED
Authorization: Bearer {token}
```

#### Get Reconciliation Statistics
```http
GET /api/reconciliation/:uploadJobId/stats
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": {
    "total": 1000,
    "matched": 850,
    "partial": 100,
    "unmatched": 30,
    "duplicate": 20
  }
}
```

#### Update Reconciliation Result (Manual Review)
```http
PATCH /api/reconciliation/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "MATCHED",
  "notes": "Manually verified - amounts match"
}
```

### Dashboard

#### Get Dashboard Summary
```http
GET /api/dashboard/summary
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": {
    "uploads": {
      "total": 50,
      "completed": 45,
      "processing": 3,
      "failed": 2
    },
    "reconciliation": {
      "total": 10000,
      "matched": 8500,
      "partial": 1000,
      "unmatched": 300,
      "duplicate": 200
    },
    "recentJobs": [...]
  }
}
```

#### Get Recent Activity
```http
GET /api/dashboard/activity?limit=20
Authorization: Bearer {token}
```

### Audit

#### Get Audit Logs
```http
GET /api/audit?entityType=ReconciliationResult&page=1&limit=50
Authorization: Bearer {token}
```

#### Get Audit Logs for Entity
```http
GET /api/audit/:entityId?entityType=ReconciliationResult
Authorization: Bearer {token}
```

#### Get Audit History
```http
GET /api/audit/:entityId/history?entityType=ReconciliationResult
Authorization: Bearer {token}
```

### Health Check

```http
GET /api/health

Response:
{
  "success": true,
  "data": {
    "uptime": 3600,
    "timestamp": "2026-01-26T10:00:00.000Z",
    "status": "OK",
    "database": "Connected"
  }
}
```

## 🔒 Role-Based Access Control

| Role | Permissions |
|------|------------|
| **VIEWER** | View reconciliation results, dashboard, audit logs |
| **ANALYST** | All VIEWER permissions + Upload files + Update reconciliation results |
| **ADMIN** | All ANALYST permissions + View all users' data + Access all audit logs |

## 🧩 Reconciliation Rules

### 1. Exact Match (Priority 1)
- Matches on: `transactionId` + `amount`
- Confidence: 100%

### 2. Partial Match (Priority 2)
- Matches on: `referenceNumber` + `amount` (with ±2% variance)
- Confidence: Calculated based on variance

### 3. Duplicate Detection (Priority 3)
- Detects: Same `transactionId` within same upload
- Status: DUPLICATE

### 4. Unmatched
- No matching record found
- Status: UNMATCHED

## 📝 CSV/Excel File Format

Your upload files should have the following columns:

| Column | Required | Description |
|--------|----------|-------------|
| `transaction_id` or `transactionId` | Yes | Unique transaction identifier |
| `reference_number` or `referenceNumber` | Yes | Reference number |
| `amount` | Yes | Transaction amount |
| `date` | Yes | Transaction date |
| `description` | No | Transaction description |
| `source_system` or `sourceSystem` | No | Source system name |

Example CSV:
```csv
transaction_id,reference_number,amount,date,description
TXN001,REF12345,1000.00,2026-01-15,Payment received
TXN002,REF12346,2500.50,2026-01-16,Invoice payment
```

## 🔐 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Input sanitization and validation
- Rate limiting (100 requests per 15 minutes)
- Helmet.js security headers
- CORS protection
- File type validation
- File size limits (10MB default)
- SQL/NoSQL injection protection

## 📊 Monitoring & Logging

Logs are stored in `logs/` directory:
- `error.log` - Error logs only
- `combined.log` - All logs

Log format:
```
2026-01-26 10:00:00 [info]: Server running in development mode on port 5000
2026-01-26 10:00:01 [info]: MongoDB connected successfully
```

## 🐛 Error Handling

All errors follow this format:
```json
{
  "success": false,
  "message": "Error description",
  "error": {
    "details": "..."
  }
}
```

Common HTTP Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict (duplicate file)
- `500` - Internal Server Error

## 🧪 Testing

To test the system:

1. Start MongoDB
2. Run the server: `npm run dev`
3. Run the worker: `npm run worker`
4. Use Postman/Insomnia/cURL to test APIs

Example test flow:
```bash
# 1. Register user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","role":"ANALYST"}'

# 2. Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# 3. Upload file
curl -X POST http://localhost:5000/api/uploads \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@transactions.csv"

# 4. Check status
curl http://localhost:5000/api/uploads/JOB_ID \
  -H "Authorization: Bearer YOUR_TOKEN"

# 5. View results
curl http://localhost:5000/api/reconciliation/JOB_ID/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🔧 Configuration

All configuration is in `src/config/`:

- `index.ts` - Main configuration
- `reconciliationRules.ts` - Reconciliation rules configuration

Modify rules easily:
```typescript
export const reconciliationRules: ReconciliationRule[] = [
  {
    name: 'EXACT_MATCH',
    priority: 1,
    enabled: true,
    matchCriteria: {
      fields: ['transactionId', 'amount'],
    },
  },
  // Add more rules...
];
```

## 📈 Performance Considerations

- **Batch Processing**: Records processed in configurable chunks (default: 1000)
- **Async Workers**: Non-blocking file processing
- **Database Indexes**: Optimized queries with strategic indexes
- **Connection Pooling**: MongoDB connection reuse
- **Rate Limiting**: API protection against abuse

## 🚨 Production Deployment

1. Set `NODE_ENV=production`
2. Use strong `JWT_SECRET`
3. Configure production MongoDB URI
4. Use process manager (PM2):
```bash
pm2 start dist/server.js --name api
pm2 start dist/workers/index.js --name worker
```
5. Enable HTTPS with reverse proxy (nginx)
6. Set up log rotation
7. Configure MongoDB backups
8. Monitor with APM tools

## 📄 License

Proprietary - All rights reserved

## 👥 Support

For support, email: support@example.com
