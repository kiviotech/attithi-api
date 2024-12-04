'use strict';

const QRCode = require('qrcode');
const templates = require('../templates');

module.exports = {
  async sendNotifications(bookingData) {
    const errors = [];
    
    // Send Email
    try {
      await this.sendEmail(bookingData);
    } catch (error) {
      console.error('Email sending failed:', error);
      errors.push({ type: 'email', error });
    }
    
    // Send SMS
    try {
      await this.sendSMS(bookingData);
    } catch (error) {
      console.error('SMS sending failed:', error);
      errors.push({ type: 'sms', error });
    }
    
    // Send WhatsApp
    try {
      await this.sendWhatsApp(bookingData);
    } catch (error) {
      console.error('WhatsApp sending failed:', error);
      errors.push({ type: 'whatsapp', error });
    }
    
    // If all notifications failed, throw an error
    if (errors.length === 3) {
      throw new Error('All notification methods failed');
    }
    
    // Return result with any errors
    return {
      success: errors.length < 3,
      errors: errors.length > 0 ? errors : undefined
    };
  },

  async sendEmail(bookingData) {
    try {
      await strapi.plugins['email'].services.email.send({
        to: bookingData.email,
        subject: 'Booking Request Confirmation',
        html: `
          <h1>Booking Request Received</h1>
          <p>Dear ${bookingData.name},</p>
          <p>Your booking request has been received successfully.</p>
          <p>Booking Request ID: ${bookingData.id}</p>
          <p>You can track your booking status by downloading our app:</p>
          <p><a href="[APP_STORE_LINK]">Download from App Store</a></p>
          <p><a href="[PLAY_STORE_LINK]">Download from Play Store</a></p>
        `,
      });
    } catch (error) {
      throw error;
    }
  },

  async sendSMS(bookingData) {
    try {
      const twilioClient = require('twilio')(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      );

      await twilioClient.messages.create({
        body: `Your booking request (ID: ${bookingData.id}) has been received. Download our app to track status: [APP_LINK]`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: bookingData.phoneNumber
      });
    } catch (error) {
      throw error;
    }
  },

  async sendWhatsApp(bookingData) {
    try {
      // Only attempt WhatsApp if TWILIO_WHATSAPP_ENABLED is true
      if (process.env.TWILIO_WHATSAPP_ENABLED !== 'true') {
        console.log('WhatsApp notifications are disabled');
        return;
      }

      const twilioClient = require('twilio')(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      );

      await twilioClient.messages.create({
        body: `Your booking request (ID: ${bookingData.id}) has been received. Download our app to track status: [APP_LINK]`,
        from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
        to: `whatsapp:${bookingData.phoneNumber}`
      });
    } catch (error) {
      throw error;
    }
  },

  async sendAllocationNotifications(allocationData) {
    const errors = [];
    
    // Send Email
    try {
      await this.sendAllocationEmail(allocationData);
    } catch (error) {
      console.error('Allocation email sending failed:', error);
      errors.push({ type: 'email', error });
    }
    
    // Send SMS
    try {
      await this.sendAllocationSMS(allocationData);
    } catch (error) {
      console.error('Allocation SMS sending failed:', error);
      errors.push({ type: 'sms', error });
    }
    
    // Send WhatsApp
    try {
      await this.sendAllocationWhatsApp(allocationData);
    } catch (error) {
      console.error('Allocation WhatsApp sending failed:', error);
      errors.push({ type: 'whatsapp', error });
    }
    
    if (errors.length === 3) {
      throw new Error('All allocation notifications failed');
    }
    
    return {
      success: errors.length < 3,
      errors: errors.length > 0 ? errors : undefined
    };
  },

  async sendAllocationEmail(allocationData) {
    try {
      const qrCodeDataUrl = await this.generateQRCode(allocationData.bookingRequestId);
      
      // Get the appropriate template based on accommodation type
      let template;
      switch(allocationData.accommodationType) {
        case 'guestHouse':
          template = templates.confirmations.guestHouse;
          break;
        case 'dormitory':
          template = templates.confirmations.dormitory;
          break;
        case 'yatriNivasRoom':
          template = templates.confirmations.yatriNivasRoom;
          break;
        case 'chinuShankhari':
          template = templates.confirmations.chinuShankhari;
          break;
        case 'peerlessFlat':
          template = templates.confirmations.peerlessFlat;
          break;
        default:
          template = templates.confirmations.guestHouse;
      }

      await strapi.plugins['email'].services.email.send({
        to: allocationData.email,
        subject: 'Room Allocation Confirmation',
        html: template(allocationData, qrCodeDataUrl)
      });
    } catch (error) {
      throw error;
    }
  },

  async sendAllocationSMS(allocationData) {
    try {
      const twilioClient = require('twilio')(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      );

      const message = `Room allocated! Room: ${allocationData.roomNumber}, Building: ${allocationData.building}. Check-in: ${new Date(allocationData.checkInDate).toLocaleDateString()}. Please show this SMS at reception.`;

      await twilioClient.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: allocationData.phoneNumber
      });
    } catch (error) {
      throw error;
    }
  },

  async sendAllocationWhatsApp(allocationData) {
    try {
      if (process.env.TWILIO_WHATSAPP_ENABLED !== 'true') {
        console.log('WhatsApp notifications are disabled');
        return;
      }

      const twilioClient = require('twilio')(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      );

      const message = `Room allocated! Room: ${allocationData.roomNumber}, Building: ${allocationData.building}. Check-in: ${new Date(allocationData.checkInDate).toLocaleDateString()}. Please show this message at reception.`;

      await twilioClient.messages.create({
        body: message,
        from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
        to: `whatsapp:${allocationData.phoneNumber}`
      });
    } catch (error) {
      throw error;
    }
  },

  async generateQRCode(bookingRequestId) {
    try {
      // Generate QR code with the booking request ID
      // You can customize the URL format based on your frontend application
      const bookingUrl = `${process.env.FRONTEND_URL}/booking/${bookingRequestId}`;
      const qrCodeDataUrl = await QRCode.toDataURL(bookingUrl);
      return qrCodeDataUrl;
    } catch (error) {
      console.error('QR code generation failed:', error);
      throw error;
    }
  },

  async sendConfirmationNotifications(bookingData) {
    const errors = [];
    
    // Send Email
    try {
      await this.sendConfirmationEmail(bookingData);
    } catch (error) {
      console.error('Confirmation email sending failed:', error);
      errors.push({ type: 'email', error });
    }
    
    // Send SMS
    try {
      await this.sendConfirmationSMS(bookingData);
    } catch (error) {
      console.error('Confirmation SMS sending failed:', error);
      errors.push({ type: 'sms', error });
    }
    
    // Send WhatsApp
    try {
      await this.sendConfirmationWhatsApp(bookingData);
    } catch (error) {
      console.error('Confirmation WhatsApp sending failed:', error);
      errors.push({ type: 'whatsapp', error });
    }
    
    if (errors.length === 3) {
      throw new Error('All confirmation notifications failed');
    }
    
    return {
      success: errors.length < 3,
      errors: errors.length > 0 ? errors : undefined
    };
  },

  async sendConfirmationEmail(bookingData) {
    try {
      // Generate QR code for the booking
      const qrCodeDataUrl = await this.generateQRCode(bookingData.id);

      await strapi.plugins['email'].services.email.send({
        to: bookingData.email,
        subject: 'Booking Request Confirmed',
        html: `
          <h1>Booking Request Confirmed</h1>
          <p>Dear ${bookingData.name},</p>
          <p>Your booking request has been confirmed!</p>
          <p>Details:</p>
          <ul>
            <li>Booking Request ID: ${bookingData.id}</li>
            <li>Check-in Date: ${new Date(bookingData.checkInDate).toLocaleDateString()}</li>
            <li>Check-out Date: ${new Date(bookingData.checkOutDate).toLocaleDateString()}</li>
            <li>Number of Guests: ${bookingData.numberOfGuests}</li>
            <li>Purpose of Visit: ${bookingData.purpose}</li>
          </ul>
          <p>Your room will be allocated soon. You will receive another email with room details.</p>
          <p>Please use this QR code during check-in:</p>
          <img src="${qrCodeDataUrl}" alt="Booking QR Code" style="width: 200px; height: 200px;"/>
          <p>You can also scan this QR code with our app to view your booking details.</p>
          <p>Important Notes:</p>
          <ul>
            <li>Check-in time is between 2:00 PM and 6:00 PM</li>
            <li>Please carry a valid government ID proof</li>
            <li>In case of any changes, please contact us immediately</li>
          </ul>
        `,
      });
    } catch (error) {
      throw error;
    }
  },

  async sendConfirmationSMS(bookingData) {
    try {
      const twilioClient = require('twilio')(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      );

      const message = `Booking confirmed! ID: ${bookingData.id}. Check-in: ${new Date(bookingData.checkInDate).toLocaleDateString()}. You'll receive room details soon. Download our app to view details: [APP_LINK]`;

      await twilioClient.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: bookingData.phoneNumber
      });
    } catch (error) {
      throw error;
    }
  },

  async sendConfirmationWhatsApp(bookingData) {
    try {
      if (process.env.TWILIO_WHATSAPP_ENABLED !== 'true') {
        console.log('WhatsApp notifications are disabled');
        return;
      }

      const twilioClient = require('twilio')(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      );

      const message = `Booking confirmed! ID: ${bookingData.id}. Check-in: ${new Date(bookingData.checkInDate).toLocaleDateString()}. You'll receive room details soon. Download our app to view details: [APP_LINK]`;

      await twilioClient.messages.create({
        body: message,
        from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
        to: `whatsapp:${bookingData.phoneNumber}`
      });
    } catch (error) {
      throw error;
    }
  },

  async sendRejectionNotifications(bookingData) {
    const errors = [];
    
    try {
      await this.sendRejectionEmail(bookingData);
    } catch (error) {
      console.error('Rejection email sending failed:', error);
      errors.push({ type: 'email', error });
    }
    
    try {
      await this.sendRejectionSMS(bookingData);
    } catch (error) {
      console.error('Rejection SMS sending failed:', error);
      errors.push({ type: 'sms', error });
    }
    
    try {
      await this.sendRejectionWhatsApp(bookingData);
    } catch (error) {
      console.error('Rejection WhatsApp sending failed:', error);
      errors.push({ type: 'whatsapp', error });
    }
    
    if (errors.length === 3) {
      throw new Error('All rejection notifications failed');
    }
    
    return {
      success: errors.length < 3,
      errors: errors.length > 0 ? errors : undefined
    };
  },

  async sendRejectionEmail(bookingData) {
    try {
      let template;
      const { rejectionReason, rejectionType } = bookingData;

      switch (rejectionType) {
        case 'noAvailability':
          template = templates.rejections.noAvailability(bookingData);
          break;
        case 'sixMonthRule':
          template = templates.rejections.sixMonthRule(bookingData);
          break;
        case 'specialCelebrationBelow10k':
          template = templates.rejections.specialCelebrationBelow10k(bookingData);
          break;
        case 'specialCelebrationAbove10k':
          template = templates.rejections.specialCelebrationAbove10k(bookingData);
          break;
        default:
          // Custom rejection reason
          template = `
            <h1>Booking Request - Not Approved</h1>
            <p>Dear Devotee,</p>
            <p>Namaskar.</p>
            <p>We have received your accommodation request and appreciate your interest in staying at Holy Kamarpukur.</p>
            <p>We regret to inform you that we cannot accommodate your request for the following reason:</p>
            <p>${rejectionReason}</p>
            <p>May Sri Ramakrishna, Holy Mother Sri Sarada Devi and Swami Vivekananda bless you all!</p>
            <p>With best regards and namaskar again.</p>
            <p>Yours sincerely,</p>
            <p>Adhyaksha<br>
            RAMAKRISHNA MATH & RAMAKRISHNA MISSION, KAMARPUKUR</p>
          `;
      }

      await strapi.plugins['email'].services.email.send({
        to: bookingData.email,
        subject: 'Booking Request Update',
        html: template
      });
    } catch (error) {
      throw error;
    }
  },

  async sendRejectionSMS(bookingData) {
    try {
      const twilioClient = require('twilio')(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      );

      const message = `Your booking request (ID: ${bookingData.id}) could not be approved. Please check your email for details.`;

      await twilioClient.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: bookingData.phoneNumber
      });
    } catch (error) {
      throw error;
    }
  },

  async sendRejectionWhatsApp(bookingData) {
    try {
      if (process.env.TWILIO_WHATSAPP_ENABLED !== 'true') {
        console.log('WhatsApp notifications are disabled');
        return;
      }

      const twilioClient = require('twilio')(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      );

      const message = `Your booking request (ID: ${bookingData.id}) could not be approved. Please check your email for details.`;

      await twilioClient.messages.create({
        body: message,
        from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
        to: `whatsapp:${bookingData.phoneNumber}`
      });
    } catch (error) {
      throw error;
    }
  }
};
