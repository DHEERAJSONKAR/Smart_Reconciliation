# Smart Reconciliation & Audit System - Frontend

Enterprise-grade frontend application for the Smart Reconciliation & Audit System.

## Tech Stack

- **React 18** with **TypeScript**
- **Vite** for blazing fast development
- **Tailwind CSS** for modern UI
- **React Router DOM** for routing
- **TanStack React Query** for server state management
- **Axios** for API communication
- **Recharts** for data visualization
- **React Hot Toast** for notifications

## Features

✅ **Authentication & Authorization**
- JWT-based authentication
- Role-based access control (ADMIN, ANALYST, VIEWER)
- Protected routes with automatic token management

✅ **Dashboard**
- Real-time reconciliation metrics
- Interactive charts (Pie, Bar)
- Date range filtering
- Summary cards with trends

✅ **File Upload**
- Drag & drop interface
- CSV & Excel support
- Real-time upload status tracking
- Upload history with pagination

✅ **Reconciliation**
- View reconciliation results
- Status filtering (MATCHED, PARTIAL, UNMATCHED, DUPLICATE)
- Detailed record comparison
- Mismatch highlighting

✅ **Audit Trail**
- Immutable audit logs
- Timeline view
- Change history tracking
- Entity filtering

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Backend server running on http://localhost:5000

### Installation

\`\`\`bash
cd frontend
npm install
\`\`\`

### Development

\`\`\`bash
npm run dev
\`\`\`

The application will be available at http://localhost:3000

### Build for Production

\`\`\`bash
npm run build
npm run preview
\`\`\`

## Project Structure

\`\`\`
src/
├── api/              # API client and endpoint definitions
├── auth/             # Authentication context and protected routes
├── components/       # Reusable UI components
├── layouts/          # Layout components
├── pages/            # Page components
├── types/            # TypeScript type definitions
├── utils/            # Utility functions
├── main.tsx          # Application entry point
└── index.css         # Global styles
\`\`\`

## Environment Variables

Create a `.env` file in the root directory:

\`\`\`env
VITE_API_URL=http://localhost:5000/api
\`\`\`

## Default Credentials

For testing purposes:
- Email: admin@test.com
- Password: Admin@123

## Key Features Implementation

### Role-Based Access Control

- **ADMIN**: Full access to all features
- **ANALYST**: Upload, reconciliation, and audit access
- **VIEWER**: Read-only dashboard and reconciliation access

### Real-Time Updates

- Upload status polling every 5 seconds
- React Query automatic background refetching
- Toast notifications for user feedback

### Responsive Design

- Mobile-first approach
- Tailwind CSS responsive utilities
- Optimized for all screen sizes

## API Integration

All API endpoints are consumed from the backend:

- `POST /api/auth/login` - Authentication
- `POST /api/uploads` - File upload
- `GET /api/uploads` - Upload history
- `GET /api/dashboard` - Dashboard metrics
- `GET /api/reconciliation` - Reconciliation results
- `GET /api/audit/logs` - Audit trail

## Contributing

This is an enterprise production system. Follow the coding standards:

- TypeScript strict mode enabled
- ESLint for code quality
- Tailwind CSS for styling
- Component-based architecture
- React Query for data fetching

## License

Proprietary - Smart Reconciliation & Audit System
