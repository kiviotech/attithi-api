'use strict';

/**
 * user-activity-log controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::user-activity-log.user-activity-log', ({ strapi }) => ({
  /**
   * Create a log entry
   * @param {Object} ctx - Koa context
   */
  async create(ctx) {
    try {
      // Get authenticated user information
      const user = ctx.state.user;
      
      // Add user information if available and not already provided
      if (user && ctx.request.body.data) {
        if (!ctx.request.body.data.username) {
          ctx.request.body.data.username = user.username || user.email;
        }
        
        if (!ctx.request.body.data.userRole && user.role) {
          ctx.request.body.data.userRole = user.role.name || user.role.type;
        }
        
        // Set default timestamp if not provided
        if (!ctx.request.body.data.timestamp) {
          ctx.request.body.data.timestamp = new Date();
        }
      }
      
      // Get IP address if not provided
      if (!ctx.request.body.data.ipAddress) {
        ctx.request.body.data.ipAddress = ctx.request.ip || '0.0.0.0';
      }
      
      // Get user agent if not provided
      if (!ctx.request.body.data.userAgent) {
        ctx.request.body.data.userAgent = ctx.request.headers['user-agent'] || 'unknown';
      }
      
      // Call the default create implementation
      const response = await super.create(ctx);
      
      return { success: true, data: response.data };
    } catch (error) {
      ctx.body = {
        success: false,
        error: 'Error creating activity log',
        details: error.message
      };
      ctx.status = 500;
    }
  },
  
  /**
   * Overriding the default find method to add success flag
   * @param {Object} ctx - Koa context
   */
  async find(ctx) {
    try {
      // Call the default find method
      const { data, meta } = await super.find(ctx);
      
      // Return with success flag
      return {
        success: true,
        data,
        total: meta.pagination?.total || 0,
        meta
      };
    } catch (error) {
      ctx.body = {
        success: false,
        error: 'Error fetching activity logs',
        details: error.message
      };
      ctx.status = 500;
    }
  },
  
  /**
   * Overriding the default findOne method to add success flag
   * @param {Object} ctx - Koa context
   */
  async findOne(ctx) {
    try {
      // Call the default findOne method
      const { data } = await super.findOne(ctx);
      
      // Return with success flag
      return {
        success: true,
        data
      };
    } catch (error) {
      ctx.body = {
        success: false,
        error: 'Error fetching activity log',
        details: error.message
      };
      ctx.status = 500;
    }
  },
  
  /**
   * Get analytics from logs
   * @param {Object} ctx - Koa context
   */
  async analytics(ctx) {
    try {
      // Query parameters for filtering (optional)
      const { startDate, endDate, actions, usernames } = ctx.query;
      
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
        }
      } else {
        // Default to last 30 days
        filters.timestamp = {
          $gte: defaultStartDate
        };
      }
      
      // Add action filter if provided
      if (actions) {
        const actionList = actions.split(',');
        filters.action = {
          $in: actionList
        };
      }
      
      // Add username filter if provided
      if (usernames) {
        const usernameList = usernames.split(',');
        filters.username = {
          $in: usernameList
        };
      }
      
      // Execute various analytics queries
      
      // 1. Total activity count
      const totalCount = await strapi.entityService.count('api::user-activity-log.user-activity-log', {
        filters
      });
      
      // 2. Get all activities with needed fields for analysis
      const allActivities = await strapi.entityService.findMany('api::user-activity-log.user-activity-log', {
        filters,
        fields: ['action', 'username', 'timestamp']
      });
      
      // Create action counts manually
      const actionCounts = {};
      allActivities.forEach(item => {
        if (!actionCounts[item.action]) {
          actionCounts[item.action] = 0;
        }
        actionCounts[item.action]++;
      });
      
      const actionCountsArray = Object.entries(actionCounts).map(([action, count]) => ({
        action,
        count
      }));
      
      // 3. User counts - also from the same data
      const userCounts = {};
      allActivities.forEach(item => {
        if (item.username && !userCounts[item.username]) {
          userCounts[item.username] = 0;
        }
        if (item.username) {
          userCounts[item.username]++;
        }
      });
      
      const userCountsArray = Object.entries(userCounts).map(([username, count]) => ({
        username,
        count
      }));
      
      // 4. Activity by date (for time series chart)
      // Create a daily activity breakdown
      const dailyActivity = {};
      allActivities.forEach(log => {
        if (log.timestamp) {
          const date = new Date(log.timestamp).toISOString().split('T')[0];
          if (!dailyActivity[date]) {
            dailyActivity[date] = 0;
          }
          dailyActivity[date]++;
        }
      });
      
      // 5. Calculate active users
      const uniqueUsers = Object.keys(userCounts).length;
      
      // Return combined analytics data
      return {
        success: true,
        totalActivityCount: totalCount,
        activityByAction: actionCountsArray,
        activityByUser: userCountsArray,
        timeSeriesData: Object.entries(dailyActivity).map(([date, count]) => ({ date, count })),
        uniqueUsers,
        period: {
          start: filters.timestamp?.$gte || defaultStartDate,
          end: filters.timestamp?.$lte || new Date()
        }
      };
    } catch (error) {
      ctx.body = {
        success: false,
        error: 'Error generating analytics',
        details: error.message
      };
      ctx.status = 500;
    }
  },
  
  /**
   * Search logs with enhanced filtering
   * @param {Object} ctx - Koa context
   */
  async search(ctx) {
    try {
      // Extract search parameters
      const params = ctx.query;
      
      // Use the service to execute the search
      const result = await strapi.service('api::user-activity-log.user-activity-log').search(params);
      
      // Return successful response
      return {
        success: true,
        data: result.data,
        total: result.meta.pagination.total,
        meta: result.meta
      };
    } catch (error) {
      // Return error response
      ctx.body = {
        success: false,
        error: 'Error performing search',
        details: error.message
      };
      ctx.status = 500;
    }
  },
  
  /**
   * Get security alerts from logs
   * @param {Object} ctx - Koa context
   */
  async securityAlerts(ctx) {
    try {
      // Get time ranges for alerts
      const now = new Date();
      const oneDayAgo = new Date(now);
      oneDayAgo.setDate(now.getDate() - 1);
      
      const oneWeekAgo = new Date(now);
      oneWeekAgo.setDate(now.getDate() - 7);
      
      // 1. Failed login attempts in the last 24 hours
      const failedLogins = await strapi.entityService.findMany('api::user-activity-log.user-activity-log', {
        filters: {
          action: { $eq: 'user.login' },
          timestamp: { $gte: oneDayAgo },
          notes: { $containsi: 'Failed' }
        }
      });
      
      // 2. Group failed login attempts by username and IP
      const loginAttemptsByUser = {};
      const loginAttemptsByIP = {};
      
      failedLogins.forEach(log => {
        // Group by username
        if (log.username && !loginAttemptsByUser[log.username]) {
          loginAttemptsByUser[log.username] = 0;
        }
        if (log.username) {
          loginAttemptsByUser[log.username]++;
        }
        
        // Group by IP
        if (log.ipAddress && !loginAttemptsByIP[log.ipAddress]) {
          loginAttemptsByIP[log.ipAddress] = 0;
        }
        if (log.ipAddress) {
          loginAttemptsByIP[log.ipAddress]++;
        }
      });
      
      // Find suspicious patterns (high number of failed attempts)
      const suspiciousUsers = Object.entries(loginAttemptsByUser)
        .filter(([_, count]) => count >= 5)
        .map(([username, count]) => ({ username, count }));
      
      const suspiciousIPs = Object.entries(loginAttemptsByIP)
        .filter(([_, count]) => count >= 5)
        .map(([ipAddress, count]) => ({ ipAddress, count }));
      
      // 3. Unusual access times (simplified - actual rules would be more sophisticated)
      const unusualTimeAccess = await strapi.entityService.findMany('api::user-activity-log.user-activity-log', {
        filters: {
          action: { $eq: 'user.login' },
          timestamp: { $gte: oneWeekAgo }
        }
      });
      
      // Filter for logins between midnight and 4 AM (simplified example)
      const afterHoursLogins = unusualTimeAccess.filter(log => {
        if (!log.timestamp) return false;
        const hour = new Date(log.timestamp).getHours();
        return hour >= 0 && hour < 4;
      });
      
      // 4. Account modifications
      const accountChanges = await strapi.entityService.findMany('api::user-activity-log.user-activity-log', {
        filters: {
          action: { 
            $in: ['user.password_change', 'user.role_change', 'user.permissions_change']
          },
          timestamp: { $gte: oneWeekAgo }
        }
      });
      
      return {
        success: true,
        failedLoginAttempts: {
          total: failedLogins.length,
          suspiciousUsers,
          suspiciousIPs
        },
        unusualActivityTimes: {
          afterHoursLogins: afterHoursLogins.map(log => ({
            username: log.username || 'unknown',
            timestamp: log.timestamp,
            ipAddress: log.ipAddress || 'unknown'
          }))
        },
        accountModifications: accountChanges.map(log => ({
          action: log.action,
          username: log.username || 'unknown',
          timestamp: log.timestamp,
          details: log.details || {}
        })),
        generatedAt: new Date()
      };
    } catch (error) {
      ctx.body = {
        success: false,
        error: 'Error generating security alerts',
        details: error.message
      };
      ctx.status = 500;
    }
  }
}));

