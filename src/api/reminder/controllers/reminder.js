'use strict';

module.exports = {
  // Send all types of reminders
  async sendAllReminders(ctx) {
    try {
      const { data } = ctx.request.body;
      
      // Validate required fields
      if (!data.email || !data.phoneNumber || !data.name || !data.bookingId) {
        return ctx.badRequest('Missing required fields');
      }

      const result = await strapi.service('api::reminder.reminder').sendAllReminders(data);
      return ctx.send(result);
    } catch (error) {
      return ctx.badRequest(error.message);
    }
  },

  // Send email reminder only
  async sendEmailReminder(ctx) {
    try {
      const { data } = ctx.request.body;
      
      if (!data.email || !data.name || !data.bookingId) {
        return ctx.badRequest('Missing required fields');
      }

      const result = await strapi.service('api::reminder.reminder').sendEmailReminder(data);
      return ctx.send(result);
    } catch (error) {
      return ctx.badRequest(error.message);
    }
  },

  // Send SMS reminder only
  async sendSMSReminder(ctx) {
    try {
      const { data } = ctx.request.body;
      
      if (!data.phoneNumber || !data.name || !data.bookingId) {
        return ctx.badRequest('Missing required fields');
      }

      const result = await strapi.service('api::reminder.reminder').sendSMSReminder(data);
      return ctx.send(result);
    } catch (error) {
      return ctx.badRequest(error.message);
    }
  },

  // Send WhatsApp reminder only
  async sendWhatsAppReminder(ctx) {
    try {
      const { data } = ctx.request.body;
      
      if (!data.phoneNumber || !data.name || !data.bookingId) {
        return ctx.badRequest('Missing required fields');
      }

      const result = await strapi.service('api::reminder.reminder').sendWhatsAppReminder(data);
      return ctx.send(result);
    } catch (error) {
      return ctx.badRequest(error.message);
    }
  }
}; 