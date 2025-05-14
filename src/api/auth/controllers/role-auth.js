'use strict';

/**
 * Role-based authentication controller
 */
module.exports = {
  /**
   * Login with username/email and password, returning role and permissions
   * @param {Object} ctx - Koa context
   */
  async login(ctx) {
    const { identifier, password } = ctx.request.body;

    if (!identifier || !password) {
      return ctx.badRequest('Please provide both identifier and password');
    }

    // Find the user
    const user = await strapi.db.query('plugin::users-permissions.user').findOne({
      where: {
        $or: [
          { email: identifier.toLowerCase() },
          { username: identifier },
        ],
      },
      populate: { role: true },
    });

    if (!user) {
      return ctx.badRequest('Invalid identifier or password');
    }

    // Check if user is active
    if (!user.confirmed) {
      return ctx.badRequest('Your account is not confirmed yet');
    }

    if (user.blocked) {
      return ctx.badRequest('Your account has been blocked');
    }

    // Verify password
    const validPassword = await strapi.plugins['users-permissions'].services.user.validatePassword(
      password,
      user.password
    );

    if (!validPassword) {
      return ctx.badRequest('Invalid identifier or password');
    }

    // Get user permissions
    const { userPermissions } = await strapi
      .service('api::user-permission.user-permission')
      .getUserPermissions(user.id);

    // Generate JWT token
    const jwt = strapi.plugins['users-permissions'].services.jwt.issue({
      id: user.id,
    });

    // Prepare user object for response
    const userForResponse = {
      id: user.id,
      username: user.username,
      email: user.email,
      user_role: user.role.type,
      role: {
        id: user.role.id,
        name: user.role.name,
        type: user.role.type,
      }
    };

    return ctx.send({
      jwt,
      user: userForResponse,
      permissions: userPermissions,
    });
  },

  /**
   * Get current user data with role and permissions
   * @param {Object} ctx - Koa context
   */
  async getMe(ctx) {
    // Check if user is authenticated
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized('You are not logged in');
    }

    // Get user with role
    const userData = await strapi.db.query('plugin::users-permissions.user').findOne({
      where: { id: user.id },
      populate: { role: true },
    });

    if (!userData) {
      return ctx.notFound('User not found');
    }

    // Get user permissions
    const { userPermissions } = await strapi
      .service('api::user-permission.user-permission')
      .getUserPermissions(user.id);

    // Prepare user object for response
    const userForResponse = {
      id: userData.id,
      username: userData.username,
      email: userData.email,
      user_role: userData.role.type,
      role: {
        id: userData.role.id,
        name: userData.role.name,
        type: userData.role.type,
      }
    };

    return ctx.send({
      user: userForResponse,
      permissions: userPermissions,
    });
  }
};
