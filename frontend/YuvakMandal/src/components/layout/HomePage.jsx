import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useEvent } from '../../context/EventContext';
import { useAuth } from '../../context/AuthContext';
import AlertContext from '../../context/AlertContext';
import splashLogo from '../../assets/splashlogo.jpg';
import imageall from '../../assets/imageall.png';
import { CalendarIcon, MapPinIcon, UsersIcon, SparklesIcon, Bars3Icon, XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import ManageContributions from '../contributions/ManageContributions';

const HomePage = () => {
  const navigate = useNavigate();
  const { events, getEvents } = useEvent();
  const { user, guestLogin, logout, isAuthenticated } = useAuth();
  const { setAlert } = useContext(AlertContext);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [coreTeam, setCoreTeam] = useState({});
  const [galleryItems, setGalleryItems] = useState([]);
  const [selectedInitiative, setSelectedInitiative] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [initiativeIndex, setInitiativeIndex] = useState(0);
  const [isInitiativePaused, setIsInitiativePaused] = useState(false);
  const baseURL = import.meta.env.VITE_API_URL;

  // Auto-login as guest if not authenticated
  useEffect(() => {
    if (!isAuthenticated && !user?.isGuest) {
      guestLogin();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    // Fetch events for the home page
    getEvents({ status: 'all', type: 'all', page: 1 });
    // Fetch team members and gallery
    fetchTeamMembers();
    fetchGalleryItems();
  }, []);

  const fetchGalleryItems = async () => {
    try {
      const response = await axios.get(`${baseURL}/api/gallery`);
      setGalleryItems(response.data);
    } catch (error) {
      console.error('Error fetching gallery items:', error);
    }
  };

  // If URL contains ?initiative=<id> open that initiative on load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const initiativeId = params.get('initiative');
    if (initiativeId) {
      (async () => {
        try {
          const res = await axios.get(`${baseURL}/api/gallery/${initiativeId}`);
          if (res?.data) {
            setSelectedInitiative(res.data);
            setSelectedImageIndex(0);
          }
        } catch (err) {
          // silently fail
          console.error('Failed to load shared initiative', err);
        }
      })();
    }
  }, []);

  const fetchTeamMembers = async () => {
    try {
      const response = await axios.get(`${baseURL}/api/users`);
      const users = response.data;
      
      // Extract core team members
      const pradhan = users.find(u => u.role === 'Pradhan');
      const upPradhan = users.find(u => u.role === 'Up Pradhan');
      const secretary = users.find(u => u.role === 'Secretary');
      const treasurer = users.find(u => u.role === 'Treasurer');
      const chiefAdvisor = users.find(u => u.role === 'Chief Advisor');
      
      setCoreTeam({
        pradhan: pradhan || {},
        upPradhan: upPradhan || {},
        secretary: secretary || {},
        treasurer: treasurer || {},
        chiefAdvisor: chiefAdvisor || {}
      });
      
      // Set all members
      setTeamMembers(users);
    } catch (error) {
      console.error('Error fetching team members:', error);
    }
  };

  useEffect(() => {
    // Filter upcoming and completed events
    if (events && events.length > 0) {
      const upcoming = events.filter(event => event.status === 'Upcoming').slice(0, 6);
      setUpcomingEvents(upcoming);
    }
  }, [events]);

  // Auto-rotate carousel in modal
  useEffect(() => {
    if (!selectedInitiative || !selectedInitiative.images || selectedInitiative.images.length <= 1) {
      return;
    }

    const interval = setInterval(() => {
      setSelectedImageIndex((prev) => (prev + 1) % selectedInitiative.images.length);
    }, 4000); // Change image every 4 seconds

    return () => clearInterval(interval);
  }, [selectedInitiative]);

  // Auto-advance initiatives carousel every 1.5s (pause on hover/focus)
  useEffect(() => {
    const count = galleryItems.slice(0, 6).length;
    if (count <= 1) return;
    if (isInitiativePaused) return;

    const timer = setInterval(() => {
      setInitiativeIndex((prev) => (prev + 1) % count);
    }, 1500);

    return () => clearInterval(timer);
  }, [galleryItems, isInitiativePaused]);

  // Prevent background scroll when initiative modal is open
  useEffect(() => {
    if (selectedInitiative) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    // cleanup on unmount
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [selectedInitiative]);

  // Helpers to open/close initiatives and create share links
  const openInitiative = (item) => {
    setSelectedInitiative(item);
    setSelectedImageIndex(0);
    try {
      const params = new URLSearchParams(window.location.search);
      params.set('initiative', item._id);
      window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
    } catch (e) {
      // ignore
    }
  };

  const closeInitiative = () => {
    setSelectedInitiative(null);
    try {
      const params = new URLSearchParams(window.location.search);
      params.delete('initiative');
      const qs = params.toString();
      window.history.replaceState({}, '', `${window.location.pathname}${qs ? `?${qs}` : ''}`);
    } catch (e) {
      // ignore
    }
  };

  const getShareUrl = (id) => `${window.location.origin}${window.location.pathname}?initiative=${id}`;

  const handleShare = async (item) => {
    const url = getShareUrl(item._id);
    try {
      if (navigator.share) {
        await navigator.share({ title: item.title || 'Initiative', url });
        setAlert({ type: 'success', message: 'Shared successfully' });
        return;
      }
    } catch (err) {
      // share cancelled or failed, fallback to copy
      console.warn('Web Share failed', err);
    }

    try {
      await navigator.clipboard.writeText(url);
      setAlert({ type: 'success', message: 'Link copied to clipboard' });
    } catch (err) {
      console.error('Copy failed', err);
      setAlert({ type: 'error', message: 'Unable to copy link' });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Bar */}
      <nav className="fixed top-0 w-full bg-white shadow-md z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20 gap-2">
            {/* Logo and Title */}
            <div className="flex items-center space-x-2 md:space-x-3 flex-shrink-0">
              <img src={splashLogo} alt="Mandal Logo" className="w-10 md:w-12 h-10 md:h-12 rounded-full object-cover" />
              <div className="flex flex-col min-w-0">
                <h1 className="text-sm md:text-xl font-bold text-indigo-600 truncate">Jai Dev Balatika</h1>
                <p className="text-xs text-gray-600 truncate">Shegal Yuvak Mandal</p>
              </div>
            </div>

            {/* Right Side - Navigation and Auth */}
            <div className="flex items-center space-x-4 md:space-x-6">
              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-6">
                <a href="#events" className="text-gray-700 hover:text-indigo-600 font-medium transition">Events</a>
                <a href="#about" className="text-gray-700 hover:text-indigo-600 font-medium transition">About</a>
                <a href="#initiatives" className="text-gray-700 hover:text-indigo-600 font-medium transition">Initiative</a>
              </div>

              {/* Login Button */}
              <Link
                to="/login"
                className="px-3 md:px-4 py-2 text-indigo-600 border border-indigo-600 rounded-lg hover:bg-indigo-50 transition font-medium text-sm md:text-base"
              >
                Login
              </Link>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition"
              >
                {isMobileMenuOpen ? (
                  <XMarkIcon className="w-6 h-6 text-gray-700" />
                ) : (
                  <Bars3Icon className="w-6 h-6 text-gray-700" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu Dropdown */}
          {isMobileMenuOpen && (
            <div className="md:hidden pb-4 border-t border-gray-200">
              <a
                href="#events"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-4 py-2 text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded font-medium transition"
              >
                Events
              </a>
              <a
                href="#about"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-4 py-2 text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded font-medium transition"
              >
                About
              </a>
              <a
                href="#initiatives"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-4 py-2 text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded font-medium transition"
              >
                Initiative
              </a>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-6">
              <h2 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
                Welcome to <span className="text-indigo-600">Jai Dev Balatika</span> <br />
                <span className="text-gray-700">Shegal Yuvak Mandal</span>
              </h2>
              <p className="text-xl text-gray-600 leading-relaxed">
                A vibrant community dedicated to youth development, cultural preservation, and social empowerment. 
                Join us in building a stronger, more connected Mandal where every member contributes to collective growth.
              </p>
            </div>

            {/* Right Image */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-3xl blur-2xl opacity-60"></div>
              <img
                src={imageall}
                alt="Mandal Community"
                className="relative w-full h-auto rounded-3xl shadow-2xl object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Initiatives & Highlights Section */}
      <section id="initiatives" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Our Initiatives</h2>
            <p className="text-xl text-gray-600">Impactful programs and activities that drive our community forward</p>
          </div>

          {galleryItems.length > 0 ? (
            <div
              className="relative"
              onMouseEnter={() => setIsInitiativePaused(true)}
              onMouseLeave={() => setIsInitiativePaused(false)}
            >
              {/* Slides viewport */}
              <div className="overflow-hidden rounded-2xl">
                <div
                  className="flex transition-transform duration-500 ease-in-out"
                  style={{ width: `${galleryItems.slice(0, 6).length * 100}%`, transform: `translateX(-${initiativeIndex * (100 / galleryItems.slice(0,6).length)}%)` }}
                >
                  {galleryItems.slice(0, 6).map((item, index) => (
                    <div
                      key={item._id}
                      onClick={() => openInitiative(item)}
                      className="w-full md:w-full px-4 py-6 flex-shrink-0"
                      style={{ width: `${100 / galleryItems.slice(0,6).length}%` }}
                    >
                      <div className="group relative bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer">
                        <div className="relative h-64 overflow-hidden bg-gray-200">
                          {item.images && item.images.length > 0 ? (
                            <img
                              src={item.images[0].url}
                              alt={item.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
                              <span className="text-white text-2xl font-bold text-center px-4">{item.title}</span>
                            </div>
                          )}

                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                          {item.images && item.images.length > 1 && (
                            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-sm font-semibold text-indigo-600">
                              {item.images.length} photos
                            </div>
                          )}
                        </div>

                        <div className="p-6">
                          <h3 className="text-2xl font-bold text-gray-900 mb-3 line-clamp-2">{item.title}</h3>
                          {item.description && (
                            <p className="text-gray-600 text-sm line-clamp-3 mb-4">{item.description}</p>
                          )}

                          <div className="flex items-center justify-between text-xs text-gray-500 border-t pt-4">
                            <div>
                              {new Date(item.createdAt).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </div>

                            <div className="mx-4 flex-1 text-center">
                              {item.createdBy && (
                                <span className="font-medium">{item.createdBy.name}</span>
                              )}
                            </div>

                            <div className="flex-shrink-0">
                              <button
                                onClick={(e) => { e.stopPropagation(); handleShare(item); }}
                                className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                              >
                                Share
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="absolute inset-0 bg-indigo-600/0 group-hover:bg-indigo-600/5 transition-colors duration-300 flex items-end justify-end p-6 opacity-0 group-hover:opacity-100">
                          <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center transform scale-0 group-hover:scale-100 transition-transform duration-300">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Controls */}
              <div className="absolute inset-0 flex items-center justify-between px-4 pointer-events-none">
                <button
                  onClick={() => setInitiativeIndex((prev) => (prev - 1 + galleryItems.slice(0,6).length) % galleryItems.slice(0,6).length)}
                  className="pointer-events-auto bg-white/80 hover:bg-white px-2 py-2 rounded-full shadow-md"
                  aria-label="Previous initiative"
                >
                  <ChevronLeftIcon className="w-6 h-6 text-gray-700" />
                </button>

                <button
                  onClick={() => setInitiativeIndex((prev) => (prev + 1) % galleryItems.slice(0,6).length)}
                  className="pointer-events-auto bg-white/80 hover:bg-white px-2 py-2 rounded-full shadow-md"
                  aria-label="Next initiative"
                >
                  <ChevronRightIcon className="w-6 h-6 text-gray-700" />
                </button>
              </div>

              {/* Indicators */}
              <div className="mt-6 flex items-center justify-center space-x-2">
                {galleryItems.slice(0,6).map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setInitiativeIndex(idx)}
                    className={`w-3 h-3 rounded-full ${initiativeIndex === idx ? 'bg-indigo-600' : 'bg-gray-300'}`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-16 bg-gray-50 rounded-3xl">
              <svg className="w-20 h-20 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
              <p className="text-gray-600 text-xl mb-2">No initiatives added yet</p>
              <p className="text-gray-500">Initiatives and highlights will appear here</p>
            </div>
          )}
        </div>
      </section>

      {/* Leadership Section - Right after Hero */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-900 to-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Meet Our Leadership</h2>
            <p className="text-xl text-gray-300">Visionary leaders guiding our Mandal to greater heights</p>
          </div>

          {/* Show two columns on small screens so leadership cards aren't full-width on mobile */}
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {/* Pradhan */}
            {coreTeam.pradhan && Object.keys(coreTeam.pradhan).length > 0 && (
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-indigo-400 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition duration-300"></div>
                <div className="relative bg-white rounded-2xl overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-300 transform group-hover:-translate-y-2">
                  <div className="h-56 bg-gradient-to-br from-indigo-600 to-indigo-700 relative overflow-hidden">
                    {coreTeam.pradhan?.image?.includes("https://res") ? (
                      <img 
                        src={coreTeam.pradhan.image} 
                        alt={coreTeam.pradhan.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-white text-7xl font-bold">
                          {coreTeam.pradhan?.name?.charAt(0).toUpperCase() || "P"}
                        </span>
                      </div>
                    )}
                    {/* role badge removed */}
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 text-center mb-1">
                      {coreTeam.pradhan?.name || "Pradhan"}
                    </h3>
                    <p className="text-center text-indigo-600 font-semibold text-sm mb-4">Pradhan</p>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center justify-center">
                        <svg className="w-4 h-4 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9c-1.512 1.512-3.956 1.512-5.468 0l-4.242-4.243c-1.512-1.512-1.512-3.956 0-5.468l4.243-4.243c1.512-1.512 3.956-1.512 5.468 0L18.9 7.657M9 11l3 3m0 0l3-3m-3 3V8"></path>
                        </svg>
                        <span className="truncate">{coreTeam.pradhan?.villageName || "Village"}</span>
                      </div>
                      <div className="flex items-center justify-center">
                        <svg className="w-4 h-4 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                        </svg>
                        <span className="truncate">{coreTeam.pradhan?.mobileNumber || "Contact"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Up Pradhan */}
            {coreTeam.upPradhan && Object.keys(coreTeam.upPradhan).length > 0 && (
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-400 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition duration-300"></div>
                <div className="relative bg-white rounded-2xl overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-300 transform group-hover:-translate-y-2">
                  <div className="h-56 bg-gradient-to-br from-blue-600 to-blue-700 relative overflow-hidden">
                    {coreTeam.upPradhan?.image?.includes("https://res") ? (
                      <img 
                        src={coreTeam.upPradhan.image} 
                        alt={coreTeam.upPradhan.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-white text-7xl font-bold">
                          {coreTeam.upPradhan?.name?.charAt(0).toUpperCase() || "U"}
                        </span>
                      </div>
                    )}
                    {/* role badge removed */}
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 text-center mb-1">
                      {coreTeam.upPradhan?.name || "Up Pradhan"}
                    </h3>
                    <p className="text-center text-blue-600 font-semibold text-sm mb-4">Up Pradhan</p>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center justify-center">
                        <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9c-1.512 1.512-3.956 1.512-5.468 0l-4.242-4.243c-1.512-1.512-1.512-3.956 0-5.468l4.243-4.243c1.512-1.512 3.956-1.512 5.468 0L18.9 7.657M9 11l3 3m0 0l3-3m-3 3V8"></path>
                        </svg>
                        <span className="truncate">{coreTeam.upPradhan?.villageName || "Village"}</span>
                      </div>
                      <div className="flex items-center justify-center">
                        <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                        </svg>
                        <span className="truncate">{coreTeam.upPradhan?.mobileNumber || "Contact"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Treasurer */}
            {coreTeam.treasurer && Object.keys(coreTeam.treasurer).length > 0 && (
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-amber-600 to-amber-400 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition duration-300"></div>
                <div className="relative bg-white rounded-2xl overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-300 transform group-hover:-translate-y-2">
                  <div className="h-56 bg-gradient-to-br from-amber-600 to-amber-700 relative overflow-hidden">
                    {coreTeam.treasurer?.image?.includes("https://res") ? (
                      <img 
                        src={coreTeam.treasurer.image} 
                        alt={coreTeam.treasurer.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-white text-7xl font-bold">
                          {coreTeam.treasurer?.name?.charAt(0).toUpperCase() || "T"}
                        </span>
                      </div>
                    )}
                    {/* role badge removed */}
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 text-center mb-1">
                      {coreTeam.treasurer?.name || "Treasurer"}
                    </h3>
                    <p className="text-center text-amber-600 font-semibold text-sm mb-4">Treasurer</p>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center justify-center">
                        <svg className="w-4 h-4 mr-2 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9c-1.512 1.512-3.956 1.512-5.468 0l-4.242-4.243c-1.512-1.512-1.512-3.956 0-5.468l4.243-4.243c1.512-1.512 3.956-1.512 5.468 0L18.9 7.657M9 11l3 3m0 0l3-3m-3 3V8"></path>
                        </svg>
                        <span className="truncate">{coreTeam.treasurer?.villageName || "Village"}</span>
                      </div>
                      <div className="flex items-center justify-center">
                        <svg className="w-4 h-4 mr-2 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                        </svg>
                        <span className="truncate">{coreTeam.treasurer?.mobileNumber || "Contact"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Secretary */}
            {coreTeam.secretary && Object.keys(coreTeam.secretary).length > 0 && (
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-green-400 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition duration-300"></div>
                <div className="relative bg-white rounded-2xl overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-300 transform group-hover:-translate-y-2">
                  <div className="h-56 bg-gradient-to-br from-green-600 to-green-700 relative overflow-hidden">
                    {coreTeam.secretary?.image?.includes("https://res") ? (
                      <img 
                        src={coreTeam.secretary.image} 
                        alt={coreTeam.secretary.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-white text-7xl font-bold">
                          {coreTeam.secretary?.name?.charAt(0).toUpperCase() || "S"}
                        </span>
                      </div>
                    )}
                    {/* role badge removed */}
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 text-center mb-1">
                      {coreTeam.secretary?.name || "Secretary"}
                    </h3>
                    <p className="text-center text-green-600 font-semibold text-sm mb-4">Secretary</p>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center justify-center">
                        <svg className="w-4 h-4 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9c-1.512 1.512-3.956 1.512-5.468 0l-4.242-4.243c-1.512-1.512-1.512-3.956 0-5.468l4.243-4.243c1.512-1.512 3.956-1.512 5.468 0L18.9 7.657M9 11l3 3m0 0l3-3m-3 3V8"></path>
                        </svg>
                        <span className="truncate">{coreTeam.secretary?.villageName || "Village"}</span>
                      </div>
                      <div className="flex items-center justify-center">
                        <svg className="w-4 h-4 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                        </svg>
                        <span className="truncate">{coreTeam.secretary?.mobileNumber || "Contact"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Chief Advisor */}
            {coreTeam.chiefAdvisor && Object.keys(coreTeam.chiefAdvisor).length > 0 && (
              <div className="group relative hidden lg:block">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-purple-400 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition duration-300"></div>
                <div className="relative bg-white rounded-2xl overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-300 transform group-hover:-translate-y-2">
                  <div className="h-56 bg-gradient-to-br from-purple-600 to-purple-700 relative overflow-hidden">
                    {coreTeam.chiefAdvisor?.image?.includes("https://res") ? (
                      <img 
                        src={coreTeam.chiefAdvisor.image} 
                        alt={coreTeam.chiefAdvisor.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-white text-7xl font-bold">
                          {coreTeam.chiefAdvisor?.name?.charAt(0).toUpperCase() || "C"}
                        </span>
                      </div>
                    )}
                    {/* role badge removed */}
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 text-center mb-1">
                      {coreTeam.chiefAdvisor?.name || "Chief Advisor"}
                    </h3>
                    <p className="text-center text-purple-600 font-semibold text-sm mb-4">Chief Advisor</p>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center justify-center">
                        <svg className="w-4 h-4 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9c-1.512 1.512-3.956 1.512-5.468 0l-4.242-4.243c-1.512-1.512-1.512-3.956 0-5.468l4.243-4.243c1.512-1.512 3.956-1.512 5.468 0L18.9 7.657M9 11l3 3m0 0l3-3m-3 3V8"></path>
                        </svg>
                        <span className="truncate">{coreTeam.chiefAdvisor?.villageName || "Village"}</span>
                      </div>
                      <div className="flex items-center justify-center">
                        <svg className="w-4 h-4 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                        </svg>
                        <span className="truncate">{coreTeam.chiefAdvisor?.mobileNumber || "Contact"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-4">About Our Mandal</h2>
          <p className="text-center text-gray-600 max-w-3xl mx-auto mb-16 text-lg">
            Discover our mission, values, and impact in the community
          </p>

          {/* Location and Contact Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            {/* Location Card */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-8 hover:shadow-lg transition">
              <div className="w-14 h-14 bg-green-600 rounded-full flex items-center justify-center mb-6">
                <MapPinIcon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Location</h3>
              <div className="text-gray-700 space-y-2">
                <p className="flex items-start">
                  <span className="font-semibold mr-2">Panchyat:</span>
                  <span>Tharjun</span>
                </p>
                <p className="flex items-start">
                  <span className="font-semibold mr-2">Teshil:</span>
                  <span>Chachyot</span>
                </p>
                <p className="flex items-start">
                  <span className="font-semibold mr-2">District:</span>
                  <span>Mandi</span>
                </p>
                <p className="flex items-start">
                  <span className="font-semibold mr-2">State:</span>
                  <span>Himachal Pradesh</span>
                </p>
                <p className="flex items-start">
                  <span className="font-semibold mr-2">PIN Code:</span>
                  <span>175029</span>
                </p>
              </div>
            </div>

            {/* Contact Card */}
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-8 hover:shadow-lg transition">
              <div className="w-14 h-14 bg-orange-600 rounded-full flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Get In Touch</h3>
              <div className="text-gray-700 space-y-4">
                <p className="text-lg">
                  <span className="font-semibold">Email:</span>
                </p>
                <a href="mailto:balatikayuvakmandalburahan@gmail.com" className="text-orange-600 hover:text-orange-700 font-semibold break-all">
                  balatikayuvakmandalburahan@gmail.com
                </a>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Mission */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 hover:shadow-lg transition">
              <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center mb-6">
                <SparklesIcon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h3>
              <p className="text-gray-700 leading-relaxed">
                To empower youth through cultural heritage, social responsibility, and community service. 
                We aim to create leaders who contribute meaningfully to society.
              </p>
            </div>

            {/* Values */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-8 hover:shadow-lg transition">
              <div className="w-14 h-14 bg-purple-600 rounded-full flex items-center justify-center mb-6">
                <UsersIcon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Core Values</h3>
              <p className="text-gray-700 leading-relaxed">
                Unity, Integrity, Excellence, and Service. We believe in collective growth where every member's 
                contribution matters and every voice is heard.
              </p>
            </div>

            {/* Activities */}
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-2xl p-8 hover:shadow-lg transition">
              <div className="w-14 h-14 bg-indigo-600 rounded-full flex items-center justify-center mb-6">
                <CalendarIcon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Activities</h3>
              <p className="text-gray-700 leading-relaxed">
                From cultural events and sports tournaments to community service and social initiatives. 
                We organize regular activities to foster brotherhood and community engagement.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section id="events" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-4">Upcoming Events</h2>
          <p className="text-center text-gray-600 max-w-3xl mx-auto mb-16 text-lg">
            Join us for exciting events and activities
          </p>

          {upcomingEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {upcomingEvents.map(event => (
                <div
                  key={event._id}
                  className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
                >
                  {/* Event Image */}
                  {event.image && (
                    <div className="h-48 overflow-hidden bg-gray-200">
                      <img
                        src={event.image}
                        alt={event.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}

                  {/* Event Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">{event.name}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{event.description}</p>

                    {/* Event Details */}
                    <div className="space-y-3 mb-6 border-t pt-4">
                      <div className="flex items-center text-gray-700">
                        <CalendarIcon className="w-5 h-5 mr-3 text-indigo-600" />
                        <span className="text-sm">
                          {new Date(event.date).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                      {event.location && (
                        <div className="flex items-center text-gray-700">
                          <MapPinIcon className="w-5 h-5 mr-3 text-indigo-600" />
                          <span className="text-sm truncate">{event.location}</span>
                        </div>
                      )}
                      {event.type && (
                        <div className="flex items-center text-gray-700">
                          <UsersIcon className="w-5 h-5 mr-3 text-indigo-600" />
                          <span className="text-sm">{event.type}</span>
                        </div>
                      )}
                    </div>

                    {/* Status Badge */}
                    <div className="flex justify-between items-center">
                      <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                        {event.status}
                      </span>
                      <Link
                        to={`/login`}
                        className="text-indigo-600 hover:text-indigo-700 font-semibold text-sm"
                      >
                        View Details →
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-16 text-center shadow-md">
              <CalendarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No upcoming events at the moment.</p>
              <p className="text-gray-500 mt-2">Check back soon for new events!</p>
            </div>
          )}
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-indigo-600">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-white mb-16">Our Impact</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-5xl font-bold text-white mb-2">100+</div>
              <p className="text-indigo-100 text-lg">Active Members</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-white mb-2">50+</div>
              <p className="text-indigo-100 text-lg">Events Organized</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-white mb-2">₹50L+</div>
              <p className="text-indigo-100 text-lg">Community Fund</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-white mb-2">15+</div>
              <p className="text-indigo-100 text-lg">Years Strong</p>
            </div>
          </div>
        </div>
      </section>

      {/* All Members Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-4">All Mandal Members</h2>
          <p className="text-center text-gray-600 max-w-3xl mx-auto mb-16 text-lg">
            Meet all the dedicated members of our community
          </p>

          {teamMembers.length > 0 ? (
            <div className="-mx-4 px-4">
              <div className="overflow-x-auto py-2">
                <div className="flex gap-6 items-stretch snap-x snap-mandatory">
                  {teamMembers.map((member) => (
                    <div
                      key={member._id}
                      className="min-w-[220px] md:min-w-[260px] snap-center bg-white rounded-lg shadow-md overflow-hidden flex-shrink-0 flex flex-col transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                    >
                      <div className="h-36 overflow-hidden relative">
                        {member?.image?.includes("https://res") ? (
                          <img
                            src={member.image}
                            alt={member.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-r from-indigo-600 to-blue-500 flex items-center justify-center">
                            <span className="text-white text-4xl font-semibold">
                              {member.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="p-3 flex-1 flex flex-col">
                        <h3 className="font-semibold text-indigo-800 truncate">{member.name}</h3>
                        <div className="bg-indigo-100 text-center py-1 px-2 rounded-full mt-2 mb-2 self-start">
                          <span className="text-indigo-800 font-medium text-xs">{member.role}</span>
                        </div>
                        <div className="text-gray-700 mt-auto text-xs">
                          <div className="flex items-center mb-1">
                            <svg className="w-3 h-3 mr-1 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9c-1.512 1.512-3.956 1.512-5.468 0l-4.242-4.243c-1.512-1.512-1.512-3.956 0-5.468l4.243-4.243c1.512-1.512 3.956-1.512 5.468 0L18.9 7.657M9 11l3 3m0 0l3-3m-3 3V8"></path>
                            </svg>
                            <span className="truncate">{member.villageName}</span>
                          </div>
                          <div className="flex items-center">
                            <svg className="w-3 h-3 mr-1 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                            </svg>
                            <span className="truncate">{member.mobileNumber}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-16 text-center shadow-md">
              <UsersIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No members found.</p>
            </div>
          )}
        </div>
      </section>

      {/* Manage Contributions - visible to Admin / Treasurer only */}
      {user && (user.role === 'Admin' || user.role === 'Treasurer') && (
        <div>
          <ManageContributions members={teamMembers} />
        </div>
      )}

      <footer className="bg-gray-900 text-gray-400 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-white font-bold mb-4">About Us</h3>
              <p className="text-sm leading-relaxed">
                Jai Dev Balatika Shegal Yuvak Mandal - A community-driven organization dedicated to youth empowerment 
                and cultural preservation.
              </p>
            </div>
            <div>
              <h3 className="text-white font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#about" className="hover:text-white transition">About</a></li>
                <li><a href="#events" className="hover:text-white transition">Events</a></li>
                <li><Link to="/login" className="hover:text-white transition">Login</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-bold mb-4">Contact</h3>
              <p className="text-sm">
                Shegal, Village<br />
                District, State<br />
                Email: info@mandal.com
              </p>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-8 text-center text-sm">
            <p>&copy; 2024 Jai Dev Balatika Shegal Yuvak Mandal. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Initiative Details Modal */}
      {selectedInitiative && (
        <div
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 overflow-y-auto"
          onClick={closeInitiative}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full my-8 max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
              <div className="absolute top-4 right-4 z-10">
              <button
                onClick={closeInitiative}
                className="bg-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg hover:bg-gray-100 transition-colors"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Main Image Carousel */}
            <div className="relative bg-gray-900 h-56 sm:h-64 md:h-[60vh] overflow-hidden rounded-t-3xl group bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center flex-shrink-0">
              {/* Carousel Track */}
              <div className="relative w-full h-full">
                {selectedInitiative.images && selectedInitiative.images.length > 0 ? (
                  <>
                    {/* Images with smooth fade transition, centered and contained */}
                    {selectedInitiative.images.map((image, idx) => (
                      <div
                        key={idx}
                        className={`absolute inset-0 transition-opacity duration-700 ease-in-out flex items-center justify-center ${
                          idx === selectedImageIndex ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                        }`}
                      >
                        <img
                          src={image.url}
                          alt={`${selectedInitiative.title} ${idx + 1}`}
                          className="w-full h-full object-cover md:object-contain md:max-h-[60vh] md:max-w-[95%] rounded-lg mx-auto"
                        />
                      </div>
                    ))}

                    {/* Left Arrow - Large and Prominent */}
                    {selectedInitiative.images.length > 1 && (
                      <button
                        onClick={() =>
                          setSelectedImageIndex(
                            selectedImageIndex === 0
                              ? selectedInitiative.images.length - 1
                              : selectedImageIndex - 1
                          )
                        }
                        className="absolute left-4 md:left-6 top-1/2 transform -translate-y-1/2 z-20 bg-white/40 hover:bg-white/60 backdrop-blur-md text-white rounded-full p-3 md:p-4 transition-all duration-300 hover:scale-110 active:scale-95"
                      >
                        <svg className="w-6 md:w-8 h-6 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                    )}

                    {/* Right Arrow - Large and Prominent */}
                    {selectedInitiative.images.length > 1 && (
                      <button
                        onClick={() =>
                          setSelectedImageIndex(
                            (selectedImageIndex + 1) % selectedInitiative.images.length
                          )
                        }
                        className="absolute right-4 md:right-6 top-1/2 transform -translate-y-1/2 z-20 bg-white/40 hover:bg-white/60 backdrop-blur-md text-white rounded-full p-3 md:p-4 transition-all duration-300 hover:scale-110 active:scale-95"
                      >
                        <svg className="w-6 md:w-8 h-6 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    )}

                    {/* Carousel Indicators (Dots) - At Bottom Center */}
                    {selectedInitiative.images.length > 1 && (
                      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-3 z-20">
                        {selectedInitiative.images.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => setSelectedImageIndex(idx)}
                            className={`transition-all duration-300 rounded-full hover:scale-125 ${
                              idx === selectedImageIndex
                                ? 'bg-white w-3 h-3 scale-125'
                                : 'bg-white/60 w-2.5 h-2.5 hover:bg-white/80'
                            }`}
                            aria-label={`Go to image ${idx + 1}`}
                          />
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
                    <span className="text-white text-4xl font-bold text-center px-4">{selectedInitiative.title}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Content (scrollable if needed) */}
            <div className="p-8 overflow-auto min-h-0">
              {/* Title */}
              <h2 className="text-4xl font-bold text-gray-900 mb-4">{selectedInitiative.title}</h2>

              {/* Meta Information */}
              <div className="flex flex-wrap gap-6 mb-8 pb-8 border-b border-gray-200">
                <div className="flex items-center text-gray-600">
                  <svg className="w-5 h-5 mr-2 text-indigo-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  </svg>
                  <span className="font-medium">
                    {new Date(selectedInitiative.createdAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>

                {selectedInitiative.createdBy && (
                  <div className="flex items-center text-gray-600">
                    <svg className="w-5 h-5 mr-2 text-indigo-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M10 11a5 5 0 110-10 5 5 0 010 10zM0 20c0-1.656.895-3.157 2.332-3.957A9.86 9.86 0 0110 15c4.42 0 8.346 2.234 10.668 5.043C21.105 20.157 20.21 21.657 20.21 23.313V24H0v-.687z" />
                    </svg>
                    <span className="font-medium">{selectedInitiative.createdBy.name}</span>
                  </div>
                )}

                {selectedInitiative.images && selectedInitiative.images.length > 0 && (
                  <div className="flex items-center text-gray-600">
                    <svg className="w-5 h-5 mr-2 text-indigo-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="font-medium">{selectedInitiative.images.length} photos</span>
                  </div>
                )}
              </div>

              {/* Description */}
              {selectedInitiative.description && (
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">About this Initiative</h3>
                  <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-wrap">
                    {selectedInitiative.description}
                  </p>
                </div>
              )}

              {/* Image Thumbnails */}
              {selectedInitiative.images && selectedInitiative.images.length > 1 && (
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Photo Gallery</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {selectedInitiative.images.map((image, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImageIndex(idx)}
                        className={`relative rounded-lg overflow-hidden transition-all duration-300 ring-2 ${
                          idx === selectedImageIndex
                            ? 'ring-indigo-600 scale-105'
                            : 'ring-gray-200 hover:ring-indigo-400'
                        }`}
                      >
                        <img
                          src={image.url}
                          alt={`${selectedInitiative.title} ${idx + 1}`}
                          className="w-full h-24 md:h-28 object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Close Button */}
              <div className="mt-8 pt-8 border-t border-gray-200 flex gap-4">
                <button
                  onClick={() => handleShare(selectedInitiative)}
                  className="px-6 py-3 bg-white border border-indigo-200 text-indigo-700 rounded-full font-semibold shadow-sm hover:shadow-md transition-all duration-300"
                >
                  Share
                </button>

                <button
                  onClick={closeInitiative}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
