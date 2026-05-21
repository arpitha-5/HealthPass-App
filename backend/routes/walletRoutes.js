const express = require('express');
const router = express.Router();
const { getWallet, applyWallet, topUpWallet } = require('../controllers/walletController');
const auth = require('../middleware/authMiddleware');

router.get('/', auth, getWallet);
router.post('/apply', auth, applyWallet);
router.post('/topup', auth, topUpWallet);

module.exports = router;
