'use strict';

module.exports = {
  async sendBookingConfirmation(data) {
    try {
      console.log('Attempting to send booking confirmation email to:', data.email);
      
      // Format dates
      const arrivalDate = new Date(data.checkInDate).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
      
      const departureDate = new Date(data.checkOutDate).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });

      // Ensure QR code is a valid data URL
      const qrCodeDataUrl = await this.generateQRCode(data.bookingId);

      console.log('QR Code Data URL:', qrCodeDataUrl);

      // Use the QR code in the email template
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4CAF50; text-align: center;">Confirmation reply</h2>
          <h3 style="color: #4CAF50; text-align: center;">Guest House</h3>
          
          <p><strong>Dear Devotee,</strong></p>
          <p>Namaskar.</p>
          
          <p>We have received your accommodation request and noted the contents. You are welcome to stay at our <strong>Guest House</strong> during the mentioned period i.e arrival <strong>${arrivalDate}</strong> and departure <strong>${departureDate}</strong> after breakfast at 07.30 a.m. The accommodation will be kept reserved for <strong>${data.numberOfGuests} devotees</strong>.</p>
          
          <p>On the day of your arrival, please try to reach the Math Office to do the registration formalities during office hours i.e, morning 9:00 a.m to 11:00 a.m or evening 3:30 p.m to 5:00 p.m. Please show the below QR code along with your Aadhaar card.</p>
          
          <img src="${qrCodeDataUrl}" alt="Booking QR Code" style="width: 200px; height: 200px; display: block; margin: 20px auto;"/>
          
          <p>May Sri Ramakrishna, Holy Mother Sri Sarada Devi and Swami Vivekananda bless you all !</p>
          
          <p>With best regards and namaskar again.</p>
          
          <p>Yours sincerely,</p>
          <p><strong>Swami Lokottarananda</strong><br>
          <strong>Adhyaksha</strong><br>
          <strong>RAMAKRISHNA MATH & RAMAKRISHNA MISSION, KAMARPUKUR</strong></p>
        </div>
      `;

      // Send email using strapi's email plugin
      await strapi.plugins['email'].services.email.send({
        to: data.email,
        from: process.env.SMTP_FROM,
        subject: 'Booking Confirmation - Ramakrishna Math & Mission, Kamarpukur',
        html: emailHtml
      });

      console.log('Email sent successfully to:', data.email);
      return { success: true };
    } catch (error) {
      console.error('Email sending failed:', error);
      throw new Error(`Failed to send confirmation email: ${error.message}`);
    }
  },

  async sendRevisitRegret(data) {
    try {
      console.log('Attempting to send revisit regret email to:', data.email);
      
      // Format previous stay date
      const previousStayDate = new Date(data.previousStayDate).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });

      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #FF4444; text-align: center;">Regret mail</h2>
          <h3 style="color: #FF4444; text-align: center;">For revisit in 6 months</h3>
          
          <p><strong>Dear Devotee,</strong></p>
          <p>Namaskar.</p>
          
          <p>We have received your accommodation request and appreciate your interest in staying at Holy Kamarpukur. Please don't get disheartened as it will not be possible for us to accommodate you, due to your recent stay in our Math Accommodation (<strong>${previousStayDate}</strong>) and you can't apply for accommodation less than six months from your last stay. Our inability to accede to your request may kindly be excused.</p>
          
          <p>May Sri Ramakrishna, Holy Mother Sri Sarada Devi and Swami Vivekananda bless you all !</p>
          
          <p>With best regards and namaskar again.</p>
          
          <p>Yours sincerely,</p>
          <p><strong>Adhyaksha</strong><br>
          <strong>RAMAKRISHNA MATH & RAMAKRISHNA MISSION, KAMARPUKUR</strong></p>
        </div>
      `;

      // Send email using strapi's email plugin
      await strapi.plugins['email'].services.email.send({
        to: data.email,
        from: process.env.SMTP_FROM,
        subject: 'Booking Request - Ramakrishna Math & Mission, Kamarpukur',
        html: emailHtml
      });

      console.log('Regret email sent successfully to:', data.email);
      return { success: true };
    } catch (error) {
      console.error('Email sending failed:', error);
      throw new Error(`Failed to send regret email: ${error.message}`);
    }
  },

  async sendSpecialCelebrationRegret(data) {
    try {
      // Send email using strapi's email plugin
      await strapi.plugins['email'].services.email.send({
        to: data.email,
        from: process.env.SMTP_FROM,
        subject: 'Booking Request - Special Celebration Period',
        template: 'special-celebration-regret',
        templateVars: {
          guestName: data.name,
          celebrationName: data.celebrationName || 'Sri Sri Thakur\'s Tithi Puja 2025 / Durga Puja 2025'
        }
      });

      return { success: true };
    } catch (error) {
      console.error('Email sending failed:', error);
      throw new Error('Failed to send special celebration regret email');
    }
  },

  async generateQRCode(bookingId) {
    const QRCode = require('qrcode');
    try {
      return await QRCode.toDataURL(bookingId);
    } catch (error) {
      console.error('QR Code generation failed:', error);
      throw new Error('Failed to generate QR Code');
    }
  }
}; 