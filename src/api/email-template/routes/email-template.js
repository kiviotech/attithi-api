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
                      required: ['email', 'previousStayDate']
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
        tags: ['Email Template'],
        auth: false,
        documentation: {
          summary: 'Send a special celebration regret email',
          description: 'Sends a regret email for bookings during special celebrations',
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
                        celebrationType: { 
                          type: 'string',
                          enum: ['Durga Puja', 'Thakur Tithi Puja']
                        }
                      },
                      required: ['email', 'celebrationType']
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
      path: '/email-template/dormitory-confirmation',
      handler: 'email-template.sendDormitoryConfirmation',
      config: {
        policies: [],
        description: 'Send dormitory confirmation email',
        tags: ['Email Template'],
        auth: false,
        documentation: {
          summary: 'Send a dormitory booking confirmation email',
          description: 'Sends a confirmation email for dormitory accommodation bookings',
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  properties: {
                    data: {
                      type: 'object',
                      properties: {
                        bookingId: { type: 'string' },
                        email: { type: 'string' },
                        name: { type: 'string' },
                        checkInDate: { type: 'string', format: 'date' },
                        checkOutDate: { type: 'string', format: 'date' },
                        numberOfGuests: { type: 'number' }
                      },
                      required: ['bookingId', 'email', 'checkInDate', 'checkOutDate', 'numberOfGuests']
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
      path: '/email-template/peerless-confirmation',
      handler: 'email-template.sendPeerlessConfirmation',
      config: {
        policies: [],
        description: 'Send Peerless Flat confirmation email',
        tags: ['Email Template'],
        auth: false,
        documentation: {
          summary: 'Send a Peerless Flat booking confirmation email',
          description: 'Sends a confirmation email for Peerless Flat accommodation bookings',
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  properties: {
                    data: {
                      type: 'object',
                      properties: {
                        bookingId: { type: 'string' },
                        email: { type: 'string' },
                        name: { type: 'string' },
                        checkInDate: { type: 'string', format: 'date' },
                        checkOutDate: { type: 'string', format: 'date' },
                        numberOfGuests: { type: 'number' }
                      },
                      required: ['bookingId', 'email', 'checkInDate', 'checkOutDate', 'numberOfGuests']
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
      path: '/email-template/no-rooms-regret',
      handler: 'email-template.sendNoRoomsRegret',
      config: {
        policies: [],
        description: 'Send no rooms availability regret email',
        tags: ['Email Template'],
        auth: false,
        documentation: {
          summary: 'Send a no rooms availability regret email',
          description: 'Sends a regret email when no rooms are available for the requested dates',
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
                        requestedDates: {
                          type: 'object',
                          properties: {
                            checkIn: { type: 'string', format: 'date' },
                            checkOut: { type: 'string', format: 'date' }
                          }
                        }
                      },
                      required: ['email']
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