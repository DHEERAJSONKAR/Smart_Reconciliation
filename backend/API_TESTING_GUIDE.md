# API Testing Guide - Smart Reconciliation System

This guide provides step-by-step instructions for testing all API endpoints using cURL or any API client (Postman, Insomnia, etc.).

## Prerequisites

1. Server running on `http://localhost:5000`
2. MongoDB running
3. Worker process running

## Quick Start

```bash
# Terminal 1: Start server
npm run dev

# Terminal 2: Start worker
npm run worker
```

## Test Sequence

### 1. Health Check

```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "success": true,
  "message": "System is healthy",
  "data": {
    "uptime": 123.45,
    "timestamp": "2026-01-26T10:00:00.000Z",
    "status": "OK",
    "database": "Connected"
  }
}
```

---

### 2. User Registration

#### Register as ADMIN
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "Admin123!",
    "role": "ADMIN"
  }'
```

#### Register as ANALYST
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "analyst@example.com",
    "password": "Analyst123!",
    "role": "ANALYST"
  }'
```

#### Register as VIEWER
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "viewer@example.com",
    "password": "Viewer123!",
    "role": "VIEWER"
  }'
```

Expected response:
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "...",
      "email": "analyst@example.com",
      "role": "ANALYST"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Save the token for subsequent requests!**

---

### 3. User Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "analyst@example.com",
    "password": "Analyst123!"
  }'
```

**Export token as environment variable:**
```bash
export TOKEN="your_token_here"
```

---

### 4. Get User Profile

```bash
curl http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer $TOKEN"
```

---

### 5. File Upload

#### Create test CSV file

```bash
cat > test_transactions.csv << 'EOF'
transaction_id,reference_number,amount,date,description,source_system
TXN001,REF12345,1000.00,2026-01-15,Payment received,System A
TXN002,REF12346,2500.50,2026-01-16,Invoice payment,System A
TXN003,REF12347,1500.00,2026-01-17,Transfer,System B
TXN004,REF12348,3000.00,2026-01-18,Commission,System A
TXN005,REF12345,1020.00,2026-01-19,Payment adjustment,System B
TXN001,REF99999,1000.00,2026-01-20,Duplicate test,System C
EOF
```

#### Upload file

```bash
curl -X POST http://localhost:5000/api/uploads \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@test_transactions.csv"
```

Expected response:
```json
{
  "success": true,
  "message": "File upload initiated",
  "data": {
    "jobId": "65b4c8f9e123456789abcdef",
    "fileName": "test_transactions.csv",
    "status": "PROCESSING",
    "message": "File uploaded successfully and queued for processing"
  }
}
```

**Save the jobId:**
```bash
export JOB_ID="65b4c8f9e123456789abcdef"
```

---

### 6. Check Upload Status

```bash
curl http://localhost:5000/api/uploads/$JOB_ID \
  -H "Authorization: Bearer $TOKEN"
```

Wait a few seconds and check again until status is `COMPLETED`.

---

### 7. List All Upload Jobs

```bash
# All jobs
curl http://localhost:5000/api/uploads \
  -H "Authorization: Bearer $TOKEN"

# Completed jobs only
curl "http://localhost:5000/api/uploads?status=COMPLETED" \
  -H "Authorization: Bearer $TOKEN"

# With pagination
curl "http://localhost:5000/api/uploads?page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN"
```

---

### 8. View Reconciliation Statistics

```bash
curl http://localhost:5000/api/reconciliation/$JOB_ID/stats \
  -H "Authorization: Bearer $TOKEN"
```

Expected response:
```json
{
  "success": true,
  "message": "Reconciliation statistics retrieved successfully",
  "data": {
    "total": 6,
    "matched": 0,
    "partial": 2,
    "unmatched": 2,
    "duplicate": 2
  }
}
```

---

### 9. View Reconciliation Results

#### All results
```bash
curl http://localhost:5000/api/reconciliation/$JOB_ID/results \
  -H "Authorization: Bearer $TOKEN"
```

