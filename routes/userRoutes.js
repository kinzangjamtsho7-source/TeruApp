const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/authMiddleware');
const { getBudget, updateBudget } = require('../controllers/userController');

router.get('/me/budget', isAuthenticated, getBudget);
router.put('/me/budget', isAuthenticated, updateBudget);

module.exports = router;
