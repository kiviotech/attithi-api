/**
 * Test script for user activity logging
 * 
 * Run with: node scripts/test-activity-logging.js
 * 
 * This script creates sample activity logs to test the logging system.
 */

const path = require('path');
const fs = require('fs');

const sample_activities = [
  // Logins
  {
    action: 'user.login',
    username: 'admin',
    userRole: 'admin',
    ipAddress: '192.168.1.101',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/96.0.4664.110 Safari/537.36',
    details: {
      method: 'password',
      success: true,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() // 2 hours ago
    },
    notes: 'Admin login'
  },
  {
    action: 'user.login',
    username: 'john.doe',
    userRole: 'authenticated',
    ipAddress: '192.168.1.105',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1',
    details: {
      method: 'password',
      success: true,
      timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString() // 90 minutes ago
    },
    notes: 'User login'
  },
  {
    action: 'user.login',
    username: 'unknown_user',
    userRole: 'public',
    ipAddress: '203.0.113.42',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36',
    details: {
      method: 'password',
      success: false,
      error: 'Invalid credentials',
      timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString() // 45 minutes ago
    },
    notes: 'Failed login attempt'
  },
  
  // Failed login attempts from the same IP (suspicious)
  {
    action: 'user.login',
    username: 'admin',
    userRole: 'public',
    ipAddress: '203.0.113.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/96.0.4664.110 Safari/537.36',
    details: {
      method: 'password',
      success: false,
      error: 'Invalid credentials',
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString() // 30 minutes ago
    },
    notes: 'Failed login attempt'
  },
  {
    action: 'user.login',
    username: 'administrator',
    userRole: 'public',
    ipAddress: '203.0.113.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/96.0.4664.110 Safari/537.36',
    details: {
      method: 'password',
      success: false,
      error: 'Invalid credentials',
      timestamp: new Date(Date.now() - 1000 * 60 * 29).toISOString() // 29 minutes ago
    },
    notes: 'Failed login attempt'
  },
  {
    action: 'user.login',
    username: 'superuser',
    userRole: 'public',
    ipAddress: '203.0.113.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/96.0.4664.110 Safari/537.36',
    details: {
      method: 'password',
      success: false,
      error: 'Invalid credentials',
      timestamp: new Date(Date.now() - 1000 * 60 * 28).toISOString() // 28 minutes ago
    },
    notes: 'Failed login attempt'
  },
  
  // Data actions
  {
    action: 'donation.create',
    username: 'jane.smith',
    userRole: 'authenticated',
    ipAddress: '192.168.1.110',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36',
    details: {
      resourceId: 123,
      resourceData: {
        amount: 1000,
        currency: 'INR',
        donor: 'John Doe'
      },
      timestamp: new Date(Date.now() - 1000 * 60 * 20).toISOString() // 20 minutes ago
    },
    notes: 'Created donation: 123'
  },
  {
    action: 'donation.update',
    username: 'jane.smith',
    userRole: 'authenticated',
    ipAddress: '192.168.1.110',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36',
    details: {
      resourceId: 123,
      changes: {
        amount: {
          from: 1000,
          to: 1500
        }
      },
      timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString() // 15 minutes ago
    },
    notes: 'Updated donation: 123'
  },
  {
    action: 'guest-detail.view',
    username: 'john.doe',
    userRole: 'authenticated',
    ipAddress: '192.168.1.105',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1',
    details: {
      resourceId: 456,
      timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString() // 10 minutes ago
    },
    notes: 'Viewed guest details: 456'
  },
  
  // System actions
  {
    action: 'system.backup',
    username: 'admin',
    userRole: 'admin',
    ipAddress: '192.168.1.101',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/96.0.4664.110 Safari/537.36',
    details: {
      backupSize: '250MB',
      destination: 's3://backup-bucket/backup-2023-05-22.zip',
      timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString() // 5 minutes ago
    },
    notes: 'System backup initiated'
  },
  {
    action: 'user.permission_change',
    username: 'admin',
    userRole: 'admin',
    ipAddress: '192.168.1.101',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/96.0.4664.110 Safari/537.36',
    details: {
      targetUserId: 789,
      targetUsername: 'jane.smith',
      previousRole: 'authenticated',
      newRole: 'editor',
      timestamp: new Date(Date.now() - 1000 * 60 * 3).toISOString() // 3 minutes ago
    },
    notes: 'Changed permissions for user jane.smith: authenticated → editor'
  },
  
  // After-hours login (for security alerts testing)
  {
    action: 'user.login',
    username: 'admin',
    userRole: 'admin',
    ipAddress: '192.168.1.150',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/96.0.4664.110 Safari/537.36',
    details: {
      method: 'password',
      success: true,
      timestamp: new Date(new Date().setHours(3, 15, 0, 0)).toISOString() // 3:15 AM
    },
    notes: 'Admin login (after hours)'
  }
];

async function createTestLogs() {
  try {
    console.log('Starting Strapi...');
    
    // Import Strapi programmatically
    const strapiPath = path.resolve(process.cwd());
    process.chdir(strapiPath);
    
    // Require Strapi instance rather than the constructor
    const strapi = require('@strapi/strapi');
    
    // Start Strapi instance
    await strapi({ dir: strapiPath }).load();
    
    console.log('Creating test activity logs...');
    
    for (const activity of sample_activities) {
      try {
        // Create the log directly with the entity service
        const log = await strapi.entityService.create('api::user-activity-log.user-activity-log', {
          data: {
            ...activity,
            publishedAt: new Date() // Auto-publish
          }
        });
        console.log(`Created log: ${activity.action} - ${activity.username}`);
      } catch (error) {
        console.error(`Error creating log for ${activity.action}:`, error.message);
      }
    }
    
    console.log('Test logs created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

createTestLogs(); 