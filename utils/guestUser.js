const { User } = require('../models');
const bcrypt = require('bcrypt');

// Helper function to get or create a guest user for anonymous operations
async function getOrCreateGuestUser() {
  try {
    // Try to find an existing guest user
    let guestUser = await User.findOne({ where: { email: 'guest@teeru.app' } });
    
    if (!guestUser) {
      // Hash a dummy password for the guest user (not used for authentication)
      const hashedPassword = await bcrypt.hash('guest', 10);
      
      // Create a guest user if it doesn't exist
      guestUser = await User.create({
        fullName: 'Guest User',
        email: 'guest@teeru.app',
        password: hashedPassword,
        role: 'user',
        isVerified: true,
        monthlyBudget: 0
      });
      console.log('✅ Guest user created for anonymous operations');
    }
    
    return guestUser.id;
  } catch (error) {
    console.error('Error getting/creating guest user:', error);
    // Fallback: return null and handle in controllers
    return null;
  }
}

module.exports = { getOrCreateGuestUser };

