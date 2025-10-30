const express = require('express');
const router = express.Router();
const { getSummary } = require('../controllers/reportController');
const { isAuthenticated } = require('../middleware/authMiddleware');

router.get('/summary', isAuthenticated, getSummary);

module.exports = router;
