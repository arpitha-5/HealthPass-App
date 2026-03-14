const express = require('express');
const router = express.Router();
const { getNearbyHospitals } = require('../controllers/hospitalController');
const auth = require('../middleware/authMiddleware');

router.get('/nearby', auth, getNearbyHospitals);

module.exports = router;
