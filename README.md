# Smart Reconciliation & Audit System

Enterprise-grade financial reconciliation and audit system built with MERN stack.

## Features

- 📁 CSV/Excel file upload and parsing
- 🔄 Automated reconciliation with configurable rules
- 📊 Real-time dashboard and analytics
- 🔍 Comprehensive audit trail
- 👥 User authentication and authorization
- ⚡ Background job processing

## Tech Stack

**Backend:**
- Node.js + Express + TypeScript
- MongoDB + Mongoose
- JWT Authentication
- Background Workers

**Frontend:**
- React + TypeScript
- Vite
- TailwindCSS
- React Query

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/YOUR_USERNAME/smart-reconciliation.git
cd smart-reconciliation
```

2. Backend Setup:
```bash
cd backend
npm install
cp .env.example .env
# Update .env with your MongoDB URI
npm run build
npm start
```

3. Worker Setup (separate terminal):
```bash
cd backend
npm run worker
```

4. Frontend Setup:
```bash
cd frontend
npm install
cp .env.example .env
# Update VITE_API_URL if needed
npm run dev
```

## CSV File Format

Upload CSV files with these columns:
```csv
transaction_id,reference_number,amount,date,description,source_system
TXN001,REF001,15000.50,2026-01-15,Payment description,SystemName
```

**Required columns:**
- `transaction_id` - Unique transaction ID
- `reference_number` - Reference for matching
- `amount` - Numeric amount
- `date` - Date in YYYY-MM-DD format

**Optional columns:**
- `description` - Transaction description
- `source_system` - System name

## Deployment

See deployment guides:
- Backend: Deploy on Render/Railway
- Worker: Deploy as background service
- Frontend: Deploy on Vercel/Netlify
- Database: MongoDB Atlas

## Default Credentials

```
Email: admin@test.com
Password: Admin@123
```

⚠️ Change these credentials in production!

## License

MIT
