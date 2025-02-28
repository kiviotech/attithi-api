'use strict';

const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

module.exports = {
  // Generate and upload QR code to server
  async generateAndUploadQRCode(bookingId) {
    try {
      // Create a temporary file path for the QR code
      const tempDir = path.join(process.cwd(), 'public/uploads/temp');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      
      const fileName = `qrcode-${bookingId}-${uuidv4()}.png`;
      const filePath = path.join(tempDir, fileName);
      
      // Generate QR code as a file
      await QRCode.toFile(filePath, bookingId);
      
      // Read the file as a buffer
      const buffer = fs.readFileSync(filePath);
      
      // Upload to Strapi's media library
      const uploadedFile = await strapi.plugins.upload.services.upload.upload({
        data: {}, // data like caption, alternativeText, etc.
        files: {
          path: filePath,
          name: fileName,
          type: 'image/png',
          size: buffer.length,
        },
      });
      
      // Clean up the temporary file
      fs.unlinkSync(filePath);
      
      // Return the URL of the uploaded file
      console.log('QR code uploaded successfully. URL:', uploadedFile[0].url);
      return uploadedFile[0].url;
    } catch (error) {
      console.error('Error generating and uploading QR code:', error);
      throw new Error('Failed to generate and upload QR code');
    }
  },

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

      // Generate QR code and get URL
      const qrCodeUrl = await this.generateAndUploadQRCode(data.bookingId);
      console.log('QR Code URL:', qrCodeUrl);

      // Use fully qualified URL with server address
      const fullQrCodeUrl = `${process.env.SERVER_URL || 'http://localhost:1338'}${qrCodeUrl}`;

      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4CAF50; text-align: center;">Confirmation reply</h2>
          <h3 style="color: #4CAF50; text-align: center;">Guest House</h3>
          
          <p><strong>Dear Devotee,</strong></p>
          <p>Namaskar.</p>
          
          <p>We have received your accommodation request and noted the contents. You are welcome to stay at our <strong>Guest House</strong> during the mentioned period i.e arrival <strong>${arrivalDate}</strong> and departure <strong>${departureDate}</strong> after breakfast at 07.30 a.m. The accommodation will be kept reserved for <strong>${data.numberOfGuests} devotees</strong>.</p>
          
          <p>On the day of your arrival, please try to reach the Math Office to do the registration formalities during office hours i.e, morning 9:00 a.m to 11:00 a.m or evening 3:30 p.m to 5:00 p.m. Please show the below QR code along with your Aadhaar card.</p>
          
          <div style="text-align: center; margin: 20px 0;">
            <img src="${fullQrCodeUrl}" alt="Booking QR Code" style="width: 200px; height: 200px;"/>
          </div>
          
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
          <h2 style="color: #FF0000; text-align: center;">Regret mail</h2>
          <h3 style="color: #FF0000; text-align: center;">For revisit in 6 months</h3>
          
          <p><strong>Dear Devotee,</strong></p>
          <p>Namaskar.</p>
          
          <p>We have received your accommodation request and appreciate your interest in staying at Holy Kamarpukur. <strong style="color: #FF0000;">Please don't get disheartened as it will not be possible for us to accommodate you, due to your recent stay in our Math Accommodation (${previousStayDate}) and you can't apply for accommodation less than six months from your last stay.</strong> Our inability to accede to your request may kindly be excused.</p>
          
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
        subject: 'Regret mail - For revisit in 6 months - Ramakrishna Math & Mission, Kamarpukur',
        html: emailHtml
      });

      console.log('Revisit regret email sent successfully to:', data.email);
      return { success: true };
    } catch (error) {
      console.error('Email sending failed:', error);
      throw new Error(`Failed to send revisit regret email: ${error.message}`);
    }
  },

  async sendSpecialCelebrationRegret(data) {
    try {
      console.log('Attempting to send special celebration regret email to:', data.email);
      
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #FF0000; text-align: center;">Regret mail - Special Celebrations (No and Below 10k)</h2>
          
          <p><strong>Dear Devotee,</strong></p>
          <p>Namaskar.</p>
          
          <p>We have received your accommodation request and appreciate your interest in staying at Holy Kamarpukur during <strong>Sri Sri Thakur's Tithi Puja 2025 / Durga Puja 2025</strong>.</p>
          
          <p style="background-color: #FFF9C4; padding: 10px;"><strong>Please note that we have limited accommodations and most of them are used for the artists, performers and volunteers during Sri Sri Durga Utsav and Sri Sri Thakur's Tithi Puja.</strong> Thus, don't get disheartened as it will not be possible for us to accommodate you during the period as requested by you due to paucity of space. Hope you will understand our constraints.</p>
          
          <p>May Sri Ramakrishna, Holy Mother Sri Sarada Devi and Swami Vivekananda bless you and members of your family!</p>
          
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
        subject: 'Regret mail - Special Celebrations - Ramakrishna Math & Mission, Kamarpukur',
        html: emailHtml
      });

      console.log('Special celebration regret email sent successfully to:', data.email);
      return { success: true };
    } catch (error) {
      console.error('Email sending failed:', error);
      throw new Error(`Failed to send special celebration regret email: ${error.message}`);
    }
  },

  async sendDormitoryConfirmation(data) {
    try {
      console.log('Attempting to send dormitory confirmation email to:', data.email);
      
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

      // Generate QR code and get URL
      const qrCodeUrl = await this.generateAndUploadQRCode(data.bookingId);
      console.log('QR Code URL:', qrCodeUrl);

      // Use fully qualified URL with server address
      const fullQrCodeUrl = `${process.env.SERVER_URL || 'http://localhost:1338'}${qrCodeUrl}`;

      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4CAF50; text-align: center;">Confirmation reply</h2>
          <h3 style="color: #4CAF50; text-align: center;">Dormitory</h3>
          
          <p><strong>Dear Devotee,</strong></p>
          <p>Namaskar.</p>
          
          <p>We have received your accommodation request and noted the contents. As all the rooms have already been booked for the dates requested by you, we shall provide your accommodation at <strong>Yatri Niwas (Dormitory)</strong> for the mentioned period i.e arrival <strong>${arrivalDate}</strong> and departure <strong>${departureDate}</strong> after breakfast at 07.30 a.m. The accommodation will be kept reserved for <strong>${data.numberOfGuests} devotees</strong>.</p>
          
          <p><strong>Yatri Niwas</strong> (Dormitory), where male devotees and female devotees are accommodated separately, is situated 5 minutes walking distance from our Ashrama premises.</p>
          
          <p>On the day of your arrival, please try to reach the Math Office to do the registration formalities during office hours i.e, morning 9:00 a.m to 11:00 a.m or evening 3:30 p.m to 5:00 p.m. Please show the below QR code along with your Aadhaar card.</p>
          
          <div style="text-align: center; margin: 20px 0;">
            <img src="${fullQrCodeUrl}" alt="Booking QR Code" style="width: 200px; height: 200px;"/>
          </div>
          
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
        subject: 'Booking Confirmation - Dormitory - Ramakrishna Math & Mission, Kamarpukur',
        html: emailHtml
      });

      console.log('Dormitory confirmation email sent successfully to:', data.email);
      return { success: true };
    } catch (error) {
      console.error('Email sending failed:', error);
      throw new Error(`Failed to send dormitory confirmation email: ${error.message}`);
    }
  },

  async sendPeerlessConfirmation(data) {
    try {
      console.log('Attempting to send Peerless Flat confirmation email to:', data.email);
      
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

      // Generate QR code and get URL
      const qrCodeUrl = await this.generateAndUploadQRCode(data.bookingId);
      console.log('QR Code URL:', qrCodeUrl);

      // Use fully qualified URL with server address
      const fullQrCodeUrl = `${process.env.SERVER_URL || 'http://localhost:1338'}${qrCodeUrl}`;

      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4CAF50; text-align: center;">Confirmation reply</h2>
          <h3 style="color: #4CAF50; text-align: center;">Peerless Flat</h3>
          
          <p><strong>Dear Devotee,</strong></p>
          <p>Namaskar.</p>
          
          <p>We have received your accommodation request and noted the contents. You are welcome to stay at <strong>our Peerless Flat</strong>, which is situated 5 minutes walking distance from our Ashrama premises, during the mentioned period i.e arrival <strong>${arrivalDate}</strong> and departure <strong>${departureDate}</strong> at 07.30 a.m. The accommodation will be kept reserved for <strong>${data.numberOfGuests} devotees</strong>.</p>
          
          <p>On the day of your arrival, please try to reach the Math Office to do the registration formalities during office hours i.e, morning 9:00 a.m to 11:00 a.m or evening 3:30 p.m to 5:00 p.m. Please show the below QR code along with your Aadhaar card.</p>
          
          <div style="text-align: center; margin: 20px 0;">
            <img src="${fullQrCodeUrl}" alt="Booking QR Code" style="width: 200px; height: 200px;"/>
          </div>
          
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
        subject: 'Booking Confirmation - Peerless Flat - Ramakrishna Math & Mission, Kamarpukur',
        html: emailHtml,
        attachDataUrls: true
      });

      console.log('Peerless Flat confirmation email sent successfully to:', data.email);
      return { success: true };
    } catch (error) {
      console.error('Email sending failed:', error);
      throw new Error(`Failed to send Peerless Flat confirmation email: ${error.message}`);
    }
  },

  async sendNoRoomsRegret(data) {
    try {
      console.log('Attempting to send no rooms availability regret email to:', data.email);
      
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #FF0000; text-align: center;">Regret mail</h2>
          <h3 style="color: #FF0000; text-align: center;">For no rooms availability</h3>
          
          <p><strong>Dear Devotee,</strong></p>
          <p>Namaskar.</p>
          
          <p>We have received your accommodation request and appreciate your interest in staying at Holy Kamarpukur. <strong style="color: #FF0000;">Please don't get disheartened as it will not be possible for us to accommodate you during the period requested by you due to paucity of space.</strong> Our inability to accede to your request may kindly be excused.</p>
          
          <p>However, if you are flexible with your dates of pilgrimage to Holy Kamarpukur, please send a fresh request using the following link,</p>
          
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
        subject: 'Regret mail - No rooms availability - Ramakrishna Math & Mission, Kamarpukur',
        html: emailHtml
      });

      console.log('No rooms availability regret email sent successfully to:', data.email);
      return { success: true };
    } catch (error) {
      console.error('Email sending failed:', error);
      throw new Error(`Failed to send no rooms availability regret email: ${error.message}`);
    }
  }
}; 