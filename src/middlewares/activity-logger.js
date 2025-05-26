'use strict';

/**
 * Activity logger middleware
 *
 * This middleware automatically tracks certain user activities.
 * It can be applied to routes that should be logged.
 */

/**
 * Gets the client IP address from a request
 * @param {Object} req - The request object
 * @returns {string} The client IP address
 */
const getClientIp = (req) => {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    // Get the first IP if there are multiple in the chain
    return forwarded.split(',')[0].trim();
  }
  return req.ip || req.connection?.remoteAddress || '0.0.0.0';
};

module.exports = (config, { strapi }) => {
  return async (ctx, next) => {
    // Save the request start time
    const startTime = Date.now();
    
    // Get user information if available
    const user = ctx.state?.user;
    const username = user?.username || 'anonymous';
    const userRole = user?.role?.name || 'public';
    const userId = user?.id;
    
    // Get request information
    const ipAddress = getClientIp(ctx.request.req);
    const userAgent = ctx.request.headers['user-agent'];
    const method = ctx.request.method;
    const path = ctx.request.url;
    
    // Extract information about the action being performed
    const endpoint = path.split('?')[0]; // Remove query params
    
    try {
      // Allow the request to proceed
      await next();
      
      // Only log certain types of requests if configured
      if (config.excludeMethods && config.excludeMethods.includes(method)) {
        return;
      }
      
      if (config.excludePaths) {
        for (const excludePath of config.excludePaths) {
          if (endpoint.startsWith(excludePath)) {
            return;
          }
        }
      }

      // Skip logging for the user-activity-log endpoint itself to avoid recursion
      if (endpoint.includes('user-activity-logs')) {
        return;
      }

      // Determine the action type based on the endpoint and method
      let actionType = 'api.access';
      let resourceType = '';
      let resourceId = null;
      
      // Check if this is an API endpoint
      if (endpoint.startsWith('/api/')) {
        const parts = endpoint.replace('/api/', '').split('/');
        resourceType = parts[0];
        resourceId = parts.length > 1 ? parts[1] : null;
        
        // Determine action based on HTTP method
        switch (method) {
          case 'GET':
            actionType = resourceId ? `${resourceType}.view` : `${resourceType}.list`;
            break;
          case 'POST':
            actionType = `${resourceType}.create`;
            break;
          case 'PUT':
          case 'PATCH':
            actionType = `${resourceType}.update`;
            break;
          case 'DELETE':
            actionType = `${resourceType}.delete`;
            break;
        }
      }
      
      // For auth endpoints, log specially
      if (endpoint.includes('auth/local')) {
        actionType = 'user.login';
      } else if (endpoint.includes('auth/logout')) {
        actionType = 'user.logout';
      }
      
      // Calculate response time
      const responseTime = Date.now() - startTime;
      
      // Only log if we have a valid user or we're configured to log anonymous access
      if (userId || config.logAnonymous) {
        // Create a log entry - using direct entity service creation
        try {
          await strapi.entityService.create('api::user-activity-log.user-activity-log', {
            data: {
              action: actionType,
              username,
              userRole,
              ipAddress,
              userAgent,
              details: {
                method,
                path,
                statusCode: ctx.response.status,
                responseTime,
                resourceType,
                resourceId
              },
              notes: `${method} ${endpoint} - ${ctx.response.status}`,
              timestamp: new Date().toISOString(),
              publishedAt: new Date()
            }
          });
        } catch (logError) {
          strapi.log.error(`Failed to create activity log: ${logError.message}`);
        }
      }
    } catch (error) {
      // Just pass through if there's an error, we don't want to block the request
      // but we should log the error
      strapi.log.error(`Error in activity logger middleware: ${error.message}`);
      
      // Continue with the request
      throw error;
    }
  };
}; 