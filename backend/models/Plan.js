const mongoose = require('mongoose');

const PlanSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        enum: ['Basic', 'Gold', 'Platinum', 'Plus', 'Premium', 'Advanced', 'Enhanced']
    },
    memberCoverage: {
        type: Number,
        default: 1
    },
    freeDoctorVisits: {
        type: Number,
        default: 0
    },
    diagnosticsCoverage: {
        type: Number, // Percentage
        default: 0
    },
    accidentalCover: {
        type: Number,
        default: 0
    },
    walletCreditPercentage: {
        type: Number,
        default: 0
    },
    price: {
        monthly: Number,
        quarterly: Number,
        annual: Number
    },
    features: [String]
}, { timestamps: true });

module.exports = mongoose.model('Plan', PlanSchema);

