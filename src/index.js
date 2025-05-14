'use strict';

module.exports = {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register({ strapi }) {
    // Register extensions to plugins
    strapi.plugin('users-permissions').service('users-permissions').getRoutes = async () => {
      const routesMap = {};

      // Process API routes
      Object.entries(strapi.api || {}).forEach(([apiName, api]) => {
        const routes = api.routes || {};
        
        Object.values(routes).forEach((route) => {
          // Safely handle routes without config or type
          if (!route.config || !route.config.type) {
            // Add a default type to prevent errors
            if (route.config) {
              route.config.type = 'content-api';
            }
            return;
          }

          // Extract controller and action from handler
          let handler = route.handler || '';
          const handlerParts = handler.split('.');
          
          // Basic handler parsing (similar to validateRouteInfo)
          const controller = handlerParts.length > 1 ? handlerParts[0] : handler;
          const action = handlerParts.length > 1 ? handlerParts[1] : 'index';
          
          const permission = {
            enabled: false,
            policy: '',
            controller,
            action,
            type: route.config.type,
          };

          // Set the route in the map
          if (!routesMap[route.method]) {
            routesMap[route.method] = {};
          }
          routesMap[route.method][route.path] = {
            handler: route.handler,
            ...permission,
          };
        });
      });

      // Process plugin routes
      Object.entries(strapi.plugins || {}).forEach(([pluginName, plugin]) => {
        const routesObj = plugin.routes || {};
        const pluginRoutes = routesObj.routes || [];
        
        pluginRoutes.forEach((route) => {
          // Safely handle routes without config or type
          if (!route.config || !route.config.type) {
            // Add a default type to prevent errors
            if (route.config) {
              route.config.type = 'content-api';
            }
            return;
          }

          // Extract controller and action from handler
          let handler = route.handler || '';
          const handlerParts = handler.split('.');
          
          // Basic handler parsing
          const controller = handlerParts.length > 1 ? handlerParts[0] : handler;
          const action = handlerParts.length > 1 ? handlerParts[1] : 'index';
          
          const permission = {
            enabled: false,
            policy: '',
            controller,
            action,
            plugin: pluginName,
            type: route.config.type,
          };

          // Set the route in the map
          if (!routesMap[route.method]) {
            routesMap[route.method] = {};
          }
          routesMap[route.method][route.path] = {
            handler: route.handler,
            ...permission,
          };
        });
      });

      return routesMap;
    };
  },

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  bootstrap({ strapi }) {
    const setupRoles = require('./bootstrap/roles');
    return setupRoles();
  },
};
