'use strict';

const axios = require('axios');
const NodeCache = require('node-cache');

// Create a cache with items expiring after 7 days (common postal data rarely changes)
const postalCache = new NodeCache({ stdTTL: 604800 });

/**
 * A controller to proxy postal API requests
 */

module.exports = {
  async getPincodeDetails(ctx) {
    try {
      const { pincode } = ctx.params;
      
      // Validate pincode format
      if (!pincode || !/^\d{6}$/.test(pincode)) {
        return ctx.badRequest('Invalid pincode format. Must be 6 digits.');
      }
      
      // Check cache first
      const cacheKey = `pincode_${pincode}`;
      const cachedData = postalCache.get(cacheKey);
      
      if (cachedData) {
        // Return cached data
        return ctx.send(cachedData);
      }
      
      // Fetch from postal API
      const response = await axios.get(`https://api.postalpincode.in/pincode/${pincode}`, {
        // Skip SSL certificate verification - use with caution
        httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false })
      });
      
      const data = response.data;
      
      // Cache the response if valid
      if (data && data[0] && data[0].Status === 'Success') {
        postalCache.set(cacheKey, data);
      }
      
      return ctx.send(data);
    } catch (error) {
      console.error('Error proxying postal API request:', error);
      
      // Provide a fallback for common errors
      if (error.code === 'ENOTFOUND' || error.code === 'ETIMEDOUT') {
        return ctx.badRequest('Postal API service is currently unavailable');
      }
      
      return ctx.internalServerError('Error processing postal API request');
    }
  }
}; 