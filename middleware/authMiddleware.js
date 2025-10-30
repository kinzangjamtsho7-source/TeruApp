const { User } = require('../models');

exports.isAuthenticated = async (req, res, next) => {
  if (!req.session || !req.session.user) {
    return res.redirect('/login');
  }
  try {
    const user = await User.findByPk(req.session.user.id);
    if (!user) {
      req.session.destroy(() => {});
      return res.redirect('/login');
    }
    res.locals.user = req.session.user;
    return next();
  } catch (error) {
    return res.status(500).render('error', {
      message: 'Authentication error',
      error
    });
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


