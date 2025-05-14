'use strict';

/**
 * invitation router.
 */

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/invitation/eligible-users',
      handler: 'invitation.getEligibleUsers',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/invitation/export-users',
      handler: 'invitation.exportUsers',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/invitation/send-invitations',
      handler: 'invitation.sendInvitations',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/invitation/group-by-address',
      handler: 'invitation.groupByAddress',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
