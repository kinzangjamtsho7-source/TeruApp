const { User } = require('../models');

exports.isAuthenticated = async (req, res, next) => {
  // Allow access without authentication - just set user to null if not logged in
  if (!req.session || !req.session.user) {
    res.locals.user = null;
    return next();
  }
  try {
    const user = await User.findByPk(req.session.user.id);
    if (!user) {
      req.session.destroy(() => {});
      res.locals.user = null;
      return next();
    }
    res.locals.user = req.session.user;
    return next();
  } catch (error) {
    res.locals.user = null;
    return next();
  }
};

exports.isAdmin = (req, res, next) => {
  if (!req.session || !req.session.user || req.session.user.role !== 'admin') {
    return res.status(403).render('error', {
      message: 'Access denied. Admins only.',
      error: new Error('Unauthorized')
    });
  }
  return next();
};

exports.isStudent = (req, res, next) => {
  if (!req.session || !req.session.user || req.session.user.role !== 'user') {
    return res.status(403).render('error', {
      message: 'Access denied. Users only.',
      error: new Error('Unauthorized')
    });
  }
  return next();
};