/**
 * Generate timeline data from logs
 * @param {Array} logs - Activity logs
 * @returns {Array} - Timeline data for charts
 */
function generateTimelineData(logs) {
  // Create a map to store counts by day
  const timelineMap = {};
  
  // Get date range (last 30 days)
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 30);
  
  // Initialize timeline with 0 counts for each day
  for (let day = new Date(start); day <= end; day.setDate(day.getDate() + 1)) {
    const dateKey = day.toISOString().split('T')[0];
    timelineMap[dateKey] = {
      date: dateKey,
      total: 0,
      logins: 0,
      failedLogins: 0,
      updates: 0,
      views: 0,
      other: 0
    };
  }
  
  // Fill timeline with actual data
  logs.forEach(log => {
    // Get date from timestamp
    const timestamp = log.timestamp || new Date().toISOString();
    const dateKey = timestamp.split('T')[0];
    
    // Only include logs from the last 30 days
    if (timelineMap[dateKey]) {
      timelineMap[dateKey].total++;
      
      // Categorize by action type
      if (log.action === 'user.login') {
        if (log.details?.success === false) {
          timelineMap[dateKey].failedLogins++;
        } else {
          timelineMap[dateKey].logins++;
        }
      } else if (log.action.includes('.update')) {
        timelineMap[dateKey].updates++;
      } else if (log.action.includes('.view')) {
        timelineMap[dateKey].views++;
      } else {
        timelineMap[dateKey].other++;
      }
    }
  });
  
  // Convert map to array and sort by date
  return Object.values(timelineMap).sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Get top items from logs
 * @param {Array} logs - Activity logs
 * @param {string} field - Field to count
 * @param {number} limit - Max number of results
 * @returns {Array} - Top items
 */
