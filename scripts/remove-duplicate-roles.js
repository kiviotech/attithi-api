'use strict';

// Usage: Add a call to this script in your Strapi bootstrap, run once, then remove.

module.exports = async ({ strapi }) => {
  try {
    // Fetch all roles
    const allRoles = await strapi.db.query('plugin::users-permissions.role').findMany({});
    const seenNames = new Set();
    const rolesToDelete = [];

    // Group roles by name (case-insensitive), keep only the first, mark others for deletion
    for (const role of allRoles) {
      const nameKey = role.name.trim().toLowerCase();
      if (seenNames.has(nameKey)) {
        rolesToDelete.push(role.id);
      } else {
        seenNames.add(nameKey);
      }
    }

    // Delete duplicates
    for (const id of rolesToDelete) {
      await strapi.db.query('plugin::users-permissions.role').delete({ where: { id } });
      strapi.log.info(`Deleted duplicate role with id: ${id}`);
    }

    strapi.log.info(`Removed ${rolesToDelete.length} duplicate roles by name. Only one of each name remains.`);
  } catch (error) {
    strapi.log.error('Error removing duplicate roles:', error);
  }
}; 