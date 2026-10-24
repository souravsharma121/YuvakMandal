// components/documents/ImportantDocuments.jsx
import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import AuthContext from '../../context/AuthContext';
import SkeletonLoader from '../loader/SkeletonLoader';
import { FaFilePdf, FaPlus, FaTrash, FaEye, FaDownload, FaTimes } from 'react-icons/fa';
import certificatePdf from '../../assets/importantDocs/Certificate_of_Registration_of_Societies.pdf?url';

const baseURL = import.meta.env.VITE_API_URL;

const UPLOAD_ROLES = ['Admin', 'Pradhan', 'Up Pradhan', 'Treasurer', 'Secretary', 'Chief Advisor'];
const MAX_FILE_SIZE = 10 * 1024 * 1024;

const bundledDocuments = [
  {
    _id: 'bundled-certificate',
    title: 'Certificate of Registration of Societies',
    description: 'Society registration certificate',
    fileUrl: certificatePdf,
    format: 'pdf',
    bundled: true
  }
];

// Cloudinary's fl_attachment flag forces a download for cross-origin files
const getDownloadUrl = (doc) =>
  doc.bundled ? doc.fileUrl : doc.fileUrl.replace('/upload/', '/upload/fl_attachment/');

const ImportantDocuments = () => {
  const { user, token } = useContext(AuthContext);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', file: null });
  const [viewingDoc, setViewingDoc] = useState(null);

  const canUpload = !!user && UPLOAD_ROLES.includes(user.role);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const res = await axios.get(`${baseURL}/api/documents`, {
          headers: { 'x-auth-token': token }
        });
        setDocuments(res.data);
      } catch (err) {
        console.error(err);
        toast.error(err.response?.data?.message || 'Failed to load documents');
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      toast.error('File size must be 10MB or less');
      e.target.value = '';
      return;
    }

    setForm(prev => ({ ...prev, file }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.file) {
      return toast.error('Please choose a PDF or image file');
    }

    const data = new FormData();
    data.append('title', form.title);
    data.append('description', form.description);
    data.append('file', form.file);

    try {
      setSubmitting(true);
      const res = await axios.post(`${baseURL}/api/documents`, data, {
        headers: { 'x-auth-token': token }
      });
      setDocuments(prev => [res.data, ...prev]);
      setForm({ title: '', description: '', file: null });
      setShowForm(false);
      toast.success('Document uploaded successfully');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this document?')) return;

    try {
      await axios.delete(`${baseURL}/api/documents/${id}`, {
        headers: { 'x-auth-token': token }
      });
      setDocuments(prev => prev.filter(doc => doc._id !== id));
      toast.success('Document deleted');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <SkeletonLoader type="text" size="lg" className="mb-6" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <SkeletonLoader type="user-card" count={3} />
        </div>
      </div>
    );
  }

  const allDocuments = [...bundledDocuments, ...documents];

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-indigo-800">Important Documents</h1>
          <p className="text-gray-600 mt-1">Official documents and certificates of the mandal</p>
        </div>
        {canUpload && (
          <button
            onClick={() => setShowForm(prev => !prev)}
            className="inline-flex items-center justify-center bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 transition-colors"
          >
            <FaPlus className="mr-2" />
            {showForm ? 'Close' : 'Add Document'}
          </button>
        )}
      </div>

      {canUpload && showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 mb-8 max-w-2xl">
          <div className="mb-4">
            <label htmlFor="doc-title" className="block text-gray-700 font-medium mb-2">Title *</label>
            <input
              type="text"
              id="doc-title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="doc-description" className="block text-gray-700 font-medium mb-2">Description</label>
            <textarea
              id="doc-description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows="3"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="mb-6">
            <label htmlFor="doc-file" className="block text-gray-700 font-medium mb-2">File * (PDF or image, max 10MB)</label>
            <input
              type="file"
              id="doc-file"
              accept="application/pdf,image/*"
              onChange={handleFileChange}
              className="w-full text-sm text-gray-600"
              required
            />
            {form.file && <p className="text-xs text-gray-500 mt-2">Selected: {form.file.name}</p>}
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-60"
            >
              {submitting ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        </form>
      )}

      {allDocuments.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl shadow-sm">
          <p className="text-indigo-600 text-xl">No documents yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {allDocuments.map(doc => {
            const isPdf = doc.format === 'pdf';
            return (
              <div key={doc._id} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
                <div className="h-40 bg-indigo-50 flex items-center justify-center overflow-hidden">
                  {isPdf ? (
                    <FaFilePdf className="text-red-500" size={56} />
                  ) : (
                    <img src={doc.fileUrl} alt={doc.title} className="w-full h-full object-cover" />
                  )}
                </div>

                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="font-semibold text-lg text-indigo-800">{doc.title}</h3>
                  {doc.description && <p className="text-sm text-gray-600 mt-1">{doc.description}</p>}
                  {!doc.bundled && (
                    <p className="text-xs text-gray-500 mt-2">
                      {doc.uploadedBy?.name && `By ${doc.uploadedBy.name} · `}
                      {new Date(doc.createdAt).toLocaleDateString()}
                    </p>
                  )}

                  <div className="mt-auto pt-4 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => setViewingDoc(doc)}
                        className="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium"
                      >
                        <FaEye className="mr-2" />
                        View
                      </button>
                      <a
                        href={getDownloadUrl(doc)}
                        download
                        className="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium"
                      >
                        <FaDownload className="mr-2" />
                        Download
                      </a>
                    </div>
                    {canUpload && !doc.bundled && (
                      <button
                        onClick={() => handleDelete(doc._id)}
                        className="text-red-500 hover:text-red-700"
                        aria-label="Delete document"
                        title="Delete"
                      >
                        <FaTrash />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {viewingDoc && (
        <div
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
          onClick={() => setViewingDoc(null)}
        >
          <div
            className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold text-indigo-800 truncate">{viewingDoc.title}</h2>
              <div className="flex items-center space-x-3 flex-shrink-0">
                <a
                  href={getDownloadUrl(viewingDoc)}
                  download
                  className="inline-flex items-center bg-indigo-600 text-white py-2 px-3 rounded hover:bg-indigo-700 transition-colors"
                >
                  <FaDownload className="mr-2" />
                  Download
                </a>
                <button
                  onClick={() => setViewingDoc(null)}
                  className="text-gray-500 hover:text-gray-800"
                  aria-label="Close viewer"
                >
                  <FaTimes size={20} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-hidden bg-gray-100">
              {viewingDoc.format === 'pdf' ? (
                <iframe src={viewingDoc.fileUrl} title={viewingDoc.title} className="w-full h-full" />
              ) : (
                <div className="w-full h-full flex items-center justify-center p-4">
                  <img src={viewingDoc.fileUrl} alt={viewingDoc.title} className="max-h-full max-w-full object-contain" />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImportantDocuments;
