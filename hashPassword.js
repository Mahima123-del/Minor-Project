const bcrypt = require('bcrypt');

const plainPassword = 'password123'; // Replace with the desired admin password
const saltRounds = 10; // The cost factor for hashing (higher = more secure, but slower)

bcrypt.hash(plainPassword, saltRounds, (err, hash) => {
    if (err) {
        console.error('Error hashing password:', err);
    } else {
        console.log('Hashed password:', hash);
    }
});