'use strict';

module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/reminders/all',
      handler: 'reminder.sendAllReminders',
      config: {
        policies: [],
        description: 'Send checkout reminders through all channels',
        tags: ['Reminders'],
        auth: false,
        middlewares: [],
      }
    },
    {
      method: 'POST',
      path: '/reminders/email',
      handler: 'reminder.sendEmailReminder',
      config: {
        policies: [],
        description: 'Send checkout reminder via email',
        tags: ['Reminders'],
        auth: false,
        middlewares: [],
      }
    },
    {
      method: 'POST',
      path: '/reminders/sms',
      handler: 'reminder.sendSMSReminder',
      config: {
        policies: [],
        description: 'Send checkout reminder via SMS',
        tags: ['Reminders'],
        auth: false,
        middlewares: [],
      }
    },
    {
      method: 'POST',
      path: '/reminders/whatsapp',
      handler: 'reminder.sendWhatsAppReminder',
      config: {
        policies: [],
        description: 'Send checkout reminder via WhatsApp',
        tags: ['Reminders'],
        auth: false,
        middlewares: [],
      }
    }
  ]
}; 