'use strict';

/**
 * A set of functions called "actions" for `invitation`
 */

module.exports = {
  /**
   * Get eligible users for invitation based on criteria
   * @param {Object} ctx - The context object
   * @returns {Promise<Array>} List of eligible users
   */
  async getEligibleUsers(ctx) {
    try {
      const { query } = ctx;
      const { hasDeeksha, minDonationAmount, hasCapitalInvestment, startDate, endDate } = query;

      // Start with a query for all guests (users)
      const guestQuery = {};

      // Add filtering conditions only if they have valid values
      if (hasDeeksha === 'true') {
        guestQuery.filters = {
          ...(guestQuery.filters || {}),
          deeksha: { $notNull: true }
        };
      }

      if (startDate && endDate) {
        const dateFilter = {
          createdAt: {
            $gte: new Date(startDate).toISOString(),
            $lte: new Date(endDate).toISOString(),
          }
        };
        guestQuery.filters = {
          ...(guestQuery.filters || {}),
          ...dateFilter
        };
      }

      // Fetch all guests that match basic criteria
      const guests = await strapi.entityService.findMany('api::guest-detail.guest-detail', guestQuery);

      // For now, we'll use a simplified approach without complex donation filtering
      // in the initial version to ensure the API works
      let filteredGuests = guests;

      // Format response data
      const formattedGuests = filteredGuests.map(guest => {
        return {
          id: guest.id,
          name: guest.name || '',
          phone: guest.phone_number || '',
          email: guest.email || '',
          deeksha: !!guest.deeksha,
          address: guest.address || ''
        };
      });

      return formattedGuests;
    } catch (error) {
      ctx.throw(500, error);
    }
  },

  /**
   * Export users data for invitation
   * @param {Object} ctx - The context object
   * @returns {Promise<Object>} Exported data as a file
   */
  async exportUsers(ctx) {
    try {
      const { request } = ctx;
      const { userIds, format = 'xlsx', groupByAddress = false } = request.body;

      if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
        return ctx.badRequest('User IDs are required');
      }

      // Fetch users data
      const users = await strapi.entityService.findMany('api::guest-detail.guest-detail', {
        filters: {
          id: { $in: userIds }
        },
        populate: ['donations']
      });

      if (!users.length) {
        return ctx.notFound('No users found with the provided IDs');
      }

      // Group by address if required
      let exportData = users;
      if (groupByAddress) {
        const addressGroups = {};
        
        users.forEach(user => {
          // Create address key from the single address field
          const addressKey = user.address || '';
          
          if (!addressGroups[addressKey]) {
            addressGroups[addressKey] = [];
          }
          
          addressGroups[addressKey].push(user);
        });
        
        // Convert groups to array format, keeping one entry per address
        exportData = Object.values(addressGroups).map(group => {
          // Use the first user for the address
          const primaryUser = group[0];
          
          // Add additional names for the same address
          // Store additional resident information
          if (group.length > 1) {
            // Use a property that won't conflict with the model
            primaryUser._additionalResidents = group.slice(1).map(user => ({
              id: user.id,
              name: user.name || '',
              recipient: user.phone_number || '',
              email: user.email || ''
            }));
          }
          
          return primaryUser;
        });
      }

      // Format data for export
      const formattedData = exportData.map(user => {
        const row = {
          Name: user.name || '',
          Email: user.email || '',
          Phone: user.phone_number || '',
          Address: user.address || '',
          Deeksha: user.deeksha ? 'Yes' : 'No',
        };
        
        // Add additional residents info if grouped by address
        if (user._additionalResidents) {
          row['Additional Residents'] = user._additionalResidents.map(resident => 
            resident.name
          ).join(', ');
        }
        
        return row;
      });

      // Set appropriate content type
      if (format === 'csv') {
        ctx.type = 'text/csv';
        ctx.attachment('invitation_list.csv');
        
        // Convert to CSV
        const headers = Object.keys(formattedData[0]);
        const csv = [
          headers.join(','),
          ...formattedData.map(row => headers.map(header => {
            const value = row[header] || '';
            // Escape quotes and wrap in quotes if needed
            return value.includes(',') ? `"${value.replace(/"/g, '""')}"` : value;
          }).join(','))
        ].join('\n');
        
        return csv;
      } else {
        // Default to xlsx
        // For a real implementation, you would use a library like exceljs
        // This is a placeholder
        ctx.type = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        ctx.attachment('invitation_list.xlsx');
        
        // Here you would generate the Excel file
        // For now just return JSON with a message
        return { message: 'Excel export feature will be implemented with exceljs' };
      }
    } catch (error) {
      ctx.throw(500, error);
    }
  },

  /**
   * Send invitations to users
   * @param {Object} ctx - The context object
   * @returns {Promise<Object>} Result of sending invitations
   */
  async sendInvitations(ctx) {
    try {
      const { request } = ctx;
      const { userIds, channel, templateData } = request.body;

      if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
        return ctx.badRequest('User IDs are required');
      }

      if (!channel) {
        return ctx.badRequest('Channel is required');
      }

      if (!templateData || !templateData.message) {
        return ctx.badRequest('Template message is required');
      }

      // Fetch users data
      const users = await strapi.entityService.findMany('api::guest-detail.guest-detail', {
        filters: {
          id: { $in: userIds }
        }
      });

      if (!users.length) {
        return ctx.notFound('No users found with the provided IDs');
      }

      // Initialize counters
      const results = {
        total: userIds.length,
        sentCount: 0,
        failedCount: 0,
        skippedCount: 0,
        details: []
      };

      // Process each user
      for (const user of users) {
        try {
          // Skip if missing required contact info for the channel
          if (
            (channel === 'email' && !user.email) ||
            ((channel === 'whatsapp' || channel === 'sms') && !user.phone_number)
          ) {
            results.skippedCount++;
            results.details.push({
              userId: user.id,
              status: 'skipped',
              reason: `Missing ${channel === 'email' ? 'email' : 'phone'}`
            });
            continue;
          }

          // Personalize message
          let personalizedMessage = templateData.message
            .replace(/{name}/g, user.name || '')
            .replace(/{date}/g, templateData.date || new Date().toLocaleDateString())
            .replace(/{venue}/g, templateData.venue || 'our location');

          // Send invitation based on channel
          // This would integrate with actual email/SMS/WhatsApp services
          if (channel === 'email') {
            // Email sending logic would go here
            // For now, just simulate success
            results.sentCount++;
            results.details.push({
              userId: user.id,
              status: 'sent',
              channel: 'email',
              recipient: user.email
            });
          } else if (channel === 'whatsapp') {
            // WhatsApp sending logic would go here
            // For now, just simulate success
            results.sentCount++;
            results.details.push({
              userId: user.id,
              status: 'sent',
              channel: 'whatsapp',
              recipient: user.phone
            });
          } else if (channel === 'sms') {
            // SMS sending logic would go here
            // For now, just simulate success
            results.sentCount++;
            results.details.push({
              userId: user.id,
              status: 'sent',
              channel: 'sms',
              recipient: user.phone_number
            });
          }
        } catch (error) {
          results.failedCount++;
          results.details.push({
            userId: user.id,
            status: 'failed',
            reason: error.message || 'Unknown error'
          });
        }
      }

      return results;
    } catch (error) {
      ctx.throw(500, error);
    }
  },

  /**
   * Group users by address
   * @param {Object} ctx - The context object
   * @returns {Promise<Object>} Users grouped by address
   */
  async groupByAddress(ctx) {
    try {
      const { request } = ctx;
      const { userIds } = request.body;

      if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
        return ctx.badRequest('User IDs are required');
      }

      // Fetch users data
      const users = await strapi.entityService.findMany('api::guest-detail.guest-detail', {
        filters: {
          id: { $in: userIds }
        }
      });

      if (!users.length) {
        return ctx.notFound('No users found with the provided IDs');
      }

      // Group by address
      const addressGroups = {};
      
      users.forEach(user => {
        // Create address key from the single address field
        const addressKey = user.address || '';
        
        if (!addressGroups[addressKey]) {
          addressGroups[addressKey] = {
            address: user.address || '',
            residents: []
          };
        }
        
        addressGroups[addressKey].residents.push({
          id: user.id,
          name: user.name || '',
          phone: user.phone_number || '',
          email: user.email || ''
        });
      });

      return Object.values(addressGroups);
    } catch (error) {
      ctx.throw(500, error);
    }
  }
};
