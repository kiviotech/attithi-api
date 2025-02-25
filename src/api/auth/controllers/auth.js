'use strict';

module.exports = {
  // Initiate login with phone number
  async initiateLogin(ctx) {
    try {
      const { phoneNumber } = ctx.request.body;

      if (!phoneNumber) {
        return ctx.badRequest('Phone number is required');
      }

      // Check if user exists
      const user = await strapi.db.query('api::guest-detail.guest-detail').findOne({
        where: { phone_number: phoneNumber }
      });

      if (!user) {
        return ctx.badRequest('No user found with this phone number');
      }

      // Generate OTP
      const otp = await strapi.service('api::otp.otp').generateOTP();

      // Store OTP
      await strapi.service('api::otp.otp').storeOTP(phoneNumber, otp);

      // Send OTP via SMS
      await strapi.service('api::otp.otp').sendOTPviaSMS(phoneNumber, otp);

      return ctx.send({
        success: true,
        message: 'OTP sent successfully'
      });
    } catch (error) {
      console.error('Login initiation failed:', error);
      return ctx.badRequest(error.message);
    }
  },

  // Verify OTP and complete login
  async verifyOTP(ctx) {
    try {
      const { phoneNumber, otp } = ctx.request.body;

      if (!phoneNumber || !otp) {
        return ctx.badRequest('Phone number and OTP are required');
      }

      // Verify OTP
      const verification = await strapi.service('api::otp.otp').verifyOTP(phoneNumber, otp);

      if (!verification.isValid) {
        return ctx.badRequest(verification.message);
      }

      // Get user details
      const user = await strapi.db.query('api::guest-detail.guest-detail').findOne({
        where: { phone_number: phoneNumber }
      });

      // Generate JWT token
      const jwt = strapi.plugins['users-permissions'].services.jwt.issue({
        id: user.id,
        phone_number: user.phone_number
      });

      return ctx.send({
        success: true,
        jwt,
        user: {
          id: user.id,
          name: user.name,
          phoneNumber: user.phone_number,
          email: user.email
        }
      });
    } catch (error) {
      console.error('OTP verification failed:', error);
      return ctx.badRequest(error.message);
    }
  }
}; 