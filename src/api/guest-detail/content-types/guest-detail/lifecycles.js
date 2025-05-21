'use strict';

/**
 * Lifecycle callbacks for the `guest-detail` model.
 */

module.exports = {
  beforeCreate: async (event) => {
    const { data } = event.params;
    
    // Only proceed if unique_no is not already set
    if (!data.unique_no) {
      try {
        // Query to find all guest details with unique_no values
        const guestDetails = await strapi.entityService.findMany('api::guest-detail.guest-detail', {
          fields: ['unique_no'],
        });
        
        // Extract and parse all unique_no values that start with 'C' followed by numbers
        const uniqueNumbers = guestDetails
          .filter(guest => guest.unique_no && guest.unique_no.match(/^C\d+$/))
          .map(guest => parseInt(guest.unique_no.substring(1)));
        
        // Find the highest number and increment by 1, or start at 1 if none exist
        const highestUniqueNo = uniqueNumbers.length > 0 ? Math.max(...uniqueNumbers) + 1 : 1;
        
        // Set the new unique_no
        data.unique_no = `C${highestUniqueNo}`;
        
        console.log(`Auto-generated unique_no: ${data.unique_no} for new guest`);
      } catch (error) {
        console.error('Error generating unique_no:', error);
        // In case of error, set a fallback unique_no using timestamp
        const timestamp = new Date().getTime();
        data.unique_no = `C${timestamp}`;
        console.log(`Fallback unique_no generated: ${data.unique_no}`);
      }
    }
  },
}; 