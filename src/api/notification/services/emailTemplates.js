'use strict';

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

module.exports = {
  // Confirmation Templates
  guestHouse: (data, qrCode) => `
    <h1>Accommodation Confirmation</h1>
    <p>Dear Devotee,</p>
    <p>Namaskar.</p>
    <p>We have received the accommodation request and noted the contents. You are welcome to stay at our Guest House during the mentioned period i.e arrival ${formatDate(data.checkInDate)} and departure ${formatDate(data.checkOutDate)} at 07.30 a.m. The accommodation will be kept reserved for ${data.numberOfGuests} devotees.</p>
    <p>On the day of your arrival, please try to reach the Math Office to do the registration formalities during office hours (morning 8:30 am to 11:30 am, evening 3:30 pm to 5:00 pm). Please show the below QR code along with your Aadhaar card.</p>
    <img src="${qrCode}" alt="Booking QR Code" style="width: 200px; height: 200px;"/>
    <p>May Sri Ramakrishna, Holy Mother Sri Sarada Devi and Swami Vivekananda bless you all!</p>
    <p>With best regards and namaskar again.</p>
    <p>Yours sincerely,</p>
    <p>Swami Lokottarananda<br>
    Adhyaksha<br>
    RAMAKRISHNA MATH & RAMAKRISHNA MISSION, KAMARPUKUR</p>
  `,

  dormitory: (data, qrCode) => `
    <h1>Accommodation Confirmation - Dormitory</h1>
    <p>Dear Devotee,</p>
    <p>Namaskar.</p>
    <p>We have received the accommodation request and noted the contents. As all the rooms have already been booked for the dates requested by you, we shall provide your accommodation at Yatri Niwas (Dormitory) for the mentioned period i.e arrival ${formatDate(data.checkInDate)} and departure ${formatDate(data.checkOutDate)} at 07.30 a.m. The accommodation will be kept reserved for ${data.numberOfGuests} devotees.</p>
    <p>Yatri Niwas (Dormitory), where male devotees and female devotees are accommodated separately, is situated 5 minutes walking distance from our Ashrama premises.</p>
    <p>On the day of your arrival, please try to reach the Math Office to do the registration formalities during office hours (morning 8:30 am to 11:30 am, evening 3:30 pm to 5:00 pm). Please show the below QR code along with your Aadhaar card.</p>
    <img src="${qrCode}" alt="Booking QR Code" style="width: 200px; height: 200px;"/>
    <p>May Sri Ramakrishna, Holy Mother Sri Sarada Devi and Swami Vivekananda bless you all!</p>
    <p>With best regards and namaskar again.</p>
    <p>Yours sincerely,</p>
    <p>Swami Lokottarananda<br>
    Adhyaksha<br>
    RAMAKRISHNA MATH & RAMAKRISHNA MISSION, KAMARPUKUR</p>
  `,

  yatriNivasRoom: (data, qrCode) => `
    <h1>Accommodation Confirmation - Yatri Nivas Room</h1>
    <p>Dear Devotee,</p>
    <p>Namaskar.</p>
    <p>We have received the accommodation request and noted the contents. You are welcome to stay at our Yatri Niwas (Room), which is situated 5 minutes walking distance from our Ashrama premises, during the mentioned period i.e arrival ${formatDate(data.checkInDate)} and departure ${formatDate(data.checkOutDate)} at 07.30 a.m. The accommodation will be kept reserved for ${data.numberOfGuests} devotees.</p>
    <p>On the day of your arrival, please try to reach the Math Office to do the registration formalities during office hours (morning 8:30 am to 11:30 am, evening 3:30 pm to 5:00 pm). Please show the below QR code along with your Aadhaar card.</p>
    <img src="${qrCode}" alt="Booking QR Code" style="width: 200px; height: 200px;"/>
    <p>May Sri Ramakrishna, Holy Mother Sri Sarada Devi and Swami Vivekananda bless you all!</p>
    <p>With best regards and namaskar again.</p>
    <p>Yours sincerely,</p>
    <p>Swami Lokottarananda<br>
    Adhyaksha<br>
    RAMAKRISHNA MATH & RAMAKRISHNA MISSION, KAMARPUKUR</p>
  `,

  chinuShankhari: (data, qrCode) => `
    <h1>Accommodation Confirmation - Chinu Shankhari Memorial Building</h1>
    <p>Dear Devotee,</p>
    <p>Namaskar.</p>
    <p>We have received the accommodation request and noted the contents. You are welcome to stay at our Chinu Shankhari Memorial Building GUEST HOUSE, which is situated 5 minutes walking distance from our Ashrama premises, during the mentioned period i.e arrival ${formatDate(data.checkInDate)} and departure ${formatDate(data.checkOutDate)} after breakfast at 07.30 a.m. The accommodation will be kept reserved for ${data.numberOfGuests} devotees.</p>
    <p>On the day of your arrival, please try to reach the Math Office to do the registration formalities during office hours (morning 8:30 am to 11:30 am, evening 3:30 pm to 5:00 pm). Please show the below QR code along with your Aadhaar card.</p>
    <img src="${qrCode}" alt="Booking QR Code" style="width: 200px; height: 200px;"/>
    <p>May Sri Ramakrishna, Holy Mother Sri Sarada Devi and Swami Vivekananda bless you all!</p>
    <p>With best regards and namaskar again.</p>
    <p>Yours sincerely,</p>
    <p>Swami Lokottarananda<br>
    Adhyaksha<br>
    RAMAKRISHNA MATH & RAMAKRISHNA MISSION, KAMARPUKUR</p>
  `,

  peerlessFlat: (data, qrCode) => `
    <h1>Accommodation Confirmation - Peerless Flat</h1>
    <p>Dear Devotee,</p>
    <p>Namaskar.</p>
    <p>We have received the accommodation request and noted the contents. You are welcome to stay at our Peerless Flat, which is situated 5 minutes walking distance from our Ashrama premises, during the mentioned period i.e arrival ${formatDate(data.checkInDate)} and departure ${formatDate(data.checkOutDate)} at 07.30 a.m. The accommodation will be kept reserved for ${data.numberOfGuests} devotees.</p>
    <p>On the day of your arrival, please try to reach the Math Office to do the registration formalities during office hours (morning 8:30 am to 11:30 am, evening 3:30 pm to 5:00 pm). Please show the below QR code along with your Aadhaar card.</p>
    <img src="${qrCode}" alt="Booking QR Code" style="width: 200px; height: 200px;"/>
    <p>May Sri Ramakrishna, Holy Mother Sri Sarada Devi and Swami Vivekananda bless you all!</p>
    <p>With best regards and namaskar again.</p>
    <p>Yours sincerely,</p>
    <p>Swami Lokottarananda<br>
    Adhyaksha<br>
    RAMAKRISHNA MATH & RAMAKRISHNA MISSION, KAMARPUKUR</p>
  `,

  // Rejection Templates
  noAvailability: (data) => `
    <h1>Accommodation Request - Not Available</h1>
    <p>Dear Devotee,</p>
    <p>Namaskar.</p>
    <p>We have received the accommodation request and appreciate your interest in staying at Holy Kamarpukur. Please don't get disheartened as it will not be possible for us to accommodate you during the period requested by you due to paucity of space. Our inability to accede to your request may kindly be excused.</p>
    <p>May Sri Ramakrishna, Holy Mother Sri Sarada Devi and Swami Vivekananda bless you all!</p>
    <p>With best regards and namaskar again.</p>
    <p>Yours sincerely,</p>
    <p>Adhyaksha<br>
    RAMAKRISHNA MATH & RAMAKRISHNA MISSION, KAMARPUKUR</p>
  `,

  sixMonthRule: (data) => `
    <h1>Accommodation Request - Six Month Rule</h1>
    <p>Dear Devotee,</p>
    <p>Namaskar.</p>
    <p>We have received the accommodation request and appreciate your interest in staying at Holy Kamarpukur. Please don't get disheartened as it will not be possible for us to accommodate you, due to your recent stay in our Math Accommodation (${formatDate(data.lastStayDate)}) and you can't apply for accommodation less than six months from your last stay. Our inability to accede to your request may kindly be excused.</p>
    <p>May Sri Ramakrishna, Holy Mother Sri Sarada Devi and Swami Vivekananda bless you all!</p>
    <p>With best regards and namaskar again.</p>
    <p>Yours sincerely,</p>
    <p>Adhyaksha<br>
    RAMAKRISHNA MATH & RAMAKRISHNA MISSION, KAMARPUKUR</p>
  `,

  specialCelebrationBelow10k: (data) => `
    <h1>Accommodation Request - Special Celebration</h1>
    <p>Dear Devotee,</p>
    <p>Namaskar.</p>
    <p>We have received the accommodation request and appreciate your interest in staying at Holy Kamarpukur during ${data.celebrationType}.</p>
    <p>Please note that we have limited accommodations and most of them are used for the artists, performers and volunteers during Sri Sri Durga Utsav and Sri Sri Thakur's Tithi Puja. Thus, don't get disheartened as it will not be possible for us to accommodate you during the period as requested by you due to paucity of space. Hope you will understand our constraints.</p>
    <p>May Sri Ramakrishna, Holy Mother Sri Sarada Devi and Swami Vivekananda bless you and members of your family!</p>
    <p>With best regards and namaskar again.</p>
    <p>Yours sincerely,</p>
    <p>Swami Lokottarananda<br>
    Adhyaksha<br>
    RAMAKRISHNA MATH & RAMAKRISHNA MISSION, KAMARPUKUR</p>
  `,

  specialCelebrationAbove10k: (data) => `
    <h1>Accommodation Request - Special Celebration</h1>
    <p>Dear Devotee,</p>
    <p>Namaskar.</p>
    <p>We have received the accommodation request and appreciate your interest in staying at Holy Kamarpukur during ${data.celebrationType}.</p>
    <p>Please note that we have limited accommodations and most of them are used for the artists, performers and volunteers during Sri Sri Durga Utsav and Sri Sri Thakur's Tithi Puja. Thus, don't get disheartened as it will not be possible for us to accommodate you during this period as requested by you due to paucity of space. As you are closely associated with Ramakrishna Math, Kamarpukur, it equally hurts us to regret your accommodation request. Hope you will understand our constraints.</p>
    <p>In addition to the aforementioned reason, we also wish to inform you that during special celebrations like Sri Sri Durga Puja and Sri Sri Thakur's Tithi Puja, we are extremely busy with preparation for this celebration and managing the inflow of pilgrims and making Prasad Arrangements for thousands and thousands of devotees and volunteers. As a result we don't get time and opportunity to pay even little attention to our in-house guests like you. Thus, we request you to come and stay some other time and go back with fond memories of your pilgrimage.</p>
    <p>May Sri Ramakrishna, Holy Mother Sri Sarada Devi and Swami Vivekananda bless you and members of your family!</p>
    <p>With best regards and namaskar again.</p>
    <p>Yours sincerely,</p>
    <p>Swami Lokottarananda<br>
    Adhyaksha<br>
    RAMAKRISHNA MATH & RAMAKRISHNA MISSION, KAMARPUKUR</p>
  `
}; 