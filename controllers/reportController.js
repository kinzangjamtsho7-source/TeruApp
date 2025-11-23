const { Expense } = require('../models');

exports.getSummary = async (req, res) => {
  try {
    // Ensure user is logged in using the NEW session format
    const userId = req.session?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized. Please log in.' });
    }

    const expenses = await Expense.findAll({ where: { userId } });

    // Group by category
    const byCategory = {};
    for (const e of expenses) {
      const key = e.category || 'Uncategorized';
      byCategory[key] = (byCategory[key] || 0) + Number(e.amount);
    }

    // Group by date
    const byDate = {};
    for (const e of expenses) {
      const key = e.date; // DATEONLY
      byDate[key] = (byDate[key] || 0) + Number(e.amount);
    }

    return res.json({ byCategory, byDate });

  } catch (error) {
    console.error('Error getting report summary:', error);
    return res.status(500).json({ message: 'Failed to build report' });
  }
};
