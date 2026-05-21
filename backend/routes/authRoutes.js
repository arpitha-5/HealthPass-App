const express = require('express');
const router = express.Router();
const { signup, login, completeSignup, verifyOTP } = require('../controllers/authController');

// ===== AUTHENTICATION ROUTES =====

/**
 * POST /api/auth/signup
 * Legacy signup with phone number (creates user directly)
 * Body: { phoneNumber, name?, email? }
 */
router.post('/signup', signup);

/**
 * POST /api/auth/login
 * Phone-based login
 * Body: { phoneNumber, name?, email? }
 */
router.post('/login', login);

/**
 * POST /api/auth/complete-signup
 * Complete signup with full user details (NEW)
 * Flow: Phone OTP verification -> Save user & details -> Return token
 * Body: {
 *   phoneNumber: string (required),
 *   fullName: string (required),
 *   email?: string,
 *   language?: string (default: 'English'),
 *   city?: string,
 *   referralCode?: string,
 *   isPhoneVerified: boolean (required - means OTP was verified)
 * }
 */
router.post('/complete-signup', completeSignup);

/**
 * POST /api/auth/send-otp
 * Send OTP to phone number
 * Body: { mobile }
 */
router.post('/send-otp', require('../controllers/authController').sendOTP);

/**
 * POST /api/auth/verify-otp
 * Verify OTP for phone number
 * Body: { mobile, otp }
 */
router.post('/verify-otp', verifyOTP);

// ===== DEVELOPMENT/TESTING ROUTES =====
// Only enabled if NODE_ENV is 'development'
if (process.env.NODE_ENV !== 'production') {
  router.post('/test/login', async (req, res) => {
    // This endpoint allows testing without Firebase
    // Use this if you're having Firebase network issues
    console.log('🧪 Development test endpoint called');
    console.log('   Body:', req.body);

    try {
      const { phoneNumber, name } = req.body;

      if (!phoneNumber) {
        return res.status(400).json({
          success: false,
          message: 'Phone number is required',
        });
      }

      // Call the actual login handler
      const User = require('../models/User');
      const jwt = require('jsonwebtoken');
      const { JWT_SECRET } = require('../config');

      const normalizePhoneNumber = (rawPhoneNumber) => {
        if (!rawPhoneNumber) return null;
        const trimmedPhoneNumber = String(rawPhoneNumber).trim();
        if (trimmedPhoneNumber.startsWith('+')) return trimmedPhoneNumber;
        const digitsOnly = trimmedPhoneNumber.replace(/\D/g, '');
        if (digitsOnly.length === 10) return `+91${digitsOnly}`;
        if (digitsOnly.length > 10) return `+${digitsOnly}`;
        return null;
      };

      const normalizedPhone = normalizePhoneNumber(phoneNumber);

      if (!normalizedPhone) {
        return res.status(400).json({
          success: false,
          message: 'Invalid phone number format. Expected 10 digits.',
        });
      }

      // Check MongoDB connection
      console.log('   MongoDB Status: Connected');

      let user = await User.findOne({ mobileNumber: normalizedPhone });
      let isNewUser = false;

      if (!user) {
        user = new User({
          name: name || 'Test User',
          mobileNumber: normalizedPhone,
          isVerified: true,
        });
        isNewUser = true;
        console.log('   ✅ New user created');
      } else {
        console.log('   ✅ Existing user found');
      }

      await user.save();

      const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '30d' });

      return res.status(isNewUser ? 201 : 200).json({
        success: true,
        message: isNewUser ? 'Test user created' : 'Test login successful',
        token,
        isNewUser,
        user: {
          id: user._id,
          name: user.name,
          mobileNumber: user.mobileNumber,
          isVerified: user.isVerified,
          isProfileComplete: user.isProfileComplete,
        },
      });
    } catch (error) {
      console.error('❌ Test endpoint error:', error);
      return res.status(500).json({
        success: false,
        message: 'Test endpoint error: ' + error.message,
        error: error.message,
      });
    }
  });

  // Health check endpoint
  router.get('/test/health', (req, res) => {
    res.status(200).json({
      status: 'OK',
      message: 'Backend is running',
      timestamp: new Date().toISOString(),
    });
  });
}

module.exports = router;
