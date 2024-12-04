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
    
    <p>Please note that we have limited accommodations and most of them are used for the artists, performers and volunteers during Sri Sri Durga Utsav and Sri Sri Thakur's Tithi Puja. Thus, don't get disheartened as it will not be possible for us to accommodate you during this period as requested by you due to paucity of space. As you are closely associated with Ramakrishna Math, Kamarpukur, it equally hurts us to regret your accommodation request. Hope you will understand our constraints.</p>
    
    <p>In addition to the aforementioned reason, we also wish to inform you that during special celebrations like Sri Sri Durga Puja and Sri Sri Thakur's Tithi Puja, we are extremely busy with preparation for this celebration and managing the inflow of pilgrims and making Prasad Arrangements for thousands and thousands of devotees and volunteers. As a result we don't get time and opportunity to pay even little attention to our in-house guests like you. Thus, we request you to come and stay some other time and go back with fond memories of your pilgrimage.</p>
    
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