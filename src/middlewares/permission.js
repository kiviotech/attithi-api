'use strict';

/**
 * Permission middleware to check if a user has the required role or permission
 */
module.exports = (config, { strapi }) => {
  return async (ctx, next) => {
    try {
      // Skip if no user in request (for public routes)
      if (!ctx.state.user) {
        // This is a public request, check if the action is allowed for public users
        if (config.publicAllowed) {
          return await next();
        }
        return ctx.unauthorized('You need to be logged in');
      }

      const { id: userId, role } = ctx.state.user;
      
      // Optional quick role check based on the route configuration
      if (config.roles && Array.isArray(config.roles)) {
        // If roles array is specified, check if user's role is in the allowed roles
        if (!config.roles.includes(role?.type)) {
          return ctx.forbidden(`Access denied. Required role: ${config.roles.join(' or ')}`);
        }
      }

      // Optional permission check based on the route configuration
      if (config.permissions && Array.isArray(config.permissions)) {
        // User service to check permissions
        const { userPermissions } = await strapi
          .service('api::user-permission.user-permission')
          .getUserPermissions(userId);
          
        // Check if user has at least one of the required permissions
        const hasPermission = config.permissions.some(permission => 
          userPermissions.includes(permission)
        );
        
        if (!hasPermission) {
          return ctx.forbidden(`You don't have the required permissions: ${config.permissions.join(', ')}`);
        }
      }

      await next();
    } catch (error) {
      strapi.log.error('Permission middleware error:', error);
      return ctx.internalServerError('An error occurred while checking permissions');
    }
  };
};
