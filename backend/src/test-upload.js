#!/usr/bin/env node

/**
 * Test Script - Upload and Process Sample File
 * This script tests the complete file upload and processing flow
 */

const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const axios = require('axios');

const API_URL = 'http://localhost:5000/api';
const TEST_USER = {
  email: 'admin@test.com',
  password: 'Admin@123'
};

async function main() {
  try {
    console.log('🚀 Starting upload test...\n');

    // Step 1: Login
    console.log('1️⃣  Logging in...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, TEST_USER);
    const token = loginResponse.data.data.token;
    console.log('✅ Login successful\n');

    // Step 2: Upload file
    console.log('2️⃣  Uploading sample file...');
    const filePath = path.join(__dirname, '../uploads/test_upload_new.csv');
    
    if (!fs.existsSync(filePath)) {
      console.error('❌ Sample file not found:', filePath);
      process.exit(1);
    }

    const form = new FormData();
    form.append('file', fs.createReadStream(filePath));
    form.append('sourceSystem', 'TestSystem');
    form.append('description', 'Test upload from script');

    const uploadResponse = await axios.post(`${API_URL}/uploads`, form, {
      headers: {
        ...form.getHeaders(),
        Authorization: `Bearer ${token}`
      }
    });

    const uploadJobId = uploadResponse.data.data.jobId;
    console.log('✅ File uploaded successfully');
    console.log('📝 Job ID:', uploadJobId, '\n');

    // Step 3: Wait for processing
    console.log('3️⃣  Waiting for processing...');
    let attempts = 0;
    const maxAttempts = 20;
    
    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const statusResponse = await axios.get(`${API_URL}/uploads/${uploadJobId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const job = statusResponse.data.data;
      console.log(`   Status: ${job.status} | Processed: ${job.processedRecords}/${job.totalRecords}`);

      if (job.status === 'COMPLETED') {
        console.log('\n✅ Processing completed successfully!');
        console.log('📊 Results:');
        console.log('   - Total Records:', job.totalRecords);
        console.log('   - Processed:', job.processedRecords);
        console.log('   - Duration:', Math.round(job.processingTime / 1000), 'seconds\n');
        return;
      }

      if (job.status === 'FAILED') {
        console.log('\n❌ Processing failed!');
        console.log('   Error:', job.errorMessage);
        process.exit(1);
      }

      attempts++;
    }

    console.log('\n⏱️  Timeout waiting for processing');
    process.exit(1);

  } catch (error) {
    console.error('\n❌ Test failed:', error.response?.data?.message || error.message);
    process.exit(1);
  }
}

main();
