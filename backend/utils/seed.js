const mongoose = require('mongoose');
const Plan = require('../models/Plan');
require('dotenv').config();

const plans = [
    {
        name: 'Basic',
        price: { monthly: 499, quarterly: 1299, annual: 3999 },
        opdVisits: 5,
        diagnosticDiscount: 10,
        teleconsultAccess: true,
        pharmacyDiscount: 5,
        insuranceCover: 'None',
        waitTime: 'Standard'
    },
    {
        name: 'Plus',
        price: { monthly: 999, quarterly: 2699, annual: 8999 },
        opdVisits: 15,
        diagnosticDiscount: 20,
        teleconsultAccess: true,
        pharmacyDiscount: 15,
        insuranceCover: 'Partial',
        waitTime: 'Priority'
    },
    {
        name: 'Premium',
        price: { monthly: 1999, quarterly: 5499, annual: 17999 },
        opdVisits: 50,
        diagnosticDiscount: 50,
        teleconsultAccess: true,
        pharmacyDiscount: 30,
        insuranceCover: 'Full',
        waitTime: 'Instant'
    }
];

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        await Plan.deleteMany({});
        await Plan.insertMany(plans);
        console.log('Database seeded with membership plans');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedDB();
