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
  },

  async sendRevisitRegret(ctx) {
    try {
      const { data } = ctx.request.body;

      // Validate required fields
      if (!data.email || !data.previousStayDate || !data.name) {
        return ctx.badRequest('Missing required fields');
      }

      // Send regret email
      const result = await strapi.service('api::email-template.email-template')
        .sendRevisitRegret(data);

      return ctx.send(result);
    } catch (error) {
      return ctx.badRequest(error.message);
    }
  },

  async sendSpecialCelebrationRegret(ctx) {
    try {
      const { data } = ctx.request.body;

      // Validate required fields
      if (!data.email || !data.name) {
        return ctx.badRequest('Missing required fields');
      }

      // Send special celebration regret email
      const result = await strapi.service('api::email-template.email-template')
        .sendSpecialCelebrationRegret(data);

      return ctx.send(result);
    } catch (error) {
      return ctx.badRequest(error.message);
    }
  },

  async testEmail(ctx) {
    try {
      console.log('Testing email functionality');
      
      // Send a simple test email
      await strapi.plugins['email'].services.email.send({
        to: process.env.SMTP_USERNAME, // Send to yourself for testing
        from: process.env.SMTP_FROM,
        subject: 'Test Email from Attithi API',
        text: 'This is a test email to verify SMTP configuration.',
        html: '<h1>Test Email</h1><p>This is a test email to verify SMTP configuration.</p>'
      });
      
      return ctx.send({
        success: true,
        message: 'Test email sent successfully'
      });
    } catch (error) {
      console.error('Test email failed:', error);
      return ctx.badRequest(`Email test failed: ${error.message}`);
    }
  },

  async testDirectEmail(ctx) {
    try {
      console.log('Testing email with direct nodemailer');
      
      const nodemailer = require('nodemailer');
      
      // Create a transporter with your SMTP settings
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT),
        secure: parseInt(process.env.SMTP_PORT) === 465,
        auth: {
          user: process.env.SMTP_USERNAME,
          pass: process.env.SMTP_PASSWORD
        },
        debug: true // Enable debug output
      });
      
      console.log('SMTP Configuration:', {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: parseInt(process.env.SMTP_PORT) === 465,
        auth: {
          user: process.env.SMTP_USERNAME,
          pass: '********' // Masked for security
        }
      });
      
      // Send mail
      const info = await transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: process.env.SMTP_USERNAME, // Send to yourself
        subject: 'Direct Nodemailer Test',
        text: 'Testing direct nodemailer implementation',
        html: '<h1>Direct Test</h1><p>Testing direct nodemailer implementation</p>'
      });
      
      console.log('Message sent:', info.messageId);
      
      return ctx.send({
        success: true,
        message: 'Direct test email sent successfully',
        messageId: info.messageId
      });
    } catch (error) {
      console.error('Direct email test failed:', error);
      return ctx.badRequest(`Direct email test failed: ${error.message}`);
    }
  },

  async sendNoRoomsRegret(ctx) {
    try {
      const { data } = ctx.request.body;

      // Validate required fields
      if (!data.email) {
        return ctx.badRequest('Missing required fields');
      }

      // Send no rooms regret email
      const result = await strapi.service('api::email-template.email-template')
        .sendNoRoomsRegret(data);

      return ctx.send(result);
    } catch (error) {
      return ctx.badRequest(error.message);
    }
  },

  async sendDormitoryConfirmation(ctx) {
    try {
      const { data } = ctx.request.body;

      // Validate required fields
      if (!data.email || !data.checkInDate || !data.checkOutDate || !data.numberOfGuests || !data.bookingId) {
        return ctx.badRequest('Missing required fields');
      }

      // Send dormitory confirmation email
      const result = await strapi.service('api::email-template.email-template')
        .sendDormitoryConfirmation(data);

      return ctx.send(result);
    } catch (error) {
      return ctx.badRequest(error.message);
    }
  },

  async sendPeerlessConfirmation(ctx) {
    try {
      const { data } = ctx.request.body;

      // Validate required fields
      if (!data.email || !data.checkInDate || !data.checkOutDate || !data.numberOfGuests || !data.bookingId) {
        return ctx.badRequest('Missing required fields');
      }

      // Send peerless confirmation email
      const result = await strapi.service('api::email-template.email-template')
        .sendPeerlessConfirmation(data);

      return ctx.send(result);
    } catch (error) {
      return ctx.badRequest(error.message);
    }
  },

  async sendAccommodationRegret(ctx) {
    try {
      const { data } = ctx.request.body;

      // Validate required fields
      if (!data.email) {
        return ctx.badRequest('Missing required fields');
      }

      // Send accommodation regret email
      const result = await strapi.service('api::email-template.email-template')
        .sendAccommodationRegret(data);

      return ctx.send(result);
    } catch (error) {
      return ctx.badRequest(error.message);
    }
  },

  async sendChinuShankhariConfirmation(ctx) {
    try {
      const { data } = ctx.request.body;

      // Validate required fields
      if (!data.email || !data.checkInDate || !data.checkOutDate || !data.numberOfGuests || !data.bookingId) {
        return ctx.badRequest('Missing required fields');
      }

      // Send Chinu Shankhari confirmation email
      const result = await strapi.service('api::email-template.email-template')
        .sendChinuShankhariConfirmation(data);

      return ctx.send(result);
    } catch (error) {
      return ctx.badRequest(error.message);
    }
  },

  async sendYatriNivasConfirmation(ctx) {
    try {
      const { data } = ctx.request.body;

      // Validate required fields
      if (!data.email || !data.checkInDate || !data.checkOutDate || !data.numberOfGuests || !data.bookingId) {
        return ctx.badRequest('Missing required fields');
      }

      // Send Yatri Nivas confirmation email
      const result = await strapi.service('api::email-template.email-template')
        .sendYatriNivasConfirmation(data);

      return ctx.send(result);
    } catch (error) {
      return ctx.badRequest(error.message);
    }
  }
}; 