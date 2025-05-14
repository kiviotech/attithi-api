'use strict';

/**
 * Data Control controller
 */

module.exports = {
  /**
   * Create a new company
   * @param {Object} ctx - The context object containing the request
   * @returns {Object} The created company data or error
   */
  async createCompany(ctx) {
    try {
      const { body } = ctx.request;
      
      // Validate required fields
      if (!body.name) {
        return ctx.badRequest('Company name is required');
      }
      
      // Create the company
      const company = await strapi.service('api::data-control.data-control').createCompany(body);
      
      return {
        success: true,
        data: company
      };
    } catch (error) {
      console.error('Error creating company:', error);
      return ctx.badRequest(`Failed to create company: ${error.message}`);
    }
  }
}; 