#### Unmatched only
```bash
curl "http://localhost:5000/api/reconciliation/$JOB_ID/results?status=UNMATCHED" \
  -H "Authorization: Bearer $TOKEN"
```

#### Duplicates only
```bash
curl "http://localhost:5000/api/reconciliation/$JOB_ID/results?status=DUPLICATE" \
  -H "Authorization: Bearer $TOKEN"
```

#### Partial matches only
```bash
curl "http://localhost:5000/api/reconciliation/$JOB_ID/results?status=PARTIAL" \
  -H "Authorization: Bearer $TOKEN"
```

---

### 10. Update Reconciliation Result (Manual Review)

Get a result ID from the previous response, then:

```bash
export RESULT_ID="65b4c8f9e123456789abcdef"

curl -X PATCH http://localhost:5000/api/reconciliation/$RESULT_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "MATCHED",
    "notes": "Manually verified - amounts within acceptable variance"
  }'
```

---

### 11. Dashboard Summary

```bash
curl http://localhost:5000/api/dashboard/summary \
  -H "Authorization: Bearer $TOKEN"
```

Expected response:
```json
{
  "success": true,
  "message": "Dashboard summary retrieved successfully",
  "data": {
    "uploads": {
      "total": 1,
      "completed": 1,
      "processing": 0,
      "failed": 0
    },
    "reconciliation": {
      "total": 6,
      "matched": 1,
      "partial": 2,
      "unmatched": 2,
      "duplicate": 1
    },
    "recentJobs": [...]
  }
}
```

---

### 12. Recent Activity

```bash
curl "http://localhost:5000/api/dashboard/activity?limit=5" \
  -H "Authorization: Bearer $TOKEN"
```

---

### 13. Audit Logs

#### Get all audit logs (ADMIN only)
```bash
curl http://localhost:5000/api/audit \
  -H "Authorization: Bearer $TOKEN"
```

#### Get audit logs for specific entity
```bash
curl "http://localhost:5000/api/audit/$RESULT_ID?entityType=ReconciliationResult" \
  -H "Authorization: Bearer $TOKEN"
```

#### Get audit history
```bash
curl "http://localhost:5000/api/audit/$RESULT_ID/history?entityType=ReconciliationResult" \
  -H "Authorization: Bearer $TOKEN"
```

#### Filter audit logs
```bash
curl "http://localhost:5000/api/audit?entityType=ReconciliationResult&action=REVIEW" \
  -H "Authorization: Bearer $TOKEN"
```

---

## Test Scenarios

### Scenario 1: Duplicate File Upload (Idempotency Test)

Upload the same file twice:

```bash
# First upload
curl -X POST http://localhost:5000/api/uploads \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@test_transactions.csv"

# Wait for processing to complete (check status)

# Second upload (same file)
curl -X POST http://localhost:5000/api/uploads \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@test_transactions.csv"
```

Expected: Second upload should return 409 Conflict with message about duplicate file.

---

### Scenario 2: Role-Based Access Control

#### VIEWER trying to upload (should fail)
```bash
# Login as viewer
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "viewer@example.com",
    "password": "Viewer123!"
  }'

export VIEWER_TOKEN="viewer_token_here"

# Try to upload
curl -X POST http://localhost:5000/api/uploads \
  -H "Authorization: Bearer $VIEWER_TOKEN" \
  -F "file=@test_transactions.csv"
```

Expected: 403 Forbidden error

---

### Scenario 3: Invalid Token

```bash
curl http://localhost:5000/api/uploads \
  -H "Authorization: Bearer invalid_token"
```

Expected: 401 Unauthorized error

---

### Scenario 4: Upload Excel File

Create an Excel file with the same data and upload:

```bash
curl -X POST http://localhost:5000/api/uploads \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@test_transactions.xlsx"
```

---

### Scenario 5: Invalid File Type

```bash
echo "test" > test.txt

curl -X POST http://localhost:5000/api/uploads \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@test.txt"
```

Expected: 400 Bad Request - Invalid file type

---

### Scenario 6: Multiple Uploads for Testing Reconciliation

Create a second CSV file that matches with the first:

