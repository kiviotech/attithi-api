'use strict';

/**
 * Data Control service
 */

module.exports = {
  /**
   * Create a new company
   * @param {Object} data - The company data
   * @returns {Object} The created company
   */
  async createCompany(data) {
    try {
      // Here you would normally create a company in your database
      // For now, we'll just return a mock response since we don't have a company model
      
      // If you have a company model, you can use:
      // const company = await strapi.entityService.create('api::company.company', { data });
      
      // Mock response for now
      return {
        id: Date.now(),
        name: data.name,
        address: data.address || '',
        email: data.email || '',
        phone: data.phone || '',
        created_at: new Date(),
        status: 'active'
      };
    } catch (error) {
      console.error('Company creation error:', error);
      throw error;
    }
  }
}; 