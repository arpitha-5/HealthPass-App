const express = require('express');
const router = express.Router();
const { getBenefits } = require('../controllers/benefitsController');
const auth = require('../middleware/authMiddleware');

router.get('/', auth, getBenefits);

module.exports = router;
