const { User } = require('../models');

exports.getBudget = async (req, res) => {
  try {
    // If no user session, return default budget of 0
    if (!req.session || !req.session.user || !req.session.user.id) {
      return res.json({ monthlyBudget: 0, budgetSetDate: null });
    }
    const userId = req.session.user.id;
    const user = await User.findByPk(userId, { attributes: ['monthlyBudget', 'budgetSetDate'] });
    if (!user) {
      return res.json({ monthlyBudget: 0, budgetSetDate: null });
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
    // If no user session, return error
    if (!req.session || !req.session.user || !req.session.user.id) {
      return res.status(401).json({ message: 'Please log in to update budget' });
    }
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

