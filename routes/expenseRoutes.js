const express = require('express');
const router = express.Router();
const { getExpenses, addExpense, updateExpense, deleteExpense } = require('../controllers/expenseController');
const { isAuthenticated } = require('../middleware/authMiddleware');

// Allow access without authentication - middleware will set user to null if not logged in
router.get('/', isAuthenticated, getExpenses);
router.post('/', isAuthenticated, addExpense);
router.put('/:id', isAuthenticated, updateExpense);
router.delete('/:id', isAuthenticated, deleteExpense);

module.exports = router;
