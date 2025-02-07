'use strict';

/**
 * room-blocking router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::room-blocking.room-blocking');
