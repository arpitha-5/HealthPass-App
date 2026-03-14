const mongoose = require('mongoose');
const Plan = require('./models/Plan');
require('dotenv').config();

const plans = [
    {
        name: 'Basic',
        memberCoverage: 1,
        freeDoctorVisits: 2,
        diagnosticsCoverage: 10,
        accidentalCover: 50000,
        walletCreditPercentage: 5,
        price: { monthly: 99, quarterly: 249, annual: 999 },
        features: ['2 Free Consultations/month', '1 Lab Test/month', 'Health Records Storage', 'Emergency Helpline']
    },
    {
        name: 'Gold',
        memberCoverage: 4,
        freeDoctorVisits: 10,
        diagnosticsCoverage: 25,
        accidentalCover: 200000,
        walletCreditPercentage: 10,
        price: { monthly: 299, quarterly: 799, annual: 2999 },
        features: ['10 Free Consultations/month', '5 Lab Tests/month', 'Hospital Cashless (₹25,000)', '2 Ambulance Rides/year', 'Health Records Storage', 'Family Coverage (up to 4)']
    },
    {
        name: 'Platinum',
        memberCoverage: 6,
        freeDoctorVisits: 999, // unlimited
        diagnosticsCoverage: 50,
        accidentalCover: 500000,
        walletCreditPercentage: 15,
        price: { monthly: 599, quarterly: 1499, annual: 5999 },
        features: ['Unlimited Consultations', 'Unlimited Lab Tests', 'Hospital Cashless (₹1,00,000)', 'Unlimited Ambulance Rides', 'International OPD Coverage', 'Entire Family Coverage', 'Dedicated Health Manager']
    }
];

async function seed() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/healthpass');
        console.log('Connected to DB');

        await Plan.deleteMany({});
        console.log('Cleared existing plans');

        const createdPlans = await Plan.insertMany(plans);
        console.log('Seeded plans:', createdPlans.map(p => p.name));

        process.exit(0);
    } catch (err) {
        console.error('Seeding error:', err);
        process.exit(1);
    }
}

seed();
