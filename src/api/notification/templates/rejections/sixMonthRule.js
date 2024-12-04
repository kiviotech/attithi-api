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
    
    <p>We have received the accommodation request and appreciate your interest in staying at Holy Kamarpukur. Please don't get disheartened as it will not be possible for us to accommodate you, due to your recent stay in our Math Accommodation (${formatDate(data.lastStayDate)}) and you can't apply for accommodation less than six months from your last stay. Our inability to accede to your request may kindly be excused.</p>
    
    <p>May Sri Ramakrishna, Holy Mother Sri Sarada Devi and Swami Vivekananda bless you all!</p>
    
    <div class="footer">
      <p>With best regards and namaskar again.</p>
      <p>Yours sincerely,</p>
      <p>
        Adhyaksha<br>
        RAMAKRISHNA MATH & RAMAKRISHNA MISSION, KAMARPUKUR
      </p>
    </div>
  </div>
</body>
</html>
`; 