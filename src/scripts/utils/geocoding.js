const axios = require('axios');

const geocodeAddress = async (address) => {
  try {
    // Geocoding API
    const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
      params: {
        address,
        key: process.env.GMAPS_API,
      },
    });

    // Ambil hasil koordinat dari response API
    const { location } = response.data.results[0].geometry;

    return { lng: location.lng, lat: location.lat };
  } catch (error) {
    console.error('Error during geocoding:', error);
    throw new Error('Error during geocoding');
  }
};

module.exports = geocodeAddress;
