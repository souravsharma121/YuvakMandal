import React, { useEffect, useState } from 'react';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';

const NotificationList = () => {
  const { notifications, loading, getNotifications, deleteNotification } = useNotification();
  const { user } = useAuth();
  const [deletingId, setDeletingId] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  
  useEffect(() => {
    getNotifications();
  }, []);
  
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const confirmDelete = (notification) => {
    setSelectedNotification(notification);
    setShowConfirmModal(true);
  };
  
  const closeModal = () => {
    setShowConfirmModal(false);
    setSelectedNotification(null);
  };
  
  const handleDelete = async () => {
    if (!selectedNotification) return;
    
    setDeletingId(selectedNotification._id);
    const success = await deleteNotification(selectedNotification._id);
    
    if (success) {
      closeModal();
    }
    
    setDeletingId(null);
  };
  
  // Check if user can delete (admin or the creator)
  const canDelete = (notification) => {
    return user && (
      user.role === 'Admin' || 
      (notification.createdBy && notification.createdBy._id === user._id)
    );
  };
  
  if (loading && notifications.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold p-6 border-b">Notifications</h2>
      
      {notifications.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No notifications available.
        </div>
      ) : (
        <div className="divide-y divide-gray-200">
          {notifications.map(notification => (
            <div key={notification._id} className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{notification.title}</h3>
                  <p className="text-sm text-gray-500 mb-3">
                    By {notification.createdBy?.name || 'User'} ({notification.createdBy?.role || 'Member'}) • {formatDate(notification.createdAt)}
                  </p>
                  <div className="text-gray-700 whitespace-pre-line">{notification.message}</div>
                </div>
                
                {canDelete(notification) && (
                  <button
                    onClick={() => confirmDelete(notification)}
                    className="ml-4 p-2 text-red-500 hover:text-red-700 focus:outline-none"
                    disabled={deletingId === notification._id}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm">
            <h3 className="text-xl font-semibold mb-4">Delete Notification</h3>
            
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete this notification? This action cannot be undone.
            </p>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={closeModal}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                disabled={deletingId === selectedNotification?._id}
              >
                {deletingId === selectedNotification?._id ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Deleting...
                  </span>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationList;