const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/authMiddleware');
const {
  getExpenses,
  addExpense,
  updateExpense,
  deleteExpense
} = require('../controllers/expenseController');

// Routes requiring login
router.get('/', isAuthenticated, getExpenses);
router.post('/', isAuthenticated, addExpense);
router.put('/:id', isAuthenticated, updateExpense);
router.delete('/:id', isAuthenticated, deleteExpense);

module.exports = router;
