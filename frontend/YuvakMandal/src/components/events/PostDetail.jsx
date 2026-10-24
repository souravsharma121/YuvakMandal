import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AlertContext from '../../context/AlertContext';
import { CalendarIcon, MapPinIcon, UsersIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import splashLogo from '../../assets/splashlogo.jpg';

const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setAlert } = useContext(AlertContext);
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const baseURL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${baseURL}/api/events/${id}`);
      setPost(response.data);
    } catch (error) {
      console.error('Error fetching post:', error);
      setAlert({ type: 'error', message: 'Failed to load post' });
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        {/* Navigation Bar */}
        <nav className="fixed top-12 w-full bg-white shadow-md z-50">
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
        <div className="pt-[128px] flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading post...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-white">
        {/* Navigation Bar */}
        <nav className="fixed top-12 w-full bg-white shadow-md z-50">
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
        <div className="pt-[128px] flex items-center justify-center h-screen">
          <p className="text-gray-600 text-lg">Post not found</p>
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
      <nav className="fixed top-12 w-full bg-white shadow-md z-50">
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

      {/* Post Content */}
      <section className="pt-[128px] pb-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          {/* Featured Image */}
          {post.image && (
            <div className="mb-8 rounded-2xl overflow-hidden shadow-lg">
              <img
                src={post.image}
                alt={post.name}
                className="w-full h-auto max-h-[500px] object-cover"
              />
            </div>
          )}

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">{post.name}</h1>

          {/* Metadata */}
          <div className="flex flex-wrap gap-4 md:gap-8 mb-8 pb-8 border-b border-gray-300">
            <div className="flex items-center text-gray-600">
              <CalendarIcon className="w-5 h-5 mr-3 text-indigo-600" />
              <span className="text-sm md:text-base">
                {new Date(post.date).toLocaleDateString('en-IN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
            {post.location && (
              <div className="flex items-center text-gray-600">
                <MapPinIcon className="w-5 h-5 mr-3 text-indigo-600" />
                <span className="text-sm md:text-base">{post.location}</span>
              </div>
            )}
            {post.type && (
              <div className="flex items-center text-gray-600">
                <UsersIcon className="w-5 h-5 mr-3 text-indigo-600" />
                <span className="text-sm md:text-base">{post.type}</span>
              </div>
            )}
          </div>

          {/* Status Badge */}
          <div className="mb-8">
            <span className="inline-block px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
              {post.status}
            </span>
          </div>

          {/* Description */}
          <div className="bg-white rounded-2xl p-8 shadow-md mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">About this Post</h2>
            <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-wrap">
              {post.description}
            </p>
          </div>

          {/* Additional Details */}
          {post.organizer && (
            <div className="bg-white rounded-2xl p-8 shadow-md mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Organizer</h2>
              <p className="text-gray-700 text-lg">{post.organizer}</p>
            </div>
          )}

          {/* Back Button */}
          <div className="mt-12">
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              Back to Posts
            </button>
          </div>
        </div>
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
                <li><a href="/#about" className="hover:text-white transition">About</a></li>
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

export default PostDetail;
