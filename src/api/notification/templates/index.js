const guestHouse = require('./confirmations/guestHouse.js');
const dormitory = require('./confirmations/dormitory.js');
const yatriNivasRoom = require('./confirmations/yatriNivasRoom.js');
const chinuShankhari = require('./confirmations/chinuShankhari.js');
const peerlessFlat = require('./confirmations/peerlessFlat.js');

const noAvailability = require('./rejections/noAvailability.js');
const sixMonthRule = require('./rejections/sixMonthRule.js');
const specialCelebrationBelow10k = require('./rejections/specialCelebrationBelow10k.js');
const specialCelebrationAbove10k = require('./rejections/specialCelebrationAbove10k.js');

module.exports = {
  confirmations: {
    guestHouse,
    dormitory,
    yatriNivasRoom,
    chinuShankhari,
    peerlessFlat
  },
  rejections: {
    noAvailability,
    sixMonthRule,
    specialCelebrationBelow10k,
    specialCelebrationAbove10k
  }
}; 