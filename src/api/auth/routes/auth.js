'use strict';

module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/auth/login/otp/initiate',
      handler: 'auth.initiateLogin',
      config: {
        policies: [],
        description: 'Initiate login with phone number',
        tags: ['Authentication']
      }
    },
    {
      method: 'POST',
      path: '/auth/login/otp/verify',
      handler: 'auth.verifyOTP',
      config: {
        policies: [],
        description: 'Verify OTP and complete login',
        tags: ['Authentication']
      }
    }
  ]
}; 