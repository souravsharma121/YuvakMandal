// routes/weather.js
const express = require('express');
const router = express.Router();
const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config()

const API_KEY = process.env.WEATHER_API;
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

/**
 * @route   GET /api/loadweather/current
 * @desc    Get current weather by city name
 * @access  Public
 */

router.get('/current', async (req, res) => {
  try {
    const { q, lat, lon, units = 'metric' } = req.query;
    const params = { appid: API_KEY, units };
    
    // Add query parameters based on what was provided
    if (q) params.q = q;
    if (lat && lon) {
      params.lat = lat;
      params.lon = lon;
    }
    
    // If neither city name nor coordinates provided
    if (!q && (!lat || !lon)) {
      return res.status(400).json({ 
        message: 'Please provide either a city name (q) or coordinates (lat & lon)' 
      });
    }
    
    const response = await axios.get(`${BASE_URL}/weather`, { params });
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching current weather:', error.message);
    
    // Handle API-specific errors
    if (error.response) {
      const status = error.response.status;
      if (status === 404) {
        return res.status(404).json({ message: 'Location not found' });
      }
      return res.status(status).json({ message: error.response.data.message });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/loadweather/forecast
 * @desc    Get 5-day forecast by city name
 * @access  Public
 */
router.get('/forecast', async (req, res) => {
  try {
    const { q, lat, lon, units = 'metric' } = req.query;
    const params = { appid: API_KEY, units };
    
    // Add query parameters based on what was provided
    if (q) params.q = q;
    if (lat && lon) {
      params.lat = lat;
      params.lon = lon;
    }
    
    // If neither city name nor coordinates provided
    if (!q && (!lat || !lon)) {
      return res.status(400).json({ 
        message: 'Please provide either a city name (q) or coordinates (lat & lon)' 
      });
    }
    
    const response = await axios.get(`${BASE_URL}/forecast`, { params });
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching forecast:', error.message);
    
    // Handle API-specific errors
    if (error.response) {
      const status = error.response.status;
      if (status === 404) {
        return res.status(404).json({ message: 'Location not found' });
      }
      return res.status(status).json({ message: error.response.data.message });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/geocoding', async (req, res) => {
    try {
      const { q, limit = 5 } = req.query;
      
      if (!q) {
        return res.status(400).json({ 
          message: 'Please provide a search query (q)' 
        });
      }
      
      // OpenWeatherMap Geocoding API endpoint
      const geocodingUrl = 'http://api.openweathermap.org/geo/1.0/direct';
      
      const response = await axios.get(geocodingUrl, {
        params: {
          q,
          limit,
          appid: API_KEY
        }
      });
      
      res.json(response.data);
    } catch (error) {
      console.error('Error fetching location suggestions:', error.message);
      
      // Handle API-specific errors
      if (error.response) {
        const status = error.response.status;
        return res.status(status).json({ message: error.response.data.message || 'API error' });
      }
      
      res.status(500).json({ message: 'Failed to fetch location suggestions' });
    }
  });

module.exports = router;