const express = require('express');
const router = express.Router();
const { getPlans, createSubscription } = require('../controllers/planController');
const auth = require('../middleware/authMiddleware');

router.get('/', getPlans);
router.post('/subscribe', auth, createSubscription);

module.exports = router;
