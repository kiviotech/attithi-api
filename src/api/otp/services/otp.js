'use strict';

module.exports = {
  // Generate a 6 digit OTP
  generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  },

  // Store OTP with expiry (15 minutes)
  async storeOTP(phoneNumber, otp) {
    try {
      // First clear any existing OTP
      await strapi.db.query('api::otp-storage.otp-storage').delete({
        where: { phone_number: phoneNumber }
      });

      // Store new OTP
      await strapi.db.query('api::otp-storage.otp-storage').create({
        data: {
          phone_number: phoneNumber,
          otp: otp,
          expires_at: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes expiry
          publishedAt: new Date()
        }
      });

      return true;
    } catch (error) {
      console.error('OTP storage failed:', error);
      throw new Error('Failed to store OTP');
    }
  },

  // Verify OTP
  async verifyOTP(phoneNumber, otp) {
    try {
      const otpRecord = await strapi.db.query('api::otp-storage.otp-storage').findOne({
        where: { phone_number: phoneNumber }
      });

      if (!otpRecord) {
        return { isValid: false, message: 'No OTP found' };
      }

      if (new Date() > new Date(otpRecord.expires_at)) {
        return { isValid: false, message: 'OTP expired' };
      }

      if (otpRecord.otp !== otp) {
        return { isValid: false, message: 'Invalid OTP' };
      }

      // Delete the used OTP
      await strapi.db.query('api::otp-storage.otp-storage').delete({
        where: { id: otpRecord.id }
      });

      return { isValid: true };
    } catch (error) {
      console.error('OTP verification failed:', error);
      throw new Error('Failed to verify OTP');
    }
  },

  // Send OTP via SMS
  async sendOTPviaSMS(phoneNumber, otp) {
    try {
      const twilioClient = require('twilio')(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      );

      await twilioClient.messages.create({
        body: `Your login OTP is: ${otp}. Valid for 15 minutes.`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phoneNumber
      });

      return true;
    } catch (error) {
      console.error('SMS sending failed:', error);
      throw new Error('Failed to send OTP via SMS');
    }
  }
}; 