import React, { useContext, useEffect, useState } from 'react';
import AuthContext from '../../context/AuthContext';
import AlertContext from '../../context/AlertContext';
import UserForm from './UserForm';
import SkeletonLoader from '../loader/SkeletonLoader';
import { Edit2, Trash2, Plus, Search, User, Phone, MapPin, Mail, Shield, LayoutGrid, List, KeyRound } from 'lucide-react';
import AdminResetPassword from './AdminResetPassword';

const UserManagement = () => {
  const { getAllUsers, deleteUser } = useContext(AuthContext);
  const { setAlert } = useContext(AlertContext);
  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [resetTarget, setResetTarget] = useState(null);

  const fetchUsers = async () => {
    // keeping loading quiet for refresh updates to avoid flicker, only excessive loading for initial
    if (users.length === 0) setIsLoading(true);
    try {
      const fetchedUsers = await getAllUsers();
      setUsers(fetchedUsers);
      setFilteredUsers(fetchedUsers);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const lowerCaseSearch = searchTerm.toLowerCase();
      const filtered = users.filter(user =>
        user.name.toLowerCase().includes(lowerCaseSearch) ||
        user.mobileNumber.includes(searchTerm) ||
        (user.email && user.email.toLowerCase().includes(lowerCaseSearch)) ||
        user.villageName.toLowerCase().includes(lowerCaseSearch) ||
        user.role.toLowerCase().includes(lowerCaseSearch)
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [searchTerm, users]);

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

  const handleFormSuccess = () => {
    fetchUsers();
    handleCloseForm();
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteUser(userId);
        setAlert('User deleted successfully', 'success');
        fetchUsers(); // Refresh list
      } catch (error) {
        setAlert('Failed to delete user', 'danger');
      }
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'Admin': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Pradhan': return 'bg-red-100 text-red-800 border-red-200';
      case 'Secretary': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Treasurer': return 'bg-green-100 text-green-800 border-green-200';
      case 'Chief Advisor':
      case 'Advisor': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Core Member': return 'bg-amber-100 text-amber-800 border-amber-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (isLoading && users.length === 0) {
    return (
      <div className="p-6">
        <SkeletonLoader type="text" size="lg" className="mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          <SkeletonLoader type="dashboard-card" count={3} />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen bg-gray-50/50">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">User Management</h1>
          <p className="text-gray-500 mt-1">Manage members, roles and permissions</p>
        </div>
        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="bg-white border border-gray-200 p-1 rounded-xl flex items-center shadow-sm">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-indigo-100 text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
              title="Grid View"
            >
              <LayoutGrid size={20} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-indigo-100 text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
              title="List View"
            >
              <List size={20} />
            </button>
          </div>

          <button
            className="flex items-center gap-2 bg-indigo-600 text-white py-2.5 px-5 rounded-xl hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-indigo-500/30"
            onClick={handleAddUser}
          >
            <Plus size={20} />
            <span>Add New Member</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex items-center gap-3">
        <Search className="text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search by name, number, village or role..."
          className="flex-1 outline-none text-gray-700 placeholder:text-gray-400"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Modal for User Form */}
      {showAddUserForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity" aria-hidden="true" onClick={handleCloseForm}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <UserForm
                user={editingUser}
                onClose={handleCloseForm}
                onSuccess={handleFormSuccess}
              />
            </div>
          </div>
        </div>
      )}

      {resetTarget && (
        <AdminResetPassword user={resetTarget} onClose={() => setResetTarget(null)} />
      )}

      {/* Users List - Responsive Grid */}
      {/* Users List - Grid vs List View */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredUsers.map(user => (
            <div key={user._id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${getRoleBadgeColor(user.role).replace('text-', 'bg-opacity-20 ')}`}>
                    {user.image && user.image.includes('http') ? (
                      <img src={user.image} alt={user.name} className="w-full h-full object-cover rounded-full" />
                    ) : (
                      user.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 text-lg leading-tight">{user.name}</h3>
                    <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getRoleBadgeColor(user.role)}`}>
                      {user.role}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEditUser(user)}
                    className="p-2 text-gray-500 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-colors"
                    title="Edit User"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => setResetTarget(user)}
                    className="p-2 text-gray-500 hover:bg-amber-50 hover:text-amber-600 rounded-lg transition-colors"
                    title="Reset Password"
                  >
                    <KeyRound size={18} />
                  </button>
                  <button
                    onClick={() => handleDeleteUser(user._id)}
                    className="p-2 text-gray-500 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                    title="Delete User"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-center gap-3 text-gray-600 text-sm">
                  <Phone size={16} className="text-gray-400" />
                  <span>{user.mobileNumber}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600 text-sm">
                  <Mail size={16} className="text-gray-400" />
                  <span className="truncate">{user.email || 'No email added'}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600 text-sm">
                  <MapPin size={16} className="text-gray-400" />
                  <span>{user.villageName}</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-50 flex justify-between items-center text-xs text-gray-400">
                <span>ID: {user._id.slice(-6).toUpperCase()}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${user.isActive === 'No' ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-600'}`}>
                  {user.isActive === 'No' ? 'INACTIVE' : 'ACTIVE'}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100 text-xs uppercase text-gray-500 font-semibold tracking-wider">
                  <th className="px-6 py-4">Member</th>
                  <th className="px-6 py-4">Contact Info</th>
                  <th className="px-6 py-4">Village</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.map(user => (
                  <tr key={user._id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${getRoleBadgeColor(user.role).replace('text-', 'bg-opacity-20 ')}`}>
                          {user.image && user.image.includes('http') ? (
                            <img src={user.image} alt={user.name} className="w-full h-full object-cover rounded-full" />
                          ) : (
                            user.name.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800 text-sm">{user.name}</p>
                          <p className="text-xs text-gray-400">ID: {user._id.slice(-6).toUpperCase()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone size={14} className="text-gray-400" />
                          <span>{user.mobileNumber}</span>
                        </div>
                        {user.email && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Mail size={14} className="text-gray-400" />
                            <span className="truncate max-w-[150px]">{user.email}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin size={14} className="text-gray-400" />
                        <span>{user.villageName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getRoleBadgeColor(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${user.isActive === 'No' ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-600'}`}>
                        {user.isActive === 'No' ? 'INACTIVE' : 'ACTIVE'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEditUser(user)}
                          className="p-1.5 text-gray-500 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-colors"
                          title="Edit User"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => setResetTarget(user)}
                          className="p-1.5 text-gray-500 hover:bg-amber-50 hover:text-amber-600 rounded-lg transition-colors"
                          title="Reset Password"
                        >
                          <KeyRound size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user._id)}
                          className="p-1.5 text-gray-500 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                          title="Delete User"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {filteredUsers.length === 0 && !isLoading && (
        <div className="text-center py-20">
          <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
            <User size={32} />
          </div>
          <h3 className="text-lg font-medium text-gray-900">No users found</h3>
          <p className="text-gray-500">Try adjusting your search query or add a new member.</p>
        </div>
      )}
    </div>
  );
};

export default UserManagement;