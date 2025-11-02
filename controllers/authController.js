const { User } = require('../models');
const bcrypt = require('bcrypt');
const sendOtpEmail = require('../utils/sendOtp');

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

exports.getSignup = (req, res) => {
  res.render('auth/signup', { error: null });
};

exports.postSignup = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    // Validate input
    if (!fullName || !email || !password) {
      return res.status(400).render('auth/signup', { error: 'All fields are required' });
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).render('auth/signup', { error: 'Email already registered' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const otp = generateOtp();
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

    const user = await User.create({
      fullName,
      email,
      password: hashed,
      role: 'user',
      isVerified: false,
      otpCode: otp,
      otpExpiresAt
    });

    // Send OTP email (non-blocking - don't let email failures prevent signup)
    sendOtpEmail(email, otp).catch(err => {
      console.error('Failed to send OTP email (user can still verify manually):', err);
    });

    // Set session before redirect
    req.session.pendingEmail = email;
    console.log('✅ User created, OTP generated, redirecting to verify-otp for:', email);
    
    // Save session explicitly before redirect
    req.session.save((err) => {
      if (err) {
        console.error('Session save error:', err);
        return res.status(500).render('error', { message: 'Session error', error: err });
      }
      console.log('✅ Session saved, redirecting to /verify-otp');
      return res.redirect('/verify-otp');
    });
  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).render('auth/signup', { error: 'Signup failed. Please try again.' });
  }
};

exports.getVerifyOtp = (req, res) => {
  const email = req.session.pendingEmail;
  console.log('📧 GET /verify-otp - Pending email in session:', email || 'none');
  if (!email) {
    console.log('⚠️ No pending email in session, redirecting to signup');
    return res.redirect('/signup');
  }
  res.render('auth/verify-otp', { error: null });
};

exports.postVerifyOtp = async (req, res) => {
  try {
    const { otp } = req.body;
    const email = req.session.pendingEmail;
    if (!email) {
      return res.redirect('/signup');
    }

    const user = await User.findOne({ where: { email } });
    if (!user || !user.otpCode) {
      return res.status(400).render('auth/verify-otp', { error: 'Invalid session, sign up again' });
    }

    if (user.otpCode !== otp) {
      return res.status(400).render('auth/verify-otp', { error: 'Incorrect OTP' });
    }

    if (user.otpExpiresAt && user.otpExpiresAt < new Date()) {
      return res.status(400).render('auth/verify-otp', { error: 'OTP expired, sign up again' });
    }

    user.isVerified = true;
    user.otpCode = null;
    user.otpExpiresAt = null;
    await user.save();

    delete req.session.pendingEmail;
    return res.redirect('/login');
  } catch (error) {
    console.error('Verify OTP error:', error);
    return res.status(500).render('error', { message: 'OTP verification failed', error });
  }
};

exports.getLogin = (req, res) => {
  res.render('auth/login', { error: null });
};

exports.postLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).render('auth/login', { error: 'Invalid credentials' });
    }
    if (!user.isVerified) {
      req.session.pendingEmail = user.email;
      return res.redirect('/verify-otp');
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(400).render('auth/login', { error: 'Invalid credentials' });
    }

    req.session.user = {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role
    };
    return res.redirect('/home');
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).render('error', { message: 'Login failed', error });
  }
};

exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
};

// Auth middleware lives in middleware/authMiddleware.js
