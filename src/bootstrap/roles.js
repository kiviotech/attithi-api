'use strict';

/**
 * Bootstrap script to create default roles and set permissions
 * This follows the Strapi users-permissions structure for roles and permissions
 */

module.exports = async () => {
  try {
    // Check if we need to create roles
    const pluginStore = strapi.store({
      environment: '',
      type: 'plugin',
      name: 'users-permissions',
    });

    // Get existing roles
    const roles = await pluginStore.get({ key: 'roles' }) || {};
    const roleKeys = Object.keys(roles);

    // Define our custom roles if they don't exist
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

    // Check role existence based on type
    const roleExists = (type) => {
      return Object.values(roles).some(role => role.type === type);
    };

    // Get role ID by type
    const getRoleId = (type) => {
      const role = Object.values(roles).find(role => role.type === type);
      return role ? role.id : null;
    };

    // Get the users-permissions service
    const usersPermissionsService = strapi.plugin('users-permissions').service('users-permissions');
    
    // For each custom role that doesn't exist, create it
    for (const role of customRoles) {
      if (!roleExists(role.type)) {
        console.log(`Creating role: ${role.name}`);
        
        try {
          // Create the role using the users-permissions role service
          await strapi.query('plugin::users-permissions.role').create({
            data: {
              name: role.name,
              description: role.description,
              type: role.type,
              permissions: {},
            },
          });
          
          console.log(`Role ${role.name} created successfully`);          
        } catch (error) {
          console.error(`Error creating role ${role.name}:`, error);
        }
      } else {
        console.log(`Role ${role.name} already exists`);
      }
    }
    
    // Refetch roles to get the latest IDs
    const updatedRoles = await pluginStore.get({ key: 'roles' }) || {};
    
    // Apply permission templates
    const permissionTemplates = {
      'super-admin': [
        // Core permissions
        { action: 'plugin::content-manager.*' },
        { action: 'plugin::content-type-builder.*' },
        { action: 'plugin::upload.*' },
        { action: 'plugin::users-permissions.*' },
        // API permissions
        { action: 'api::*.*' }
      ],
      'admin': [
        // Core permissions with limitations
        { action: 'plugin::content-manager.explorer.read' },
        { action: 'plugin::content-manager.explorer.create' },
        { action: 'plugin::content-manager.explorer.update' },
        { action: 'plugin::upload.read' },
        { action: 'plugin::upload.assets.create' },
        // API permissions with limitations
        { action: 'api::donation.*' },
        { action: 'api::guest-detail.*' },
        { action: 'api::room.*' },
        { action: 'api::booking-request.*' }
      ],
      'donation': [
        // Limited to donation management
        { action: 'plugin::content-manager.explorer.read', subject: 'api::donation.*' },
        { action: 'plugin::content-manager.explorer.create', subject: 'api::donation.*' },
        { action: 'plugin::content-manager.explorer.update', subject: 'api::donation.*' },
        { action: 'api::donation.*' },
        { action: 'api::donor.*' }
      ],
      'guest-house': [
        // Limited to guest house management
        { action: 'plugin::content-manager.explorer.read', subject: 'api::guest-detail.*' },
        { action: 'plugin::content-manager.explorer.create', subject: 'api::guest-detail.*' },
        { action: 'plugin::content-manager.explorer.update', subject: 'api::guest-detail.*' },
        { action: 'plugin::content-manager.explorer.read', subject: 'api::room.*' },
        { action: 'plugin::content-manager.explorer.read', subject: 'api::booking-request.*' },
        { action: 'api::guest-detail.*' },
        { action: 'api::room.find' },
        { action: 'api::room.findOne' },
        { action: 'api::room-allocation.*' },
        { action: 'api::booking-request.*' }
      ]
    };
    
    // IMPORTANT: This is a simplified approach. In a production environment, you would need to:
    // 1. Get all permissions for each controller action
    // 2. Filter them based on your role requirements
    // 3. Assign them properly through the permissions service
    
    console.log('Bootstrap finished');
  } catch (error) {
    console.error('Bootstrap error:', error);
  }
};
