'use strict';

/**
 * user-activity-log service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::user-activity-log.user-activity-log', ({ strapi }) => ({
  /**
   * Create a new activity log entry
   * @param {Object} data - The log data
   * @returns {Promise} - Created log entry
   */
  async createLog(data) {
    // Ensure timestamp is present
    if (!data.timestamp) {
      data.timestamp = new Date();
    }
    
    try {
      // Use the entity service to create the log entry
      const result = await strapi.entityService.create('api::user-activity-log.user-activity-log', {
        data
      });
      
      return result;
    } catch (error) {
      strapi.log.error('Error creating activity log:', error);
      throw error;
    }
  },
  
  /**
   * Get logs with advanced filtering
   * @param {Object} params - Filter parameters
   * @returns {Promise} - Logs matching the filters
   */
  async findWithFilters(params) {
    const { filters, sort, pagination } = params;
    
    try {
      return await strapi.entityService.findMany('api::user-activity-log.user-activity-log', {
        filters,
        sort,
        ...pagination
      });
    } catch (error) {
      strapi.log.error('Error finding activity logs with filters:', error);
      throw error;
    }
  },
  
  /**
   * Get analytics data from logs
   * @param {Object} params - Filter parameters
   * @returns {Promise} - Analytics data
   */
  async getAnalytics(params) {
    const { startDate, endDate, actions, usernames } = params;
    
    // Default time period (last 30 days) if not specified
    const defaultStartDate = new Date();
    defaultStartDate.setDate(defaultStartDate.getDate() - 30);
    
    // Build filtering criteria
    const filters = {};
    
    // Add date range filter if provided
    if (startDate || endDate) {
      filters.timestamp = {};
      if (startDate) {
        filters.timestamp.$gte = new Date(startDate);
      } else {
        filters.timestamp.$gte = defaultStartDate;
      }
      if (endDate) {
        filters.timestamp.$lte = new Date(endDate);
      } else {
        // Add a default end date if only start date is provided
        filters.timestamp.$lte = new Date();
      }
    } else {
      // Default to last 30 days
      filters.timestamp = {
        $gte: defaultStartDate,
        $lte: new Date()
      };
    }
    
    // Add action filter if provided
    if (actions) {
      const actionList = Array.isArray(actions) ? actions : actions.split(',');
      filters.action = {
        $in: actionList
      };
    }
    
    // Add username filter if provided
    if (usernames) {
      const usernameList = Array.isArray(usernames) ? usernames : usernames.split(',');
      filters.username = {
        $in: usernameList
      };
    }
    
    try {
      // Get all activities with needed fields for analysis
      const allActivities = await strapi.entityService.findMany('api::user-activity-log.user-activity-log', {
        filters,
        fields: ['action', 'username', 'timestamp', 'ipAddress', 'details']
      });
      
      return allActivities;
    } catch (error) {
      strapi.log.error('Error generating analytics:', error);
      throw error;
    }
  },
  
  /**
   * Search logs with advanced criteria
   * @param {Object} params - Search parameters
   * @returns {Promise} - Logs matching the search criteria
   */
  async search(params) {
    const {
      page = 1,
      pageSize = 10,
      sortBy = 'timestamp',
      sortOrder = 'desc',
      action,
      username,
      ipAddress,
      startDate,
      endDate,
      keyword
    } = params;
    
    // Build filters
    const filters = {};
    
    if (action) {
      filters.action = { $containsi: action };
    }
    
    if (username) {
      filters.username = { $containsi: username };
    }
    
    if (ipAddress) {
      filters.ipAddress = { $containsi: ipAddress };
    }
    
    // Date filtering
    if (startDate || endDate) {
      filters.timestamp = {};
      if (startDate) {
        filters.timestamp.$gte = new Date(startDate);
      }
      if (endDate) {
        filters.timestamp.$lte = new Date(endDate);
      }
    }
    
    // Keyword search (searches in notes and other text fields)
    if (keyword) {
      filters.$or = [
        { notes: { $containsi: keyword } },
        { userAgent: { $containsi: keyword } },
        { action: { $containsi: keyword } }
      ];
    }
    
    // Parse pagination parameters
    const parsedPage = parseInt(page, 10) || 1;
    const parsedPageSize = parseInt(pageSize, 10) || 10;
    
    // Calculate offset
    const offset = parsedPage > 1 ? (parsedPage - 1) * parsedPageSize : 0;
    
    // Build sort option
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder;
    
    try {
      // Execute search query
      const results = await strapi.entityService.findMany('api::user-activity-log.user-activity-log', {
        filters,
        sort: sortOptions,
        start: offset,
        limit: parsedPageSize,
        populate: '*'
      });
      
      // Get total count for pagination
      const total = await strapi.entityService.count('api::user-activity-log.user-activity-log', {
        filters
      });
      
      // Calculate total pages
      const totalPages = Math.ceil(total / parsedPageSize);
      
      return {
        data: results,
        meta: {
          pagination: {
            page: parsedPage,
            pageSize: parsedPageSize,
            pageCount: totalPages,
            total
          }
        }
      };
    } catch (error) {
      strapi.log.error('Error searching activity logs:', error);
      throw error;
    }
  }
}));
