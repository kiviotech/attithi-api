'use strict';

module.exports = {
  async sendBookingNotification(ctx) {
    try {
      const { data } = ctx.request.body;

      // Validate required fields
      if (!data.id || !data.name || !data.email || !data.phoneNumber) {
        return ctx.badRequest('Missing required fields');
      }

      // Send notifications using the existing service
      const result = await strapi.service('api::notification.notification').sendNotifications({
        id: data.id,
        name: data.name,
        email: data.email,
        phoneNumber: data.phoneNumber,
      });

      return ctx.send({
        success: true,
        message: 'Notification sent successfully',
        data: result
      });

    } catch (error) {
      console.error('Failed to send notification:', error);
      return ctx.badRequest(error.message);
    }
  }
}; 