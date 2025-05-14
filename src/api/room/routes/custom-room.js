'use strict';

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/rooms/:roomId/availability',
      handler: 'room.getAvailability',
      config: {
        auth: false, // Set to true if you want authentication
      },
    },
  ],
};
