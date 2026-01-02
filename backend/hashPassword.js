const bcrypt = require('bcrypt');

const password = 'admin12345'; // Must be at least 8 characters (per your schema)
bcrypt.hash(password, 10, (err, hash) => {
  if (err) {
    console.error('Error hashing password:', err);
    return;
  }
  console.log('Hashed Password:', hash);
});