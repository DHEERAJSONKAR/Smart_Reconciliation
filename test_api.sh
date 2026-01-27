#!/bin/bash

# Smart Reconciliation API Testing Script
BASE_URL="http://localhost:5000/api"
TOKEN=""

echo "================================"
echo "Smart Reconciliation API Testing"
echo "================================"
echo ""

# 1. Health Check
echo "1. Testing Health Check..."
curl -s $BASE_URL/health | python3 -m json.tool
echo -e "\n"

# 2. Register Admin User
echo "2. Registering Admin User..."
REGISTER_RESPONSE=$(curl -s -X POST $BASE_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test@1234",
    "role": "ADMIN"
  }')
echo "$REGISTER_RESPONSE" | python3 -m json.tool
TOKEN=$(echo "$REGISTER_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['token'])" 2>/dev/null)
echo -e "\n"

# 3. Login (if registration failed - user already exists)
if [ -z "$TOKEN" ]; then
  echo "3. Login with existing user..."
  LOGIN_RESPONSE=$(curl -s -X POST $BASE_URL/auth/login \
    -H "Content-Type: application/json" \
    -d '{
      "email": "test@example.com",
      "password": "Test@1234"
    }')
  echo "$LOGIN_RESPONSE" | python3 -m json.tool
  TOKEN=$(echo "$LOGIN_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['token'])" 2>/dev/null)
  echo -e "\n"
fi

echo "Token: $TOKEN"
echo -e "\n"

# 4. Upload CSV File
echo "4. Uploading CSV File..."
UPLOAD_RESPONSE=$(curl -s -X POST $BASE_URL/uploads \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/Users/apple/Documents/Smart_Reconciliation/test_transactions.csv" \
  -F "source=BANK_A")
echo "$UPLOAD_RESPONSE" | python3 -m json.tool
JOB_ID=$(echo "$UPLOAD_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['jobId'])" 2>/dev/null)
echo -e "\n"

# 5. Check Upload Status (wait 3 seconds)
echo "5. Checking Upload Status (waiting 3 seconds)..."
sleep 3
curl -s -X GET "$BASE_URL/uploads/$JOB_ID" \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
echo -e "\n"

# 6. Get All Uploads
echo "6. Getting All Upload Jobs..."
curl -s -X GET "$BASE_URL/uploads?limit=5" \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
echo -e "\n"

# 7. Get Dashboard Statistics
echo "7. Getting Dashboard Statistics..."
curl -s -X GET "$BASE_URL/dashboard/stats" \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
echo -e "\n"

# 8. Get Reconciliation Results
echo "8. Getting Reconciliation Results..."
curl -s -X GET "$BASE_URL/reconciliation/results?limit=5" \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
echo -e "\n"

# 9. Get Audit Logs
echo "9. Getting Audit Logs..."
curl -s -X GET "$BASE_URL/audit/logs?limit=5" \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
echo -e "\n"

echo "================================"
echo "Testing Complete!"
echo "================================"
