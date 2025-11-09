const { User } = require('../models');
const { getOrCreateGuestUser } = require('../utils/guestUser');

exports.getBudget = async (req, res) => {
  try {
    let userId;
    
    // If user is logged in, use their ID
    if (req.session && req.session.user && req.session.user.id) {
      userId = req.session.user.id;
    } else {
      // Otherwise, use guest user
      userId = await getOrCreateGuestUser();
      if (!userId) {
        return res.json({ monthlyBudget: 0, budgetSetDate: null });
      }
    }
    
    const user = await User.findByPk(userId, { attributes: ['monthlyBudget', 'budgetSetDate'] });
    if (!user) {
      return res.json({ monthlyBudget: 0, budgetSetDate: null });
    }
    return res.json({ 
      monthlyBudget: Number(user.monthlyBudget || 0),
      budgetSetDate: user.budgetSetDate
    });
  } catch (error) {
    console.error('Error getting budget:', error);
    return res.status(500).json({ message: 'Failed to fetch budget', error: error.message });
  }
};

exports.updateBudget = async (req, res) => {
  try {
    let userId;
    
    // If user is logged in, use their ID
    if (req.session && req.session.user && req.session.user.id) {
      userId = req.session.user.id;
    } else {
      // Otherwise, use guest user
      userId = await getOrCreateGuestUser();
      if (!userId) {
        return res.status(500).json({ message: 'Failed to update budget' });
      }
    }
    
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
    console.error('Error updating budget:', error);
    return res.status(500).json({ message: 'Failed to update budget', error: error.message });
  }
};

