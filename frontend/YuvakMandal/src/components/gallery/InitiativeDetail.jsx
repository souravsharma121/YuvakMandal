import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AlertContext from '../../context/AlertContext';
import { ArrowLeftIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import splashLogo from '../../assets/splashlogo.jpg';

const InitiativeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setAlert } = useContext(AlertContext);
  const [initiative, setInitiative] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const baseURL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchInitiative();
  }, [id]);

  const fetchInitiative = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${baseURL}/api/gallery/${id}`);
      setInitiative(response.data);
    } catch (error) {
      console.error('Error fetching initiative:', error);
      setAlert({ type: 'error', message: 'Failed to load initiative' });
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handlePrevImage = () => {
    if (initiative?.images && initiative.images.length > 0) {
      setSelectedImageIndex((prev) => 
        prev === 0 ? initiative.images.length - 1 : prev - 1
      );
    }
  };

  const handleNextImage = () => {
    if (initiative?.images && initiative.images.length > 0) {
      setSelectedImageIndex((prev) => 
        (prev + 1) % initiative.images.length
      );
    }
  };

  const handleShare = async () => {
    // Use backend share endpoint so social platforms fetch OG meta tags
    const url = `${window.location.origin}/share/initiative/${id}`;
    try {
      if (navigator.share) {
        await navigator.share({ 
          title: initiative?.title || 'Initiative', 
          url 
        });
        setAlert({ type: 'success', message: 'Shared successfully' });
        return;
      }
    } catch (err) {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        {/* Navigation Bar */}
        <nav className="fixed top-12 w-full bg-white shadow-md z-[70]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20 gap-2">
              <div className="flex items-center space-x-2 md:space-x-3 flex-shrink-0">
                <img src={splashLogo} alt="Mandal Logo" className="w-10 md:w-12 h-10 md:h-12 rounded-full object-cover" />
                <div className="flex flex-col min-w-0">
                  <h1 className="text-sm md:text-xl font-bold text-indigo-600 truncate">Jai Dev Balatika</h1>
                  <p className="text-xs text-gray-600 truncate">Shegal Yuvak Mandal</p>
                </div>
              </div>
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 px-4 py-2 text-indigo-600 border border-indigo-600 rounded-lg hover:bg-indigo-50 transition font-medium"
              >
                <ArrowLeftIcon className="w-5 h-5" />
                Back
              </button>
            </div>
          </div>
        </nav>
        <div className="pt-[136px] flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading initiative...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!initiative) {
    return (
      <div className="min-h-screen bg-white">
        {/* Navigation Bar */}
        <nav className="fixed top-12 w-full bg-white shadow-md z-[70]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20 gap-2">
              <div className="flex items-center space-x-2 md:space-x-3 flex-shrink-0">
                <img src={splashLogo} alt="Mandal Logo" className="w-10 md:w-12 h-10 md:h-12 rounded-full object-cover" />
                <div className="flex flex-col min-w-0">
                  <h1 className="text-sm md:text-xl font-bold text-indigo-600 truncate">Jai Dev Balatika</h1>
                  <p className="text-xs text-gray-600 truncate">Shegal Yuvak Mandal</p>
                </div>
              </div>
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 px-4 py-2 text-indigo-600 border border-indigo-600 rounded-lg hover:bg-indigo-50 transition font-medium"
              >
                <ArrowLeftIcon className="w-5 h-5" />
                Back
              </button>
            </div>
          </div>
        </nav>
        <div className="pt-[136px] flex items-center justify-center min-h-screen">
          <p className="text-gray-600 text-lg">Initiative not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Welcome Marquee */}
      <div className="fixed top-0 w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 z-[60] shadow-md">
        <div className="overflow-hidden h-12 flex items-center">
          <div className="flex animate-marquee whitespace-nowrap">
            <div className="flex items-center space-x-8 text-white font-semibold text-sm md:text-base">
              <span className="flex items-center">
                <svg className="w-5 h-5 mr-2 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                </svg>
                आपका हार्दिक स्वागत एवं अभिनन्दन करता है
              </span>
              <span className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 01.787 0l7-3a1 1 0 000-1.838l-7-3zM3.11 9.048l-1.99.852a1 1 0 000 1.838l7 3a1 1 0 00.788 0l7-3a1 1 0 000-1.838l-1.99-.852-1.94.831a1 1 0 01-.787 0l-4-1.714a1 1 0 00-.788 0l-4 1.714a1 1 0 01-.787 0l-1.94-.831z" />
                  <path d="M1.98 13.718a1 1 0 00-.783 1.838l7 3a1 1 0 00.788 0l7-3a1 1 0 00-.783-1.838l-4.786 2.05-4.786-2.05z" />
                </svg>
                Welcome to Jai Dev Balatika Shegal Yuvak Mandal Burahan
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Bar */}
      <nav className="fixed top-12 w-full bg-white shadow-md z-[70]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20 gap-2">
            <div className="flex items-center space-x-2 md:space-x-3 flex-shrink-0">
              <img src={splashLogo} alt="Mandal Logo" className="w-10 md:w-12 h-10 md:h-12 rounded-full object-cover" />
              <div className="flex flex-col min-w-0">
                <h1 className="text-sm md:text-xl font-bold text-indigo-600 truncate">Jai Dev Balatika</h1>
                <p className="text-xs text-gray-600 truncate">Shegal Yuvak Mandal</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 px-3 md:px-4 py-2 text-indigo-600 border border-indigo-600 rounded-lg hover:bg-indigo-50 transition font-medium text-sm md:text-base"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              Back to Home
            </button>
          </div>
        </div>
      </nav>

      {/* Initiative Content - Blog Post Style */}
      <section className="pt-[136px] pb-20 bg-white min-h-screen">
        {/* Hero Image */}
        {initiative.images && initiative.images.length > 0 && (
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
            <div className="relative w-full h-96 md:h-[500px] overflow-hidden bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center rounded-2xl">
              <img
                src={initiative.images[0]?.url}
                alt={initiative.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
            </div>
          </div>
        )}

        {/* Article Content */}
        <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Article Header */}
          <header className="mb-12">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              {initiative.title}
            </h1>
            
            {/* Byline */}
            <div className="flex flex-wrap items-center gap-6 text-gray-600 pb-6 border-b-2 border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {initiative.createdBy?.name?.charAt(0).toUpperCase() || 'M'}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{initiative.createdBy?.name || 'Mandal Team'}</p>
                  <p className="text-sm text-gray-500">Initiative Creator</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <time dateTime={new Date(initiative.createdAt).toISOString()}>
                  {new Date(initiative.createdAt).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </time>
              </div>

              {initiative.images && (
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>{initiative.images.length} photo{initiative.images.length !== 1 ? 's' : ''}</span>
                </div>
              )}
            </div>
          </header>

          {/* Article Body */}
          {initiative.description && (
            <div className="prose prose-lg max-w-none mb-12">
              <p className="text-gray-700 text-lg leading-8 whitespace-pre-wrap first-letter:text-3xl first-letter:font-bold first-letter:text-indigo-600 first-letter:mr-2 first-letter:float-left">
                {initiative.description}
              </p>
            </div>
          )}

          {/* Image Gallery */}
          {initiative.images && initiative.images.length > 1 && (
            <div className="my-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                <div className="w-1 h-8 bg-gradient-to-b from-indigo-600 to-purple-600 rounded-full"></div>
                Gallery
              </h2>

              {/* Main Gallery Image */}
              <div className="relative bg-gray-100 rounded-2xl overflow-hidden shadow-lg mb-6">
                <div className="relative h-96 md:h-[500px] flex items-center justify-center bg-gradient-to-br from-indigo-600 to-purple-600">
                  <img
                    src={initiative.images[selectedImageIndex]?.url}
                    alt={`${initiative.title} ${selectedImageIndex + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Navigation Arrows */}
                {initiative.images.length > 1 && (
                  <>
                    <button
                      onClick={handlePrevImage}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/40 hover:bg-white/60 backdrop-blur-md text-white rounded-full p-3 md:p-4 transition-all duration-300 hover:scale-110 active:scale-95"
                      aria-label="Previous image"
                    >
                      <ChevronLeftIcon className="w-6 md:w-8 h-6 md:h-8" />
                    </button>
                    <button
                      onClick={handleNextImage}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/40 hover:bg-white/60 backdrop-blur-md text-white rounded-full p-3 md:p-4 transition-all duration-300 hover:scale-110 active:scale-95"
                      aria-label="Next image"
                    >
                      <ChevronRightIcon className="w-6 md:w-8 h-6 md:h-8" />
                    </button>
                  </>
                )}

                {/* Image Counter */}
                <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm font-semibold">
                  {selectedImageIndex + 1} / {initiative.images.length}
                </div>
              </div>

              {/* Thumbnails */}
              <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory">
                {initiative.images.map((image, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`flex-shrink-0 w-24 h-24 md:w-28 md:h-28 rounded-xl overflow-hidden transition-all duration-300 snap-center ${
                      idx === selectedImageIndex 
                        ? 'ring-4 ring-indigo-600 scale-105 shadow-lg' 
                        : 'ring-2 ring-gray-300 hover:ring-indigo-400 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={image.url}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Share and Actions */}
          <div className="flex flex-col sm:flex-row gap-4 pt-12 border-t-2 border-gray-200">
            <button
              onClick={handleShare}
              className="flex-1 px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 font-semibold flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C9.589 12.938 10 11.980 10 11c0-1.657-1.343-3-3-3s-3 1.343-3 3 1.343 3 3 3c.981 0 1.938-.411 2.342-1.316m0 0a9 9 0 018.684-13.342c5.226 0 9.5 4.226 9.5 9.5s-4.226 9.5-9.5 9.5c-.64 0-1.274-.041-1.9-.12m0 0a9.75 9.75 0 01-1.331-20.04" />
              </svg>
              Share This Initiative
            </button>
            <button
              onClick={() => navigate('/')}
              className="flex-1 px-6 py-4 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transform hover:-translate-y-1 transition-all duration-300 font-semibold flex items-center justify-center gap-2"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              Back to Home
            </button>
          </div>
        </article>
      </section>

      {/* Footer */}
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
                <li><a href="/" className="hover:text-white transition">Home</a></li>
                <li><a href="/#initiatives" className="hover:text-white transition">Initiatives</a></li>
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
    </div>
  );
};

export default InitiativeDetail;
