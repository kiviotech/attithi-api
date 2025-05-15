'use strict';

/**
 * guest-detail router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::guest-detail.guest-detail', {
  routes: [
    {
      method: 'GET',
      path: '/guest-details/findByAadhaar/:aadhaar',
      handler: 'guest-detail.findByAadhaar',
      config: {
        policies: [],
        middlewares: [],
      },
      info: {
        description: 'Find Guest by Aadhaar',
        name: 'findByAadhaar',
        displayName: 'findByAadhaar',
        middlewares: [],
      },
    },
  ],
});