```bash
cat > test_transactions_2.csv << 'EOF'
transaction_id,reference_number,amount,date,description,source_system
TXN001,REF12345,1000.00,2026-01-15,Matching payment,System B
TXN006,REF12346,2550.00,2026-01-16,Partial match test,System B
TXN007,REF99999,500.00,2026-01-21,New transaction,System B
EOF

curl -X POST http://localhost:5000/api/uploads \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@test_transactions_2.csv"

export JOB_ID_2="new_job_id_here"

# Wait for processing, then check stats
curl http://localhost:5000/api/reconciliation/$JOB_ID_2/stats \
  -H "Authorization: Bearer $TOKEN"
```

Expected:
- TXN001 should have MATCHED status (exact match with first upload)
- TXN006 should have PARTIAL status (reference matches, amount ±2%)
- TXN007 should have UNMATCHED status

---

## Postman Collection

If using Postman, create a collection with:

1. **Variables**:
   - `base_url`: `http://localhost:5000`
   - `token`: `{{token}}`

2. **Pre-request Script** (for authenticated requests):
```javascript
pm.request.headers.add({
  key: 'Authorization',
  value: 'Bearer ' + pm.variables.get('token')
});
```

3. **Test Script** (for login request):
```javascript
if (pm.response.code === 200) {
  const response = pm.response.json();
  pm.variables.set('token', response.data.token);
}
```

---

## Common Issues & Troubleshooting

### Issue: 401 Unauthorized
**Solution**: Check if token is valid and not expired. Re-login if needed.

### Issue: 403 Forbidden
**Solution**: Check if user role has permission for the action.

### Issue: Upload stays in PROCESSING
**Solution**: Check if worker process is running. Check worker logs.

### Issue: Database connection error
**Solution**: Ensure MongoDB is running on the correct port.

### Issue: File parsing errors
**Solution**: Check CSV/Excel format. Ensure required columns exist.

---

## Validation Testing

### Invalid Email
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "invalid-email",
    "password": "Test123!"
  }'
```

### Short Password
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "short"
  }'
```

### Invalid Role
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!",
    "role": "INVALID_ROLE"
  }'
```

### Invalid Reconciliation Status
```bash
curl -X PATCH http://localhost:5000/api/reconciliation/$RESULT_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "INVALID_STATUS"
  }'
```

---

## Performance Testing

### Upload Large File

Create a large CSV file:

```bash
# Generate 10,000 rows
(echo "transaction_id,reference_number,amount,date,description"
for i in {1..10000}; do
  echo "TXN$i,REF$i,$((RANDOM % 10000 + 100)).00,2026-01-15,Description $i"
done) > large_test.csv

# Upload
curl -X POST http://localhost:5000/api/uploads \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@large_test.csv"
```

Monitor worker logs to see processing time.

---

## Clean Up

To start fresh:

```bash
# Drop database (from mongo shell)
mongo smart_reconciliation
db.dropDatabase()

# Remove uploaded files
rm -rf uploads/*

# Remove logs
rm -rf logs/*
```

---

## Expected Results Summary

| Test | Expected Result |
|------|-----------------|
| Health Check | 200 OK, database connected |
| Register | 201 Created, returns token |
| Login | 200 OK, returns token |
| Upload (valid) | 201 Created, job queued |
| Upload (duplicate) | 409 Conflict |
| Upload (invalid type) | 400 Bad Request |
| Get job status | 200 OK, shows processing/completed |
| Reconciliation stats | 200 OK, shows match counts |
| Update result (ANALYST) | 200 OK, creates audit log |
| Update result (VIEWER) | 403 Forbidden |
| Dashboard | 200 OK, shows summary |
| Audit logs | 200 OK, shows history |

---

## Next Steps

1. Test all endpoints in order
2. Verify role-based access control
3. Test with different file formats
4. Monitor logs for errors
5. Check audit trail after updates
6. Test idempotency with duplicate files
7. Verify reconciliation accuracy

---

For more information, see:
- [README.md](README.md) - General documentation
- [ARCHITECTURE.md](ARCHITECTURE.md) - System architecture
