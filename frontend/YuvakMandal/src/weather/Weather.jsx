// src/weather/Weather.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FaTimes } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { 
  FaCloudSun, 
  FaMapMarkerAlt, 
  FaTemperatureHigh, 
  FaWind, 
  FaTint, 
  FaCompass,
  FaSearch,
  FaCloud,
  FaSun,
  FaCloudRain,
  FaSnowflake,
  FaBolt,
  FaSmog
} from 'react-icons/fa';
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const baseURL = import.meta.env.VITE_API_URL;
const API_BASE_URL = `${baseURL}/api/loadweather`;

const Weather = () => {
  const { t } = useTranslation();
  const [location, setLocation] = useState('');
  const [currentWeather, setCurrentWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('daily');
  const [userLocation, setUserLocation] = useState(null);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchTimeout = useRef(null);

  // Get user's location on component mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          fetchWeatherData("New York");
        }
      );
    } else {
      fetchWeatherData("New York");
    }
  }, []);

  // Fetch weather data when user location is obtained
  useEffect(() => {
    if (userLocation) {
      fetchWeatherByCoords(userLocation.lat, userLocation.lon);
    }
  }, [userLocation]);

  const fetchWeatherByCoords = async (lat, lon) => {
    setLoading(true);
    setError(null);
    
    try {
      const currentRes = await axios.get(`${API_BASE_URL}/current`, {
        params: { lat, lon, units: 'metric' }
      });

      setCurrentWeather(currentRes.data);
      setLocation(currentRes.data.name);
      
      const forecastRes = await axios.get(`${API_BASE_URL}/forecast`, {
        params: { lat, lon, units: 'metric' }
      });
      
      setForecast(forecastRes.data);
    } catch (err) {
      console.error('Error fetching weather data:', err);
      setError(err.response?.data?.message || 'Failed to fetch weather data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchWeatherData = async (searchLocation) => {
    setLoading(true);
    setError(null);
    
    try {
      const currentRes = await axios.get(`${API_BASE_URL}/current`, {
        params: { q: searchLocation, units: 'metric' }
      });

      setCurrentWeather(currentRes.data);
      
      const forecastRes = await axios.get(`${API_BASE_URL}/forecast`, {
        params: { q: searchLocation, units: 'metric' }
      });
      
      setForecast(forecastRes.data);
    } catch (err) {
      console.error('Error fetching weather data:', err);
      setError(err.response?.data?.message || 'Location not found. Please check the city name and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (location.trim()) {
      fetchWeatherData(location);
    }
  };

  const getDailyForecast = () => {
    if (!forecast) return [];
    
    const dailyData = {};
    
    forecast.list.forEach((item) => {
      const date = new Date(item.dt * 1000).toLocaleDateString();
      
      if (!dailyData[date]) {
        dailyData[date] = {
          date,
          day: new Date(item.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' }),
          temperatures: [],
          icon: item.weather[0].icon,
          description: item.weather[0].description,
          humidity: [],
          wind: []
        };
      }
      
      dailyData[date].temperatures.push(item.main.temp);
      dailyData[date].humidity.push(item.main.humidity);
      dailyData[date].wind.push(item.wind.speed);
    });
    
    return Object.values(dailyData).map(day => ({
      ...day,
      highTemp: Math.max(...day.temperatures),
      lowTemp: Math.min(...day.temperatures),
      avgHumidity: Math.round(day.humidity.reduce((a, b) => a + b, 0) / day.humidity.length),
      avgWind: (day.wind.reduce((a, b) => a + b, 0) / day.wind.length).toFixed(1)
    }));
  };

  const fetchLocationSuggestions = useCallback(async (query) => {
    if (!query || query.length < 1) {
      setSearchSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    
    try {
      const response = await axios.get(`${API_BASE_URL}/geocoding`, {
        params: { q: query, limit: 5 }
      });
      
      setSearchSuggestions(response.data);
      setShowSuggestions(true);
    } catch (err) {
      console.error('Error fetching location suggestions:', err);
      setSearchSuggestions([]);
    }
  }, []);

  const handleLocationInputChange = (e) => {
    const value = e.target.value;
    setLocation(value);
    
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }
    
    searchTimeout.current = setTimeout(() => {
      fetchLocationSuggestions(value);
    }, 300);
  };

  const handleSuggestionSelect = (suggestion) => {
    setLocation(`${suggestion.name}${suggestion.state ? `, ${suggestion.state}` : ''}, ${suggestion.country}`);
    setShowSuggestions(false);
    fetchWeatherByCoords(suggestion.lat, suggestion.lon);
  };

  const getHourlyForecast = () => {
    if (!forecast) return [];
    
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todayStr = now.toLocaleDateString();
    const tomorrowStr = tomorrow.toLocaleDateString();
    
    return forecast.list
      .filter((item) => {
        const itemDate = new Date(item.dt * 1000);
        const itemDateStr = itemDate.toLocaleDateString();
        return itemDateStr === todayStr || itemDateStr === tomorrowStr;
      })
      .map((item) => {
        const date = new Date(item.dt * 1000);
        return {
          time: date.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true }),
          temp: Math.round(item.main.temp),
          icon: item.weather[0].icon,
          description: item.weather[0].description,
          humidity: item.main.humidity,
          wind: item.wind.speed,
          date: date.toLocaleDateString(),
          day: date.toLocaleDateString('en-US', { weekday: 'short' })
        };
      });
  };

  const getMonthlyForecast = () => {
    if (!forecast) return [];
    
    const dailyData = getDailyForecast();
    const monthlyData = {};
    
    dailyData.forEach((day) => {
      const date = new Date(day.date);
      const monthYear = `${date.toLocaleDateString('en-US', { month: 'short' })} ${date.getFullYear()}`;
      
      if (!monthlyData[monthYear]) {
        monthlyData[monthYear] = {
          month: monthYear,
          days: [],
          highTemps: [],
          lowTemps: [],
          humidity: [],
          wind: []
        };
      }
      
      monthlyData[monthYear].days.push(day.day);
      monthlyData[monthYear].highTemps.push(day.highTemp);
      monthlyData[monthYear].lowTemps.push(day.lowTemp);
      monthlyData[monthYear].humidity.push(day.avgHumidity);
      monthlyData[monthYear].wind.push(parseFloat(day.avgWind));
    });
    
    return Object.values(monthlyData).map(month => ({
      ...month,
      avgHighTemp: Math.round(month.highTemps.reduce((a, b) => a + b, 0) / month.highTemps.length),
      avgLowTemp: Math.round(month.lowTemps.reduce((a, b) => a + b, 0) / month.lowTemps.length),
      avgHumidity: Math.round(month.humidity.reduce((a, b) => a + b, 0) / month.humidity.length),
      avgWind: (month.wind.reduce((a, b) => a + b, 0) / month.wind.length).toFixed(1)
    }));
  };

  const getWeatherIcon = (iconCode) => {
    const iconMap = {
      '01': <FaSun className="text-yellow-400" size={24} />,
      '02': <FaCloudSun className="text-yellow-300" size={24} />,
      '03': <FaCloud className="text-gray-400" size={24} />,
      '04': <FaCloud className="text-gray-500" size={24} />,
      '09': <FaCloudRain className="text-blue-400" size={24} />,
      '10': <FaCloudRain className="text-blue-500" size={24} />,
      '11': <FaBolt className="text-yellow-500" size={24} />,
      '13': <FaSnowflake className="text-blue-200" size={24} />,
      '50': <FaSmog className="text-gray-300" size={24} />
    };
    
    const prefix = iconCode.substring(0, 2);
    return iconMap[prefix] || <FaCloudSun size={24} />;
  };

  const getChartData = () => {
    if (!forecast) return [];
    
    return forecast.list.slice(0, 8).map(item => ({
      time: new Date(item.dt * 1000).toLocaleTimeString('en-US', { hour: 'numeric', hour12: true }),
      temperature: Math.round(item.main.temp)
    }));
  };

  // Gradient colors based on weather condition
  const getBackgroundGradient = () => {
    if (!currentWeather) return 'from-blue-500 to-blue-700';
    
    const weatherId = currentWeather.weather[0].id;
    
    if (weatherId >= 200 && weatherId < 300) {
      return 'from-gray-700 to-gray-900'; // Thunderstorm
    } else if (weatherId >= 300 && weatherId < 500) {
      return 'from-blue-400 to-blue-600'; // Drizzle
    } else if (weatherId >= 500 && weatherId < 600) {
      return 'from-blue-600 to-blue-800'; // Rain
    } else if (weatherId >= 600 && weatherId < 700) {
      return 'from-blue-200 to-blue-400'; // Snow
    } else if (weatherId >= 700 && weatherId < 800) {
      return 'from-gray-400 to-gray-600'; // Atmosphere (fog, mist, etc.)
    } else if (weatherId === 800) {
      return 'from-yellow-400 to-orange-500'; // Clear
    } else if (weatherId > 800) {
      return 'from-blue-300 to-blue-500'; // Clouds
    }
    
    return 'from-blue-500 to-blue-700'; // Default
  };

  return (
    <div className="container mx-auto px-0 sm:px-4 py-0 sm:py-8 max-w-6xl w-full">
      {/* Main Weather Card */}
      <div className="bg-white rounded-none sm:rounded-lg shadow-lg overflow-hidden">
        {/* Header with Search */}
        <div className={`bg-gradient-to-r ${getBackgroundGradient()} p-6`}>
          <div className="max-w-6xl mx-auto">
            <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center">
              <FaCloudSun className="mr-3" />
              {t('weatherForecast')}
            </h1>
            
            <form onSubmit={handleSubmit} className="mt-4 flex relative">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaMapMarkerAlt className="text-blue-200" />
                </div>
                <input
                  type="text"
                  value={location}
                  onChange={handleLocationInputChange}
                  onFocus={() => location && setShowSuggestions(true)}
                  placeholder={t('searchLocation')}
                  className="block w-full pl-10 pr-4 py-3 border border-blue-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {location && (
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => {
                      setLocation('');
                      setSearchSuggestions([]);
                      setShowSuggestions(false);
                    }}
                  >
                    <FaTimes className="text-gray-400 hover:text-gray-600" />
                  </button>
                )}
              </div>
              <button
                type="submit"
                className="bg-blue-800 hover:bg-blue-900 text-white px-4 py-3 rounded-r-lg transition duration-200 ease-in-out flex items-center"
              >
                <FaSearch className="mr-2" />
                <span className="hidden sm:inline">{t('search')}</span>
              </button>
              
              {/* Location suggestions dropdown */}
              {showSuggestions && searchSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-10">
                  <ul className="max-h-60 overflow-auto">
                    {searchSuggestions.map((suggestion, index) => (
                      <li
                        key={`${suggestion.name}-${index}`}
                        className="px-4 py-3 hover:bg-blue-50 cursor-pointer flex items-center border-b border-gray-100 last:border-b-0 transition-colors duration-150"
                        onClick={() => handleSuggestionSelect(suggestion)}
                      >
                        <FaMapMarkerAlt className="text-blue-500 mr-3 flex-shrink-0" />
                        <div className="min-w-0">
                          <div className="font-medium text-gray-800 truncate">
                            {suggestion.name}
                            {suggestion.state && `, ${suggestion.state}`}
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            {suggestion.country} ({suggestion.lat.toFixed(2)}, {suggestion.lon.toFixed(2)})
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </form>
          </div>
        </div>
        
        {/* Loading State */}
        {loading && (
          <div className="p-8 text-center">
            <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
            <p className="mt-3 text-gray-600">{t('loadingWeather')}</p>
          </div>
        )}
        
        {/* Error State */}
        {error && (
          <div className="p-6 text-center">
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded">
              <div className="flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="font-medium">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Weather Data */}
        {!loading && !error && currentWeather && (
          <>
            {/* Current Weather */}
            <div className="p-6 border-b">
              <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center mb-4 md:mb-0">
                    <div className="text-5xl mr-4">
                      {getWeatherIcon(currentWeather.weather[0].icon)}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800">
                        {currentWeather.name}, {currentWeather.sys.country}
                      </h2>
                      <p className="text-gray-600 capitalize">
                        {currentWeather.weather[0].description}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date().toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-center md:text-right">
                    <div className="text-5xl font-bold text-gray-800">
                      {Math.round(currentWeather.main.temp)}°C
                    </div>
                    <div className="text-gray-600">
                      {t('feelsLike')}: {Math.round(currentWeather.main.feels_like)}°C
                    </div>
                    <div className="text-sm text-gray-500">
                      {t('highTemp')}: {Math.round(currentWeather.main.temp_max)}°C | {t('lowTemp')}: {Math.round(currentWeather.main.temp_min)}°C
                    </div>
                  </div>
                </div>
                
                {/* Weather Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg shadow-sm">
                    <div className="flex items-center text-blue-600 mb-2">
                      <FaWind className="mr-2" />
                      <span className="font-semibold">{t('wind')}</span>
                    </div>
                    <div className="text-xl font-bold">{currentWeather.wind.speed} m/s</div>
                    <div className="text-sm text-gray-600 flex items-center">
                      <FaCompass className="mr-1" />
                      {currentWeather.wind.deg}°
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg shadow-sm">
                    <div className="flex items-center text-blue-600 mb-2">
                      <FaTint className="mr-2" />
                      <span className="font-semibold">{t('humidity')}</span>
                    </div>
                    <div className="text-xl font-bold">{currentWeather.main.humidity}%</div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg shadow-sm">
                    <div className="flex items-center text-blue-600 mb-2">
                      <FaTemperatureHigh className="mr-2" />
                      <span className="font-semibold">{t('pressure')}</span>
                    </div>
                    <div className="text-xl font-bold">{currentWeather.main.pressure} hPa</div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg shadow-sm">
                    <div className="flex items-center text-blue-600 mb-2">
                      <FaSun className="mr-2" />
                      <span className="font-semibold">{t('visibility')}</span>
                    </div>
                    <div className="text-xl font-bold">{(currentWeather.visibility / 1000).toFixed(1)} km</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Forecast Tabs */}
            <div className="p-6">
              <div className="max-w-6xl mx-auto">
                <div className="flex overflow-x-auto border-b mb-6 scrollbar-hide">
                  <button
                    className={`py-3 px-6 font-medium whitespace-nowrap ${activeTab === 'hourly' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-blue-500'}`}
                    onClick={() => setActiveTab('hourly')}
                  >
                    {t('hourlyForecast')}
                  </button>
                  <button
                    className={`py-3 px-6 font-medium whitespace-nowrap ${activeTab === 'daily' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-blue-500'}`}
                    onClick={() => setActiveTab('daily')}
                  >
                    {t('dailyForecast')}
                  </button>
                  <button
                    className={`py-3 px-6 font-medium whitespace-nowrap ${activeTab === 'monthly' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-blue-500'}`}
                    onClick={() => setActiveTab('monthly')}
                  >
                    {t('monthlyForecast')}
                  </button>
                </div>
                
                {/* Hourly Forecast */}
                {activeTab === 'hourly' && (
                  <div>
                    <h3 className="text-xl font-semibold mb-4">{t('next24Hours')}</h3>
                    <div className="overflow-x-auto pb-4">
                      <div className="inline-flex space-x-4 min-w-full pb-2">
                        {getHourlyForecast().map((hour, index) => (
                          <div key={index} className="flex-shrink-0 w-28">
                            <div className="bg-gradient-to-b from-blue-50 to-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
                              <div className="text-sm font-medium text-gray-500 text-center">
                                {hour.day}, {hour.time}
                              </div>
                              <div className="text-3xl my-3 flex justify-center">
                                {getWeatherIcon(hour.icon)}
                              </div>
                              <div className="text-lg font-bold text-center">{hour.temp}°C</div>
                              <div className="text-xs text-gray-500 capitalize mt-1 text-center">{hour.description}</div>
                              <div className="text-xs flex justify-between mt-3">
                                <span className="flex items-center">
                                  <FaTint className="text-blue-400 mr-1" size={10} />
                                  {hour.humidity}%
                                </span>
                                <span className="flex items-center">
                                  <FaWind className="text-blue-400 mr-1" size={10} />
                                  {hour.wind}m/s
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Daily Forecast */}
                {activeTab === 'daily' && (
                  <div>
                    <h3 className="text-xl font-semibold mb-4">{t('next5Days')}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                      {getDailyForecast().map((day, index) => (
                        <div key={index} className="bg-white border rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200">
                          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-3 text-center border-b">
                            <div className="font-medium">{day.day}</div>
                            <div className="text-sm text-gray-500">{day.date}</div>
                          </div>
                          <div className="p-4">
                            <div className="text-4xl flex justify-center mb-3">
                              {getWeatherIcon(day.icon)}
                            </div>
                            <div className="text-center mb-4 capitalize">
                              <div className="text-sm font-medium">{day.description}</div>
                            </div>
                            <div className="flex justify-between text-sm mb-4">
                              <div>
                                <div className="font-semibold">{t('high')}</div>
                                <div className="text-lg font-bold text-red-500">{Math.round(day.highTemp)}°C</div>
                              </div>
                              <div>
                                <div className="font-semibold">{t('low')}</div>
                                <div className="text-lg font-bold text-blue-500">{Math.round(day.lowTemp)}°C</div>
                              </div>
                            </div>
                            <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                              <div className="flex items-center text-gray-600">
                                <FaTint className="text-blue-400 mr-2" />
                                <span>{day.avgHumidity}%</span>
                              </div>
                              <div className="flex items-center text-gray-600">
                                <FaWind className="text-blue-400 mr-2" />
                                <span>{day.avgWind} m/s</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Monthly Forecast */}
                {activeTab === 'monthly' && (
                  <div>
                    <h3 className="text-xl font-semibold mb-4">{t('monthlyOutlook')}</h3>
                    <div className="bg-white border rounded-lg shadow-sm overflow-hidden mb-4">
                      <div className="p-6">
                        <p className="text-gray-600 mb-6">
                          {t('monthlyForecastDescription')}
                        </p>
                        {getMonthlyForecast().map((month, index) => (
                          <div key={index} className="mb-8 last:mb-0">
                            <h4 className="text-lg font-semibold border-b pb-3 mb-4">{month.month}</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg shadow-sm">
                                <div className="text-center mb-4">
                                  <div className="text-lg font-semibold text-gray-800">{t('temperatureOutlook')}</div>
                                </div>
                                <div className="flex justify-around">
                                  <div className="text-center">
                                    <div className="text-sm text-gray-600">{t('avgHigh')}</div>
                                    <div className="text-xl font-bold text-red-500">{month.avgHighTemp}°C</div>
                                  </div>
                                  <div className="text-center">
                                    <div className="text-sm text-gray-600">{t('avgLow')}</div>
                                    <div className="text-xl font-bold text-blue-500">{month.avgLowTemp}°C</div>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg shadow-sm">
                                <div className="text-center mb-4">
                                  <div className="text-lg font-semibold text-gray-800">{t('precipitationOutlook')}</div>
                                </div>
                                <div className="flex justify-around">
                                  <div className="text-center">
                                    <div className="text-sm text-gray-600">{t('avgHumidity')}</div>
                                    <div className="text-xl font-bold text-blue-400">{month.avgHumidity}%</div>
                                  </div>
                                  <div className="text-center">
                                    <div className="text-sm text-gray-600">{t('avgWind')}</div>
                                    <div className="text-xl font-bold text-blue-400">{month.avgWind} m/s</div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Temperature Trend Chart */}
            <div className="p-6 border-t bg-gray-50">
              <div className="max-w-6xl mx-auto">
                <h3 className="text-xl font-semibold mb-4">{t('temperatureTrend')}</h3>
                <div className="h-64 bg-white rounded-lg p-4 border shadow-sm">
                  <div className="h-full w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={getChartData()}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                        <XAxis 
                          dataKey="time" 
                          tick={{ fill: '#6b7280' }}
                          axisLine={{ stroke: '#e5e7eb' }}
                        />
                        <YAxis 
                          label={{ 
                            value: '°C', 
                            angle: -90, 
                            position: 'insideLeft',
                            fill: '#6b7280'
                          }}
                          tick={{ fill: '#6b7280' }}
                          axisLine={{ stroke: '#e5e7eb' }}
                        />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: '#fff',
                            border: '1px solid #e5e7eb',
                            borderRadius: '0.5rem',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                          }}
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="temperature"
                          stroke="#4f46e5"
                          strokeWidth={2}
                          activeDot={{ r: 8 }}
                          name={t('temperature')}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Weather Details */}
            <div className="p-6 border-t">
              <div className="max-w-6xl mx-auto">
                <h3 className="text-xl font-semibold mb-4">{t('weatherDetails')}</h3>
                <div className="bg-gray-50 rounded-lg p-6 shadow-sm">
                  <p className="text-gray-600 mb-6">
                    {t('weatherDataSource')}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                      <h4 className="font-semibold text-blue-600 mb-2">{t('sunrise')}</h4>
                      <p className="text-xl font-bold">
                        {new Date(currentWeather.sys.sunrise * 1000).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true
                        })}
                      </p>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                      <h4 className="font-semibold text-blue-600 mb-2">{t('sunset')}</h4>
                      <p className="text-xl font-bold">
                        {new Date(currentWeather.sys.sunset * 1000).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true
                        })}
                      </p>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                      <h4 className="font-semibold text-blue-600 mb-2">{t('coordinates')}</h4>
                      <p className="text-lg">
                        {currentWeather.coord.lat.toFixed(2)}° N, {currentWeather.coord.lon.toFixed(2)}° E
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Weather;