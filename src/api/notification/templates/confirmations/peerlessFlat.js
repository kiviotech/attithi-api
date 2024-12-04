const formatDate = require('../../utils/formatDate');

module.exports = (data, qrCode) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .qr-code { width: 200px; height: 200px; margin: 20px 0; }
    .footer { margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <p>Dear Devotee,</p>
    <p>Namaskar.</p>
    
    <p>We have received the accommodation request and noted the contents. You are welcome to stay at our Peerless Flat, which is situated 5 minutes walking distance from our Ashrama premises, during the mentioned period i.e arrival ${formatDate(data.checkInDate)} and departure ${formatDate(data.checkOutDate)} at 07.30 a.m. The accommodation will be kept reserved for ${data.numberOfGuests} devotees.</p>
    
    <p>On the day of your arrival, please try to reach the Math Office to do the registration formalities during office hours (morning 8:30 am to 11:30 am, evening 3:30 pm to 5:00 pm). Please show the below QR code along with your Aadhaar card.</p>
    
    <img src="${qrCode}" alt="Booking QR Code" class="qr-code"/>
    
    <p>May Sri Ramakrishna, Holy Mother Sri Sarada Devi and Swami Vivekananda bless you all!</p>
    
    <div class="footer">
      <p>With best regards and namaskar again.</p>
      <p>Yours sincerely,</p>
      <p>
        Swami Lokottarananda<br>
        Adhyaksha<br>
        RAMAKRISHNA MATH & RAMAKRISHNA MISSION, KAMARPUKUR
      </p>
    </div>
  </div>
</body>
</html>
`; 