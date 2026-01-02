const bcrypt = require('bcrypt');

const plaintextPassword = 'admin12345';
const hashedPassword = '$2b$10$ose3gZPKWaY3EZP6DkBW5O47tNYPid/VpyZOJ84.SYjgjanHoAi.a';

bcrypt.compare(plaintextPassword, hashedPassword, (err, isMatch) => {
  if (err) {
    console.error('Error comparing password:', err);
    return;
  }
  console.log('Password match:', isMatch);
});