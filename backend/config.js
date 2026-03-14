const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('MongoDB connection error:', error.message);
        process.exit(1);
    }
};

module.exports = {
    connectDB,
    PORT: process.env.PORT || 5000,
    JWT_SECRET: process.env.JWT_SECRET || 'fallback_secret'
};
