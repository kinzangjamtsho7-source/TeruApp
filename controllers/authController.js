const { User } = require('../models');

exports.getVerifyOtp = (req, res) => {
  const email = req.session.pendingEmail;
  console.log('📧 GET /verify-otp - Pending email in session:', email || 'none');
  if (!email) {
    console.log('⚠️ No pending email in session');
    return res.status(400).render('error', { 
      message: 'No pending verification session',
      error: new Error('Verification session expired or invalid')
    });
  }
  res.render('auth/verify-otp', { error: null });
};

exports.postVerifyOtp = async (req, res) => {
  try {
    const { otp } = req.body;
    const email = req.session.pendingEmail;
    if (!email) {
      return res.status(400).render('error', {
        message: 'No pending verification session',
        error: new Error('Verification session expired or invalid')
      });
    }

    const user = await User.findOne({ where: { email } });
    if (!user || !user.otpCode) {
      return res.status(400).render('auth/verify-otp', { error: 'Invalid session' });
    }

    if (user.otpCode !== otp) {
      return res.status(400).render('auth/verify-otp', { error: 'Incorrect OTP' });
    }

    if (user.otpExpiresAt && user.otpExpiresAt < new Date()) {
      return res.status(400).render('auth/verify-otp', { error: 'OTP expired' });
    }

    user.isVerified = true;
    user.otpCode = null;
    user.otpExpiresAt = null;
    await user.save();

    delete req.session.pendingEmail;
    // Redirect to login page after successful verification
    return res.redirect('/admin');
  } catch (error) {
    console.error('Verify OTP error:', error);
    return res.status(500).render('error', { message: 'OTP verification failed', error });
  }
};

exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/home');
  });
};

// Auth middleware lives in middleware/authMiddleware.js
