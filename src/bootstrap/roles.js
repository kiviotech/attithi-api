'use strict';

/**
 * Bootstrap script to create default roles and set permissions
 * This follows the Strapi users-permissions structure for roles and permissions
 */

module.exports = async () => {
  try {
    const customRoles = [
      {
        name: 'Super Admin',
        description: 'Super administrators have access to all features and content',
        type: 'super-admin',
      },
      {
        name: 'Admin',
        description: 'Regular administrators with limited permissions',
        type: 'admin',
      },
      {
        name: 'Donation',
        description: 'Users who manage donation-related activities',
        type: 'donation',
      },
      {
        name: 'Guest House',
        description: 'Users who manage guest house and room allocations',
        type: 'guest-house',
      },
    ];

    for (const role of customRoles) {
      // Check if the role exists in the actual roles table
      const existing = await strapi.db.query('plugin::users-permissions.role').findOne({
        where: { type: role.type }
      });
      if (!existing) {
        await strapi.db.query('plugin::users-permissions.role').create({
            data: {
              name: role.name,
              description: role.description,
              type: role.type,
              permissions: {},
            },
          });
        strapi.log.info(`Created role: ${role.name}`);
      } else {
        strapi.log.info(`Role already exists: ${role.name}`);
      }
    }
    strapi.log.info('Role bootstrap finished');
  } catch (error) {
    strapi.log.error('Bootstrap error:', error);
  }
};
