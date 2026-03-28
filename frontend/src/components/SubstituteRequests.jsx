import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, UserPlus, Mail, Calendar, RefreshCw } from 'lucide-react';
import axios from 'axios';

const SubstituteRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    fetchSubstituteRequests();
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchSubstituteRequests();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchSubstituteRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/faculty/substitute-requests', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setRequests(response.data.requests);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Error fetching substitute requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResponse = async (requestId, accept) => {
    setProcessingId(requestId);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `http://localhost:5000/api/faculty/substitute-respond/${requestId}`,
        { accept },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        if (accept) {
          alert('✅ You have accepted the substitute request! The HOD will be notified.');
        } else {
          alert('❌ You have declined the substitute request. The applicant will be notified to find another substitute.');
        }
        fetchSubstituteRequests(); // Refresh the list
      }
    } catch (error) {
      console.error('Error responding to request:', error);
      alert(error.response?.data?.message || 'Failed to respond to request');
    } finally {
      setProcessingId(null);
    }
  };

  const getTimeRemaining = (dateString) => {
    const leaveDate = new Date(dateString);
    const now = new Date();
    const diffDays = Math.ceil((leaveDate - now) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Passed';
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    return `${diffDays} days left`;
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-3 text-sm text-gray-600">Loading requests...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">Substitute Requests</h2>
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <RefreshCw size={12} className="cursor-pointer hover:text-blue-500" onClick={fetchSubstituteRequests} />
          <span>Updated {lastUpdated.toLocaleTimeString()}</span>
        </div>
      </div>

      {requests.length === 0 ? (
        <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-lg">
          <UserPlus className="mx-auto text-gray-400" size={40} />
          <p className="mt-3 text-gray-600 dark:text-gray-400">No substitute requests at the moment.</p>
        </div>
      ) : (
        <>
          {/* Request count badge */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg mb-2">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              You have <span className="font-bold">{requests.length}</span> pending substitute request{requests.length !== 1 ? 's' : ''}
            </p>
          </div>

          {requests.map((request) => (
            <div
              key={request._id}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-5"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-lg text-gray-800 dark:text-white">
                    {request.faculty?.personalDetails?.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {request.faculty?.personalDetails?.department}
                  </p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  getTimeRemaining(request.startDate) === 'Today' 
                    ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    : getTimeRemaining(request.startDate) === 'Passed'
                    ? 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                    : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                }`}>
                  {getTimeRemaining(request.startDate)}
                </span>
              </div>

              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-3">
                <Calendar size={14} className="mr-2" />
                <span>{new Date(request.startDate).toLocaleDateString()} → {new Date(request.endDate).toLocaleDateString()}</span>
                <span className="ml-2 text-xs text-gray-500">
                  ({request.days} {request.days === 1 ? 'day' : 'days'})
                </span>
              </div>

              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-4">
                <Mail size={14} className="mr-2" />
                <span>{request.faculty?.email}</span>
              </div>

              <p className="text-gray-600 dark:text-gray-300 mb-4">
                <strong>Reason for leave:</strong> {request.reason}
              </p>

              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg mb-4">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  <strong>Responsibilities during leave:</strong> Please handle the teaching and administrative duties of {request.faculty?.personalDetails?.name} during their absence.
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => handleResponse(request._id, true)}
                  disabled={processingId === request._id}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                >
                  <CheckCircle size={16} className="mr-2" />
                  {processingId === request._id ? 'Processing...' : 'Accept Request'}
                </button>

                <button
                  onClick={() => handleResponse(request._id, false)}
                  disabled={processingId === request._id}
                  className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                >
                  <XCircle size={16} className="mr-2" />
                  {processingId === request._id ? 'Processing...' : 'Decline Request'}
                </button>
              </div>

              <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 text-center">
                <p>⚠️ If you decline, the applicant will need to find another substitute faculty.</p>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default SubstituteRequests;