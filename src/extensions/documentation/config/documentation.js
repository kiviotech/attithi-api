module.exports = {
  info: {
    version: '1.0.0',
    title: 'Attithi API Documentation',
    description: 'Documentation for the Attithi Guest House Management System API',
    contact: {
      name: 'API Support',
      email: 'support@kamarpukurmath.org'
    },
    license: {
      name: 'Apache 2.0',
      url: 'https://www.apache.org/licenses/LICENSE-2.0.html'
    }
  },
  'x-strapi-config': {
    // Path to the API endpoints
    path: '/documentation',
    // Generate documentation for the following plugins
    plugins: [
      'email',
      'upload'
    ]
  },
  tags: [
    {
      name: 'Email Template',
      description: 'Email template management endpoints'
    }
  ],
  paths: {
    '/email-template/booking-confirmation': {
      post: {
        tags: ['Email Template'],
        summary: 'Send booking confirmation email',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  data: {
                    type: 'object',
                    required: ['email', 'bookingId', 'name', 'checkInDate', 'checkOutDate', 'numberOfGuests'],
                    properties: {
                      bookingId: { type: 'string' },
                      name: { type: 'string' },
                      email: { type: 'string', format: 'email' },
                      checkInDate: { type: 'string', format: 'date' },
                      checkOutDate: { type: 'string', format: 'date' },
                      numberOfGuests: { type: 'integer' },
                      accommodationType: { type: 'string' }
                    }
                  }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Email sent successfully'
          }
        }
      }
    },
    '/email-template/revisit-regret': {
      post: {
        tags: ['Email Template'],
        summary: 'Send regret email for revisit within 6 months',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  data: {
                    type: 'object',
                    required: ['email', 'name', 'previousStayDate'],
                    properties: {
                      name: { type: 'string' },
                      email: { type: 'string', format: 'email' },
                      previousStayDate: { type: 'string', format: 'date' }
                    }
                  }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Email sent successfully'
          }
        }
      }
    },
    '/email-template/special-celebration-regret': {
      post: {
        tags: ['Email Template'],
        summary: 'Send regret email for special celebration period',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  data: {
                    type: 'object',
                    required: ['email', 'name'],
                    properties: {
                      name: { type: 'string' },
                      email: { type: 'string', format: 'email' },
                      celebrationName: { type: 'string' }
                    }
                  }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Email sent successfully'
          }
        }
      }
    }
  }
}; 