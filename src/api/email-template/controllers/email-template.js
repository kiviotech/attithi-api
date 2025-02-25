'use strict';

module.exports = {
  async sendBookingConfirmation(ctx) {
    try {
      const { data } = ctx.request.body;

      // Validate required fields
      if (!data.email || !data.bookingId || !data.name) {
        return ctx.badRequest('Missing required fields');
      }

      // Send confirmation email
      const result = await strapi.service('api::email-template.email-template')
        .sendBookingConfirmation(data);

      return ctx.send(result);
    } catch (error) {
      return ctx.badRequest(error.message);
    }
  }
}; 