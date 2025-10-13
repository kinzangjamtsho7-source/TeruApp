const Expense = require('../models/Expense');

// Get all expenses
exports.getExpenses = async (req, res) => {
  const expenses = await Expense.find();
  res.json(expenses);
};

// Add new expense
exports.addExpense = async (req, res) => {
  const newExpense = new Expense(req.body);
  await newExpense.save();
  res.json({ message: 'Expense added', data: newExpense });
};
