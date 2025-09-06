// components/gallery/GalleryList.jsx
import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import SkeletonLoader from '../loader/SkeletonLoader';
import { FaPlus, FaHeart, FaArrowLeft, FaArrowRight } from 'react-icons/fa';

const baseURL = import.meta.env.VITE_API_URL;

const GalleryList = () => {
  const { t } = useTranslation();
  const { user } = useContext(AuthContext);
  const [galleryItems, setGalleryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Check if user has permission to add gallery items
  const canManageGallery = user && ['Admin', 'Pradhan', 'Up-Pradhan', 'Advisor', 'Chief Advisor', 'Treasurer', 'Secretary'].includes(user.role);
  
  useEffect(() => {
    const fetchGalleryItems = async () => {
      try {
        const res = await axios.get(`${baseURL}/api/gallery`);
        setGalleryItems(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchGalleryItems();
  }, []);
  
  const openGalleryModal = (item) => {
    setSelectedItem(item);
    setCurrentImageIndex(0);
    document.body.style.overflow = 'hidden';
  };
  
  const closeGalleryModal = () => {
    setSelectedItem(null);
    document.body.style.overflow = 'auto';
  };

  const nextImage = (e) => {
    e.stopPropagation();
    if (selectedItem && currentImageIndex < selectedItem.images.length - 1) {
      setCurrentImageIndex(prev => prev + 1);
    }
  };

  const prevImage = (e) => {
    e.stopPropagation();
    if (selectedItem && currentImageIndex > 0) {
      setCurrentImageIndex(prev => prev - 1);
    }
  };
  
  if (loading) {
    return (
      <div className="p-6 bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="mt-10 max-w-7xl mx-auto">
          <SkeletonLoader type="text" size="lg" className="mb-6" />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            <SkeletonLoader type="user-card" count={6} />
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-indigo-800 mb-4 tracking-tight">{t('gallery')}</h1>
          <p className="text-lg text-indigo-600 max-w-2xl mx-auto">
            {t('galleryDescription', 'Our wonderful community initiatives and memorable moments')}
          </p>
          
          {canManageGallery && (
            <Link 
              to="/gallery/add" 
              className="inline-flex items-center mt-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-full font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <FaPlus className="mr-2" />
              {t('addNew')}
            </Link>
          )}
        </div>
        
        {galleryItems.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl shadow-sm max-w-2xl mx-auto">
            <div className="inline-block p-6 rounded-full bg-indigo-100 mb-4">
              <svg className="w-16 h-16 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
            </div>
            <p className="text-indigo-600 text-xl mb-4">{t('noGalleryItems')}</p>
            {canManageGallery && (
              <Link 
                to="/gallery/add" 
                className="inline-block mt-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-full font-medium shadow-lg transition-all duration-300"
              >
                {t('addFirst')}
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {galleryItems.map((item, index) => {
              // Alternate between different card styles for visual variety
              const cardStyle = index % 4;
              
              return (
                <div 
                  key={item._id}
                  className={`group cursor-pointer transform transition-all duration-500 hover:scale-105 ${
                    cardStyle === 0 ? 'rounded-2xl overflow-hidden shadow-lg' :
                    cardStyle === 1 ? 'rounded-3xl overflow-hidden shadow-md' :
                    cardStyle === 2 ? 'rounded-xl overflow-hidden shadow-xl' :
                    'rounded-2xl overflow-hidden shadow-lg'
                  }`}
                  onClick={() => openGalleryModal(item)}
                >
                  {item.images.length > 0 && (
                    <div className="relative overflow-hidden">
                      <img 
                        src={item.images[0].url} 
                        alt={item.title}
                        className="w-full h-64 object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      
                      {/* Image count badge with fun design */}
                      {item.images.length > 1 && (
                        <div className="absolute top-3 right-3 bg-white rounded-full px-3 py-1 shadow-md text-indigo-700 text-sm font-bold">
                          {item.images.length} {t('photos')}
                        </div>
                      )}
                      
                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    </div>
                  )}
                  
                  <div className={`p-6 ${
                    cardStyle === 0 ? 'bg-white' :
                    cardStyle === 1 ? 'bg-gradient-to-br from-indigo-50 to-purple-50' :
                    cardStyle === 2 ? 'bg-white' :
                    'bg-gradient-to-r from-blue-50 to-indigo-50'
                  }`}>
                    <h3 className="text-2xl font-bold mb-3 text-indigo-800">{item.title}</h3>
                    
                    {item.description && (
                      <p className="text-indigo-600 mb-4 line-clamp-3">
                        {item.description}
                      </p>
                    )}
                    
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-indigo-500 font-medium">
                        {new Date(item.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                      
                      <div className="flex items-center text-indigo-400">
                        <FaHeart className="mr-1" />
                        <span>{item.createdBy?.name || ''}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      {/* Beautiful Full-screen Image Modal */}
      {selectedItem && (
        <div 
          className="fixed inset-0 bg-indigo-900/95 z-50 flex items-center justify-center"
          onClick={closeGalleryModal}
        >
          <div className="absolute top-4 right-4 z-10">
            <button
              onClick={closeGalleryModal}
              className="bg-white/10 backdrop-blur-sm text-white rounded-full h-10 w-10 flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              <span className="text-2xl">×</span>
            </button>
          </div>
          
          <div className="absolute top-8 left-8 z-10">
            <h2 className="text-3xl font-bold text-white">{selectedItem.title}</h2>
            {selectedItem.description && (
              <p className="text-indigo-200 mt-2 max-w-xl">{selectedItem.description}</p>
            )}
          </div>
          
          {/* Main Image Container */}
          <div 
            className="relative w-full h-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {selectedItem.images.length > 0 && (
              <img 
                src={selectedItem.images[currentImageIndex].url} 
                alt={`${selectedItem.title} - ${currentImageIndex + 1}`}
                className="max-h-[80vh] max-w-[90vw] object-contain rounded-lg shadow-2xl"
              />
            )}
            
            {/* Navigation Arrows with beautiful design */}
            {selectedItem.images.length > 1 && (
              <>
                <button 
                  onClick={prevImage}
                  disabled={currentImageIndex === 0}
                  className={`absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/10 backdrop-blur-sm text-white p-4 rounded-full hover:bg-white/20 transition-colors ${
                    currentImageIndex === 0 ? 'opacity-40 cursor-not-allowed' : 'opacity-100'
                  }`}
                >
                  <FaArrowLeft />
                </button>
                
                <button 
                  onClick={nextImage}
                  disabled={currentImageIndex === selectedItem.images.length - 1}
                  className={`absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/10 backdrop-blur-sm text-white p-4 rounded-full hover:bg-white/20 transition-colors ${
                    currentImageIndex === selectedItem.images.length - 1 ? 'opacity-40 cursor-not-allowed' : 'opacity-100'
                  }`}
                >
                  <FaArrowRight />
                </button>
                
                {/* Thumbnail Navigation */}
                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-black/30 backdrop-blur-md px-4 py-3 rounded-full">
                  <div className="flex gap-3 items-center">
                    {selectedItem.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`h-2.5 rounded-full transition-all ${
                          currentImageIndex === index 
                            ? 'w-8 bg-white' 
                            : 'w-2.5 bg-white/50 hover:bg-white/80'
                        }`}
                        aria-label={`Go to image ${index + 1}`}
                      />
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
          
          {/* Image metadata */}
          <div className="absolute bottom-6 right-6 text-white/70 text-sm">
            {selectedItem.createdBy?.name && (
              <div>By {selectedItem.createdBy.name}</div>
            )}
            <div>
              {new Date(selectedItem.createdAt).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryList;