const formatDate = require('../../utils/formatDate');

module.exports = (data) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .footer { margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <p>Dear Devotee,</p>
    <p>Namaskar.</p>
    
    <p>We have received the accommodation request and appreciate your interest in staying at Holy Kamarpukur during ${data.celebrationType}.</p>
    
    <p>Please note that we have limited accommodations and most of them are used for the artists, performers and volunteers during Sri Sri Durga Utsav and Sri Sri Thakur's Tithi Puja. Thus, don't get disheartened as it will not be possible for us to accommodate you during the period as requested by you due to paucity of space. Hope you will understand our constraints.</p>
    
    <p>May Sri Ramakrishna, Holy Mother Sri Sarada Devi and Swami Vivekananda bless you and members of your family!</p>
    
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