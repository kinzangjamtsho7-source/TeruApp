require('dotenv').config();
const express = require('express');
const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const { sequelize, User } = require('./models');
const bcrypt = require('bcrypt');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const reportRoutes = require('./routes/reportRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'));

// View engine and views dir
app.set('view engine', 'ejs');
app.set('views', 'views');

// Session configuration
const sessionStore = new SequelizeStore({
  db: sequelize
});

app.use(session({
  secret: 'your-secret-key',
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Make user data available to all views
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

// Routes
app.use('/', authRoutes);
app.use('/admin', adminRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/users', userRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', {
    message: 'Something broke!',
    error: err
  });
});

const createDefaultAdmin = async () => {
  try {
    const existingAdmin = await User.findOne({ where: { email: process.env.ADMIN_EMAIL || 'admin@example.com' } });

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', 10);
      await User.create({
        fullName: 'Default Admin',
        email: process.env.ADMIN_EMAIL || 'admin@example.com',
        password: hashedPassword,
        role: 'admin',
        isVerified: true
      });
      console.log('✅ Default admin account created');
    } else {
      console.log('ℹ️ Admin already exists');
    }
  } catch (error) {
    console.error('❌ Error creating admin:', error);
  }
};

// Start server
async function startServer() {
  try {
    console.clear();
    
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ DB connected');

    // Sync all models with database
    // Using sync() without options will create tables if they don't exist
    // For development, you can use { alter: true } to modify existing tables
    // For production, use migrations instead
    await sequelize.sync({ force: false });
    console.log('✅ Database tables synced');
    
    // List all synced tables
    const tables = await sequelize.getQueryInterface().showAllTables();
    console.log('📊 Tables in database:', tables.length > 0 ? tables.join(', ') : 'No tables found');
    
    // Create session table
    await sessionStore.sync();
    console.log('✅ Session store synced');
    
    // Create default admin
    await createDefaultAdmin();
    
    // Start the server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Error starting server:', error.message);
    if (error.name === 'SequelizeConnectionError') {
      console.error('💡 Make sure PostgreSQL is running and the database exists.');
      console.error('💡 Create the database manually: CREATE DATABASE ' + (process.env.DB_NAME || 'college_feedback') + ';');
    } else if (error.name === 'SequelizeDatabaseError') {
      console.error('💡 Database error - check if the database "' + (process.env.DB_NAME || 'college_feedback') + '" exists.');
    }
    console.error('Full error:', error);
    process.exit(1);
  }
}

// Start the server
startServer();
