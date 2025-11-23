const { User } = require('../models');

// --------------------------------------
// Show Signup Page
// --------------------------------------
exports.getSignup = (req, res) => {
  res.render('auth/signup', { error: null });
};

// --------------------------------------
// Handle Signup
// --------------------------------------
exports.postSignup = async (req, res) => {
  try {
    const { username, password, profileName } = req.body;

    if (!username || !password) {
      return res.status(400).render("auth/signup", { error: "All fields are required" });
    }

    // Check if username already exists
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(400).render("auth/signup", { error: "Username already taken" });
    }

    // Create user (offline password - no hashing)
    await User.create({
      username,
      password,
      profileName: profileName || null,
      lastLogin: null
    });

    return res.redirect("/auth/login");
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).render("error", {
      message: "Signup failed",
      error
    });
  }
};

// --------------------------------------
// Show Login Page
// --------------------------------------
exports.getLogin = (req, res) => {
  res.render('auth/login', { error: null });
};

// --------------------------------------
// Handle Login
// --------------------------------------
exports.postLogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).render("auth/login", { error: "All fields are required" });
    }

    const user = await User.findOne({ where: { username } });

    // Offline login verification (plain text)
    if (!user || user.password !== password) {
      return res.status(400).render("auth/login", { error: "Invalid username or password" });
    }

    // Save session userId (IMPORTANT)
    req.session.userId = user.id;

    // Save last login time
    user.lastLogin = new Date();
    await user.save();

    return res.redirect("/home"); // Your dashboard page
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).render("error", {
      message: "Login failed",
      error
    });
  }
};

// --------------------------------------
// Logout
// --------------------------------------
exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect("/auth/login");
  });
};

// --------------------------------------
// Auto-login middleware (optional)
// --------------------------------------
exports.autoLogin = async (req, res, next) => {
  try {
    if (!req.session.userId) return next();

    const user = await User.findByPk(req.session.userId);
    if (!user) {
      req.session.destroy();
      return next();
    }

    req.currentUser = user;
    res.locals.user = user;
    next();
  } catch (err) {
    next(err);
  }
};
