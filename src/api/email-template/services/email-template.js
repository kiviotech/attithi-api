'use strict';

const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

/**
 * Helper function to extract a person's first name from their full name
 * @param {string} fullName - The full name which may include titles
 * @returns {string} - The extracted first name or 'Devotee' if unable to extract
 */
const extractFirstName = (fullName) => {
  if (!fullName) return 'Devotee';
  
  // Extract the first name if there's a title like 'Mr.' or 'Mrs.'
  const nameParts = fullName.split(' ');
  if (nameParts.length > 1 && (nameParts[0].endsWith('.') || nameParts[0].length <= 4)) {
    return nameParts[1]; // Use the second part as the name
  } else {
    return nameParts[0]; // Use the first part as the name
  }
};

/**
 * Add CC recipients to email config if they exist
 * @param {object} emailConfig - Email configuration object
 * @param {Array} ccRecipients - Array of CC email addresses
 * @returns {object} - Updated emailConfig
 */
const addCcRecipientsIfExist = (emailConfig, ccRecipients) => {
  if (ccRecipients && Array.isArray(ccRecipients) && ccRecipients.length > 0) {
    // Filter out any empty or invalid email addresses
    const validCcEmails = ccRecipients.filter(email => 
      email && typeof email === 'string' && email.trim() !== '' && email.includes('@')
    );
    
    if (validCcEmails.length > 0) {
      emailConfig.cc = validCcEmails;
      console.log(`Adding ${validCcEmails.length} CC recipients to email`);
    }
  }
  
  return emailConfig;
};

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

  // Send booking confirmation email for Guest House
  async sendBookingConfirmation(data) {
    try {
      console.log('Attempting to send booking confirmation email to:', data.email);
      
      // Log CC recipients if they exist
      if (data.cc && Array.isArray(data.cc) && data.cc.length > 0) {
        console.log('CC recipients:', data.cc);
      }
      
      // Use helper function to extract first name for personalized greeting
      const guestName = extractFirstName(data.name);
      
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
      
      // Prepare room details section if provided
      let roomDetailsSection = '';
      if (data.roomDetails) {
        roomDetailsSection = `
          <p><strong>Room(s) Allocated:</strong> ${data.roomDetails}</p>
        `;
      }

      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4CAF50; text-align: center;">Confirmation reply</h2>
          <h3 style="color: #4CAF50; text-align: center;">Guest House</h3>
          
          <p><strong>Dear ${guestName},</strong></p>
          <p>Namaskar.</p>
          
          <p>We have received your accommodation request and noted the contents. You are welcome to stay at our <strong>Guest House</strong>, which is situated within our Ashrama premises, during the mentioned period i.e arrival <strong>${arrivalDate}</strong> and departure <strong>${departureDate}</strong> at 07.30 a.m. The accommodation will be kept reserved for <strong>${data.numberOfGuests} ${data.numberOfGuests > 1 ? 'devotees' : 'devotee'}</strong>.</p>
          ${roomDetailsSection}
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

      // Prepare email configuration
      const emailConfig = {
        to: data.email,
        from: process.env.SMTP_FROM,
        subject: 'Booking Confirmation - Guest House - Ramakrishna Math & Mission, Kamarpukur',
        html: emailHtml,
        attachDataUrls: true
      };
      
      // Add CC recipients if they exist using helper function
      addCcRecipientsIfExist(emailConfig, data.cc);
      
      // Send email
      await strapi.plugins['email'].services.email.send(emailConfig);

      console.log('Guest House confirmation email sent successfully to:', data.email);
      return { success: true };
    } catch (error) {
      console.error('Email sending failed:', error);
      throw new Error(`Failed to send Guest House confirmation email: ${error.message}`);
    }
  },

  // Function for Yatri Nivas confirmation emails (separate from Guest House)
  async sendYatriNivasConfirmation(data) {
    try {
      console.log('Attempting to send Yatri Nivas confirmation email to:', data.email);
      
      // Log CC recipients if they exist
      if (data.cc && Array.isArray(data.cc) && data.cc.length > 0) {
        console.log('CC recipients:', data.cc);
      }
      
      // Use helper function to extract first name for personalized greeting
      const guestName = extractFirstName(data.name);
      
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
      
      // Prepare room details section if provided
      let roomDetailsSection = '';
      if (data.roomDetails) {
        roomDetailsSection = `
          <p><strong>Room(s) Allocated:</strong> ${data.roomDetails}</p>
        `;
      }

      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4CAF50; text-align: center;">Confirmation reply</h2>
          <h3 style="color: #4CAF50; text-align: center;">Yatri Nivas Room</h3>
          
          <p><strong>Dear ${guestName},</strong></p>
          <p>Namaskar.</p>
          
          <p>We have received your accommodation request and noted the contents. You are welcome to stay at our <strong>Yatri Niwas (Room)</strong>, which is situated 5 minutes walking distance from our Ashrama premises, during the mentioned period i.e arrival <strong>${arrivalDate}</strong> and departure <strong>${departureDate}</strong> at 07.30 a.m. The accommodation will be kept reserved for <strong>${data.numberOfGuests} ${data.numberOfGuests > 1 ? 'devotees' : 'devotee'}</strong>.</p>
          ${roomDetailsSection}
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

      // Prepare email configuration
      const emailConfig = {
        to: data.email,
        from: process.env.SMTP_FROM,
        subject: 'Booking Confirmation - Yatri Nivas Room - Ramakrishna Math & Mission, Kamarpukur',
        html: emailHtml,
        attachDataUrls: true
      };
      
      // Add CC recipients if they exist using helper function
      addCcRecipientsIfExist(emailConfig, data.cc);
      
      // Send email
      await strapi.plugins['email'].services.email.send(emailConfig);

      console.log('Yatri Nivas confirmation email sent successfully to:', data.email);
      return { success: true };
    } catch (error) {
      console.error('Email sending failed:', error);
      throw new Error(`Failed to send Yatri Nivas confirmation email: ${error.message}`);
    }
  },

  // Send regret email when revisit is not allowed
  async sendRevisitRegret(data) {
    try {
      console.log('Attempting to send revisit regret email to:', data.email);
      
      // Use helper function to extract first name for personalized greeting
      const guestName = extractFirstName(data.name);
      
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #FF4444; text-align: center;">Regret mail</h2>
          <h3 style="color: #FF4444; text-align: center;">For guest re-visit</h3>
          
          <p><strong>Dear ${guestName},</strong></p>
          <p>Namaskar.</p>
          
          <p>We have received your accommodation request. We regret to inform you that you have stayed recently at our accommodation. According to our present policy, devotees who had visited and stayed in our Asrama will only be allowed to revisit and stay after three months from the date of departure.</p>
          
          <p>May Sri Ramakrishna, Holy Mother Sri Sarada Devi and Swami Vivekananda bless you all !</p>
          
          <p>With best regards and namaskar again.</p>
          
          <p>Yours sincerely,</p>
          <p><strong>Swami Lokottarananda</strong><br>
          <strong>Adhyaksha</strong><br>
          <strong>RAMAKRISHNA MATH & RAMAKRISHNA MISSION, KAMARPUKUR</strong></p>
        </div>
      `;

      // Prepare email configuration
      const emailConfig = {
        to: data.email,
        from: process.env.SMTP_FROM,
        subject: 'Regarding Your Accommodation Request - Ramakrishna Math & Mission, Kamarpukur',
        html: emailHtml
      };
      
      // Add CC recipients if they exist using helper function
      addCcRecipientsIfExist(emailConfig, data.cc);
      
      // Send email
      await strapi.plugins['email'].services.email.send(emailConfig);

      console.log('Revisit regret email sent successfully to:', data.email);
      return { success: true };
    } catch (error) {
      console.error('Email sending failed:', error);
      throw new Error(`Failed to send revisit regret email: ${error.message}`);
    }
  },

  // Remaining methods omitted for brevity but would follow the same pattern
  // All would use extractFirstName for personalized greetings and addCcRecipientsIfExist for CC functionality
};
