import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

const PendingApprovals = ({ hodDepartment, onLeaveAction }) => {

  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchPendingLeaves();
  }, []);

  const fetchPendingLeaves = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        'http://localhost:5000/api/hod/pending-leaves',
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setPendingLeaves(response.data.leaves);
      }

    } catch (error) {
      console.error('Error fetching pending leaves:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (leaveId, status) => {
    setProcessingId(leaveId);
    try {
      const token = localStorage.getItem('token');

      const response = await axios.put(
        `http://localhost:5000/api/hod/approve-leave/${leaveId}`,
        { status },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        // Remove approved/rejected leave from list
        setPendingLeaves(prev =>
          prev.filter(leave => leave._id !== leaveId)
        );
        
        // Update parent component stats
        if (onLeaveAction) {
          onLeaveAction(status);
        }

        // Show success message
        alert(`Leave ${status} successfully!`);
      }

    } catch (error) {
      console.error('Error updating leave:', error);
      alert('Failed to update leave status. Please try again.');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-10">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-3 text-gray-600 dark:text-gray-400">Loading pending approvals...</p>
      </div>
    );
  }

  if (pendingLeaves.length === 0) {
    return (
      <div className="text-center py-10">
        <Clock className="mx-auto text-gray-400" size={40} />
        <p className="mt-3 text-gray-600 dark:text-gray-400">
          No pending leave requests 🎉
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {pendingLeaves.map((leave) => (
        <div
          key={leave._id}
          className="border border-gray-200 dark:border-gray-700 rounded-lg p-5"
        >
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-semibold text-lg text-gray-800 dark:text-white">
                {leave.faculty?.personalDetails?.name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {leave.leaveType} Leave | {new Date(leave.startDate).toLocaleDateString()} → {new Date(leave.endDate).toLocaleDateString()}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Applied: {new Date(leave.appliedDate).toLocaleDateString()}
              </p>
            </div>

            <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs rounded-full">
              Pending
            </span>
          </div>

          <p className="text-gray-600 dark:text-gray-300 mb-4">
            <strong>Reason:</strong> {leave.reason}
          </p>

          <div className="flex space-x-3">
            <button
              onClick={() => handleApproval(leave._id, 'approved')}
              disabled={processingId === leave._id}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckCircle size={16} className="mr-2" />
              {processingId === leave._id ? 'Processing...' : 'Approve'}
            </button>

            <button
              onClick={() => handleApproval(leave._id, 'rejected')}
              disabled={processingId === leave._id}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <XCircle size={16} className="mr-2" />
              {processingId === leave._id ? 'Processing...' : 'Reject'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PendingApprovals;