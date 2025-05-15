'use strict';

/**
 * guest-detail controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::guest-detail.guest-detail', ({ strapi }) => ({
  // Create a custom controller method to find a guest by phone number
  async findByPhone(ctx) {
    try {
      let { phoneNumber } = ctx.params;
      
      // Clean the phone number - remove any non-digit characters
      phoneNumber = phoneNumber.replace(/\D/g, '');
      
      // If it starts with 91, remove it (for +91 or 91 prefixes)
      if (phoneNumber.startsWith('91') && phoneNumber.length > 10) {
        phoneNumber = phoneNumber.substring(2);
      }
      
      // If it starts with 0, remove it
      if (phoneNumber.startsWith('0') && phoneNumber.length > 10) {
        phoneNumber = phoneNumber.substring(1);
      }
      
      // Validate the phone number - must be exactly 10 digits
      if (!phoneNumber || phoneNumber.length !== 10 || !/^\d{10}$/.test(phoneNumber)) {
        return ctx.badRequest('Invalid phone number format');
      }
      
      // Query the database for a guest with the provided phone number
      const guests = await strapi.entityService.findMany('api::guest-detail.guest-detail', {
        filters: { phone_number: phoneNumber },
        fields: ['id', 'name'], // Only return minimal fields
      });
      
      // If no guest is found, return a 404
      if (!guests || guests.length === 0) {
        return ctx.notFound('No guest found with this phone number');
      }
      
      // Return only a success response with minimal info
      return ctx.send({
        exists: true,
        guestId: guests[0].id,
        message: 'Guest found with this phone number'
      });
    } catch (error) {
      console.error('Error finding guest by phone number:', error);
      return ctx.internalServerError('An error occurred while finding the guest');
    }
  },
  
  // Add a new method to get full guest details after OTP verification
  async getDetailsByPhone(ctx) {
    try {
      let { phoneNumber } = ctx.params;
      
      // Clean the phone number - remove any non-digit characters
      phoneNumber = phoneNumber.replace(/\D/g, '');
      
      // If it starts with 91, remove it (for +91 or 91 prefixes)
      if (phoneNumber.startsWith('91') && phoneNumber.length > 10) {
        phoneNumber = phoneNumber.substring(2);
      }
      
      // If it starts with 0, remove it
      if (phoneNumber.startsWith('0') && phoneNumber.length > 10) {
        phoneNumber = phoneNumber.substring(1);
      }
      
      // Validate the phone number - must be exactly 10 digits
      if (!phoneNumber || phoneNumber.length !== 10 || !/^\d{10}$/.test(phoneNumber)) {
        return ctx.badRequest('Invalid phone number format');
      }
      
      // Query the database for a guest with the provided phone number
      const guests = await strapi.entityService.findMany('api::guest-detail.guest-detail', {
        filters: { phone_number: phoneNumber },
        populate: ['address', 'guests'],
      });
      
      // If no guest is found, return a 404
      if (!guests || guests.length === 0) {
        return ctx.notFound('No guest found with this phone number');
      }
      
      const guest = guests[0];
      
      // Format the response to match frontend expectations
      const formattedResponse = {
        id: guest.id,
        name: guest.name || "",
        phone_number: guest.phone_number || "",
        age: guest.age || "",
        gender: guest.gender || "",
        email: guest.email || "",
        occupation: guest.occupation || "",
        deeksha: guest.deeksha || "",
        identity_number: guest.identity_number || guest.aadhaar || "",
        
        // Parse address if it's a string
        address: typeof guest.address === 'object' ? guest.address : {
          state: "",
          district: "",
          street_name: guest.address || "",
          pin_code: ""
        },
        
        // Include empty guests array if none exist
        guests: guest.guests || []
      };
      
      // Return the formatted guest details
      return ctx.send(formattedResponse);
    } catch (error) {
      console.error('Error getting guest details by phone number:', error);
      return ctx.internalServerError('An error occurred while getting the guest details');
    }
  },

  // Custom controller method to find a guest by Aadhaar (unique_no)
  async findByAadhaar(ctx) {
    try {
      let { aadhaar } = ctx.params;
      console.log('[findByAadhaar] Received param:', aadhaar);
      // Clean the aadhaar number - remove any non-digit characters
      aadhaar = aadhaar.replace(/\D/g, '');
      console.log('[findByAadhaar] Cleaned Aadhaar:', aadhaar);
      // Aadhaar must be 12 digits
      if (!aadhaar || aadhaar.length !== 12 || !/^\d{12}$/.test(aadhaar)) {
        console.warn('[findByAadhaar] Invalid Aadhaar format:', aadhaar);
        return ctx.badRequest('Invalid Aadhaar number format');
      }
      // Query the database for a guest with the provided Aadhaar
      const filters = { aadhar: aadhaar };
      console.log('[findByAadhaar] Query filters:', filters);
      const guests = await strapi.entityService.findMany('api::guest-detail.guest-detail', {
        filters,
        fields: ['id', 'name'], // Only return minimal fields
      });
      console.log('[findByAadhaar] Query result:', guests);
      // If no guest is found, return a 404 with a structured error
      if (!guests || guests.length === 0) {
        console.warn('[findByAadhaar] No guest found for Aadhaar:', aadhaar);
        return ctx.notFound({
          error: true,
          message: 'No guest found with this Aadhaar number'
        });
      }
      // Return only a success response with minimal info
      console.log('[findByAadhaar] Guest found:', guests[0]);
      return ctx.send({
        exists: true,
        guestId: guests[0].id,
        message: 'Guest found with this Aadhaar number'
      });
    } catch (error) {
      console.error('Error finding guest by Aadhaar:', error);
      return ctx.internalServerError('An error occurred while finding the guest');
    }
  }
}));
