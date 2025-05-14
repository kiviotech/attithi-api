'use strict';

/**
 * room controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::room.room', ({ strapi }) => ({
  async getAvailability(ctx) {
    const { roomId } = ctx.params;
    const { start, end } = ctx.query;

    if (!start || !end) {
      return ctx.badRequest('Start and end dates are required');
    }

    // Fetch room with bed count
    const room = await strapi.entityService.findOne('api::room.room', roomId, {
      fields: ['no_of_beds'],
    });
    if (!room) return ctx.notFound('Room not found');

    // Fetch allocations for this room that overlap with the requested dates
    // Join booking-request for arrival/departure dates
    const allocations = await strapi.db.query('api::room-allocation.room-allocation').findMany({
      where: {
        room: roomId,
        booking_request: {
          $and: [
            { arrival_date: { $lte: end } },
            { departure_date: { $gte: start } },
          ],
        },
      },
      populate: { booking_request: true },
      select: ['occupancy'],
    });

    const bedsAllocated = allocations.reduce((sum, alloc) => sum + (alloc.occupancy || 0), 0);

    ctx.send({
      roomId,
      totalBeds: room.no_of_beds,
      bedsAllocated,
      bedsAvailable: room.no_of_beds - bedsAllocated,
    });
  },
}));
