# Smart Reconciliation & Audit System - Architecture

## System Overview

The Smart Reconciliation & Audit System is built with a modern, scalable architecture following enterprise best practices.

## Architecture Principles

1. **Separation of Concerns**: Clear separation between controllers, services, and data access
2. **Async-First**: Non-blocking operations for file processing and reconciliation
3. **Queue-Based Processing**: Decoupled job processing with retry mechanisms
4. **Immutable Audit Trail**: All changes tracked and never deleted
5. **Role-Based Security**: Backend-enforced authorization
6. **Idempotent Operations**: Duplicate file detection prevents reprocessing
7. **Configurable Rules Engine**: Easy to modify reconciliation logic

## System Components

### 1. API Layer
- **Express.js** web framework
- RESTful API design
- JWT authentication
- Input validation (Joi)
- Error handling middleware
- Rate limiting

### 2. Business Logic Layer
- Service classes for domain logic
- Transaction management
- Reconciliation engine
- Audit service

### 3. Data Layer
- MongoDB with Mongoose ODM
- Optimized indexes
- Schema validation
- Relationships between entities

### 4. Worker Layer
- Background job processing
- Queue management
- Retry logic
- Error recovery

### 5. Security Layer
- JWT token management
- bcrypt password hashing
- Input sanitization
- CORS and Helmet
- Rate limiting

## Data Flow

### File Upload Flow
```
1. User uploads file via API
   ↓
2. Multer middleware saves file
   ↓
3. Calculate file hash (SHA-256)
   ↓
4. Check for duplicate (idempotency)
   ↓
5. Create UploadJob record
   ↓
6. Add job to queue
   ↓
7. Return job ID immediately
   ↓
8. Worker processes job asynchronously
   ↓
9. Parse file (CSV/Excel)
   ↓
10. Create Record entries
   ↓
11. Run reconciliation engine
   ↓
12. Update job status to COMPLETED
```

### Reconciliation Flow
```
1. Get all records for upload job
   ↓
2. Load active reconciliation rules
   ↓
3. Process records in chunks
   ↓
4. For each record:
   - Try EXACT_MATCH rule
   - If no match, try PARTIAL_MATCH rule
   - If no match, try DUPLICATE_DETECTION
   - If no match, mark as UNMATCHED
   ↓
5. Create ReconciliationResult entries
   ↓
6. Return statistics
```

### Audit Trail Flow
```
1. User performs action (update reconciliation)
   ↓
2. Controller captures old and new values
   ↓
3. Call AuditService.log()
   ↓
4. Create immutable AuditLog entry
   ↓
5. Log includes:
   - Entity type and ID
   - Action performed
   - Who made the change
   - When it happened
   - IP and user agent
```

## Database Schema

### Collections

#### users
```
{
  _id: ObjectId
  email: String (unique, indexed)
  password: String (hashed)
  role: String (ADMIN | ANALYST | VIEWER)
  isActive: Boolean
  createdAt: Date
  updatedAt: Date
}
```

#### uploadjobs
```
{
  _id: ObjectId
  fileName: String
  fileHash: String (unique, indexed)
  fileSize: Number
  filePath: String
  status: String (PROCESSING | COMPLETED | FAILED)
  uploadedBy: ObjectId (ref: User)
  totalRecords: Number
  processedRecords: Number
  errorMessage: String
  startedAt: Date
  completedAt: Date
  createdAt: Date
  updatedAt: Date
}

Indexes:
- fileHash (unique)
- status
- uploadedBy + createdAt
```

#### records
```
{
  _id: ObjectId
  uploadJobId: ObjectId (ref: UploadJob)
  transactionId: String (indexed)
  referenceNumber: String (indexed)
  amount: Number
  date: Date
  description: String
  sourceSystem: String
  metadata: Object
  createdAt: Date
  updatedAt: Date
}

Indexes:
- uploadJobId
- transactionId
- referenceNumber
- transactionId + amount (compound)
- referenceNumber + amount (compound)
```

#### reconciliationresults
```
{
  _id: ObjectId
  recordId: ObjectId (ref: Record, unique)
  uploadJobId: ObjectId (ref: UploadJob)
  status: String (MATCHED | PARTIAL | UNMATCHED | DUPLICATE)
  matchedWith: ObjectId (ref: Record)
  confidence: Number (0-1)
  reason: String
  ruleName: String
  amountVariance: Number
  manuallyReviewed: Boolean
  reviewedBy: ObjectId (ref: User)
  reviewedAt: Date
  notes: String
  createdAt: Date
  updatedAt: Date
}

Indexes:
- recordId (unique)
- uploadJobId + status (compound)
- status + manuallyReviewed (compound)
```

#### auditlogs
```
{
  _id: ObjectId
  entityType: String
  entityId: ObjectId
  action: String (CREATE | UPDATE | DELETE | RECONCILE | REVIEW)
  oldValue: Object
  newValue: Object
  changedBy: ObjectId (ref: User)
  source: String
  ipAddress: String
  userAgent: String
  timestamp: Date (immutable)
}

Indexes:
- entityType + entityId + timestamp (compound)
- changedBy + timestamp (compound)

Constraints:
- No updates or deletes allowed (enforced at schema level)
```

