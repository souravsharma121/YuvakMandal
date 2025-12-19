import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useEvent } from '../../context/EventContext';
import AlertContext from '../../context/AlertContext';
import AuthContext from '../../context/AuthContext';
import { 
  CalendarIcon, 
  MapPinIcon, 
  CurrencyRupeeIcon,
  PhotoIcon,
  ClockIcon,
  UsersIcon,
  DocumentTextIcon,
  TagIcon
} from '@heroicons/react/24/outline';

const EventForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { setAlert } = useContext(AlertContext);
  const { createEvent, updateEvent, getEvent, loading, error, clearError } = useEvent();
  const { user } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    name: '',
    type: 'cricket',
    entryFee: '',
    instructions: '',
    date: '',
    time: '',
    location: '',
    maxTeams: 2,
    registrationDeadline: '',
    totalOvers: 20,
    backgroundImage: null,
    user: user
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = Boolean(id);

  useEffect(() => {
    if (isEditing) {
      loadEvent();
    }
  }, [id]);

  useEffect(() => {
    if (error) {
      setAlert(error, 'error');
      clearError();
    }
  }, [error]);

  const loadEvent = async () => {
    try {
      const event = await getEvent(id);
      if (event) {
        setFormData({
          name: event.name,
          type: event.type,
          entryFee: event.entryFee.toString(),
          instructions: event.instructions,
          date: event.date.split('T')[0],
          time: event.time,
          location: event.location,
          maxTeams: event.maxTeams,
          registrationDeadline: event.registrationDeadline ? event.registrationDeadline.split('T')[0] : '',
          totalOvers: event.liveScore?.totalOvers || 20,
          backgroundImage: null,
          user: user
        });
        
        if (event.backgroundImage) {
          setImagePreview(`${process.env.REACT_APP_SERVER_URL || 'http://localhost:5000'}${event.backgroundImage}`);
        }
      }
    } catch (error) {
      setAlert('Error loading event details', 'error');
      navigate('/events');
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    
    if (type === 'file') {
      const file = files[0];
      if (file) {
        // Validate file type
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
        if (!validTypes.includes(file.type)) {
          setAlert('Please select a valid image file (JPEG, PNG, GIF)', 'error');
          return;
        }
        
        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
          setAlert('Image file size must be less than 5MB', 'error');
          return;
        }
        
        setFormData(prev => ({
          ...prev,
          [name]: file
        }));
        
        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => setImagePreview(e.target.result);
        reader.readAsDataURL(file);
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validation
      const errors = [];
      
      if (!formData.name.trim()) errors.push('Event name is required');
      if (!formData.entryFee || parseFloat(formData.entryFee) < 0) errors.push('Valid entry fee is required');
      if (!formData.instructions.trim()) errors.push('Instructions are required');
      if (!formData.date) errors.push('Event date is required');
      if (!formData.time) errors.push('Event time is required');
      if (!formData.location.trim()) errors.push('Location is required');
      
      // Check if event date is in the future
      const eventDate = new Date(`${formData.date}T${formData.time}`);
      const now = new Date();
      if (eventDate <= now && !isEditing) {
        errors.push('Event date and time must be in the future');
      }
      
      if (errors.length > 0) {
        setAlert(errors.join(', '), 'error');
        setIsSubmitting(false);
        return;
      }

      const submitData = {
        ...formData,
        entryFee: parseFloat(formData.entryFee),
        maxTeams: parseInt(formData.maxTeams),
        totalOvers: parseInt(formData.totalOvers)
      };

      if (isEditing) {
        await updateEvent(id, submitData);
        setAlert('Event updated successfully', 'success');
      } else {
        const newEvent = await createEvent(submitData);
        setAlert('Event created successfully', 'success');
        
        // Navigate to the new event's detail page
        navigate(`/events/${newEvent._id}`);
        return;
      }
      
      navigate('/events');
    } catch (error) {
      setAlert(error.response?.data?.msg || 'Error saving event', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const eventTypes = [
    { value: 'cricket', label: 'Cricket', icon: '🏏' },
    { value: 'volleyball', label: 'Volleyball', icon: '🏐' },
    { value: 'football', label: 'Football', icon: '⚽' },
    { value: 'kabaddi', label: 'Kabaddi', icon: '🤼' },
    { value: 'kho-kho', label: 'Kho-Kho', icon: '🏃' },
    { value: 'badminton', label: 'Badminton', icon: '🏸' },
    { value: 'table-tennis', label: 'Table Tennis', icon: '🏓' },
    { value: 'other', label: 'Other', icon: '🏆' }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b">
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Edit Event' : 'Create New Event'}
          </h1>
          <p className="text-gray-600 mt-1">
            {isEditing ? 'Update event details and settings' : 'Fill in the details to create a new event'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Event Name */}
              <div>
                <label htmlFor="name" className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <TagIcon className="w-4 h-4 mr-2" />
                  Event Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter event name"
                  required
                />
              </div>

              {/* Event Type */}
              <div>
                <label htmlFor="type" className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <TagIcon className="w-4 h-4 mr-2" />
                  Event Type *
                </label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  {eventTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.icon} {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Entry Fee */}
              <div>
                <label htmlFor="entryFee" className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <CurrencyRupeeIcon className="w-4 h-4 mr-2" />
                  Entry Fee (₹) *
                </label>
                <input
                  type="number"
                  id="entryFee"
                  name="entryFee"
                  value={formData.entryFee}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.00"
                  required
                />
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="date" className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    Date *
                  </label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="time" className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <ClockIcon className="w-4 h-4 mr-2" />
                    Time *
                  </label>
                  <input
                    type="time"
                    id="time"
                    name="time"
                    value={formData.time}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              {/* Location */}
              <div>
                <label htmlFor="location" className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <MapPinIcon className="w-4 h-4 mr-2" />
                  Location *
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter event location"
                  required
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Background Image */}
              <div>
                <label htmlFor="backgroundImage" className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <PhotoIcon className="w-4 h-4 mr-2" />
                  Background Image
                </label>
                <input
                  type="file"
                  id="backgroundImage"
                  name="backgroundImage"
                  onChange={handleInputChange}
                  accept="image/*"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Max file size: 5MB. Supported formats: JPEG, PNG, GIF</p>
                
                {imagePreview && (
                  <div className="mt-4">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-md border"
                    />
                  </div>
                )}
              </div>

              {/* Team Settings */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="maxTeams" className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <UsersIcon className="w-4 h-4 mr-2" />
                    Max Teams
                  </label>
                  <input
                    type="number"
                    id="maxTeams"
                    name="maxTeams"
                    value={formData.maxTeams}
                    onChange={handleInputChange}
                    min="2"
                    max="16"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                {formData.type === 'cricket' && (
                  <div>
                    <label htmlFor="totalOvers" className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      <ClockIcon className="w-4 h-4 mr-2" />
                      Total Overs
                    </label>
                    <input
                      type="number"
                      id="totalOvers"
                      name="totalOvers"
                      value={formData.totalOvers}
                      onChange={handleInputChange}
                      min="5"
                      max="50"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                )}
              </div>

              {/* Registration Deadline */}
              <div>
                <label htmlFor="registrationDeadline" className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  Registration Deadline
                </label>
                <input
                  type="date"
                  id="registrationDeadline"
                  name="registrationDeadline"
                  value={formData.registrationDeadline}
                  onChange={handleInputChange}
                  max={formData.date}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Leave blank to use event date as deadline</p>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-6">
            <label htmlFor="instructions" className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <DocumentTextIcon className="w-4 h-4 mr-2" />
              Event Instructions *
            </label>
            <textarea
              id="instructions"
              name="instructions"
              value={formData.instructions}
              onChange={handleInputChange}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter detailed instructions for the event including rules, requirements, and other important information..."
              required
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 mt-8 pt-6 border-t">
            <button
              type="button"
              onClick={() => navigate('/events')}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting || loading}
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {isEditing ? 'Updating...' : 'Creating...'}
                </div>
              ) : (
                isEditing ? 'Update Event' : 'Create Event'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventForm;