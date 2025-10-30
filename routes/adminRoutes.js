const express = require('express');
const { isAuthenticated, isAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/home', isAuthenticated, isAdmin, (req, res) => {
  res.render('auth/admin-home');
});

module.exports = router;


