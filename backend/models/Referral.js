const mongoose = require('mongoose');

const ReferralSchema = new mongoose.Schema({
    referrerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    referredPhone: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Completed'],
        default: 'Pending'
    },
    rewardAmount: {
        type: Number,
        default: 50
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Referral', ReferralSchema);
