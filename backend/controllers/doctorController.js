const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');

exports.getDoctors = async (req, res) => {
    try {
        const doctors = await Doctor.find();

        // If no doctors in DB, add some mock ones for the first run
        if (doctors.length === 0) {
            const mockDoctors = [
                { name: 'Dr. Priya Sharma', specialization: 'Cardiologist', rating: 4.9, experience: 12, fee: 500, about: 'Experienced cardiologist with over 12 years of practice.' },
                { name: 'Dr. Rajiv Menon', specialization: 'Neurologist', rating: 4.8, experience: 9, fee: 600, about: 'Specialist in neurological disorders and spine health.' },
                { name: 'Dr. Sunita Rao', specialization: 'Dermatologist', rating: 4.7, experience: 7, fee: 400, about: 'Expert in skin health, laser treatments, and allergy care.' },
                { name: 'Dr. Ananya Verma', specialization: 'Pediatrician', rating: 4.9, experience: 10, fee: 450, about: 'Trusted pediatrician for infant care and child wellness.' },
            ];
            await Doctor.insertMany(mockDoctors);
            const newDoctors = await Doctor.find();
            return res.status(200).json({ success: true, doctors: newDoctors });
        }

        res.status(200).json({ success: true, doctors });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching doctors', error: error.message });
    }
};

exports.bookAppointment = async (req, res) => {
    try {
        const { doctorId, date, time } = req.body;

        const appointment = new Appointment({
            user: req.user._id,
            doctor: doctorId,
            date: date || new Date(),
            time,
            status: 'Confirmed'
        });

        await appointment.save();

        res.status(201).json({ success: true, message: 'Appointment booked successfully', appointment });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error booking appointment', error: error.message });
    }
};

exports.getAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find({ user: req.user._id }).populate('doctor');
        res.status(200).json({ success: true, appointments });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching appointments', error: error.message });
    }
};
