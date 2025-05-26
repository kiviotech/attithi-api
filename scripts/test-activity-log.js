/**
 * Simple test script for user activity logging
 * 
 * Run with: node scripts/test-activity-log.js
 */

const axios = require('axios');

// Configuration
const API_URL = 'http://localhost:1338'; // Adjust if your Strapi runs on a different port
const EMAIL = 'admin2@kamarpukurmath.org'; // Try a different admin email
const PASSWORD = 'Admin@123'; // Try a different password

// Sample activity log
const SAMPLE_ACTIVITY = {
  action: 'test.activity',
  username: 'test-script',
  userRole: 'script',
  ipAddress: '127.0.0.1',
  userAgent: 'TestScript/1.0',
  details: {
    scriptRun: true,
    timestamp: new Date().toISOString()
  },
  notes: 'Test activity from script'
};

/**
 * Main function
 */
async function main() {
  try {
    console.log('🚀 Starting activity log test script...');
    
    // Step 1: Login to get JWT token
    console.log('\n📝 Step 1: Authenticating...');
    const authResponse = await axios.post(`${API_URL}/api/auth/local`, {
      identifier: EMAIL,
      password: PASSWORD
    });
    
    const token = authResponse.data.jwt;
    console.log('✅ Authentication successful, got JWT token');
    
    // Step 2: Create a test activity log
    console.log('\n📝 Step 2: Creating test activity log...');
    const createResponse = await axios.post(
      `${API_URL}/api/user-activity-logs`,
      {
        data: {
          ...SAMPLE_ACTIVITY,
          publishedAt: new Date()
        }
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    
    console.log('✅ Activity log created successfully:', createResponse.data.data.id);
    
    // Step 3: Fetch analytics
    console.log('\n📝 Step 3: Fetching analytics...');
    const analyticsResponse = await axios.get(
      `${API_URL}/api/user-activity-logs-analytics`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    
    console.log('✅ Analytics fetched successfully');
    console.log(`   Total logs: ${analyticsResponse.data.data.totalLogs}`);
    console.log(`   Failed logins: ${analyticsResponse.data.data.failedLogins}`);
    console.log(`   Top users: ${JSON.stringify(analyticsResponse.data.data.topUsers)}`);
    
    // Step 4: Test search
    console.log('\n📝 Step 4: Testing search...');
    const searchResponse = await axios.get(
      `${API_URL}/api/user-activity-logs-search?contains=test&pageSize=5`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    
    console.log('✅ Search successful');
    console.log(`   Found ${searchResponse.data.meta.pagination.total} matching logs`);
    
    // Step 5: Test security alerts
    console.log('\n📝 Step 5: Testing security alerts...');
    const alertsResponse = await axios.get(
      `${API_URL}/api/user-activity-logs-security-alerts`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    
    console.log('✅ Security alerts fetched successfully');
    console.log(`   Found ${alertsResponse.data.data.length} security alerts`);
    
    console.log('\n🎉 All tests completed successfully!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    
    process.exit(1);
  }
}

// Run the main function
main(); 