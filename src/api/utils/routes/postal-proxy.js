'use strict';

/**
 * Postal API proxy routes
 */

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/api/postal/pincode/:pincode',
      handler: 'postal-proxy.getPincodeDetails',
      config: {
        auth: false,
        policies: [],
      }
    },
  ],
}; 