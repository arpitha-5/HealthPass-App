import axios from 'axios';
import * as Location from 'expo-location';

// IMPORTANT: Replace this with your actual Google Maps API Key
const GOOGLE_PLACES_API_KEY = 'YOUR_GOOGLE_MAPS_API_KEY_HERE';

/**
 * Service to handle location and fetching nearby hospitals from Google Places API
 */
export const hospitalService = {
    /**
     * Request location permission and get current coordinates
     */
    getUserLocation: async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();

            if (status !== 'granted') {
                throw new Error('Location permission denied');
            }

            const location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced,
            });

            return {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
            };
        } catch (error) {
            console.error('Error getting location:', error);
            throw error;
        }
    },

    /**
     * Fetch nearby hospitals from Google Places API
     * @param {number} latitude 
     * @param {number} longitude 
     * @param {number} radius in meters (default 5000)
     */
    fetchNearbyHospitals: async (latitude, longitude, radius = 5000) => {
        try {
            // Check if API Key is placeholder
            if (GOOGLE_PLACES_API_KEY === 'YOUR_GOOGLE_MAPS_API_KEY_HERE') {
                console.warn('⚠️ Google Places API Key is missing. Using mock data.');
                return hospitalService.getMockHospitals(latitude, longitude);
            }

            const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&type=hospital&key=${GOOGLE_PLACES_API_KEY}`;

            const response = await axios.get(url);

            if (response.data.status === 'OK') {
                return response.data.results.map(place => ({
                    id: place.place_id,
                    name: place.name,
                    rating: place.rating || 0,
                    user_ratings_total: place.user_ratings_total || 0,
                    vicinity: place.vicinity || place.formatted_address,
                    address: place.vicinity || place.formatted_address,
                    latitude: place.geometry.location.lat,
                    longitude: place.geometry.location.lng,
                    isOpen: place.opening_hours ? place.opening_hours.open_now : true,
                    icon: place.icon,
                    photos: place.photos,
                    distance: hospitalService.calculateDistance(
                        latitude,
                        longitude,
                        place.geometry.location.lat,
                        place.geometry.location.lng
                    )
                }));
            } else if (response.data.status === 'ZERO_RESULTS') {
                return [];
            } else {
                // If denied or other error, return mock data to prevent app crash/blank screen
                console.error(`Google API Error (${response.data.status}). Falling back to mocks.`);
                return hospitalService.getMockHospitals(latitude, longitude);
            }
        } catch (error) {
            console.error('Error fetching hospitals, using fallback:', error.message);
            return hospitalService.getMockHospitals(latitude, longitude);
        }
    },

    /**
     * Mock data for demo purposes when API key is missing or invalid
     */
    getMockHospitals: (lat, lng) => {
        return [
            {
                id: 'mock-1',
                name: 'City Heart Multispecialty Hospital',
                rating: 4.8,
                vicinity: 'Sector 4, Near Metro Station',
                address: 'Sector 4, Near Metro Station',
                latitude: lat + 0.005,
                longitude: lng + 0.005,
                isOpen: true,
                distance: '0.8'
            },
            {
                id: 'mock-2',
                name: 'Divine Apollo Care Clinic',
                rating: 4.5,
                vicinity: 'East Wing Road',
                address: 'East Wing Road',
                latitude: lat - 0.008,
                longitude: lng + 0.003,
                isOpen: false,
                distance: '1.4'
            },
            {
                id: 'mock-3',
                name: 'Sanjeevani Childrens Hospital',
                rating: 4.2,
                vicinity: 'Park View Avenue',
                address: 'Park View Avenue',
                latitude: lat + 0.012,
                longitude: lng - 0.007,
                isOpen: true,
                distance: '2.5'
            },
            {
                id: 'mock-4',
                name: 'Metro Diagnostics & Lab',
                rating: 4.6,
                vicinity: 'Healthcare Hub, Gachibowli',
                address: 'Healthcare Hub, Gachibowli',
                latitude: lat - 0.002,
                longitude: lng - 0.01,
                isOpen: true,
                distance: '1.1'
            }
        ];
    },

    /**
     * Simple Haversine formula to calculate distance in KM
     */
    calculateDistance: (lat1, lon1, lat2, lon2) => {
        const R = 6371; // Radius of the earth in km
        const dLat = (lat2 - lat1) * (Math.PI / 180);
        const dLon = (lon2 - lon1) * (Math.PI / 180);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const d = R * c; // Distance in km
        return d.toFixed(1);
    }
};

export default hospitalService;
