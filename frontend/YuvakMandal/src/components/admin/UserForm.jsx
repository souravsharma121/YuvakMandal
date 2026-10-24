// src/components/admin/UserForm.jsx
import React, { useState, useContext, useEffect } from 'react';
import AuthContext from '../../context/AuthContext';
import AlertContext from '../../context/AlertContext';
import { X, User, Phone, Mail, Lock, MapPin, Briefcase, ShieldCheck, ChevronDown } from 'lucide-react';

const UserForm = ({ user, onClose, onSuccess }) => {
  const { addUser, updateUser, checkRoleAvailability } = useContext(AuthContext);
  const { setAlert } = useContext(AlertContext);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    mobileNumber: '',
    email: '',
    password: '',
    villageName: '',
    role: 'Other Member',
    isActive: 'Yes'
  });

  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        mobileNumber: user.mobileNumber,
        email: user.email || '',
        password: '',
        villageName: user.villageName,
        role: user.role,
        isActive: user.isActive || 'Yes'
      });
      setIsEditing(true);
    }
  }, [user]);

  const { name, mobileNumber, email, password, villageName, role, isActive } = formData;

  const onChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async e => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!name || !mobileNumber || (!isEditing && !password) || !villageName) {
        setAlert('Please fill all required fields', 'danger');
        setLoading(false);
        return;
      }

      if (['Pradhan', 'Secretary', 'Treasurer', 'Chief Advisor'].includes(role) && !isEditing) {
        const isAvailable = await checkRoleAvailability(role);
        if (!isAvailable) {
          setAlert(`A ${role} already exists`, 'danger');
          setLoading(false);
          return;
        }
      }

      const userData = {
        name,
        mobileNumber,
        email,
        villageName,
        role,
        isActive
      };

      if (password) {
        userData.password = password;
      }

      if (isEditing) {
        await updateUser(user._id, userData);
        setAlert('User updated successfully', 'success');
      } else {
        await addUser(userData);
        setAlert('User added successfully', 'success');
      }

      if (onSuccess) {
        onSuccess();
      } else {
        onClose();
      }

    } catch (err) {
      console.error("Error submitting form", err);
      setAlert('Operation failed', 'danger');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white w-full max-w-2xl mx-auto rounded-2xl shadow-2xl overflow-hidden relative border border-gray-100 flex flex-col max-h-[90vh]">
      {/* Header with Gradient */}
      <div className="flex justify-between items-center px-6 py-5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md z-10">
        <div>
          <h2 className="text-xl font-bold tracking-wide">
            {isEditing ? 'Edit Profile' : 'New Registration'}
          </h2>
          <p className="text-indigo-100 text-sm mt-0.5 opacity-90">
            {isEditing ? 'Update member details and permissions' : 'Add a new member to the organization'}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all backdrop-blur-sm"
        >
          <X size={20} />
        </button>
      </div>

      {/* Form Content */}
      <form onSubmit={onSubmit} className="p-6 md:p-8 overflow-y-auto bg-gray-50/30 flex-1">
        <div className="space-y-6">

          {/* Row 1 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col relative group">
              <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Full Name <span className="text-red-500">*</span></label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-500 transition-colors">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  name="name"
                  value={name}
                  onChange={onChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all bg-white text-gray-900 placeholder:text-gray-400 shadow-sm"
                  placeholder="e.g. Rahul Sharma"
                  required
                />
              </div>
            </div>
            <div className="flex flex-col relative group">
              <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Mobile Number <span className="text-red-500">*</span></label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-500 transition-colors">
                  <Phone size={18} />
                </div>
                <input
                  type="text"
                  name="mobileNumber"
                  value={mobileNumber}
                  onChange={onChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all bg-white text-gray-900 placeholder:text-gray-400 shadow-sm"
                  placeholder="e.g. 9876543210"
                  required
                />
              </div>
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col relative group">
              <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-500 transition-colors">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={onChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all bg-white text-gray-900 placeholder:text-gray-400 shadow-sm"
                  placeholder="e.g. rahul@example.com"
                />
              </div>
            </div>
            <div className="flex flex-col relative group">
              <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">
                Password {!isEditing && <span className="text-red-500">*</span>}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-500 transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  name="password"
                  value={password}
                  onChange={onChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all bg-white text-gray-900 placeholder:text-gray-400 shadow-sm"
                  placeholder={isEditing ? "Leave blank to keep current" : "Create a secure password"}
                  {...(!isEditing && { required: true })}
                />
              </div>
            </div>
          </div>

          {/* Row 3 - Village */}
          <div className="flex flex-col relative group">
            <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Village Name <span className="text-red-500">*</span></label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-500 transition-colors">
                <MapPin size={18} />
              </div>
              <input
                type="text"
                name="villageName"
                value={villageName}
                onChange={onChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all bg-white text-gray-900 placeholder:text-gray-400 shadow-sm"
                placeholder="e.g. Burahan"
                required
              />
            </div>
          </div>

          {/* Row 4 - Role & Active Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col relative group">
              <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Designation <span className="text-red-500">*</span></label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-500 transition-colors">
                  <Briefcase size={18} />
                </div>
                <select
                  name="role"
                  value={role}
                  onChange={onChange}
                  className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all bg-white text-gray-900 appearance-none shadow-sm cursor-pointer"
                  required
                >
                  <option value="Admin">Admin</option>
                  <option value="Pradhan">Pradhan</option>
                  <option value="Up Pradhan">Up Pradhan</option>
                  <option value="Secretary">Secretary</option>
                  <option value="Treasurer">Treasurer</option>
                  <option value="Chief Advisor">Chief Advisor</option>
                  <option value="Advisor">Advisor</option>
                  <option value="Core Member">Core Member</option>
                  <option value="Other Member">Other Member</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                  <ChevronDown size={16} />
                </div>
              </div>
            </div>
            <div className="flex flex-col relative group">
              <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Active Status</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-500 transition-colors">
                  <ShieldCheck size={18} />
                </div>
                <select
                  name="isActive"
                  value={isActive}
                  onChange={onChange}
                  className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all bg-white text-gray-900 appearance-none shadow-sm cursor-pointer"
                >
                  <option value="Yes">Active Account</option>
                  <option value="No">Suspended / Inactive</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                  <ChevronDown size={16} />
                </div>
              </div>
            </div>
          </div>

          {/* Dynamic Note */}
          {['Pradhan', 'Secretary', 'Treasurer', 'Chief Advisor', 'Up Pradhan'].includes(role) && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-4 shadow-sm animate-in fade-in slide-in-from-top-2">
              <div className="bg-amber-100 p-2 rounded-full text-amber-600 shrink-0">
                <Briefcase size={18} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-amber-800">Position Limit</h4>
                <p className="text-xs text-amber-600 mt-0.5">
                  Please ensure there is only one <strong>{role}</strong> in the system to avoid conflicts with authority roles.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-3 pt-6 mt-8 border-t border-gray-100/50">
          <button
            type="button"
            className="px-6 py-2.5 rounded-xl text-gray-600 font-medium hover:bg-gray-100 hover:text-gray-900 transition-colors border border-transparent"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className={`px-8 py-2.5 rounded-xl text-white font-medium shadow-lg shadow-indigo-500/30 transition-all active:scale-95
                ${loading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:to-indigo-600 hover:shadow-indigo-500/40 transform hover:-translate-y-0.5'}`}
          >
            {loading ? 'Processing...' : (isEditing ? 'Save Changes' : 'Create Member')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserForm;