const Hospital = require('../models/Hospital');

exports.getNearbyHospitals = async (req, res) => {
    try {
        const hospitals = await Hospital.find().limit(10);
        
        // If no hospitals, add some mocks
        if (hospitals.length === 0) {
            const mockHospitals = [
                { name: 'City Heart Hospital', type: 'Multi Specialty', rating: 4.8, location: { type: 'Point', coordinates: [72.8777, 19.0760] } },
                { name: 'Divine Apollo Clinic', type: 'Diagnostic Center', rating: 4.6, location: { type: 'Point', coordinates: [72.8800, 19.0800] } },
                { name: 'Sanjeevani Care', type: 'Pediatric Care', rating: 4.5, location: { type: 'Point', coordinates: [72.8700, 19.0700] } },
            ];
            await Hospital.insertMany(mockHospitals);
            const newHospitals = await Hospital.find();
            return res.status(200).json({ success: true, hospitals: newHospitals });
        }

        res.status(200).json({ success: true, hospitals });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching hospitals', error: error.message });
    }
};
