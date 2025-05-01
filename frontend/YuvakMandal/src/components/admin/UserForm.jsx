// src/components/admin/UserForm.jsx
import React, { useState, useContext, useEffect } from 'react';
import AuthContext from '../../context/AuthContext';
import AlertContext from '../../context/AlertContext';

const UserForm = ({ user, onClose }) => {
  const { addUser, updateUser, checkRoleAvailability } = useContext(AuthContext);
  const { setAlert } = useContext(AlertContext);
  
  const [formData, setFormData] = useState({
    name: '',
    mobileNumber: '',
    password: '',
    villageName: '',
    role: 'Other Member'
  });
  
  const [isEditing, setIsEditing] = useState(false);
  
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        mobileNumber: user.mobileNumber,
        password: '', // Password is not pre-filled for security
        villageName: user.villageName,
        role: user.role
      });
      setIsEditing(true);
    }
  }, [user]);
  
  const { name, mobileNumber, password, villageName, role } = formData;
  
  const onChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const onSubmit = async e => {
    e.preventDefault();
    
    // Validate form
    if (!name || !mobileNumber || (!isEditing && !password) || !villageName) {
      return setAlert('Please fill all required fields', 'danger');
    }
    
    // Check if unique role is available (for Pradhan, Secretary, Treasurer)
    if (['Pradhan', 'Secretary', 'Treasurer'].includes(role) && !isEditing) {
      const isAvailable = await checkRoleAvailability(role);
      if (!isAvailable) {
        return setAlert(`A ${role} already exists`, 'danger');
      }
    }
    
    // Create submission object
    const userData = {
      name,
      mobileNumber,
      villageName,
      role
    };
    
    if (password) {
      userData.password = password;
    }
    
    if (isEditing) {
      updateUser(user._id, userData);
      setAlert('User updated successfully', 'success');
    } else {
      addUser(userData);
      setAlert('User added successfully', 'success');
    }
    
    onClose();
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow mb-6">
      <h2 className="text-xl font-semibold mb-4">
        {isEditing ? 'Edit User' : 'Add New User'}
      </h2>
      
      <form onSubmit={onSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Full Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={name}
              onChange={onChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          
          <div>
            <label htmlFor="mobileNumber" className="block text-sm font-medium text-gray-700">
              Mobile Number *
            </label>
            <input
              type="text"
              id="mobileNumber"
              name="mobileNumber"
              value={mobileNumber}
              onChange={onChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password {!isEditing && '*'} {isEditing && '(Leave blank to keep current)'}
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={onChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              {...(!isEditing && { required: true })}
            />
          </div>
          
          <div>
            <label htmlFor="villageName" className="block text-sm font-medium text-gray-700">
              Village Name *
            </label>
            <input
              type="text"
              id="villageName"
              name="villageName"
              value={villageName}
              onChange={onChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          
          <div className="md:col-span-2">
            <label htmlFor="role" className="block text-sm font-medium text-gray-700">
            Designation *
            </label>
            <select
              id="role"
              name="role"
              value={role}
              onChange={onChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            >
              <option value="Admin">Admin</option>
              <option value="Pradhan">Pradhan</option>
              <option value="Secretary">Secretary</option>
              <option value="Treasurer">Treasurer</option>
              <option value="Chief Advisor">Chief Advisor</option>
              <option value="Advisor">Advisor</option>
              <option value="Core Member">Core Member</option>
              <option value="Other Member">Other Member</option>
            </select>
            
            {['Pradhan', 'Secretary', 'Treasurer'].includes(role) && (
              <p className="mt-1 text-sm text-gray-500">
                Note: There can only be one {role.toLowerCase()} in the system.
              </p>
            )}
          </div>
        </div>
        
        <div className="flex justify-end space-x-3 mt-6">
          <button
            type="button"
            className="bg-gray-300 text-gray-800 py-2 px-4 rounded hover:bg-gray-400"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700"
          >
            {isEditing ? 'Update User' : 'Add User'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserForm;