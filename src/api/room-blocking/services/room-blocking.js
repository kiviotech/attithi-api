'use strict';

/**
 * room-blocking service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::room-blocking.room-blocking');
