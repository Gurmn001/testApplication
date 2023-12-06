var express = require('express');
var router = express.Router();
const User = require('../models/user'); // adjust the path to where your User model is located

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

// GET route for the login page
router.get('/login', (req, res) => {
  // Render the login view template
  res.render('login', { title: 'Login' });
});

// routes/index.js or wherever you manage your routes
router.get('/register', (req, res) => {
  res.render('register', { title: 'Register' });
});
// Inside routes/index.js or a similar file

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    // Here you should look for the user in the database and compare the password
    // In a real application, you should hash the password and compare the hashes
    const user = await User.findOne({ username: username });
    if (user && password === user.password) {
      // User authenticated
      // Proceed with creating user session or JWT
      res.redirect('/dashboard'); // redirect to user dashboard or another protected route
    } else {
      // Authentication failed
      res.redirect('/login');
    }
  } catch (error) {
    console.error(error);
    res.redirect('/login');
  }
});

// Registration route
router.post('/register', async (req, res) => {
  try {
    // Retrieve form values
    const { username, email, password, confirmPassword } = req.body;

    // Basic validation
    if (password !== confirmPassword) {
      // Passwords do not match
      return res.status(400).render('register', {
        message: 'Passwords do not match.',
      });
    }

    // Check if the user already exists
    let user = await User.findOne({ email });
    if (user) {
      // User already exists
      return res.status(400).render('register', {
        message: 'User already exists with this email.',
      });
    }

    // Create a new user instance
    user = new User({
      username,
      email,
      password // Password will be hashed in the pre-save hook
    });

    // Save the new user
    await user.save();

    // Redirect to the login page or send a success message
    res.redirect('/login');
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).render('register', {
      message: 'An error occurred during registration.',
    });
  }
});

module.exports = router;
