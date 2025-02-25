'use strict';

module.exports = {
  async sendBookingConfirmation(data) {
    try {
      // Send email using strapi's email plugin
      await strapi.plugins['email'].services.email.send({
        to: data.email,
        from: process.env.SMTP_FROM,
        subject: `Booking Confirmation - #${data.bookingId}`,
        template: 'booking-confirmation',
        templateVars: {
          bookingId: data.bookingId,
          guestName: data.name,
          checkInDate: new Date(data.checkInDate).toLocaleDateString(),
          checkOutDate: new Date(data.checkOutDate).toLocaleDateString(),
          numberOfGuests: data.numberOfGuests,
          purpose: data.purpose,
          accommodationType: data.accommodationType,
        }
      });

      return { success: true };
    } catch (error) {
      console.error('Email sending failed:', error);
      throw new Error('Failed to send confirmation email');
    }
  }
}; 