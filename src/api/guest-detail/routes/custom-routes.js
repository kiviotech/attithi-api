'use strict';

/**
 * Custom routes for guest-detail
 */

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/guest-details/find-by-aadhaar/:aadhaar',
      handler: 'guest-detail.findByAadhaar',
      config: {
        auth: {
          scope: ['api::guest-detail.guest-detail.find']
        }
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
      path: '/guest-details/find-by-phone/:phoneNumber',
      handler: 'guest-detail.findByPhone',
      config: {
        auth: {
          scope: ['api::guest-detail.guest-detail.find']
        }
      },
    },
    {
      method: 'GET',
      path: '/guest-details/details-by-phone/:phoneNumber',
      handler: 'guest-detail.getDetailsByPhone',
      config: {
        auth: {
          scope: ['api::guest-detail.guest-detail.find']
        }
      },
    },
    {
      method: 'GET',
      path: '/guest-details/next-unique-no',
      handler: 'guest-detail.getNextUniqueNo',
      config: {
        auth: { 
          scope: ['api::guest-detail.guest-detail.find']
        }
      }
    }
  ],
}; 