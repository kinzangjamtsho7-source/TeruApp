const express = require('express');
const path = require('path');
const router = express.Router();
const authController = require('../controllers/authController');
const { isAuthenticated } = require('../middleware/authMiddleware');
const bcrypt = require('bcryptjs');
const { User } = require('../models');

// Root route - redirect directly to home page
router.get('/', (req, res) => {
  res.redirect('/home');
});

// Auth Routes
router.get('/verify-otp', authController.getVerifyOtp);
router.post('/verify-otp', authController.postVerifyOtp);
router.get('/logout', authController.logout);

// Home page - accessible without authentication
router.get('/home', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'views', 'index.html'));
});

// App pages - accessible without authentication
router.get('/add-expense', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'views', 'add-expense.html'));
});

router.get('/expenses', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'views', 'Expenses.html'));
});

router.get('/reports', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'views', 'Reports.html'));
});

router.get('/settings', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'views', 'settings.html'));
});

// Advertisement page
router.get('/advertisement', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'views', 'advertisement.html'));
});

router.get('/notifications', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'views', 'notification.html'));
});

// Admin routes (keep admin login for admin panel only)
router.get('/admin', (req, res) => {
  res.render('auth/admin-login', { error: null });
});

// Handle admin login (for admin panel only)
router.post('/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email, role: 'admin' } });
    if (!user) {
      return res.render('auth/admin-login', { error: 'Invalid admin credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.render('auth/admin-login', { error: 'Invalid admin credentials' });
    }

    req.session.user = {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: 'admin'
    };

    res.redirect('/admin/home');
  } catch (error) {
    console.error('Admin login error:', error);
    res.render('auth/admin-login', { error: 'Login failed. Please try again.' });
  }
});

module.exports = router;
