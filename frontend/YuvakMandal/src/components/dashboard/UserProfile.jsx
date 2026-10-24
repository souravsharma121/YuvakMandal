import React, { useContext, useEffect, useState, useRef } from 'react';
import AuthContext from '../../context/AuthContext';
import ContributionCalendar from './ContributionCalendar';
import DigitalIdCard from './DigitalIdCard';
import axios from 'axios';
import { Upload, Loader, X, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import Cropper from 'react-easy-crop';
import 'react-easy-crop/react-easy-crop.css';

const UserProfile = () => {
  const { user, loadUser } = useContext(AuthContext);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState({ type: '', text: '' });
  const [showCropModal, setShowCropModal] = useState(false);
  const [imageToCrop, setImageToCrop] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const fileInputRef = useRef(null);
  const cropCanvasRef = useRef(null);
  const baseURL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    loadUser();
    // eslint-disable-next-line
  }, []);

  const onCropComplete = (croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const getCroppedImage = async () => {
    if (!imageToCrop || !croppedAreaPixels) return null;

    try {
      const image = new Image();
      image.src = imageToCrop;

      return new Promise((resolve) => {
        image.onload = () => {
          const canvas = cropCanvasRef.current || document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          canvas.width = croppedAreaPixels.width;
          canvas.height = croppedAreaPixels.height;

          ctx.drawImage(
            image,
            croppedAreaPixels.x,
            croppedAreaPixels.y,
            croppedAreaPixels.width,
            croppedAreaPixels.height,
            0,
            0,
            croppedAreaPixels.width,
            croppedAreaPixels.height
          );

          canvas.toBlob((blob) => {
            resolve(blob);
          }, 'image/jpeg', 0.95);
        };
      });
    } catch (err) {
      console.error('Error cropping image:', err);
      return null;
    }
  };

  const handleCropConfirm = async () => {
    setIsUploading(true);
    setUploadMessage({ type: '', text: '' });

    try {
      const croppedBlob = await getCroppedImage();
      if (!croppedBlob) {
        setUploadMessage({ type: 'error', text: 'Error preparing image for upload' });
        setIsUploading(false);
        return;
      }

      const formData = new FormData();
      formData.append('profileImage', croppedBlob, 'profile.jpg');

      const res = await axios.post(
        `${baseURL}/api/users/${user._id}/upload-profile-image`,
        formData
        // Token is already in axios defaults via setAuthToken
      );

      setUploadMessage({ type: 'success', text: 'Profile image updated successfully!' });
      setShowCropModal(false);
      setImageToCrop(null);
      
      // Reload user data to get updated image
      await loadUser();
      
      // Clear input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      console.error('Error uploading image:', err);
      setUploadMessage({ 
        type: 'error', 
        text: err.response?.data?.message || 'Error uploading image. Please try again.' 
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadMessage({ type: 'error', text: 'Image size must be less than 5MB' });
      return;
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      setUploadMessage({ type: 'error', text: 'Only JPEG, PNG, and GIF images are allowed' });
      return;
    }

    // Read file and show crop modal
    const reader = new FileReader();
    reader.onload = () => {
      setImageToCrop(reader.result);
      setShowCropModal(true);
      setZoom(1);
      setCrop({ x: 0, y: 0 });
      setUploadMessage({ type: '', text: '' });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-6">Your Profile</h1>

          {user ? (
            <div className="bg-white p-6 rounded-lg shadow max-w-md">
              <div className="mb-4 pb-4 border-b">
                <h3 className="text-sm text-gray-600">Full Name</h3>
                <p className="text-lg font-medium">{user.name}</p>
              </div>

              <div className="mb-4 pb-4 border-b">
                <h3 className="text-sm text-gray-600">Mobile Number</h3>
                <p className="text-lg font-medium">{user.mobileNumber}</p>
              </div>

              <div className="mb-4 pb-4 border-b">
                <h3 className="text-sm text-gray-600">Email Address</h3>
                <p className="text-lg font-medium">{user.email || 'N/A'}</p>
              </div>

              <div className="mb-4 pb-4 border-b">
                <h3 className="text-sm text-gray-600">Village</h3>
                <p className="text-lg font-medium">{user.villageName}</p>
              </div>

              <div className="mb-4">
                <h3 className="text-sm text-gray-600">Designation</h3>
                <p className="text-lg font-medium">{user.role}</p>
              </div>

              <div className="mt-6 text-sm text-gray-600">
                <p>Note: Only Admin can update profile information.</p>
              </div>
            </div>
          ) : (
            <p>Loading profile information...</p>
          )}
        </div>

        {/* User Image Section */}
        <div className="md:w-1/3">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Profile Photo</h2>

            {user && user?.image?.includes("https://res") ? (
              <div className="w-full aspect-square overflow-hidden rounded-lg mb-4">
                <img
                  src={user?.image}
                  alt={`${user.name}'s profile`}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-full aspect-square bg-gray-200 flex items-center justify-center rounded-lg mb-4">
                <span className="text-gray-500 text-6xl font-light">
                  {user ? user?.name?.charAt(0).toUpperCase() : "?"}
                </span>
              </div>
            )}

            {/* Upload Section */}
            <div className="space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                disabled={isUploading}
                className="hidden"
              />
              
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading || showCropModal}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition"
              >
                {isUploading ? (
                  <>
                    <Loader size={18} className="animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload size={18} />
                    Update Photo
                  </>
                )}
              </button>

              {uploadMessage.text && (
                <div className={`p-3 rounded-md text-sm ${
                  uploadMessage.type === 'success'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {uploadMessage.text}
                </div>
              )}

              <p className="text-xs text-gray-500">
                Supported formats: JPEG, PNG, GIF • Max size: 5MB
              </p>
            </div>

            {/* Crop Modal */}
            {showCropModal && imageToCrop && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full mx-4 p-6 max-h-[90vh] overflow-y-auto">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold">Crop Profile Image</h3>
                    <button
                      onClick={() => {
                        setShowCropModal(false);
                        setImageToCrop(null);
                      }}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <X size={24} />
                    </button>
                  </div>

                  {/* Crop Area */}
                  <div className="relative w-full h-96 bg-gray-100 rounded-lg overflow-hidden mb-4">
                    <Cropper
                      image={imageToCrop}
                      crop={crop}
                      zoom={zoom}
                      aspect={1 / 1}
                      cropShape="round"
                      showGrid={true}
                      onCropChange={setCrop}
                      onCropComplete={onCropComplete}
                      onZoomChange={setZoom}
                    />
                  </div>

                  {/* Zoom Control */}
                  <div className="mb-4 space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Zoom</label>
                    <div className="flex items-center gap-3">
                      <ZoomOut size={20} className="text-gray-600" />
                      <input
                        type="range"
                        min="1"
                        max="3"
                        step="0.1"
                        value={zoom}
                        onChange={(e) => setZoom(parseFloat(e.target.value))}
                        className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <ZoomIn size={20} className="text-gray-600" />
                    </div>
                  </div>

                  {/* Reset Button */}
                  <div className="mb-6">
                    <button
                      onClick={() => {
                        setCrop({ x: 0, y: 0 });
                        setZoom(1);
                      }}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition"
                    >
                      <RotateCcw size={18} />
                      Reset
                    </button>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setShowCropModal(false);
                        setImageToCrop(null);
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCropConfirm}
                      disabled={isUploading}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition font-medium"
                    >
                      {isUploading ? (
                        <>
                          <Loader size={18} className="animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload size={18} />
                          Upload
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Digital ID Card Section */}
      {user && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-6">Digital Membership Card</h2>
          <div className="flex justify-center bg-gray-50 rounded-xl p-8">
            <DigitalIdCard user={user} />
          </div>
        </div>
      )}

      {/* Contribution Calendar Section */}
      <ContributionCalendar />
    </div>
  );
};

export default UserProfile;