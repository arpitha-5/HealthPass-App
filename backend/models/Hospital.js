const mongoose = require('mongoose');

const hospitalSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point',
            required: true
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            required: true
        }
    },
    rating: {
        type: Number,
        default: 0
    },
    services: {
        type: [String],
        default: []
    }
}, { timestamps: true });

// VERY IMPORTANT FOR GEOSPATIAL QUERIES (10km radius)
hospitalSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Hospital', hospitalSchema);
