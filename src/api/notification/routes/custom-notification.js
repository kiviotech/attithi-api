module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/notifications/booking',
      handler: 'email.sendBookingNotification',
      config: {
        policies: [],
        description: 'Send booking notification email',
        tags: ['Notification', 'Email']
      }
    }
  ]
}; 