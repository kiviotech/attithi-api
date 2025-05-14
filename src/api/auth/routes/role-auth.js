'use strict';

/**
 * Role-based auth routes
 */
module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/auth/local/role',
      handler: 'role-auth.login',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
        // This is the required property that was missing
        type: 'content-api',
      },
    },
    {
      method: 'GET',
      path: '/auth/me',
      handler: 'role-auth.getMe',
      config: {
        auth: { strategy: 'api::auth.bearer' },
        policies: [],
        middlewares: [],
        // This is the required property that was missing
        type: 'content-api',
      },
    }
  ],
};