## Security Architecture

### Authentication Flow
```
1. User sends credentials
   ↓
2. Server validates credentials
   ↓
3. Generate JWT token with payload:
   {
     userId: "...",
     email: "...",
     role: "..."
   }
   ↓
4. Return token to client
   ↓
5. Client includes token in Authorization header
   ↓
6. Middleware verifies token
   ↓
7. Attach user info to request
   ↓
8. Proceed to route handler
```

### Authorization Middleware
```typescript
// Example authorization check
router.patch(
  '/reconciliation/:id',
  authenticate,  // Verify JWT
  authorize(UserRole.ANALYST, UserRole.ADMIN),  // Check role
  controller.update
);
```

### Security Layers
1. **Helmet**: Security headers
2. **CORS**: Cross-origin protection
3. **Rate Limiting**: API abuse prevention
4. **Input Sanitization**: XSS prevention
5. **Validation**: Joi schemas
6. **Password Hashing**: bcrypt with salt
7. **File Validation**: Type and size checks

## Scalability Considerations

### Horizontal Scaling
- Stateless API servers (can run multiple instances)
- Shared MongoDB database
- Queue system supports multiple workers
- Load balancer for API distribution

### Vertical Scaling
- Configurable chunk sizes for batch processing
- Worker concurrency settings
- Database connection pooling
- Indexed queries for performance

### Performance Optimizations
- Database indexes on frequently queried fields
- Compound indexes for multi-field queries
- Chunked processing for large files
- Async/await throughout codebase
- Lazy loading with pagination

## Error Handling Strategy

### Error Types
1. **Validation Errors**: 400 Bad Request
2. **Authentication Errors**: 401 Unauthorized
3. **Authorization Errors**: 403 Forbidden
4. **Not Found Errors**: 404 Not Found
5. **Conflict Errors**: 409 Conflict (duplicates)
6. **Server Errors**: 500 Internal Server Error

### Error Propagation
```
Controller → try/catch → asyncHandler → errorHandler middleware
```

### Error Logging
- All errors logged with Winston
- Stack traces in development
- Sanitized messages in production
- Correlation IDs for tracing

## Monitoring & Observability

### Logging Levels
- **error**: Application errors
- **warn**: Warning messages
- **info**: Informational messages
- **debug**: Debug information (dev only)

### Key Metrics to Monitor
- API response times
- Queue processing time
- File upload success rate
- Reconciliation accuracy
- Database query performance
- Error rates by endpoint
- Active user sessions

### Health Checks
- `/api/health` endpoint
- Database connectivity check
- Uptime monitoring
- Resource utilization

## Deployment Architecture

### Recommended Setup
```
Load Balancer (nginx)
    ↓
API Servers (multiple instances)
    ↓
MongoDB Cluster (replica set)

Worker Servers (separate instances)
    ↓
MongoDB Cluster (same)
```

### Process Management
```bash
# API Server
pm2 start dist/server.js -i 4 --name api

# Worker
pm2 start dist/workers/index.js --name worker
```

## Future Enhancements

1. **Redis Queue**: Replace in-memory queue with Redis for distributed systems
2. **Microservices**: Split into separate services (auth, upload, reconciliation)
3. **Event Sourcing**: Full event log for all state changes
4. **GraphQL API**: Add GraphQL alongside REST
5. **Real-time Updates**: WebSocket for live job status
6. **Advanced Analytics**: ML-based reconciliation suggestions
7. **Multi-tenancy**: Support multiple organizations
8. **API Versioning**: v1, v2 endpoints
9. **Caching Layer**: Redis for frequently accessed data
10. **Container Orchestration**: Kubernetes deployment

## Backup & Recovery

### Database Backups
- Daily automated MongoDB backups
- Point-in-time recovery enabled
- Backup retention: 30 days
- Test restores monthly

### File Backups
- Uploaded files backed up to S3/cloud storage
- Retention based on compliance requirements

### Disaster Recovery
- RTO (Recovery Time Objective): 4 hours
- RPO (Recovery Point Objective): 1 hour
- Documented recovery procedures
- Regular DR drills

## Compliance & Audit

### Data Retention
- Audit logs: 7 years (configurable)
- Upload files: 90 days (configurable)
- Reconciliation results: Indefinite
- User data: Until account deletion

### Audit Trail
- All critical actions logged
- Immutable audit records
- User identification
- Timestamp and IP tracking
- Change history preservation

## Testing Strategy

### Unit Tests
- Service layer functions
- Utility functions
- Validation schemas

### Integration Tests
- API endpoints
- Database operations
- Queue processing

### End-to-End Tests
- Complete user workflows
- File upload to reconciliation
- Multi-user scenarios

### Performance Tests
- Load testing (JMeter/k6)
- Stress testing
- Concurrent user simulation
- Large file processing

## Conclusion

This architecture provides a solid foundation for an enterprise-grade reconciliation system with emphasis on:
- Scalability
- Security
- Maintainability
- Observability
- Compliance
