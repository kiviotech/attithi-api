'use strict';

module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/data-control/create-company',
      handler: 'data-control.createCompany',
      config: {
        policies: [],
        middlewares: [],
        description: 'Create a new company',
        tags: ['Data Control']
      }
    },
  ]
}; 