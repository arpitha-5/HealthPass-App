const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    name: { type: String }, // Keep for compatibility
    mobileNumber: { type: String, required: true, unique: true },
    email: { type: String },
    passwordHash: { type: String, default: null },
    profilePicture: { type: String, default: null },
    avatar: { type: String, default: null }, // Match naming in request
    dob: { type: String, default: null },
    gender: { type: String, default: null },
    address: { type: String, default: null },
    emergencyContact: { type: String, default: null },
    isVerified: { type: Boolean, default: false },
    language: { type: String, default: 'English' },
    city: { type: String },
    referralCode: { type: String },
    isProfileComplete: { type: Boolean, default: false },
    walletBalance: { type: Number, default: 0 },
    currentSubscription: { type: mongoose.Schema.Types.ObjectId, ref: 'Subscription', default: null },
    familyMembers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'FamilyMember' }],
    insurancePolicies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'InsurancePolicy' }],
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', userSchema);
