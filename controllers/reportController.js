const { Expense } = require('../models');
const { Op } = require('sequelize');

exports.getSummary = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const expenses = await Expense.findAll({ where: { userId } });

    const byCategory = {};
    for (const e of expenses) {
      const key = e.category || 'Uncategorized';
      byCategory[key] = (byCategory[key] || 0) + Number(e.amount);
    }

    // group by date
    const byDate = {};
    for (const e of expenses) {
      const key = e.date; // DATEONLY
      byDate[key] = (byDate[key] || 0) + Number(e.amount);
    }

    return res.json({ byCategory, byDate });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to build report' });
  }
};

