module.exports = {
  async afterCreate(event) {
    const { result } = event;
    
    try {
      // Fetch the related booking request to get user details
      const bookingRequest = await strapi.entityService.findOne('api::booking-request.booking-request', result.booking_request.id, {
        populate: ['*']
      });

      // Fetch room details
      const room = await strapi.entityService.findOne('api::room.room', result.room.id, {
        populate: ['building']
      });

      // Update booking request status to confirmed
      await strapi.entityService.update('api::booking-request.booking-request', bookingRequest.id, {
        data: {
          status: 'confirmed'
        }
      });

      // Prepare data for notifications
      const allocationData = {
        id: result.id,
        bookingRequestId: bookingRequest.id,
        name: bookingRequest.name,
        email: bookingRequest.email,
        phoneNumber: bookingRequest.phone_number,
        roomNumber: room.room_number,
        building: room.building?.name || 'Main Building',
        checkInDate: result.check_in_date,
        checkOutDate: result.check_out_date,
        checkInTime: '2:00 PM',  // You can make these configurable
        checkOutTime: '12:00 PM'
      };

      // Send notifications
      await strapi.service('api::notification.notification').sendAllocationNotifications(allocationData);
    } catch (error) {
      console.error('Failed to send allocation notifications:', error);
    }
  },
}; 