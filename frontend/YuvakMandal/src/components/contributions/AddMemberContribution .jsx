import React, { useState, useEffect, useRef } from 'react';
import { useContribution } from '../../context/ContributionContext';
import axios from 'axios';
import { AlertCircle, CheckCircle, ChevronDown, CreditCard, Calendar, User, FileText, IndianRupee, Search } from 'lucide-react';

const baseURL = import.meta.env.VITE_API_URL;

const AddMemberContribution = () => {
  const { addMemberContribution } = useContribution();  
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  
  const searchInputRef = useRef(null);
  const dropdownRef = useRef(null);
  const amountInputRef = useRef(null);
  const notesInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    userId: '',
    amount: '',
    month: '',
    year: new Date().getFullYear(),
    notes: ''
  });
  
  const { userId, amount, month, year, notes } = formData;
  
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const years = [];
  const currentYear = new Date().getFullYear();
  for (let i = currentYear - 1; i <= currentYear + 1; i++) {
    years.push(i);
  }
  
  // Fetch members on component mount
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await axios.get(`${baseURL}/api/users`);
        setMembers(res.data);
        setFilteredMembers(res.data); // Initialize filtered members with all members
      } catch (err) {
        console.error('Failed to fetch members:', err);
        setErrorMessage('Failed to load members. Please try again later.');
      }
    };

    fetchMembers();
  }, []);
  
  // Filter members when search term changes
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredMembers(members);
    } else {
      const lowerSearchTerm = searchTerm.toLowerCase();
  
      const filtered = members.filter(member => {
        const fullInfo = `${member.name} - ${member.villageName || ''}`.toLowerCase();
        return fullInfo.includes(lowerSearchTerm);
      });
  
      setFilteredMembers(filtered);
    }
  }, [searchTerm, members]);
  

  // Handle clicks outside the dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) && 
          searchInputRef.current && !searchInputRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef, searchInputRef]);

  const onChange = (e) => {    
    const { name, value } = e.target;
    
    setFormData(prevState => ({ ...prevState, [name]: value }));
    
    // Clear messages when form changes
    setSuccessMessage('');
    setErrorMessage('');
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    
    // Only show dropdown if we have a search term or there are members to show
    if (e.target.value.trim() !== '' || members.length > 0) {
      setShowDropdown(true);
    }
  };
  
  const handleSelectMember = (id, name, villageName) => {
    // Update formData and searchTerm
    setFormData(prevState => ({ ...prevState, userId: id }));
    setSearchTerm(`${name} - ${villageName}`);
    
    // Close dropdown after selection
    setShowDropdown(false);
    
    // Focus on amount input after selecting a member
    setTimeout(() => {
      if (amountInputRef.current) {
        amountInputRef.current.focus();
      }
    }, 0);
  };
  
  const onSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage('');
    setErrorMessage('');
    
    try {
      // Validate that a user is selected
      if (!userId) {
        setErrorMessage('Please select a member');
        setLoading(false);
        return;
      }
      
      // Get the current user's information
      const currentUser = await axios.get(`${baseURL}/api/auth/me`);
      const isOwnContribution = userId === currentUser.data._id;
      const isAdminOrTreasurer = ['Admin', 'Treasurer'].includes(currentUser.data.role);
      
      // First check if contribution already exists for this user, month and year
      if (!isOwnContribution && !isAdminOrTreasurer) {
        const checkRes = await axios.get(`${baseURL}/api/contributions/user/${userId}`);
      
        const existingContribution = checkRes.data.find(
          c => c.month === month && c.year === parseInt(year)
        );
      
        if (existingContribution) {
          setErrorMessage(`A contribution for ${getSelectedMemberName()} already exists for ${month} ${year}`);
          setLoading(false);
          return;
        }
      }
      
      // If no existing contribution or if admin/treasurer adding for themselves, proceed
      const contributionData = {
        user: userId,
        amount: parseFloat(amount),
        month,
        year: parseInt(year),
        notes: `Added by treasurer/admin. ${notes}`
      };
      
      // Use the context method for admin/treasurer contribution
      const success = await addMemberContribution(contributionData);
      
      if (success) {
        setSuccessMessage(`Contribution for ${getSelectedMemberName()} has been added successfully!`);
        setFormData({
          userId: '',
          amount: '',
          month: '',
          year: new Date().getFullYear(),
          notes: ''
        });
        setSearchTerm('');
        
        // Focus on search input after successful submission
        setTimeout(() => {
          if (searchInputRef.current) {
            searchInputRef.current.focus();
          }
        }, 0);
      }
    } catch (err) {
      console.error('Error submitting contribution:', err);
      setErrorMessage(err.response?.data?.message || 'Failed to add contribution');
    }
    
    setLoading(false);
  };
  
  const getSelectedMemberName = () => {
    const member = members.find(m => m._id === userId);
    return member ? member.name : '';
  };

  const Alert = ({ type, message }) => {
    return type === 'success' ? (
      <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-r-md">
        <div className="flex items-center">
          <CheckCircle className="w-5 h-5 mr-3 text-green-500" />
          <span className="text-green-800 font-medium">{message}</span>
        </div>
      </div>
    ) : (
      <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-md">
        <div className="flex items-center">
          <AlertCircle className="w-5 h-5 mr-3 text-red-500" />
          <span className="text-red-800 font-medium">{message}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-2xl mx-auto border border-gray-100">
        <h2 className="text-2xl font-bold mb-2 text-gray-800">Add Member Contribution</h2>
        <p className="text-gray-500 mb-6">Record a new financial contribution for a society member</p>
        
        {successMessage && <Alert type="success" message={successMessage} />}
        {errorMessage && <Alert type="error" message={errorMessage} />}
        
        <form onSubmit={onSubmit} className="space-y-2">
          {/* Search and select members directly */}
          <div className="mb-5">
            <label className="block text-gray-700 font-medium mb-2" htmlFor="memberSearch">
              <div className="flex items-center">
                <Search className="w-5 h-5 text-gray-500" />
                <span className="ml-2">Search and Select Member</span>
              </div>
            </label>
            <div className="relative">
              <input
                type="text"
                id="memberSearch"
                ref={searchInputRef}
                value={searchTerm}
                onChange={handleSearchChange}
                onFocus={() => setShowDropdown(true)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-800"
                placeholder="Type to search by name or village"
                autoComplete="off"
              />
              
              {showDropdown && filteredMembers.length > 0 && (
                <div 
                  ref={dropdownRef}
                  className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto"
                >
                  {filteredMembers.map(member => (
                    <div 
                      key={member._id}
                      onClick={() => handleSelectMember(member._id, member.name, member.villageName)}
                      className="px-4 py-2 hover:bg-blue-50 cursor-pointer flex items-center"
                    >
                      <User className="w-4 h-4 text-gray-400 mr-2" />
                      <div>
                        <div className="font-medium">{member.name}</div>
                        <div className="text-xm text-gray-500">{member.villageName || 'No Village'}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {showDropdown && filteredMembers.length === 0 && searchTerm && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg p-4 text-center text-gray-500">
                  No members found matching "{searchTerm}"
                </div>
              )}
            </div>
          </div>
          
          <div className="mb-5">
            <label className="block text-gray-700 font-medium mb-2" htmlFor="amount">
              <div className="flex items-center">
                <IndianRupee className="w-5 h-5 text-gray-500" />
                <span className="ml-2">Amount (₹)</span>
              </div>
            </label>
            <div className="relative">
              <input
                type="text"
                inputMode="decimal"
                pattern="[0-9]*"
                id="amount"
                name="amount"
                value={amount}
                onChange={onChange}
                ref={amountInputRef}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-800"
                min="1"
                required
                placeholder="Enter contribution amount"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 font-medium">₹</span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="mb-5">
              <label className="block text-gray-700 font-medium mb-2" htmlFor="month">
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 text-gray-500" />
                  <span className="ml-2">Month</span>
                </div>
              </label>
              <div className="relative">
                <select
                  id="month"
                  name="month"
                  value={month}
                  onChange={onChange}
                  className="appearance-none w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-800"
                  required
                >
                  <option value="">Select Month</option>
                  {months.map((month) => (
                    <option key={month} value={month}>
                      {month}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>
            
            <div className="mb-5">
              <label className="block text-gray-700 font-medium mb-2" htmlFor="year">
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 text-gray-500" />
                  <span className="ml-2">Year</span>
                </div>
              </label>
              <div className="relative">
                <select
                  id="year"
                  name="year"
                  value={year}
                  onChange={onChange}
                  className="appearance-none w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-800"
                  required
                >
                  <option value="">Select Year</option>
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>
          </div>
          
          <div className="mb-5">
            <label className="block text-gray-700 font-medium mb-2" htmlFor="notes">
              <div className="flex items-center">
                <FileText className="w-5 h-5 text-gray-500" />
                <span className="ml-2">Notes (Optional)</span>
              </div>
            </label>
            <textarea
              id="notes"
              name="notes"
              value={notes}
              onChange={onChange}
              ref={notesInputRef}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-800"
              rows="3"
              placeholder="Add any additional information about this contribution"
            ></textarea>
          </div>
          
          <div className="pt-4">
            <button
              type="submit"
              className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors shadow-md ${
                loading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                <div className="flex items-center justify-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  <span>Add Contribution</span>
                </div>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMemberContribution;