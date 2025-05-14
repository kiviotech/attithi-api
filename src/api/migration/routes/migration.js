'use strict';

/**
 * migration router
 */

module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/migration/upload',
      handler: 'migration.uploadFile',
      config: {
        policies: [],
        middlewares: [],
        consumes: ['multipart/form-data'],
      },
    },
    {
      method: 'GET',
      path: '/migration/progress/:id',
      handler: 'migration.checkProgress',
      config: {
        policies: [],
      },
    },
    {
      method: 'GET',
      path: '/migration/results/:id',
      handler: 'migration.getResults',
      config: {
        policies: [],
      },
    },
    {
      method: 'POST',
      path: '/migration/cancel/:id',
      handler: 'migration.cancelJob',
      config: {
        policies: [],
      },
    },
    {
      method: 'GET',
      path: '/migration/logs/:id',
      handler: 'migration.getLogs',
      config: {
        policies: [],
      },
    },
    {
      method: 'GET',
      path: '/migration/template',
      handler: 'migration.downloadTemplate',
      config: {
        policies: [],
      },
    },
    {
      method: 'POST',
      path: '/migration/cleanup',
      handler: 'migration.cleanupJobs',
      config: {
        policies: [],
      },
    },
  ],
}; 