// src/weather/Weather.jsx
import React, { useState, useEffect } from 'react';
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
import { Line } from 'recharts';
// OpenWeatherMap API key
const API_KEY = "bf8213b41784caa2b76e64f12a552e7a";
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

const Weather = () => {
  const { t } = useTranslation();
  const [location, setLocation] = useState('');
  const [currentWeather, setCurrentWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('daily');
  const [userLocation, setUserLocation] = useState(null);

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
          // Default to a generic location if geolocation fails
          fetchWeatherData("New York");
        }
      );
    } else {
      // Geolocation not supported
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
      // Fetch current weather
      const currentRes = await axios.get(`${BASE_URL}/weather`, {
        params: {
          lat,
          lon,
          appid: API_KEY,
          units: 'metric'
        }
      });

      setCurrentWeather(currentRes.data);
      setLocation(currentRes.data.name);
      
      // Fetch 5-day forecast
      const forecastRes = await axios.get(`${BASE_URL}/forecast`, {
        params: {
          lat,
          lon,
          appid: API_KEY,
          units: 'metric'
        }
      });
      
      setForecast(forecastRes.data);
    } catch (err) {
      console.error('Error fetching weather data:', err);
      setError('Failed to fetch weather data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchWeatherData = async (searchLocation) => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch current weather
      const currentRes = await axios.get(`${BASE_URL}/weather`, {
        params: {
          q: searchLocation,
          appid: API_KEY,
          units: 'metric'
        }
      });

      setCurrentWeather(currentRes.data);
      
      // Fetch 5-day forecast
      const forecastRes = await axios.get(`${BASE_URL}/forecast`, {
        params: {
          q: searchLocation,
          appid: API_KEY,
          units: 'metric'
        }
      });
      
      setForecast(forecastRes.data);
    } catch (err) {
      console.error('Error fetching weather data:', err);
      setError('Location not found. Please check the city name and try again.');
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

  // Group forecast data by day
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

  // Get hourly forecast for today and tomorrow
  const getHourlyForecast = () => {
    if (!forecast) return [];
    
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Format dates for comparison
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

  // Group forecast data by month (averaging data per day)
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

  // Helper function to get weather icon
  const getWeatherIcon = (iconCode) => {
    const iconMap = {
      '01': <FaSun className="text-yellow-400" />,
      '02': <FaCloudSun className="text-yellow-300" />,
      '03': <FaCloud className="text-gray-400" />,
      '04': <FaCloud className="text-gray-500" />,
      '09': <FaCloudRain className="text-blue-400" />,
      '10': <FaCloudRain className="text-blue-500" />,
      '11': <FaBolt className="text-yellow-500" />,
      '13': <FaSnowflake className="text-blue-200" />,
      '50': <FaSmog className="text-gray-300" />
    };
    
    const prefix = iconCode.substring(0, 2);
    return iconMap[prefix] || <FaCloudSun />;
  };

  // Chart data for temperature trends
  const getChartData = () => {
    if (!forecast) return [];
    
    return forecast.list.slice(0, 8).map(item => ({
      time: new Date(item.dt * 1000).toLocaleTimeString('en-US', { hour: 'numeric', hour12: true }),
      temperature: Math.round(item.main.temp)
    }));
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-blue-700 p-6">
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center">
            <FaCloudSun className="mr-3" />
            {t('weatherForecast')}
          </h1>
          
          <form onSubmit={handleSubmit} className="mt-4 flex">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaMapMarkerAlt className="text-blue-300" />
              </div>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder={t('searchLocation')}
                className="block w-full pl-10 pr-4 py-2 border border-blue-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              className="bg-blue-800 text-white px-4 rounded-r-md hover:bg-blue-900 transition duration-150 ease-in-out flex items-center"
            >
              <FaSearch className="mr-2" />
              {t('search')}
            </button>
          </form>
        </div>
        
        {loading && (
          <div className="p-8 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
            <p className="mt-2 text-gray-600">{t('loadingWeather')}</p>
          </div>
        )}
        
        {error && (
          <div className="p-8 text-center">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              <p>{error}</p>
            </div>
          </div>
        )}
        
        {!loading && !error && currentWeather && (
          <>
            {/* Current Weather */}
            <div className="p-6 border-b">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="flex items-center">
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
                
                <div className="mt-4 md:mt-0 text-right">
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
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center text-blue-500 mb-2">
                    <FaWind className="mr-2" />
                    <span className="font-semibold">{t('wind')}</span>
                  </div>
                  <div className="text-xl font-bold">{currentWeather.wind.speed} m/s</div>
                  <div className="text-sm text-gray-500 flex items-center">
                    <FaCompass className="mr-1" />
                    {currentWeather.wind.deg}°
                  </div>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center text-blue-500 mb-2">
                    <FaTint className="mr-2" />
                    <span className="font-semibold">{t('humidity')}</span>
                  </div>
                  <div className="text-xl font-bold">{currentWeather.main.humidity}%</div>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center text-blue-500 mb-2">
                    <FaTemperatureHigh className="mr-2" />
                    <span className="font-semibold">{t('pressure')}</span>
                  </div>
                  <div className="text-xl font-bold">{currentWeather.main.pressure} hPa</div>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center text-blue-500 mb-2">
                    <FaSun className="mr-2" />
                    <span className="font-semibold">{t('visibility')}</span>
                  </div>
                  <div className="text-xl font-bold">{(currentWeather.visibility / 1000).toFixed(1)} km</div>
                </div>
              </div>
            </div>
            
            {/* Forecast Tabs */}
            <div className="p-6">
              <div className="flex border-b mb-4">
                <button
                  className={`py-2 px-4 font-medium ${activeTab === 'hourly' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-blue-500'}`}
                  onClick={() => setActiveTab('hourly')}
                >
                  {t('hourlyForecast')}
                </button>
                <button
                  className={`py-2 px-4 font-medium ${activeTab === 'daily' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-blue-500'}`}
                  onClick={() => setActiveTab('daily')}
                >
                  {t('dailyForecast')}
                </button>
                <button
                  className={`py-2 px-4 font-medium ${activeTab === 'monthly' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-blue-500'}`}
                  onClick={() => setActiveTab('monthly')}
                >
                  {t('monthlyForecast')}
                </button>
              </div>
              
              {/* Hourly Forecast */}
              {activeTab === 'hourly' && (
                <div>
                  <h3 className="text-xl font-semibold mb-4">{t('next24Hours')}</h3>
                  <div className="overflow-x-auto">
                    <div className="inline-flex space-x-4 min-w-full pb-2">
                      {getHourlyForecast().map((hour, index) => (
                        <div key={index} className="flex-shrink-0 w-24 text-center">
                          <div className="bg-blue-50 rounded-lg p-3">
                            <div className="text-sm font-medium text-gray-500">
                              {hour.day}, {hour.time}
                            </div>
                            <div className="text-3xl my-2 flex justify-center">
                              {getWeatherIcon(hour.icon)}
                            </div>
                            <div className="text-lg font-bold">{hour.temp}°C</div>
                            <div className="text-xs text-gray-500 capitalize mt-1">{hour.description}</div>
                            <div className="text-xs flex justify-between mt-2">
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
                      <div key={index} className="bg-white border rounded-lg shadow-sm overflow-hidden">
                        <div className="bg-blue-50 p-3 text-center border-b">
                          <div className="font-medium">{day.day}</div>
                          <div className="text-sm text-gray-500">{day.date}</div>
                        </div>
                        <div className="p-4">
                          <div className="text-4xl flex justify-center mb-2">
                            {getWeatherIcon(day.icon)}
                          </div>
                          <div className="text-center mb-3 capitalize">
                            <div className="text-sm font-medium">{day.description}</div>
                          </div>
                          <div className="flex justify-between text-sm">
                            <div>
                              <div className="font-semibold">{t('high')}</div>
                              <div className="text-lg font-bold text-red-500">{Math.round(day.highTemp)}°C</div>
                            </div>
                            <div>
                              <div className="font-semibold">{t('low')}</div>
                              <div className="text-lg font-bold text-blue-500">{Math.round(day.lowTemp)}°C</div>
                            </div>
                          </div>
                          <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                            <div className="flex items-center">
                              <FaTint className="text-blue-400 mr-1" />
                              <span>{day.avgHumidity}%</span>
                            </div>
                            <div className="flex items-center">
                              <FaWind className="text-blue-400 mr-1" />
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
                    <div className="p-4">
                      <p className="text-gray-600 mb-4">
                        {t('monthlyForecastDescription')}
                      </p>
                      {getMonthlyForecast().map((month, index) => (
                        <div key={index} className="mb-6 last:mb-0">
                          <h4 className="text-lg font-semibold border-b pb-2 mb-4">{month.month}</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-blue-50 p-4 rounded-lg">
                              <div className="text-center mb-3">
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
                            
                            <div className="bg-blue-50 p-4 rounded-lg">
                              <div className="text-center mb-3">
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
            
            {/* Temperature Trend Chart */}
            <div className="p-6 border-t">
              <h3 className="text-xl font-semibold mb-4">{t('temperatureTrend')}</h3>
              <div className="h-64 bg-white rounded-lg p-4 border">
                <div className="h-full w-full flex items-center justify-center">
                  {/* The actual chart would be implemented with recharts */}
                  <p className="text-gray-500 text-center">
                    {t('temperatureChartDescription')}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Weather Details */}
            <div className="p-6 border-t">
              <h3 className="text-xl font-semibold mb-4">{t('weatherDetails')}</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-600 mb-4">
                  {t('weatherDataSource')}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <h4 className="font-semibold text-blue-600 mb-2">{t('sunrise')}</h4>
                    <p className="text-xl font-bold">
                      {new Date(currentWeather.sys.sunrise * 1000).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                      })}
                    </p>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <h4 className="font-semibold text-blue-600 mb-2">{t('sunset')}</h4>
                    <p className="text-xl font-bold">
                      {new Date(currentWeather.sys.sunset * 1000).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                      })}
                    </p>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <h4 className="font-semibold text-blue-600 mb-2">{t('coordinates')}</h4>
                    <p className="text-lg">
                      {currentWeather.coord.lat.toFixed(2)}° N, {currentWeather.coord.lon.toFixed(2)}° E
                    </p>
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