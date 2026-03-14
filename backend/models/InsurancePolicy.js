const mongoose = require('mongoose');

const InsurancePolicySchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    provider: { type: String, required: true },
    policyNumber: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('InsurancePolicy', InsurancePolicySchema);
