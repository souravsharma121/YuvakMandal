import React, { useContext, useEffect } from 'react';
import AuthContext from '../../context/AuthContext';

const UserProfile = () => {
  const { user, loadUser } = useContext(AuthContext);
  
  useEffect(() => {
    loadUser();
    // eslint-disable-next-line
  }, []);
  
  return (
    <div className="p-6 flex flex-col md:flex-row gap-6">
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
              <h3 className="text-sm text-gray-600">Village</h3>
              <p className="text-lg font-medium">{user.villageName}</p>
            </div>
            
            <div className="mb-4">
              <h3 className="text-sm text-gray-600">Role</h3>
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
          
          {user && user?.image.includes("https://res") ? (
            <div className="w-full aspect-square overflow-hidden rounded-lg">
              <img 
                src={user?.image} 
                alt={`${user.name}'s profile`}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-full aspect-square bg-gray-200 flex items-center justify-center rounded-lg">
              <span className="text-gray-500 text-6xl font-light">
                {user ? user.name.charAt(0).toUpperCase() : "?"}
              </span>
            </div>
          )}
          
          <div className="mt-4 text-sm text-gray-600">
            <p>Contact admin to update your profile photo.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;