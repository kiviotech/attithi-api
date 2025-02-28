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

      // Send email using strapi's email plugin with attachDataUrls option
      await strapi.plugins['email'].services.email.send({
        to: data.email,
        from: process.env.SMTP_FROM,
        subject: 'Booking Request - Ramakrishna Math & Mission, Kamarpukur',
        html: emailHtml,
        attachDataUrls: true
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
      console.log('Attempting to send special celebration regret email to:', data.email);
      
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #FF4444; text-align: center;">Regret mail - Special Celebrations (Above 10k)</h2>
          
          <p><strong>Dear Devotee,</strong></p>
          <p>Namaskar.</p>
          
          <p>We have received your accommodation request and appreciate your interest in staying at Holy Kamarpukur during <strong>Sri Sri Thakur's Tithi Puja 2025 / Durga Puja 2025</strong>.</p>
          
          <p style="background-color: #FFF9C4; padding: 10px;">Please note that we have limited accommodations and most of them are used for <strong>the artists, performers and volunteers during Sri Sri Durga Utsav and Sri Sri Thakur's Tithi Puja</strong>. Thus, don't get disheartened as it will not be possible for us to accommodate you during this period as requested by you due to paucity of space. As you are closely associated with Ramakrishna Math, Kamarpukur, it equally hurts us to regret your accommodation request. Hope you will understand our constraints.</p>
          
          <p>In addition to the aforementioned reason, we also wish to inform you that during <strong>special celebrations like Sri Sri Durga Puja and Sri Sri Thakur's Tithi Puja</strong>, we are extremely busy with preparation for this celebration and managing the inflow of pilgrims and making Prasad Arrangements for thousands and thousands of devotees and volunteers. As a result we don't get time and opportunity to pay even little attention to our in-house guests like you. Thus, we request you to come and stay some other time and go back with fond memories of your pilgrimage.</p>
          
          <p>May Sri Ramakrishna, Holy Mother Sri Sarada Devi and Swami Vivekananda bless you and members of your family!</p>
          
          <p>With best regards and namaskar again.</p>
          
          <p>Yours sincerely,</p>
          <p><strong>Swami Lokottarananda</strong><br>
          <strong>Adhyaksha</strong><br>
          <strong>RAMAKRISHNA MATH & RAMAKRISHNA MISSION, KAMARPUKUR</strong></p>
        </div>
      `;

      // Send email using strapi's email plugin with attachDataUrls option
      await strapi.plugins['email'].services.email.send({
        to: data.email,
        from: process.env.SMTP_FROM,
        subject: 'Booking Request - Special Celebration - Ramakrishna Math & Mission, Kamarpukur',
        html: emailHtml,
        attachDataUrls: true
      });

      console.log('Special celebration regret email sent successfully to:', data.email);
      return { success: true };
    } catch (error) {
      console.error('Email sending failed:', error);
      throw new Error(`Failed to send special celebration regret email: ${error.message}`);
    }
  }
}; 