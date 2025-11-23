require('dotenv').config();
const express = require('express');
const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const { sequelize, User } = require('./models');

const authRoutes = require('./routes/authRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const reportRoutes = require('./routes/reportRoutes');
const userRoutes = require('./routes/userRoutes');

const { isAuthenticated } = require('./middleware/authMiddleware');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'));

// View engine
app.set('view engine', 'ejs');
app.set('views', 'views');

// Session store
const sessionStore = new SequelizeStore({ db: sequelize });

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'supersecretkey',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Offline app → must be false
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// --------------------------------------
// AUTO-LOGIN USER MIDDLEWARE
// --------------------------------------
app.use(async (req, res, next) => {
  try {
    if (req.session.userId) {
      const user = await User.findByPk(req.session.userId);
      req.currentUser = user || null;
      res.locals.user = user || null;
    } else {
      req.currentUser = null;
      res.locals.user = null;
    }
  } catch (err) {
    console.error("Auto-login error:", err);
    req.currentUser = null;
    res.locals.user = null;
  }
  next();
});

// --------------------------------------
// ROUTES
// --------------------------------------
app.use('/', authRoutes); // auth/login/signup/logout

// Protected API routes
app.use('/api/expenses', isAuthenticated, expenseRoutes);
app.use('/api/reports', isAuthenticated, reportRoutes);
app.use('/api/users', isAuthenticated, userRoutes);

// Fallback error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', { message: 'Something broke!', error: err });
});

// --------------------------------------
// START SERVER
// --------------------------------------
const startServer = async () => {
  try {
    console.clear();

    await sequelize.authenticate();
    console.log('✅ DB connected');

    await sequelize.sync({ alter: false });
    console.log('✅ Database synced');

    await sessionStore.sync();
    console.log('✅ Session store synced');

    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Error starting server:', error.message);
    process.exit(1);
  }
};

startServer();
