'use strict';

/**
 * User activity log API definition.
 * This file ensures the API is properly registered.
 */

module.exports = {
  routes: require('./routes'),
  controllers: {
    'user-activity-log': require('./controllers/user-activity-log')
  },
  services: {
    'user-activity-log': require('./services/user-activity-log')
  }
}; 