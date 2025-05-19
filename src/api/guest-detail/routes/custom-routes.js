'use strict';

/**
 * Custom routes for guest-detail
 */

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/guest-details/findByAadhaar/:aadhaar',
      handler: 'guest-detail.findByAadhaar',
      config: {
        auth: {},
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
    {
      method: 'GET',
      path: '/guest-details/by-phone/:phoneNumber',
      handler: 'guest-detail.findByPhone',
      config: {
        auth: false, // Set to true if authentication is required
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/guest-details/details-by-phone/:phoneNumber',
      handler: 'guest-detail.getDetailsByPhone',
      config: {
        auth: false, // Consider setting this to true in production
        policies: [],
        middlewares: [],
      },
    },
  ],
}; 