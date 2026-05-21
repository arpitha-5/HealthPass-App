const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { connectDB, PORT } = require('./config');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const familyRoutes = require('./routes/familyRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const planRoutes = require('./routes/planRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const hospitalRoutes = require('./routes/hospitalRoutes');
const walletRoutes = require('./routes/walletRoutes');
const benefitsRoutes = require('./routes/benefitsRoutes');

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/account', userRoutes); // Added for mobile-app compatibility
app.use('/api/family', familyRoutes);
app.use('/api/account/family', familyRoutes); // Added for mobile-app compatibility
app.use('/api/payment', paymentRoutes);
app.use('/api/payments', paymentRoutes); // Added for mobile-app compatibility
app.use('/api/subscription', planRoutes);
app.use('/api/subscriptions', planRoutes); // Added for mobile-app compatibility
app.use('/api/plans', planRoutes); // Added for mobile-app compatibility
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', doctorRoutes);
app.use('/api/hospitals', hospitalRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/subscription/wallet', walletRoutes);
app.use('/api/benefits', benefitsRoutes);

// Dashboard route used directly by mobile app
app.get('/api/dashboard', require('./middleware/authMiddleware'), require('./controllers/userController').getDashboard);

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'HealthPass API is running',
    timestamp: new Date(),
  });
});

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`HealthPass Backend API running on http://localhost:${PORT}`);
  });
});

module.exports = app;
