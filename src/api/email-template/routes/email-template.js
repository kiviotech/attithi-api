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
          description: 'Sends a confirmation email for dormitory bookings',
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  properties: {
                    data: {
                      type: 'object',
                      properties: {
                        email: { type: 'string', format: 'email' },
                        name: { type: 'string' },
                        checkInDate: { type: 'string', format: 'date' },
                        checkOutDate: { type: 'string', format: 'date' },
                        numberOfGuests: { type: 'number' },
                        bookingId: { type: 'string' }
                      },
                      required: ['email', 'checkInDate', 'checkOutDate', 'numberOfGuests', 'bookingId']
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
        description: 'Send peerless flat confirmation email',
        tags: ['Email Template'],
        auth: false,
        documentation: {
          summary: 'Send a peerless flat booking confirmation email',
          description: 'Sends a confirmation email for peerless flat bookings',
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  properties: {
                    data: {
                      type: 'object',
                      properties: {
                        email: { type: 'string', format: 'email' },
                        name: { type: 'string' },
                        checkInDate: { type: 'string', format: 'date' },
                        checkOutDate: { type: 'string', format: 'date' },
                        numberOfGuests: { type: 'number' },
                        bookingId: { type: 'string' }
                      },
                      required: ['email', 'checkInDate', 'checkOutDate', 'numberOfGuests', 'bookingId']
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
    },
    {
      method: 'POST',
      path: '/email-template/accommodation-regret',
      handler: 'email-template.sendAccommodationRegret',
      config: {
        policies: [],
        description: 'Send accommodation regret email',
        tags: ['Email Template'],
        auth: false,
        documentation: {
          summary: 'Send an accommodation regret email',
          description: 'Sends a regret email when no rooms are available',
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  properties: {
                    data: {
                      type: 'object',
                      properties: {
                        email: { type: 'string' },
                        name: { type: 'string' }
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
    },
    {
      method: 'POST',
      path: '/email-template/chinu-shankhhari-confirmation',
      handler: 'email-template.sendChinuShankhariConfirmation',
      config: {
        policies: [],
        description: 'Send Chinu Shankhhari guest house confirmation email',
        tags: ['Email Template'],
        auth: false,
        documentation: {
          summary: 'Send a Chinu Shankhhari guest house booking confirmation email',
          description: 'Sends a confirmation email for Chinu Shankhhari Memorial Building guest house accommodation bookings',
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
      path: '/email-template/yatri-nivas-confirmation',
      handler: 'email-template.sendYatriNivasConfirmation',
      config: {
        policies: [],
        description: 'Send Yatri Nivas room confirmation email',
        tags: ['Email Template'],
        auth: false,
        documentation: {
          summary: 'Send a Yatri Nivas room booking confirmation email',
          description: 'Sends a confirmation email for Yatri Nivas room accommodation bookings',
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
    }
  ]
}; 