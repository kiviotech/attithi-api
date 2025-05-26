/**
 * Direct test script for user activity logging using the internal API
 * 
 * Run with: NODE_ENV=development node scripts/test-direct-log.js
 */

// Import Strapi bootstrap module
const strapi = require('@strapi/strapi');

/**
 * Main function
 */
async function main() {
  try {
    console.log('🚀 Starting direct activity log test...');
    
    // Initialize Strapi
    console.log('📝 Initializing Strapi...');
    const app = strapi({ distDir: './dist' });
    await app.load();
    console.log('✅ Strapi initialized successfully');
    
    // Sample activity log
    const logData = {
      action: 'test.direct_api',
      username: 'test-script',
      userRole: 'script',
      ipAddress: '127.0.0.1',
      userAgent: 'DirectTestScript/1.0',
      details: {
        scriptRun: true,
        timestamp: new Date().toISOString()
      },
      notes: 'Test activity from direct script',
      publishedAt: new Date()
    };
    
    // Step 1: Using service createLog method
    console.log('\n📝 Step 1: Testing service.createLog method...');
    try {
      const logEntry1 = await app.service('api::user-activity-log.user-activity-log').createLog(logData);
      console.log('✅ Service createLog successful:', logEntry1.id);
    } catch (error) {
      console.error('❌ Error with service.createLog:', error.message);
    }
    
    // Step 2: Using direct entity service
    console.log('\n📝 Step 2: Testing entityService.create method...');
    try {
      const logEntry2 = await app.entityService.create('api::user-activity-log.user-activity-log', {
        data: {
          ...logData,
          action: 'test.entity_service'
        }
      });
      console.log('✅ Entity service create successful:', logEntry2.id);
    } catch (error) {
      console.error('❌ Error with entityService.create:', error.message);
    }
    
    // Step 3: Fetch a list of logs
    console.log('\n📝 Step 3: Fetching logs...');
    try {
      const logs = await app.entityService.findMany('api::user-activity-log.user-activity-log', {
        sort: { createdAt: 'desc' },
        limit: 5
      });
      console.log('✅ Fetched logs successfully');
      console.log(`   Total logs: ${logs.length}`);
      console.log(`   Recent actions: ${logs.map(log => log.action).join(', ')}`);
    } catch (error) {
      console.error('❌ Error fetching logs:', error.message);
    }
    
    // Cleanup and exit
    console.log('\n📝 Shutting down Strapi...');
    await app.destroy();
    console.log('✅ Strapi shutdown complete');
    
    console.log('\n🎉 Test script completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Unhandled error:', error);
    process.exit(1);
  }
}

// Run the main function
main(); 