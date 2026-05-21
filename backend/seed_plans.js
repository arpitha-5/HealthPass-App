const mongoose = require('mongoose');
require('dotenv').config();
const Plan = require('./models/Plan');

const seedPlans = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/healthpass');
        console.log('MongoDB connected');

        await Plan.deleteMany({}); // Clear existing

        const plans = [
            {
                name: 'Basic',
                memberCoverage: 1,
                freeDoctorVisits: 2,
                diagnosticsCoverage: 10,
                accidentalCover: 50000,
                walletCreditPercentage: 5,
                price: { monthly: 499, quarterly: 1299, annual: 4999 },
                features: ['2 Free Doctor Visits', '10% off Diagnostics', '50K Accidental Cover']
            },
            {
                name: 'Gold',
                memberCoverage: 2,
                freeDoctorVisits: 5,
                diagnosticsCoverage: 20,
                accidentalCover: 100000,
                walletCreditPercentage: 10,
                price: { monthly: 999, quarterly: 2799, annual: 9999 },
                features: ['5 Free Doctor Visits', '20% off Diagnostics', '1L Accidental Cover', 'Priority Support']
            },
            {
                name: 'Platinum',
                memberCoverage: 4,
                freeDoctorVisits: 12,
                diagnosticsCoverage: 30,
                accidentalCover: 300000,
                walletCreditPercentage: 15,
                price: { monthly: 1999, quarterly: 5499, annual: 19999 },
                features: ['Unlimited Doctor Visits', '30% off Diagnostics', '3L Accidental Cover', '24/7 Concierge']
            }
        ];

        await Plan.insertMany(plans);
        console.log('Plans seeded successfully!');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedPlans();
