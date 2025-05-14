'use strict';

/**
 * Users & Permissions service overrides
 * This file extends the default users-permissions service to fix errors related to custom routes
 */

module.exports = (plugin) => {
  /**
   * Overriding the getRoutes method to safely handle routes without 'type' property
   */
  plugin.services['users-permissions'].getRoutes = async () => {
    const routesMap = {};

    // Process API routes
    Object.entries(strapi.api || {}).forEach(([apiName, api]) => {
      const routes = api.routes || {};
      
      Object.values(routes).forEach((route) => {
        // Skip routes without config or type
        if (!route.config || !route.config.type) {
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
        // Skip routes without config or type
        if (!route.config || !route.config.type) {
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

  return plugin;
};
