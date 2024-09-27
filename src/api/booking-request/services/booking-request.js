'use strict';

/**
 * booking-request service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::booking-request.booking-request');
