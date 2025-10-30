const express = require('express');
const router = express.Router();
const { getExpenses, addExpense, updateExpense, deleteExpense } = require('../controllers/expenseController');
const { isAuthenticated } = require('../middleware/authMiddleware');

router.get('/', isAuthenticated, getExpenses);
router.post('/', isAuthenticated, addExpense);
router.put('/:id', isAuthenticated, updateExpense);
router.delete('/:id', isAuthenticated, deleteExpense);

module.exports = router;
