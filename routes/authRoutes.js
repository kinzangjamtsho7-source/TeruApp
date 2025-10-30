const express = require('express');
const path = require('path');
const router = express.Router();
const authController = require('../controllers/authController');
const { isAuthenticated } = require('../middleware/authMiddleware');
const bcrypt = require('bcryptjs');
const { User } = require('../models');

// Landing Page (optional)
router.get('/', (req, res) => {
  res.render('auth/landing');
});

// Auth Routes
router.get('/signup', authController.getSignup);
router.post('/signup', authController.postSignup);
router.get('/verify-otp', authController.getVerifyOtp);
router.post('/verify-otp', authController.postVerifyOtp);
router.get('/login', authController.getLogin);
router.post('/login', authController.postLogin);
router.get('/logout', authController.logout);

// Protected Home - serve main HTML
router.get('/home', isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'views', 'index.html'));
});

// App pages (protected)
router.get('/add-expense', isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'views', 'add-expense.html'));
});

router.get('/expenses', isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'views', 'Expenses.html'));
});

router.get('/reports', isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'views', 'Reports.html'));
});

router.get('/settings', isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'views', 'settings.html'));
});

// Advertisement page
router.get('/advertisement', isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'views', 'advertisement.html'));
});

router.get('/notifications', isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'views', 'notification.html'));
});

// Admin login page
router.get('/admin', (req, res) => {
  res.render('auth/admin-login', { error: null });
});

// Handle admin login
router.post('/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if it's the admin email from .env
    if (email !== process.env.ADMIN_EMAIL) {
      return res.render('auth/admin-login', { error: 'Invalid admin credentials' });
    }

    const admin = await User.findOne({ where: { email, role: 'admin' } });
    if (!admin) {
      return res.render('auth/admin-login', { error: 'Invalid admin credentials' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.render('auth/admin-login', { error: 'Invalid admin credentials' });
    }

    req.session.user = {
      id: admin.id,
      fullName: admin.fullName,
      email: admin.email,
      role: 'admin'
    };

    res.redirect('/admin/home');
  } catch (error) {
    console.error('Admin login error:', error);
    res.render('auth/admin-login', { error: 'Login failed. Please try again.' });
  }
});

module.exports = router;
