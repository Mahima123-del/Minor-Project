require('dotenv').config();
const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const path = require('path');
const multer = require('multer');
const bcrypt = require('bcrypt'); // Import bcrypt for password hashing


const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); // Add this to handle JSON data
app.use(express.static('public')); // Serve static files like HTML, CSS, etc.
app.set('view engine', 'ejs');
// Set the views folder
app.set('views', path.join(__dirname, 'views')); // Ensure this is set correctly

// Setup MySQL connection
const db = mysql.createConnection({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
});

db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err.stack);
    return;
  }
  console.log('Connected to database');
});

// Serve the homepage
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Admin login route
app.post('/admin-login', (req, res) => {
  const { username, password } = req.body;

  const query = 'SELECT * FROM admins WHERE username = ?';
  
  db.query(query, [username], (err, results) => {
    if (err) {
      console.error('Error executing query:', err);
      return res.status(500).send('Server error');
    }
    if (results.length > 0) {
      // Check password with bcrypt
      bcrypt.compare(password, results[0].password, (err, isMatch) => {
        if (err) {
          console.error('Error comparing passwords:', err);
          return res.status(500).send('Server error');
        }
        if (isMatch) {
          res.redirect('/admin-dashboard'); // Redirect to admin dashboard
        } else {
          res.send('Incorrect password');
        }
      });
    } else {
      res.send('Admin not found');
    }
  });
});

// Serve the admin dashboard
app.get('/admin-dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin-dashboard.html'));
});

// Get all users for admin to manage
app.get('/admin/users', (req, res) => {
  const query = 'SELECT * FROM users';
  db.query(query, (err, results) => {
      if (err) {
          console.error('Error fetching users:', err);
          return res.status(500).send('Server error');
      }
      res.json(results); // Send users data as JSON
  });
});

// Delete user
app.delete('/admin/delete-user/:id', (req, res) => {
  const userId = req.params.id;
  const query = 'DELETE FROM users WHERE id = ?';
  db.query(query, [userId], (err, results) => {
      if (err) {
          console.error('Error deleting user:', err);
          return res.status(500).send('Server error');
      }
      res.send('User deleted');
  });
});


// Get all bookings
app.get('/admin/bookings', (req, res) => {
  const query = 'SELECT * FROM bookings';
  db.query(query, (err, results) => {
      if (err) {
          console.error('Error fetching bookings:', err);
          return res.status(500).send('Server error');
      }
      res.json(results); // Send bookings data as JSON
  });
});

app.post('/book-hotel', (req, res) => {
  const { guestName, checkIn, checkOut, roomType, guests, payment } = req.body;

  // Validate booking and payment details
  if (!guestName || !checkIn || !checkOut || !roomType || !guests || !payment) {
      return res.status(400).json({ message: 'Missing required fields' });
  }

  // Simulate payment processing (replace this with a real payment gateway)
  const { cardNumber, cardExpiry, cardCVV } = payment;
  if (!cardNumber || !cardExpiry || !cardCVV) {
      return res.status(400).json({ message: 'Invalid payment details' });
  }

  // Mock payment success
  const isPaymentSuccessful = true; // Replace with real payment gateway response

  if (isPaymentSuccessful) {
      // Insert booking details into the database
      const query = `INSERT INTO bookings (guest_name, check_in, check_out, room_type, guests) 
                     VALUES (?, ?, ?, ?, ?)`;
      db.query(query, [guestName, checkIn, checkOut, roomType, guests], (err, result) => {
          if (err) {
              console.error('Error saving booking:', err);
              return res.status(500).json({ message: 'Server error' });
          }
          res.status(200).json({ message: 'Booking and payment successful!', bookingId: result.insertId });
      });
  } else {
      res.status(402).json({ message: 'Payment failed. Please try again.' });
  }
});

// Delete booking
app.delete('/delete-booking/:booking_id', (req, res) => {
  const { booking_id } = req.params;

  if (!booking_id) {
      return res.status(400).send("Booking ID is required");
  }

  const query = 'DELETE FROM bookings WHERE id = ?';
  db.query(query, [booking_id], (err, result) => {
      if (err) {
          console.error('Error deleting booking:', err);
          return res.status(500).send("Error deleting booking");
      }
      res.send("Booking deleted successfully");
  });
});








// Login route
app.post('/login', (req, res) => {
    const { username, email, password } = req.body;

    const query = 'SELECT * FROM users WHERE (username = ? OR email = ?) AND password = ?';
    
    db.query(query, [username, email, password], (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            return res.status(500).send('Server error');
        }
        if (results.length > 0) {
          res.redirect("home.html"); // Redirect to home.html after login
        } else {
          res.send('Incorrect username or password');
        }
    });
});

// Sign up route
app.post('/signin', (req, res) => {
  const { username, email, password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    return res.send('Passwords do not match');
  }

  const query = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
  
  db.query(query, [username, email, password], (err, results) => {
      if (err) {
          console.error('Error executing query:', err);
          return res.status(500).send('Server error');
      }
      res.redirect('home.html');
  });
});

// Add booking route
app.post('/book-hotel', (req, res) => {
  const { guestName, checkIn, checkOut, roomType, guests } = req.body;

  // SQL query to insert booking into database
  const query = 'INSERT INTO bookings (guest_name, check_in, check_out, room_type, guests) VALUES (?, ?, ?, ?, ?)';

  db.query(query, [guestName, checkIn, checkOut, roomType, guests], (err, results) => {
    if (err) {
      console.error('Error booking hotel:', err);
      return res.status(500).send('Booking failed');
    }
    res.send({ message: 'Booking successful!' });
  });
});

// Set up storage engine for uploaded images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
      cb(null, './public/uploads');  // Set the upload folder
  },
  filename: (req, file, cb) => {
      const fileName = Date.now() + '-' + file.originalname;  // Use current timestamp to avoid duplicate filenames
      cb(null, fileName);
  }
});

// Create the multer instance
const upload = multer({ storage: storage });

// Add place route (handle form submission)
app.post('/submit-place', upload.single('place-photo'), (req, res) => {
  const { 'place-name': placeName, 'place-description': placeDescription } = req.body;
  const placePhoto = req.file ? req.file.filename : '';  // Get the filename of the uploaded image

  // Insert place details into the database
  const query = 'INSERT INTO places (name, description, photo) VALUES (?, ?, ?)';
  db.query(query, [placeName, placeDescription, placePhoto], (err, results) => {
      if (err) {
          console.error('Error adding place:', err);
          return res.status(500).send('Server error');
      }
      res.redirect('/places-added');  // Redirect to the places added page
  });
});

// Serve the "Places Added by Users" page and display all places
app.get('/places-added', (req, res) => {
  const query = 'SELECT * FROM places'; // Get all places from the database
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching places:', err);
      return res.status(500).send('Server error');
    }
    // Render the places-added.ejs file and pass the fetched places
    res.render('places-added', { places: results });
  });
});






// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
