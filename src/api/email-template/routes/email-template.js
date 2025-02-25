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
    }
  ]
}; 