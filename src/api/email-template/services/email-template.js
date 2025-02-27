'use strict';

module.exports = {
  async sendBookingConfirmation(data) {
    try {
      // Format dates
      const arrivalDate = new Date(data.checkInDate).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
      
      const departureDate = new Date(data.checkOutDate).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });

      // Send email using strapi's email plugin
      await strapi.plugins['email'].services.email.send({
        to: data.email,
        from: process.env.SMTP_FROM,
        subject: 'Booking Confirmation - Ramakrishna Math & Mission, Kamarpukur',
        template: 'booking-confirmation',
        templateVars: {
          bookingId: data.bookingId,
          guestName: data.name,
          arrivalDate: arrivalDate,
          departureDate: departureDate,
          numberOfDevotees: data.numberOfGuests,
          accommodationType: data.accommodationType || 'Guest House'
        }
      });

      return { success: true };
    } catch (error) {
      console.error('Email sending failed:', error);
      throw new Error('Failed to send confirmation email');
    }
  },

  async sendRevisitRegret(data) {
    try {
      // Format previous stay date
      const previousStayDate = new Date(data.previousStayDate).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });

      // Send email using strapi's email plugin
      await strapi.plugins['email'].services.email.send({
        to: data.email,
        from: process.env.SMTP_FROM,
        subject: 'Booking Request - Ramakrishna Math & Mission, Kamarpukur',
        template: 'revisit-regret',
        templateVars: {
          guestName: data.name,
          previousStayDate: previousStayDate,
        }
      });

      return { success: true };
    } catch (error) {
      console.error('Email sending failed:', error);
      throw new Error('Failed to send regret email');
    }
  },

  async sendSpecialCelebrationRegret(data) {
    try {
      // Send email using strapi's email plugin
      await strapi.plugins['email'].services.email.send({
        to: data.email,
        from: process.env.SMTP_FROM,
        subject: 'Booking Request - Special Celebration Period',
        template: 'special-celebration-regret',
        templateVars: {
          guestName: data.name,
          celebrationName: data.celebrationName || 'Sri Sri Thakur\'s Tithi Puja 2025 / Durga Puja 2025'
        }
      });

      return { success: true };
    } catch (error) {
      console.error('Email sending failed:', error);
      throw new Error('Failed to send special celebration regret email');
    }
  }
}; 