const mongoose = require('mongoose');

const SubscriptionSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    plan: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan', required: true },
    membershipId: { type: String, unique: true },
    billingCycle: { type: String, enum: ['Monthly', 'Quarterly', 'Annual'], required: true },
    startDate: { type: Date, default: Date.now },
    expiryDate: { type: Date, required: true },
    visitsRemaining: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Subscription', SubscriptionSchema);
