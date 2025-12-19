import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Trash2 } from 'lucide-react';
import AlertContext from '../../context/AlertContext';
import { useAuth } from '../../context/AuthContext';

const baseURL = import.meta.env.VITE_API_URL;

const ManageContributions = ({ members = [] }) => {
  const { setAlert } = useContext(AlertContext);
  const { user } = useAuth();
  const [contributions, setContributions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingIds, setDeletingIds] = useState([]);

  useEffect(() => {
    fetchContributions();
  }, []);

  const fetchContributions = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${baseURL}/api/contributions`);
      setContributions(res.data);
    } catch (err) {
      console.error('Failed to fetch contributions', err);
      setAlert({ type: 'error', message: 'Failed to load contributions' });
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm('Are you sure you want to remove this contribution entry? This action cannot be undone.');
    if (!confirmed) return;

    try {
      setDeletingIds(prev => [...prev, id]);
      await axios.delete(`${baseURL}/api/contributions/${id}`);
      setContributions(prev => prev.filter(c => c._id !== id));
      setAlert({ type: 'success', message: 'Contribution removed' });
    } catch (err) {
      console.error('Failed to delete contribution', err);
      setAlert({ type: 'error', message: err.response?.data?.message || 'Failed to remove contribution' });
    } finally {
      setDeletingIds(prev => prev.filter(i => i !== id));
    }
  };

  // Group contributions by user id
  const contributionsByUser = {};
  contributions.forEach(c => {
    const uid = c.user?._id || c.user || 'unknown';
    if (!contributionsByUser[uid]) contributionsByUser[uid] = [];
    contributionsByUser[uid].push(c);
  });

  const membersSorted = [...members].sort((a, b) => (a.name || '').localeCompare(b.name || ''));

  return (
    <section id="manage-contributions" className="py-12 px-4 sm:px-6 lg:px-8 bg-white border-t">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Manage Contributions</h2>
          <p className="text-gray-600">Visible only to Admins and Treasurers — remove erroneous or duplicate entries.</p>
        </div>

        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {membersSorted.map(member => {
              const userContribs = contributionsByUser[member._id] || [];
              return (
                <div key={member._id} className="bg-gray-50 p-4 rounded-lg shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{member.name}</h3>
                      <div className="text-xs text-gray-500">{member.villageName || ''}</div>
                    </div>
                    <div className="text-sm text-gray-700">{userContribs.length} contribution{userContribs.length !== 1 ? 's' : ''}</div>
                  </div>

                  {userContribs.length === 0 ? (
                    <div className="text-sm text-gray-500">No contributions</div>
                  ) : (
                    <ul className="space-y-2">
                      {userContribs.sort((a,b) => new Date(b.paymentDate) - new Date(a.paymentDate)).map(c => (
                        <li key={c._id} className="flex items-center justify-between bg-white p-3 rounded-md border">
                          <div>
                            <div className="text-sm font-medium">{c.month} {c.year} — ₹{c.amount}</div>
                            <div className="text-xs text-gray-500">{c.status} • {new Date(c.paymentDate).toLocaleDateString('en-IN')}</div>
                            {c.notes && <div className="text-xs text-gray-600 mt-1">{c.notes}</div>}
                          </div>

                          <div className="ml-4">
                            <button
                              onClick={() => handleDelete(c._id)}
                              disabled={deletingIds.includes(c._id)}
                              className="inline-flex items-center px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm"
                              title="Remove contribution"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              {deletingIds.includes(c._id) ? 'Removing...' : 'Remove'}
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}

            {/* Contributions from unknown users (if any) */}
            { (contributionsByUser['unknown'] || []).length > 0 && (
              <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-3">Unknown / External Users</h3>
                <ul className="space-y-2">
                  {(contributionsByUser['unknown'] || []).map(c => (
                    <li key={c._id} className="flex items-center justify-between bg-white p-3 rounded-md border">
                      <div>
                        <div className="text-sm font-medium">{c.month} {c.year} — ₹{c.amount}</div>
                        <div className="text-xs text-gray-500">{c.status} • {new Date(c.paymentDate).toLocaleDateString('en-IN')}</div>
                      </div>
                      <div>
                        <button
                          onClick={() => handleDelete(c._id)}
                          disabled={deletingIds.includes(c._id)}
                          className="inline-flex items-center px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm"
                        >
                          <Trash2 className="w-4 h-4 mr-2" /> Remove
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default ManageContributions;
