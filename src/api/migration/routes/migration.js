'use strict';

module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/migration/upload',
      handler: 'migration.uploadExcel',
      config: {
        policies: [],
        description: 'Upload Excel file for data migration',
        tags: ['Migration']
      }
    },
    {
      method: 'POST',
      path: '/migration/import',
      handler: 'migration.importData',
      config: {
        policies: [],
        description: 'Import donor data from Excel',
        tags: ['Migration']
      }
    },
    {
      method: 'GET',
      path: '/migration/progress/:jobId',
      handler: 'migration.checkProgress',
      config: {
        policies: [],
        description: 'Check import progress',
        tags: ['Migration']
      }
    }
  ]
}; 