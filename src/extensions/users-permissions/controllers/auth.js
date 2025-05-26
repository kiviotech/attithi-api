'use strict';

/**
 * Auth controller extension
 * This file extends the default auth controller to track login attempts
 */

const _ = require('lodash');
const utils = require('@strapi/utils');
const { getService } = require('@strapi/plugin-users-permissions/server/utils');
const { validateCallbackBody } = require('@strapi/plugin-users-permissions/server/controllers/validation/auth');

const { sanitize } = utils;
const { ApplicationError, ValidationError } = utils.errors;

const sanitizeUser = (user, ctx) => {
  const { auth } = ctx.state;
  const userSchema = strapi.getModel('plugin::users-permissions.user');

  return sanitize.contentAPI.output(user, userSchema, { auth });
};

// Get the original controller to extend
const authController = require('@strapi/plugin-users-permissions/server/controllers/auth');

// Create a wrapper to track login attempts
module.exports = {
  ...authController,
  
  /**
   * Override the callback method to track login attempts
   */
  async callback(ctx) {
    const provider = ctx.params.provider || 'local';
    const params = ctx.request.body;
    
    // Get the client IP and user agent
    const ipAddress = ctx.request.ip || '0.0.0.0';
    const userAgent = ctx.request.headers['user-agent'] || 'unknown';
    
    try {
      // Validate the request body
      await validateCallbackBody(params);
      
      const { identifier } = params;
      
      // Try to find the user
      const user = await strapi.query('plugin::users-permissions.user').findOne({
        where: {
          provider,
          $or: [
            { email: identifier.toLowerCase() },
            { username: identifier },
          ],
        },
      });
      
      // Call the original method to handle authentication
      const result = await authController.callback(ctx);
      
      // If we got here, the login was successful
      if (user) {
        // Log successful login
        setTimeout(async () => {
          try {
            await strapi.entityService.create('api::user-activity-log.user-activity-log', {
              data: {
                action: 'user.login',
                username: user.username,
                userRole: user.role?.name || 'authenticated',
                ipAddress,
                userAgent,
                details: {
                  userId: user.id,
                  method: provider,
                  success: true,
                  timestamp: new Date().toISOString()
                },
                notes: `User ${user.username} logged in successfully via ${provider}`,
                publishedAt: new Date()
              }
            });
          } catch (error) {
            console.error('[Auth Controller] Error logging successful login:', error);
          }
        }, 0);
      }
      
      return result;
    } catch (error) {
      // Get the username that was attempted
      const identifier = params.identifier || 'unknown';
      
      // Log failed login attempt
      setTimeout(async () => {
        try {
          await strapi.entityService.create('api::user-activity-log.user-activity-log', {
            data: {
              action: 'user.login',
              username: identifier,
              userRole: 'public',
              ipAddress,
              userAgent,
              details: {
                method: provider,
                error: error.message,
                success: false,
                timestamp: new Date().toISOString()
              },
              notes: `Failed login attempt for ${identifier} via ${provider}: ${error.message}`,
              publishedAt: new Date()
            }
          });
        } catch (logError) {
          console.error('[Auth Controller] Error logging failed login:', logError);
        }
      }, 0);
      
      // Re-throw the error for the original controller to handle
      throw error;
    }
  },
  
  /**
   * Override the logout method to track logout events
   */
  async logout(ctx) {
    // Try to get user info before logging out
    const user = ctx.state.user;
    
    // Call the original method
    await authController.logout(ctx);
    
    // Log the logout if we have a user
    if (user) {
      // Get the client IP and user agent
      const ipAddress = ctx.request.ip || '0.0.0.0';
      const userAgent = ctx.request.headers['user-agent'] || 'unknown';
      
      setTimeout(async () => {
        try {
          await strapi.entityService.create('api::user-activity-log.user-activity-log', {
            data: {
              action: 'user.logout',
              username: user.username,
              userRole: user.role?.name || 'authenticated',
              ipAddress,
              userAgent,
              details: {
                userId: user.id,
                timestamp: new Date().toISOString()
              },
              notes: `User ${user.username} logged out`,
              publishedAt: new Date()
            }
          });
        } catch (error) {
          console.error('[Auth Controller] Error logging logout:', error);
        }
      }, 0);
    }
    
    return { message: 'Successfully logged out' };
  },
  
  /**
   * Override the forgotPassword method to track password reset requests
   */
  async forgotPassword(ctx) {
    // Get the client IP and user agent
    const ipAddress = ctx.request.ip || '0.0.0.0';
    const userAgent = ctx.request.headers['user-agent'] || 'unknown';
    
    // Get the email from the request
    const { email } = ctx.request.body;
    
    // Call the original method
    const result = await authController.forgotPassword(ctx);
    
    // Log the password reset request
    if (email) {
      setTimeout(async () => {
        try {
          await strapi.entityService.create('api::user-activity-log.user-activity-log', {
            data: {
              action: 'user.forgot_password',
              username: email,
              userRole: 'public',
              ipAddress,
              userAgent,
              details: {
                timestamp: new Date().toISOString()
              },
              notes: `Password reset requested for ${email}`,
              publishedAt: new Date()
            }
          });
        } catch (error) {
          console.error('[Auth Controller] Error logging password reset request:', error);
        }
      }, 0);
    }
    
    return result;
  },
  
  /**
   * Override the resetPassword method to track password resets
   */
  async resetPassword(ctx) {
    // Get the client IP and user agent
    const ipAddress = ctx.request.ip || '0.0.0.0';
    const userAgent = ctx.request.headers['user-agent'] || 'unknown';
    
    try {
      // Call the original method
      const result = await authController.resetPassword(ctx);
      
      // Log the successful password reset
      setTimeout(async () => {
        try {
          await strapi.entityService.create('api::user-activity-log.user-activity-log', {
            data: {
              action: 'user.reset_password',
              username: result.user?.username || 'unknown',
              userRole: result.user?.role?.name || 'authenticated',
              ipAddress,
              userAgent,
              details: {
                userId: result.user?.id,
                timestamp: new Date().toISOString()
              },
              notes: `Password reset successfully for ${result.user?.username || 'unknown'}`,
              publishedAt: new Date()
            }
          });
        } catch (error) {
          console.error('[Auth Controller] Error logging password reset:', error);
        }
      }, 0);
      
      return result;
    } catch (error) {
      // Log the failed password reset
      setTimeout(async () => {
        try {
          await strapi.entityService.create('api::user-activity-log.user-activity-log', {
            data: {
              action: 'user.reset_password_failed',
              userRole: 'public',
              ipAddress,
              userAgent,
              details: {
                error: error.message,
                timestamp: new Date().toISOString()
              },
              notes: `Failed password reset: ${error.message}`,
              publishedAt: new Date()
            }
          });
        } catch (logError) {
          console.error('[Auth Controller] Error logging failed password reset:', logError);
        }
      }, 0);
      
      // Re-throw the error
      throw error;
    }
  }
}; 