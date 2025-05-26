'use strict';

/**
 * JWT service
 * This file overrides the default JWT service to track auth-related activities
 */

const { getService } = require('@strapi/plugin-users-permissions/server/utils');
const jwt = require('@strapi/plugin-users-permissions/server/services/jwt');

/**
 * Enhanced version of the JWT service
 * It adds activity logging for token creation and verification
 */
module.exports = {
  ...jwt,
  
  /**
   * Override the issue method to log token creation
   */
  async issue(payload, options = {}) {
    try {
      // Call the original method to generate the token
      const token = await jwt.issue(payload, options);
      
      // Log the token creation
      if (payload && payload.id) {
        const user = await strapi.entityService.findOne('plugin::users-permissions.user', payload.id, {
          populate: ['role']
        });
        
        if (user) {
          // Log asynchronously to avoid delaying the response
          setTimeout(async () => {
            try {
              await strapi.entityService.create('api::user-activity-log.user-activity-log', {
                data: {
                  action: 'user.login',
                  username: user.username,
                  userRole: user.role?.name || 'authenticated',
                  details: {
                    userId: user.id,
                    method: options.method || 'jwt',
                    expiresIn: options.expiresIn || '30d',
                    success: true,
                    timestamp: new Date().toISOString()
                  },
                  notes: `User ${user.username} logged in successfully`,
                  publishedAt: new Date()
                }
              });
            } catch (error) {
              console.error('[JWT Service] Error logging login activity:', error);
            }
          }, 0);
        }
      }
      
      return token;
    } catch (error) {
      console.error('[JWT Service] Error in issue method:', error);
      throw error;
    }
  },
  
  /**
   * Override the verify method to log token verification attempts
   */
  async verify(token) {
    try {
      // Call the original method to verify the token
      const payload = await jwt.verify(token);
      
      // Log successful verification (keep it minimal, as this happens frequently)
      if (payload && payload.id && Math.random() < 0.01) { // Only log ~1% to prevent excessive logs
        // Log asynchronously to avoid delaying the response
        setTimeout(async () => {
          try {
            await strapi.entityService.create('api::user-activity-log.user-activity-log', {
              data: {
                action: 'token.verify',
                details: {
                  userId: payload.id,
                  timestamp: new Date().toISOString()
                },
                publishedAt: new Date()
              }
            });
          } catch (error) {
            // Silent fail - don't log errors for token verification
          }
        }, 0);
      }
      
      return payload;
    } catch (error) {
      // Log failed verification if it's not a simple expired token error
      if (error.name !== 'TokenExpiredError') {
        setTimeout(async () => {
          try {
            await strapi.entityService.create('api::user-activity-log.user-activity-log', {
              data: {
                action: 'token.invalid',
                details: {
                  error: error.message,
                  timestamp: new Date().toISOString()
                },
                notes: `Invalid token: ${error.message}`,
                publishedAt: new Date()
              }
            });
          } catch (logError) {
            // Silent fail - don't log errors for token verification
          }
        }, 0);
      }
      
      throw error;
    }
  }
}; 