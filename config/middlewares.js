// config/middlewares.js
module.exports = ({ env }) => [
  'strapi::logger',
  'strapi::errors',
  'strapi::security',
  
  {
    name: 'strapi::cors',
    config: {
      origin: ['https://app.kamarpukurmath.org','http://localhost:8082','http://localhost:5173','http://localhost:5174'],
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    },
  },
  {
    name: 'strapi::body',
    config: {
      formLimit: '2gb',  // Set form data size limit
      jsonLimit: '2gb',  // Set JSON payload size limit
      textLimit: '2gb',  // Set text payload size limit
      formidable: {
        maxFileSize: 2 * 1024 * 1024 * 1024 // Set max file size to 2GB
      }
    },
  },
  'strapi::poweredBy',
  'strapi::query',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
  
  // Add activity logger middleware
  {
    name: 'global::activity-logger',
    config: {
      // Configure which requests to log
      logAnonymous: false, // Don't log anonymous users
      excludeMethods: ['OPTIONS', 'HEAD'], // Don't log these methods
      excludePaths: [
        '/uploads', 
        '/admin', 
        '/documentation', 
        '/_health', 
        '/favicon.ico'
      ] // Don't log these paths
    },
  },
];
