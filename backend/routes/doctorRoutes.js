const express = require('express');
const router = express.Router();
const { getDoctors, bookAppointment, getAppointments } = require('../controllers/doctorController');
const auth = require('../middleware/authMiddleware');

router.get('/', auth, (req, res) => {
    // If called from /api/doctors/, return doctors
    // If called from /api/appointments/, return user's appointments
    if (req.originalUrl.includes('/api/doctors')) {
        return getDoctors(req, res);
    }
    return getAppointments(req, res);
});
router.post('/book', auth, bookAppointment);


module.exports = router;
