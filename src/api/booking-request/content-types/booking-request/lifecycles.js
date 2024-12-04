module.exports = {
  async afterCreate(event) {
    const { result } = event;
    
    try {
      await strapi.service('api::notification.notification').sendNotifications({
        id: result.id,
        name: result.name,
        email: result.email,
        phoneNumber: result.phone_number,
      });
    } catch (error) {
      console.error('Failed to send notifications:', error);
    }
  },

  async beforeUpdate(event) {
    const { params } = event;
    // Store the old status to compare later
    const oldData = await strapi.entityService.findOne('api::booking-request.booking-request', params.where.id);
    event.state = { oldStatus: oldData.status };
  },

  async afterUpdate(event) {
    const { result } = event;
    const oldStatus = event.state.oldStatus;

    // Handle status changes
    if (oldStatus !== result.status) {
      try {
        switch (result.status) {
          case 'confirmed':
            await strapi.service('api::notification.notification').sendConfirmationNotifications({
              id: result.id,
              name: result.name,
              email: result.email,
              phoneNumber: result.phone_number,
              checkInDate: result.check_in_date,
              checkOutDate: result.check_out_date,
              numberOfGuests: result.number_of_guests,
              purpose: result.purpose
            });
            break;

          case 'rejected':
            await strapi.service('api::notification.notification').sendRejectionNotifications({
              id: result.id,
              name: result.name,
              email: result.email,
              phoneNumber: result.phone_number,
              checkInDate: result.check_in_date,
              checkOutDate: result.check_out_date,
              numberOfGuests: result.number_of_guests,
              rejectionReason: result.rejection_reason,
              rejectionType: result.rejection_type,
              lastStayDate: result.last_stay_date,
              celebrationType: result.celebration_type
            });
            break;
        }
      } catch (error) {
        console.error('Failed to send status change notifications:', error);
      }
    }
  }
}; 