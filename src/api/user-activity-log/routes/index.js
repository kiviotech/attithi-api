'use strict';

/**
 * User activity log router
 */

module.exports = {
  routes: [
    // Collection root endpoints
    {
      method: 'GET',
      path: '/user-activity-logs',
      handler: 'user-activity-log.find',
      config: {
        policies: [],
        middlewares: [],
        type: 'content-api'
      },
    },
    {
      method: 'POST',
      path: '/user-activity-logs',
      handler: 'user-activity-log.create',
      config: {
        policies: [],
        middlewares: [],
        type: 'content-api'
      },
    },
    
    // Custom routes - MUST come before the :id routes
    {
      method: 'GET',
      path: '/user-activity-logs/analytics',
      handler: 'user-activity-log.analytics',
      config: {
        policies: [],
        middlewares: [],
        type: 'content-api'
      },
    },
    {
      method: 'GET',
      path: '/user-activity-logs/search',
      handler: 'user-activity-log.search',
      config: {
        policies: [],
        middlewares: [],
        type: 'content-api'
      },
    },
    {
      method: 'GET',
      path: '/user-activity-logs/security-alerts',
      handler: 'user-activity-log.securityAlerts',
      config: {
        policies: [],
        middlewares: [],
        type: 'content-api'
      },
    },
    
    // ID-specific routes
    {
      method: 'GET',
      path: '/user-activity-logs/:id',
      handler: 'user-activity-log.findOne',
      config: {
        policies: [],
        middlewares: [],
        type: 'content-api'
      },
    },
    {
      method: 'PUT',
      path: '/user-activity-logs/:id',
      handler: 'user-activity-log.update',
      config: {
        policies: [],
        middlewares: [],
        type: 'content-api'
      },
    },
    {
      method: 'DELETE',
      path: '/user-activity-logs/:id',
      handler: 'user-activity-log.delete',
      config: {
        policies: [],
        middlewares: [],
        type: 'content-api'
      },
    },
  ],
}; 