function getTopItems(logs, field, limit = 5) {
  const counts = {};
  
  logs.forEach(log => {
    const value = log[field] || 'unknown';
    counts[value] = (counts[value] || 0) + 1;
  });
  
  return Object.entries(counts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

/**
 * Detect suspicious activities from logs
 * @param {Array} logs - Activity logs
 * @returns {Array} - Suspicious activities
 */
function detectSuspiciousActivities(logs) {
  const suspiciousActivities = [];
  const userFailedAttempts = {};
  const ipLoginAttempts = {};
  const userLastLogin = {};
  
  logs.forEach(log => {
    const username = log.username || 'unknown';
    const ipAddress = log.ipAddress || '0.0.0.0';
    const timestamp = new Date(log.timestamp || new Date());
    
    // Track failed login attempts by user
    if (log.action === 'user.login' && log.details?.success === false) {
      userFailedAttempts[username] = userFailedAttempts[username] || [];
      userFailedAttempts[username].push({ timestamp, ipAddress });
      
      // Check for multiple failed attempts
      if (userFailedAttempts[username].length >= 3) {
        // Check if attempts are within 30 minutes
        const recentAttempts = userFailedAttempts[username]
          .filter(attempt => {
            const attemptTime = attempt.timestamp instanceof Date 
              ? attempt.timestamp.getTime() 
              : new Date(attempt.timestamp).getTime();
            const currentTime = timestamp.getTime();
            return (currentTime - attemptTime) / (1000 * 60) < 30;
          });
        
        if (recentAttempts.length >= 3) {
          suspiciousActivities.push({
            type: 'multiple_failed_logins',
            username,
            attempts: recentAttempts.length,
            lastAttempt: timestamp,
            ipAddress,
            severity: 'high',
            message: `Multiple failed login attempts (${recentAttempts.length}) for user ${username}`
          });
        }
      }
    }
    
    // Track login attempts by IP address
    if (log.action === 'user.login') {
      ipLoginAttempts[ipAddress] = ipLoginAttempts[ipAddress] || [];
      ipLoginAttempts[ipAddress].push({ timestamp, username, success: log.details?.success !== false });
      
      // Check for multiple failed attempts from same IP
      const failedFromIp = ipLoginAttempts[ipAddress]
        .filter(attempt => !attempt.success);
      
      if (failedFromIp.length >= 5) {
        // Check if attempts are within 1 hour
        const recentFailedFromIp = failedFromIp
          .filter(attempt => {
            const attemptTime = attempt.timestamp instanceof Date 
              ? attempt.timestamp.getTime() 
              : new Date(attempt.timestamp).getTime();
            const currentTime = timestamp.getTime();
            return (currentTime - attemptTime) / (1000 * 60 * 60) < 1;
          });
        
        if (recentFailedFromIp.length >= 5) {
          suspiciousActivities.push({
            type: 'ip_brute_force',
            ipAddress,
            attempts: recentFailedFromIp.length,
            lastAttempt: timestamp,
            severity: 'critical',
            message: `Possible brute force attempt from IP ${ipAddress} with ${recentFailedFromIp.length} failed attempts`
          });
        }
      }
      
      // Check for multiple users from same IP
      const uniqueUsers = new Set(ipLoginAttempts[ipAddress].map(a => a.username));
      if (uniqueUsers.size >= 5) {
        suspiciousActivities.push({
          type: 'multiple_users_same_ip',
          ipAddress,
          userCount: uniqueUsers.size,
          users: Array.from(uniqueUsers),
          severity: 'medium',
          message: `Multiple users (${uniqueUsers.size}) logging in from same IP address ${ipAddress}`
        });
      }
    }
    
    // Check for login location changes (different IP addresses)
    if (log.action === 'user.login' && log.details?.success !== false) {
      if (userLastLogin[username] && userLastLogin[username].ipAddress !== ipAddress) {
        const lastLoginTime = userLastLogin[username].timestamp instanceof Date 
          ? userLastLogin[username].timestamp 
          : new Date(userLastLogin[username].timestamp);
        const currentTime = timestamp.getTime();
        const lastLoginTimeMs = lastLoginTime.getTime();
        const hoursSinceLastLogin = (currentTime - lastLoginTimeMs) / (1000 * 60 * 60);
        
        // If login from different IP within 24 hours
        if (hoursSinceLastLogin < 24) {
          suspiciousActivities.push({
            type: 'location_change',
            username,
            oldIp: userLastLogin[username].ipAddress,
            newIp: ipAddress,
            hoursSinceLastLogin,
            severity: 'medium',
            message: `Login from new location for ${username} (${ipAddress}) within ${hoursSinceLastLogin.toFixed(1)} hours`
          });
        }
      }
      
      userLastLogin[username] = { timestamp, ipAddress };
    }
    
    // Check for after-hours logins (between 11pm and 5am)
    if (log.action === 'user.login' && log.details?.success !== false) {
      const hour = timestamp.getHours();
      if (hour >= 23 || hour <= 5) {
        suspiciousActivities.push({
          type: 'after_hours_login',
          username,
          timestamp,
          hour,
          severity: 'low',
          message: `After-hours login for ${username} at ${hour}:${timestamp.getMinutes().toString().padStart(2, '0')}`
        });
      }
    }
  });
  
  // Remove duplicate alerts (keep only the most recent for each type and user/IP)
  const uniqueAlerts = {};
  suspiciousActivities.forEach(activity => {
    const key = `${activity.type}_${activity.username || activity.ipAddress}`;
    if (!uniqueAlerts[key] || 
        (activity.timestamp && uniqueAlerts[key].timestamp && 
         new Date(activity.timestamp) > new Date(uniqueAlerts[key].timestamp))) {
      uniqueAlerts[key] = activity;
    }
  });
  
  return Object.values(uniqueAlerts);
}
