const express = require('express');
const path = require('path');
const router = express.Router();
const authController = require('../controllers/authController');
const { isAuthenticated } = require('../middleware/authMiddleware');

// --------------------------------------
// LANDING PAGE (No login needed)
// --------------------------------------
router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'views', 'landing.html'));
});

// --------------------------------------
// AUTH ROUTES
// --------------------------------------
router.get('/auth/signup', authController.getSignup);
router.post('/auth/signup', authController.postSignup);

router.get('/auth/login', authController.getLogin);
router.post('/auth/login', authController.postLogin);

router.get('/auth/logout', authController.logout);

// --------------------------------------
// MAIN APP PAGES (Require login)
// --------------------------------------
router.get('/home', isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'views', 'index.html'));
});

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

router.get('/advertisement', isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'views', 'advertisement.html'));
});

router.get('/notifications', isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'views', 'notification.html'));
});

// --------------------------------------
// ADMIN PANEL (Optional: Keep if needed)
// --------------------------------------
router.get('/admin', (req, res) => {
  res.render('auth/admin-login', { error: null });
});

router.post('/admin/login', async (req, res) => {
  // You can clean this later if admin login is not required
  res.send("Admin login disabled in offline mode.");
});

router.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Error destroying session:', err);
      return res.status(500).send('Could not log out. Try again.');
    }
    res.clearCookie('connect.sid'); // clear the cookie
    res.redirect('/auth/login'); // redirect to login page
  });
});


module.exports = router;
