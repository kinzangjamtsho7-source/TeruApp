const { User } = require('../models');

exports.isAuthenticated = async (req, res, next) => {
  // Check using userId instead of user
  if (!req.session || !req.session.userId) {
    res.locals.user = null;
    return res.status(401).json({ error: "Unauthorized. Please log in." });
  }

  try {
    const user = await User.findByPk(req.session.userId);

    if (!user) {
      req.session.destroy(() => {});
      res.locals.user = null;
      return res.status(401).json({ error: "Unauthorized. Please log in." });
    }

    // Set the logged-in user for other controllers
    req.currentUser = user;
    res.locals.user = user;

    next();
  } catch (error) {
    console.error("Auth check failed:", error);
    res.status(500).json({ error: "Authentication failed" });
  }
};
