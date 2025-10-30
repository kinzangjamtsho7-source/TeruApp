const { User } = require('../models');

exports.getBudget = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const user = await User.findByPk(userId, { attributes: ['monthlyBudget', 'budgetSetDate'] });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.json({ 
      monthlyBudget: Number(user.monthlyBudget || 0),
      budgetSetDate: user.budgetSetDate
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch budget', error: error.message });
  }
};

exports.updateBudget = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const { monthlyBudget } = req.body;

    const parsed = Number(monthlyBudget);
    if (!Number.isFinite(parsed) || parsed < 0) {
      return res.status(400).json({ message: 'monthlyBudget must be a non-negative number' });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.monthlyBudget = parsed;
    user.budgetSetDate = new Date();
    await user.save();

    return res.json({ monthlyBudget: Number(user.monthlyBudget) });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update budget', error: error.message });
  }
};

