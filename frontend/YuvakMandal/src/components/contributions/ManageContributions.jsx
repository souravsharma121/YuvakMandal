import React, { useState, useEffect, useContext, useMemo } from 'react';
import axios from 'axios';
import { Trash2, Edit2, Search, ChevronDown, ChevronUp, User, MapPin, Calendar, Banknote } from 'lucide-react';
import AlertContext from '../../context/AlertContext';
import { useTranslation } from 'react-i18next'; // Added import

const baseURL = import.meta.env.VITE_API_URL;

const pageSizeOptions = [10, 20, 50];

const ManageContributions = () => {
  const { t } = useTranslation(); // Added hook
  const { setAlert } = useContext(AlertContext);
  const [contributions, setContributions] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingIds, setDeletingIds] = useState([]);

  // UI state
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [villageFilter, setVillageFilter] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [expandedUsers, setExpandedUsers] = useState({});

  // Edit modal state
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ amount: '', month: '', year: '', notes: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadAll();
  }, []);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const loadAll = async () => {
    try {
      setLoading(true);
      const [cRes, mRes] = await Promise.all([
        axios.get(`${baseURL}/api/contributions`),
        axios.get(`${baseURL}/api/users`)
      ]);
      setContributions(cRes.data || []);
      setMembers(mRes.data || []);
    } catch (err) {
      console.error(err);
      setAlert('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const membersMap = useMemo(() => {
    const m = {};
    (members || []).forEach(u => { m[u._id] = u; });
    return m;
  }, [members]);

  const villageOptions = useMemo(() => {
    const setV = new Set();
    (members || []).forEach(u => { if (u.villageName) setV.add(u.villageName); });
    return ['All', ...Array.from(setV).sort()];
  }, [members]);

  // Filter contributions first
  const filteredContributions = useMemo(() => {
    const q = (query || '').trim().toLowerCase();
    let list = contributions.slice().sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate));

    if (q) {
      list = list.filter(c => {
        const name = (membersMap[c.user?._id]?.name || c.user?.name || '').toLowerCase();
        return name.includes(q) ||
          `${c.month} ${c.year}`.toLowerCase().includes(q) ||
          String(c.amount).includes(q) ||
          (c.notes || '').toLowerCase().includes(q);
      });
    }

    if (villageFilter && villageFilter !== 'All') {
      list = list.filter(c => {
        const v = membersMap[c.user?._id]?.villageName || '';
        return v === villageFilter;
      });
    }
    return list;
  }, [contributions, query, membersMap, villageFilter]);

  // Group filtered contributions by user
  const groupedData = useMemo(() => {
    const groups = {};

    filteredContributions.forEach(c => {
      // Use user ID as key, fallback to 'unknown' if missing
      // Note: Some contributions might have populated user object, others might reference ID
      const userId = c.user?._id || (typeof c.user === 'string' ? c.user : 'unknown_user');

      if (!groups[userId]) {
        // Resolve user details
        const userDetails = membersMap[userId] || (typeof c.user === 'object' ? c.user : { name: 'Unknown User', _id: userId });

        groups[userId] = {
          user: userDetails,
          records: [],
          totalAmount: 0
        };
      }

      groups[userId].records.push(c);
      groups[userId].totalAmount += (Number(c.amount) || 0);
    });

    // Convert to array and sort by user name
    return Object.values(groups).sort((a, b) => {
      const nameA = (a.user.name || '').toLowerCase();
      const nameB = (b.user.name || '').toLowerCase();
      return nameA.localeCompare(nameB);
    });
  }, [filteredContributions, membersMap]);

  // Pagination based on GROUPS (Users), not individual records
  const pagedGroups = useMemo(() => {
    const start = (page - 1) * pageSize;
    return groupedData.slice(start, start + pageSize);
  }, [groupedData, page, pageSize]);

  const totalPages = Math.max(1, Math.ceil(groupedData.length / pageSize));

  const toggleUser = (userId) => {
    setExpandedUsers(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  const openEdit = (contrib) => {
    setEditing(contrib);
    setForm({ amount: contrib.amount || '', month: contrib.month || '', year: contrib.year || '', notes: contrib.notes || '' });
  };

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const saveEdit = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      const payload = { amount: form.amount, month: form.month, year: form.year, notes: form.notes };
      const res = await axios.put(`${baseURL}/api/contributions/${editing._id}`, payload);
      setContributions(prev => prev.map(c => c._id === res.data._id ? res.data : c));
      setAlert('Contribution updated', 'success');
      setEditing(null);
    } catch (err) {
      console.error('Failed to update contribution', err);
      setAlert(err.response?.data?.message || 'Failed to update contribution', 'error');
    } finally {
      setSaving(false);
    }
  };

  const requestDelete = (id) => setConfirmDelete(id);

  const handleDeleteConfirmed = async (id) => {
    try {
      setDeletingIds(prev => [...prev, id]);
      await axios.delete(`${baseURL}/api/contributions/${id}`);
      setContributions(prev => prev.filter(c => c._id !== id));
      setAlert('Contribution removed', 'success');
    } catch (err) {
      console.error('Failed to delete contribution', err);
      setAlert(err.response?.data?.message || 'Failed to remove contribution', 'error');
    } finally {
      setDeletingIds(prev => prev.filter(i => i !== id));
      setConfirmDelete(null);
    }
  };

  return (
    <section id="manage-contributions" className="py-8 px-4 sm:px-6 lg:px-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">{t('manageContributionsPage.title')}</h2>
            <p className="text-sm text-gray-500">{t('manageContributionsPage.subtitle')}</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-3 w-full md:w-auto">
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
              <input
                value={query}
                onChange={e => { setQuery(e.target.value); setPage(1); }}
                placeholder={t('manageContributionsPage.searchPlaceholder')}
                className="pl-9 pr-3 py-2 border rounded-md w-full sm:w-64 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div className="flex w-full sm:w-auto space-x-2">
              <select
                value={pageSize}
                onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}
                className="py-2 px-3 border rounded-md bg-white text-sm flex-1 sm:flex-none"
              >
                {pageSizeOptions.map(s => <option key={s} value={s}>{s} {t('manageContributionsPage.usersPerPage')}</option>)}
              </select>
              <select
                value={villageFilter || 'All'}
                onChange={e => { setVillageFilter(e.target.value); setPage(1); }}
                className="py-2 px-3 border rounded-md bg-white text-sm flex-1 sm:flex-none"
              >
                {villageOptions.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : groupedData.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center text-gray-500">
            No contributions found matching your filters.
          </div>
        ) : (
          <div className="space-y-4">
            {pagedGroups.map(({ user, records, totalAmount }) => {
              const isExpanded = !!expandedUsers[user._id];
              return (
                <div key={user._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden transition-all duration-200">
                  {/* Accordion Header */}
                  <div
                    onClick={() => toggleUser(user._id)}
                    className="flex md:items-center justify-between p-4 cursor-pointer hover:bg-gray-50 bg-white"
                  >
                    <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6 flex-1">
                      <div className="flex items-center gap-3 min-w-[200px]">
                        <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                          <User size={20} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{user.name || t('manageContributionsPage.unknownUser')}</h3>
                          <div className="flex items-center text-xs text-gray-500 mt-0.5">
                            <MapPin size={12} className="mr-1" />
                            {user.villageName || t('manageContributionsPage.noVillage')} • {records.length} {t('manageContributionsPage.records')}
                          </div>
                        </div>
                      </div>

                      {/* Summary Stats in Header - Hidden on very small screens if needed, or stacked */}
                      <div className="mt-2 md:mt-0 flex gap-4 text-sm">
                        <div className="flex items-center text-green-700 bg-green-50 px-2 py-1 rounded">
                          <span className="font-bold mr-1">₹{totalAmount.toLocaleString()}</span>
                          <span className="text-xs opacity-80">{t('manageContributionsPage.total')}</span>
                        </div>
                      </div>
                    </div>

                    <div className="ml-4 text-gray-400">
                      {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>
                  </div>

                  {/* Accordion Body */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 bg-gray-50 p-0 md:p-4">
                      {/* Mobile View: Cards */}
                      <div className="md:hidden space-y-3 p-3">
                        {records.map(c => (
                          <div key={c._id} className="bg-white p-3 rounded border border-gray-200 shadow-sm relative">
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex items-center text-gray-800 font-medium">
                                <Calendar size={14} className="mr-1 text-gray-500" />
                                {c.month} {c.year}
                              </div>
                              <div className="text-green-600 font-bold flex items-center">
                                <Banknote size={14} className="mr-1" />
                                ₹{c.amount}
                              </div>
                            </div>

                            <div className="text-sm text-gray-600 mb-2">
                              <span className={`px-2 py-0.5 rounded text-xs ${c.status === 'Approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                {c.status}
                              </span>
                              <span className="mx-2 text-gray-300">|</span>
                              <span className="text-xs text-gray-500">
                                Paid: {new Date(c.paymentDate).toLocaleDateString('en-IN')}
                              </span>
                            </div>

                            {c.notes && (
                              <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded mt-2">
                                {c.notes}
                              </div>
                            )}

                            <div className="mt-3 flex justify-end gap-2 border-t pt-2 border-gray-100">
                              <button
                                onClick={(e) => { e.stopPropagation(); openEdit(c); }}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); requestDelete(c._id); }}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Desktop View: Table */}
                      <div className="hidden md:block overflow-x-auto bg-white rounded-lg border border-gray-200">
                        <table className="w-full text-left text-sm">
                          <thead className="bg-gray-100 text-gray-600 font-medium border-b border-gray-200">
                            <tr>
                              <th className="px-4 py-3">Month/Year</th>
                              <th className="px-4 py-3">Amount</th>
                              <th className="px-4 py-3">Status</th>
                              <th className="px-4 py-3">Payment Date</th>
                              <th className="px-4 py-3">Notes</th>
                              <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {records.map(c => (
                              <tr key={c._id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-4 py-3 text-gray-900 font-medium">{c.month} {c.year}</td>
                                <td className="px-4 py-3 text-green-700 font-medium">₹{c.amount}</td>
                                <td className="px-4 py-3">
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${c.status === 'Approved' ? 'bg-green-100 text-green-800' :
                                    c.status === 'Rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                    {c.status}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-gray-500">{new Date(c.paymentDate).toLocaleDateString('en-IN')}</td>
                                <td className="px-4 py-3 text-gray-500 max-w-xs truncate" title={c.notes}>{c.notes || '-'}</td>
                                <td className="px-4 py-3 text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    <button
                                      onClick={() => openEdit(c)}
                                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                      title="Edit"
                                    >
                                      <Edit2 size={16} />
                                    </button>
                                    <button
                                      onClick={() => requestDelete(c._id)}
                                      disabled={deletingIds.includes(c._id)}
                                      className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                                      title="Delete"
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
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {groupedData.length > 0 && (
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-200 pt-4">
            <div className="text-sm text-gray-600 text-center sm:text-left">
              Showing members {(page - 1) * pageSize + 1} — {Math.min(groupedData.length, page * pageSize)} of {groupedData.length}
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className={`px-3 py-1.5 border rounded text-sm ${page === 1 ? 'bg-gray-100 text-gray-400' : 'bg-white hover:bg-gray-50 text-gray-700'}`}
              >
                Previous
              </button>
              <div className="flex gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  // Logic to show relevant page numbers
                  let pNum = i + 1;
                  if (totalPages > 5) {
                    if (page > 3) pNum = page - 2 + i;
                    if (pNum > totalPages) pNum = i + 1 + (totalPages - 5);
                  }

                  return (
                    (pNum > 0 && pNum <= totalPages) && (
                      <button
                        key={pNum}
                        onClick={() => setPage(pNum)}
                        className={`w-8 h-8 flex items-center justify-center rounded text-sm ${page === pNum ? 'bg-blue-600 text-white' : 'border hover:bg-gray-50'}`}
                      >
                        {pNum}
                      </button>
                    )
                  );
                })}
              </div>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className={`px-3 py-1.5 border rounded text-sm ${page === totalPages ? 'bg-gray-100 text-gray-400' : 'bg-white hover:bg-gray-50 text-gray-700'}`}
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Confirm Delete Modal */}
        {confirmDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl transform transition-all">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">{t('manageContributionsPage.confirmRemoval')}</h3>
              <p className="mb-6 text-sm text-gray-600">{t('manageContributionsPage.removalMessage')}</p>
              <div className="flex justify-end space-x-3">
                <button onClick={() => setConfirmDelete(null)} className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">{t('manageContributionsPage.cancel')}</button>
                <button onClick={() => handleDeleteConfirmed(confirmDelete)} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">{t('manageContributionsPage.remove')}</button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {editing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-lg shadow-xl overflow-hidden">
              <div className="flex justify-between items-center mb-4 border-b pb-2">
                <h3 className="text-lg font-semibold text-gray-900">{t('manageContributionsPage.editContribution')}</h3>
                <button onClick={() => setEditing(null)} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2 bg-gray-50 p-3 rounded border">
                  <span className="block text-xs text-gray-500 uppercase tracking-wide">{t('contributionsPage.member')}</span>
                  <span className="font-medium text-gray-900">{membersMap[editing.user?._id]?.name || editing.user?.name || '—'}</span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('currentStatus.amount')}</label>
                  <input name="amount" value={form.amount} onChange={handleChange} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('contributionsPage.status')}</label>
                  <div className="px-3 py-2 border border-gray-200 bg-gray-100 rounded-md text-gray-600 text-sm">
                    {editing.status}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('contributionsPage.month')}</label>
                  <input name="month" value={form.month} onChange={handleChange} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('contributionsPage.year')}</label>
                  <input name="year" value={form.year} onChange={handleChange} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea name="notes" value={form.notes} onChange={handleChange} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500" rows={3} />
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button onClick={() => setEditing(null)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">{t('manageContributionsPage.cancel')}</button>
                <button onClick={saveEdit} disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">
                  {saving ? t('manageContributionsPage.saving') : t('manageContributionsPage.saveChanges')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default ManageContributions;