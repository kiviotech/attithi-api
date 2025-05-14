'use strict';

/**
 * User permission service
 */
module.exports = {
  /**
   * Get user permissions from their role
   * @param {number} userId - The user ID
   * @returns {Object} Object containing user permissions and other relevant data
   */
  async getUserPermissions(userId) {
    try {
      // Fetch the user with their role
      const user = await strapi.db.query('plugin::users-permissions.user').findOne({
        where: { id: userId },
        populate: { role: true },
      });

      if (!user || !user.role) {
        return { userPermissions: [] };
      }

      // Get permissions for the user's role
      const permissions = await strapi.db.query('plugin::users-permissions.permission').findMany({
        where: { role: user.role.id },
      });

      // Format permissions as a simple list
      const userPermissions = permissions.map(p => `${p.action}`);

      // Get role specific permissions
      let rolePermissions = [];
      
      // Define role-specific permissions based on role type
      switch (user.role.type) {
        case 'super-admin':
          rolePermissions = [
            'admin.access',
            'donation.create', 'donation.read', 'donation.update', 'donation.delete',
            'guest.create', 'guest.read', 'guest.update', 'guest.delete',
            'room.create', 'room.read', 'room.update', 'room.delete',
            'room.allocate', 'room.block',
            'reports.access', 'settings.access',
            'user.create', 'user.read', 'user.update', 'user.delete'
          ];
          break;
        case 'admin':
          rolePermissions = [
            'admin.access',
            'donation.create', 'donation.read', 'donation.update',
            'guest.create', 'guest.read', 'guest.update',
            'room.read', 'room.allocate',
            'reports.access'
          ];
          break;
        case 'donation':
          rolePermissions = [
            'donation.create', 'donation.read', 'donation.update',
            'guest.read'
          ];
          break;
        case 'guest-house':
          rolePermissions = [
            'guest.create', 'guest.read', 'guest.update',
            'room.read', 'room.allocate'
          ];
          break;
      }

      // Combine all permissions
      return {
        userPermissions: [...new Set([...userPermissions, ...rolePermissions])],
        role: user.role.type
      };
    } catch (error) {
      strapi.log.error('Error in getUserPermissions service:', error);
      return { userPermissions: [] };
    }
  },

  /**
   * Check if a user has a specific permission
   * @param {number} userId - The user ID
   * @param {string} permission - The permission to check
   * @returns {boolean} Whether the user has the permission
   */
  async hasPermission(userId, permission) {
    const { userPermissions } = await this.getUserPermissions(userId);
    return userPermissions.includes(permission);
  },

  /**
   * Check if a user has a specific role
   * @param {number} userId - The user ID
   * @param {string} roleType - The role type to check
   * @returns {boolean} Whether the user has the role
   */
  async hasRole(userId, roleType) {
    try {
      const user = await strapi.db.query('plugin::users-permissions.user').findOne({
        where: { id: userId },
        populate: { role: true },
      });

      return user && user.role && user.role.type === roleType;
    } catch (error) {
      strapi.log.error('Error in hasRole service:', error);
      return false;
    }
  }
};
