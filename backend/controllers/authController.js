const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');

// ===== UTILITY FUNCTIONS =====

const normalizePhoneNumber = (rawPhoneNumber) => {
    if (!rawPhoneNumber) {
        return null;
    }

    const trimmedPhoneNumber = String(rawPhoneNumber).trim();
    if (trimmedPhoneNumber.startsWith('+')) {
        return trimmedPhoneNumber;
    }

    const digitsOnly = trimmedPhoneNumber.replace(/\D/g, '');
    if (digitsOnly.length === 10) {
        return `+91${digitsOnly}`;
    }

    if (digitsOnly.length > 10) {
        return `+${digitsOnly}`;
    }

    return null;
};

const buildUserResponse = (user) => ({
    id: user._id,
    name: user.name,
    mobileNumber: user.mobileNumber,
    email: user.email,
    profilePicture: user.profilePicture,
    language: user.language,
    city: user.city,
    isVerified: user.isVerified,
    isProfileComplete: user.isProfileComplete,
    createdAt: user.createdAt,
});

const generateToken = (userId) => {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '30d' });
};

// ===== OTP VERIFICATION & ACCOUNT CREATION =====

/**
 * Complete Registration Process with User Details
 * Flow:
 * 1. Phone OTP verification (done on client, we just verify it's verified)
 * 2. Create/Update user with complete profile
 * 3. Save all user details dynamically
 * 4. Return token and user data for Dashboard redirect
 */
exports.completeSignup = async (req, res) => {
    try {
        const {
            phoneNumber,
            fullName,
            email,
            language = 'English',
            city,
            referralCode,
            // OTP info
            isPhoneVerified // boolean indicating if OTP was verified on client
        } = req.body;

        // Validate required fields
        if (!phoneNumber || !isPhoneVerified) {
            return res.status(400).json({
                success: false,
                message: 'Phone number verification is required.',
            });
        }

        if (!fullName || !fullName.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Full name is required.',
            });
        }

        // Normalize phone number
        const normalizedPhone = normalizePhoneNumber(phoneNumber);
        if (!normalizedPhone) {
            return res.status(400).json({
                success: false,
                message: 'Invalid phone number format.',
            });
        }

        // Normalize email
        const normalizedEmail = email ? email.trim().toLowerCase() : null;
        if (normalizedEmail && !normalizedEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email format.',
            });
        }

        // Check if user already exists
        let user = await User.findOne({ mobileNumber: normalizedPhone });
        let isNewUser = false;

        if (!user) {
            // Create new user
            user = new User({
                fullName: fullName.trim(),
                name: fullName.trim(),
                mobileNumber: normalizedPhone,
                email: normalizedEmail,
                language,
                city: city ? city.trim() : null,
                referralCode: referralCode ? referralCode.trim() : null,
                isVerified: true,
                isProfileComplete: false, // Will be completed after family setup
                passwordHash: null, // Phone-based auth, no password
            });
            isNewUser = true;
        } else {
            // Update existing user with new details
            user.fullName = fullName.trim();
            user.name = fullName.trim();
            if (normalizedEmail) user.email = normalizedEmail;
            if (language) user.language = language;
            if (city) user.city = city.trim();
            if (referralCode) user.referralCode = referralCode.trim();
            user.isVerified = true;
        }

        // Save user to database
        await user.save();
        console.log(`✅ ${isNewUser ? 'New' : 'Updated'} user saved:`, user._id);

        // Generate JWT token
        const token = generateToken(user._id);

        // Return response with redirect info
        return res.status(isNewUser ? 201 : 200).json({
            success: true,
            message: isNewUser ? 'Account created successfully!' : 'Login successful!',
            token,
            isNewUser,
            user: buildUserResponse(user),
            redirectTo: isNewUser ? '/family-setup' : '/dashboard', // Redirect path
        });

    } catch (error) {
        console.error('❌ Signup error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error during signup.',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
        });
    }
};

// ===== TRADITIONAL LOGIN WITH PHONE =====

const loginWithVerifiedPhone = async (req, res) => {
    try {
        const rawPhoneNumber = req.body.phoneNumber || req.body.mobileNumber;
        const phoneNumber = normalizePhoneNumber(rawPhoneNumber);
        const providedName = req.body.name ? String(req.body.name).trim() : '';
        const providedEmail = req.body.email ? String(req.body.email).trim().toLowerCase() : '';

        if (!phoneNumber) {
            return res.status(400).json({
                success: false,
                message: 'A valid phone number is required.',
            });
        }

        let user = await User.findOne({ mobileNumber: phoneNumber });
        let isNewUser = false;

        if (!user) {
            user = new User({
                fullName: providedName || 'HealthPass User',
                name: providedName || 'HealthPass User',
                mobileNumber: phoneNumber,
                email: providedEmail || undefined,
                passwordHash: null,
                isVerified: true,
            });
            isNewUser = true;
        } else {
            // Ensure fullName is set for schema compliance
            if (!user.fullName) {
                user.fullName = user.name || providedName || 'HealthPass User';
            }

            if (providedName && (user.name === 'HealthPass User' || !user.fullName)) {
                user.fullName = providedName;
                user.name = providedName;
            }

            if (providedEmail && !user.email) {
                user.email = providedEmail;
            }

            user.isVerified = true;
        }

        await user.save();

        const token = generateToken(user._id);

        return res.status(isNewUser ? 201 : 200).json({
            success: true,
            message: isNewUser ? 'Account created successfully.' : 'Login successful.',
            token,
            isNewUser,
            user: buildUserResponse(user),
        });
    } catch (error) {
        console.error('❌ Phone login error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error during authentication.',
            error: error.message,
        });
    }
};

// ===== VERIFY OTP (Backend verification if token is sent) =====

exports.verifyOTP = async (req, res) => {
    try {
        const { phoneNumber, otp } = req.body;

        if (!phoneNumber || !otp) {
            return res.status(400).json({
                success: false,
                message: 'Phone number and OTP are required.',
            });
        }

        // In a real implementation, verify OTP here
        // For now, we mark phone as verified
        return res.status(200).json({
            success: true,
            message: 'OTP verified successfully.',
            isVerified: true,
        });

    } catch (error) {
        console.error('❌ OTP verification error:', error);
        return res.status(500).json({
            success: false,
            message: 'Error verifying OTP.',
            error: error.message,
        });
    }
};

exports.signup = loginWithVerifiedPhone;
exports.login = loginWithVerifiedPhone;
