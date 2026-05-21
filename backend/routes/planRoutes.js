const express = require('express');
const router = express.Router();
const { getPlans, createSubscription, getPlanDetails, getActiveSubscription, cancelSubscription } = require('../controllers/planController');
const auth = require('../middleware/authMiddleware');

router.get('/', getPlans);
router.get('/active', auth, getActiveSubscription);
router.post('/cancel', auth, cancelSubscription);
router.get('/:planId', getPlanDetails);
router.post('/subscribe', auth, createSubscription);
router.post('/', auth, createSubscription);

module.exports = router;
