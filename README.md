# Smart Reconciliation & Audit System

A full-stack reconciliation platform for financial data matching and audit management.

## Features

- **JWT Authentication & RBAC** - Secure authentication with role-based access
- **Async File Processing** - CSV/Excel upload with background processing
- **Intelligent Reconciliation** - Configurable matching rules engine
- **Audit Trail** - Complete history tracking
- **Worker-Based Architecture** - Background job processing
- **Production-Ready** - Error handling, logging, and security

## Quick Start

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Build TypeScript
npm run build

# Terminal 1: Start API server
npm run dev

# Terminal 2: Start worker process
npm run worker
```

## Documentation

- **[Backend README](backend/README.md)** - Complete API documentation
- **[Architecture Guide](backend/ARCHITECTURE.md)** - System design and architecture
- **[API Testing Guide](backend/API_TESTING_GUIDE.md)** - Step-by-step testing instructions

## Tech Stack

- Node.js + TypeScript
- Express.js
- MongoDB + Mongoose
- JWT Authentication
- Multer (file uploads)
- Winston (logging)

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### File Upload
- `POST /api/uploads` - Upload CSV/Excel file
- `GET /api/uploads/:jobId` - Get upload job status
- `GET /api/uploads` - List all upload jobs

### Reconciliation
- `GET /api/reconciliation/:uploadJobId/results` - Get reconciliation results
- `GET /api/reconciliation/:uploadJobId/stats` - Get statistics
- `PATCH /api/reconciliation/:id` - Update result (manual review)

### Dashboard
- `GET /api/dashboard/summary` - Get dashboard summary
- `GET /api/dashboard/activity` - Get recent activity

### Audit
- `GET /api/audit` - Get audit logs
- `GET /api/audit/:entityId` - Get logs for entity
- `GET /api/audit/:entityId/history` - Get full history

## Project Structure

```
backend/
├── src/
│   ├── config/              # Configuration
│   ├── database/            # Database connection
│   ├── models/              # Mongoose schemas
│   ├── controllers/         # Request handlers
│   ├── services/            # Business logic
│   ├── routes/              # API routes
│   ├── middleware/          # Express middleware
│   ├── workers/             # Background workers
│   ├── queues/              # Queue management
│   ├── utils/               # Utilities
│   ├── validations/         # Input validation
│   ├── app.ts               # Express setup
│   └── server.ts            # Entry point
├── uploads/                 # File storage
├── logs/                    # Application logs
└── package.json
```

## License

Proprietary - All rights reserved
