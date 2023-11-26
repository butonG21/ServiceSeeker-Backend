const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const geocodeAddress = async (address) => {
  try {
    const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
      params: {
        address,
        key: process.env.GMAPS_API,
      },
    });

    const { data } = response;

    if (data.results.length > 0) {
      const { location } = data.results[0].geometry;
      return { longitude: location.lng, latitude: location.lat };
    }

    return null;
  } catch (error) {
    console.error('Error during geocoding:', error);
    return null;
  }
};

module.exports = geocodeAddress;
