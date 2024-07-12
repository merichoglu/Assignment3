const bcrypt = require('bcryptjs');

const password = 'adminbydefault'; // replace with your desired password

bcrypt.genSalt(10, (err, salt) => {
  if (err) throw err;
  bcrypt.hash(password, salt, (err, hash) => {
    if (err) throw err;
    console.log('Hashed Password:', hash);
  });
});
