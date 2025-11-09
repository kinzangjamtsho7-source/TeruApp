const { Expense } = require('../models');
const { getOrCreateGuestUser } = require('../utils/guestUser');

exports.getSummary = async (req, res) => {
  try {
    let userId;
    
    // If user is logged in, use their ID
    if (req.session && req.session.user && req.session.user.id) {
      userId = req.session.user.id;
    } else {
      // Otherwise, use guest user
      userId = await getOrCreateGuestUser();
      if (!userId) {
        return res.json({ byCategory: {}, byDate: {} });
      }
    }
    
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
    console.error('Error getting report summary:', error);
    return res.status(500).json({ message: 'Failed to build report' });
  }
};

