const { Expense } = require('../models');

// Get all expenses
exports.getExpenses = async (req, res) => {
  try {
    // Correct way to read logged-in user
    const userId = req.session?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized. Please log in.' });
    }

    const expenses = await Expense.findAll({
      where: { userId },
      order: [['date', 'DESC'], ['createdAt', 'DESC']]
    });

    return res.json(expenses);
  } catch (error) {
    console.error('Error getting expenses:', error);
    return res.status(500).json({ message: 'Failed to load expenses' });
  }
};

// Add a new expense
exports.addExpense = async (req, res) => {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized. Please log in.' });
    }

    const { title, amount, category, date } = req.body;
    if (!title || !amount || !date) {
      return res.status(400).json({ message: 'title, amount, and date are required' });
    }

    const created = await Expense.create({
      title,
      amount,
      category: category || null,
      date,
      userId
    });

    return res.json({ message: 'Expense added', data: created });
  } catch (error) {
    console.error('Error adding expense:', error);
    return res.status(500).json({ message: 'Failed to add expense' });
  }
};

// Update an expense
exports.updateExpense = async (req, res) => {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized. Please log in.' });
    }

    const { id } = req.params;
    const { title, amount, category, date } = req.body;

    const expense = await Expense.findOne({ where: { id, userId } });

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    expense.title = title ?? expense.title;
    expense.amount = amount ?? expense.amount;
    expense.category = category ?? expense.category;
    expense.date = date ?? expense.date;

    await expense.save();

    return res.json({ message: 'Expense updated', data: expense });
  } catch (error) {
    console.error('Error updating expense:', error);
    return res.status(500).json({ message: 'Failed to update expense' });
  }
};

// Delete an expense
exports.deleteExpense = async (req, res) => {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized. Please log in.' });
    }

    const { id } = req.params;

    const deleted = await Expense.destroy({
      where: { id, userId }
    });

    if (!deleted) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    return res.json({ message: 'Expense deleted' });
  } catch (error) {
    console.error('Error deleting expense:', error);
    return res.status(500).json({ message: 'Failed to delete expense' });
  }
};
