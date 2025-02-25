'use strict';

module.exports = {
  // Send reminder through all channels
  async sendAllReminders(data) {
    const results = {
      email: null,
      sms: null,
      whatsapp: null
    };

    try {
      // Send each notification and catch individual errors
      try {
        results.email = await this.sendEmailReminder(data);
      } catch (error) {
        console.error('Email reminder failed:', error);
        results.email = { success: false, error: error.message };
      }

      try {
        results.sms = await this.sendSMSReminder(data);
      } catch (error) {
        console.error('SMS reminder failed:', error);
        results.sms = { success: false, error: error.message };
      }

      try {
        results.whatsapp = await this.sendWhatsAppReminder(data);
      } catch (error) {
        console.error('WhatsApp reminder failed:', error);
        results.whatsapp = { success: false, error: error.message };
      }

      // Check if at least one notification was sent
      if (!results.email?.success && !results.sms?.success && !results.whatsapp?.success) {
        throw new Error('All reminders failed to send');
      }

      return {
        success: true,
        message: 'Reminders processed',
        results
      };
    } catch (error) {
      console.error('Failed to send reminders:', error);
      throw new Error(error.message);
    }
  },

  // Email reminder
  async sendEmailReminder(data) {
    try {
      // Verify SMTP credentials exist
      if (!process.env.SMTP_USERNAME || !process.env.SMTP_PASSWORD) {
        throw new Error('SMTP credentials not configured');
      }

      await strapi.plugins['email'].services.email.send({
        to: data.email,
        from: process.env.SMTP_FROM,
        subject: 'Checkout Reminder - Tomorrow',
        template: 'checkout-reminder',
        templateVars: {
          guestName: data.name,
          bookingId: data.bookingId,
          checkoutDate: new Date(data.checkoutDate).toLocaleDateString(),
          checkoutTime: '11:00 AM',
          roomNumber: data.roomNumber
        }
      });
      
      return { success: true, channel: 'email' };
    } catch (error) {
      console.error('Email reminder failed:', error);
      throw new Error(`Email failed: ${error.message}`);
    }
  },

  // SMS reminder using Twilio
  async sendSMSReminder(data) {
    try {
      // Verify Twilio credentials exist
      if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
        throw new Error('Twilio credentials not configured');
      }

      const twilioClient = require('twilio')(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      );

      const message = await twilioClient.messages.create({
        body: `Dear ${data.name}, this is a reminder that your checkout is scheduled for tomorrow at 11:00 AM. Room: ${data.roomNumber}. Thank you for staying with us.`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: data.phoneNumber
      });

      return { success: true, channel: 'sms', messageId: message.sid };
    } catch (error) {
      console.error('SMS reminder failed:', error);
      throw new Error(`SMS failed: ${error.message}`);
    }
  },

  // WhatsApp reminder using Twilio WhatsApp
  async sendWhatsAppReminder(data) {
    try {
      // Verify Twilio credentials exist
      if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_WHATSAPP_NUMBER) {
        throw new Error('Twilio WhatsApp credentials not configured');
      }

      const twilioClient = require('twilio')(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      );

      // Format the message for WhatsApp
      const message = await twilioClient.messages.create({
        body: `Dear ${data.name}, this is a reminder that your checkout is scheduled for tomorrow at 11:00 AM.\n\nBooking Details:\nRoom: ${data.roomNumber}\nCheckout Date: ${new Date(data.checkoutDate).toLocaleDateString()}\n\nThank you for staying with us.`,
        from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
        to: `whatsapp:${data.phoneNumber}`
      });

      return { success: true, channel: 'whatsapp', messageId: message.sid };
    } catch (error) {
      console.error('WhatsApp reminder failed:', error);
      throw new Error(`WhatsApp failed: ${error.message}`);
    }
  }
}; 