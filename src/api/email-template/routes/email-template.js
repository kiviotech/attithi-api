'use strict';

module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/email-template/booking-confirmation',
      handler: 'email-template.sendBookingConfirmation',
      config: {
        policies: [],
        description: 'Send booking confirmation email',
        tags: ['Email Template'],
        auth: false,
        middlewares: [],
        documentation: {
          summary: 'Send a booking confirmation email',
          description: 'Sends a confirmation email to the guest with booking details',
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  properties: {
                    data: {
                      type: 'object',
                      properties: {
                        bookingId: { type: 'string' },
                        name: { type: 'string' },
                        email: { type: 'string' },
                        checkInDate: { type: 'string' },
                        checkOutDate: { type: 'string' },
                        numberOfGuests: { type: 'integer' },
                        purpose: { type: 'string' },
                        accommodationType: { type: 'string' }
                      },
                      required: ['email', 'bookingId', 'name']
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    {
      method: 'POST',
      path: '/email-template/revisit-regret',
      handler: 'email-template.sendRevisitRegret',
      config: {
        policies: [],
        description: 'Send regret email for revisit within 6 months',
        tags: ['Email Template'],
        auth: false,
        documentation: {
          summary: 'Send a regret email for revisit within 6 months',
          description: 'Sends a regret email to guests who try to book within 6 months of their last stay',
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  properties: {
                    data: {
                      type: 'object',
                      properties: {
                        email: { type: 'string' },
                        name: { type: 'string' },
                        previousStayDate: { type: 'string', format: 'date' }
                      },
                      required: ['email', 'name', 'previousStayDate']
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    {
      method: 'POST',
      path: '/email-template/special-celebration-regret',
      handler: 'email-template.sendSpecialCelebrationRegret',
      config: {
        policies: [],
        description: 'Send regret email for special celebration period',
        tags: ['Email Template']
      }
    }
  ]
}; 