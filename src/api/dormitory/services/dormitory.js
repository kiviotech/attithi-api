'use strict';

/**
 * dormitory service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::dormitory.dormitory');
