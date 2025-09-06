// components/gallery/GalleryAddForm.jsx
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import Spinner from '../loader/SkeletonLoader';
const baseURL = import.meta.env.VITE_API_URL  
const GalleryAddForm = () => {
  const { t } = useTranslation();
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    images: []
  });
  
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState([]);
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Preview images
    const previews = files.map(file => ({
      url: URL.createObjectURL(file),
      name: file.name
    }));
    
    setImagePreview(prev => [...prev, ...previews]);
    setFormData({
      ...formData,
      images: [...formData.images, ...files]
    });
  };
  
  const removeImage = (index) => {
    setImagePreview(prev => prev.filter((_, i) => i !== index));
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index)
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.images.length === 0) {
      return toast.error(t('pleaseUploadAtLeastOneImage'));
    }
    
    try {
      setLoading(true);
      
      const form = new FormData();
      form.append('title', formData.title);
      form.append('description', formData.description);
      
      // Append each image to form data
      formData.images.forEach(image => {
        form.append('images', image);
      });
      
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          'x-auth-token': token
        }
      };
      
      await axios.post(`${baseURL}/api/gallery`, form, config);
      
      toast.success(t('galleryItemAdded'));
      navigate('/gallery');
    } catch (err) {
      console.error(err);
      const message = err.response?.data?.message || t('somethingWentWrong');
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return <Spinner />;
  }
  
  return (
    <div className="bg-white shadow-md rounded-md p-5 w-full">
      <h2 className="text-2xl font-semibold mb-6">{t('addGalleryItem')}</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="title" className="block text-gray-700 font-medium mb-2">
            {t('title')} *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="description" className="block text-gray-700 font-medium mb-2">
            {t('description')}
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-2">
            {t('images')} *
          </label>
          
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <svg className="w-8 h-8 mb-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">{t('clickToUpload')}</span>
                </p>
                <p className="text-xs text-gray-500">{t('jpgPngGif')}</p>
              </div>
              <input
                type="file"
                name="images"
                onChange={handleImageChange}
                className="hidden"
                accept="image/*"
                multiple
              />
            </label>
          </div>
          
          {imagePreview.length > 0 && (
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {imagePreview.map((image, index) => (
                <div key={index} className="relative group">
                  <img
                    src={image.url}
                    alt={`Preview ${index + 1}`}
                    className="h-24 w-full object-cover rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                  <p className="text-xs mt-1 truncate">{image.name}</p>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/gallery')}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            {t('cancel')}
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {t('submit')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default GalleryAddForm;