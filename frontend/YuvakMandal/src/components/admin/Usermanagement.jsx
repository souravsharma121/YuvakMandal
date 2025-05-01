import React, { useContext, useEffect, useState } from 'react';
import AuthContext from '../../context/AuthContext';
import AlertContext from '../../context/AlertContext';
import UserForm from './UserForm';
import SkeletonLoader from '../loader/SkeletonLoader';

const UserManagement = () => {
  const { getAllUsers, deleteUser } = useContext(AuthContext);
  const { setAlert } = useContext(AlertContext);
  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Add this line

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true); // Set loading to true before fetching
      try {
        const users = await getAllUsers();
        setUsers(users);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      } finally {
        setIsLoading(false); // Set loading to false after fetching
      }
    };
  
    fetchUsers();
    // eslint-disable-next-line
  }, []); 
  
  const handleAddUser = () => {
    setEditingUser(null);
    setShowAddUserForm(true);
  };
  
  const handleEditUser = (user) => {
    setEditingUser(user);
    setShowAddUserForm(true);
  };
  
  const handleCloseForm = () => {
    setShowAddUserForm(false);
    setEditingUser(null);
  };
  
  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      await deleteUser(userId);
      setAlert('User deleted successfully', 'success');
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <SkeletonLoader type="text" size="lg" className="mb-6" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          <SkeletonLoader type="dashboard-card" count={3} />
        </div>
        
        <div className="mt-10">
          <SkeletonLoader type="text" size="lg" className="mb-6" />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <SkeletonLoader type="user-card" count={4} />
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">User Management</h1>
        <button
          className="bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700"
          onClick={handleAddUser}
        >
          Add New User
        </button>
      </div>
      
      {showAddUserForm && (
        <div className="mb-8">
          <UserForm 
            user={editingUser} 
            onClose={handleCloseForm} 
          />
        </div>
      )}
      
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr>
              <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Mobile Number
              </th>
              <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Village
              </th>
              <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Designation
              </th>
              <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map(user => (
              <tr key={user._id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{user.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{user.mobileNumber}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{user.villageName}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${user.role === 'Admin' ? 'bg-purple-100 text-purple-800' : ''}
                    ${user.role === 'Pradhan' ? 'bg-red-100 text-red-800' : ''}
                    ${user.role === 'Secretary' ? 'bg-blue-100 text-blue-800' : ''}
                    ${user.role === 'Treasurer' ? 'bg-green-100 text-green-800' : ''}
                    ${user.role === 'Chief Advisor' ? 'bg-green-100 text-green-800' : ''}
                    ${user.role === 'Advisor' ? 'bg-green-100 text-green-800' : ''}
                    ${user.role === 'Core Member' ? 'bg-yellow-100 text-yellow-800' : ''}
                    ${user.role === 'Other Member' ? 'bg-gray-100 text-gray-800' : ''}
                  `}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                    onClick={() => handleEditUser(user)}
                  >
                    Edit
                  </button>
                  <button
                    className="text-red-600 hover:text-red-900"
                    onClick={() => handleDeleteUser(user._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;