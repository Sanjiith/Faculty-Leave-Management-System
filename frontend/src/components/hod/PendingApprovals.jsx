import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';

const PendingApprovals = ({ hodDepartment, onLeaveAction }) => {

  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [workloadWarning, setWorkloadWarning] = useState(null);
  const [facultyOnLeave, setFacultyOnLeave] = useState(0);

  useEffect(() => {
    fetchPendingLeaves();
    fetchWorkloadStatus();
  }, []);

  const fetchWorkloadStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/hod/workload-status', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setFacultyOnLeave(response.data.workload.facultyOnLeaveToday);
      }
    } catch (error) {
      console.error('Error fetching workload status:', error);
    }
  };

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

  const handleApproval = async (leaveId, status, force = false) => {
    setProcessingId(leaveId);
    try {
      const token = localStorage.getItem('token');

      const response = await axios.put(
        `http://localhost:5000/api/hod/approve-leave/${leaveId}`,
        { status, force },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setPendingLeaves(prev =>
          prev.filter(leave => leave._id !== leaveId)
        );
        
        if (onLeaveAction) {
          onLeaveAction(status);
        }

        // Refresh workload status
        fetchWorkloadStatus();

        alert(`Leave ${status} successfully!`);
      }
    } catch (error) {
      if (error.response?.data?.workloadWarning) {
        // Show workload warning modal
        setWorkloadWarning({
          leaveId,
          message: error.response.data.message,
          conflictDates: error.response.data.conflictDates
        });
      } else {
        console.error('Error updating leave:', error);
        alert(error.response?.data?.message || 'Failed to update leave status. Please try again.');
      }
    } finally {
      setProcessingId(null);
    }
  };

  const confirmApproval = () => {
    if (workloadWarning) {
      handleApproval(workloadWarning.leaveId, 'approved', true);
      setWorkloadWarning(null);
    }
  };

  const cancelApproval = () => {
    setWorkloadWarning(null);
  };

  if (loading) {
    return (
      <div className="text-center py-8 sm:py-10">
        <div className="animate-spin rounded-full h-8 sm:h-10 w-8 sm:w-10 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-3 text-sm sm:text-base text-gray-600 dark:text-gray-400">Loading pending approvals...</p>
      </div>
    );
  }

  if (pendingLeaves.length === 0) {
    return (
      <div className="text-center py-8 sm:py-10">
        <Clock className="mx-auto text-gray-400" size={32} />
        <p className="mt-3 text-sm sm:text-base text-gray-600 dark:text-gray-400">
          No pending leave requests 🎉
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Workload Status Banner */}
      {facultyOnLeave >= 2 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 sm:p-4 mb-4">
          <div className="flex items-start">
            <AlertTriangle className="text-yellow-600 dark:text-yellow-400 mt-0.5 mr-2 sm:mr-3 flex-shrink-0" size={16} />
            <div>
              <p className="font-medium text-xs sm:text-sm text-yellow-800 dark:text-yellow-300">
                Workload Alert
              </p>
              <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-1">
                {facultyOnLeave} faculty already on leave today. Max recommended is 2.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Workload Warning Modal */}
      {workloadWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-4 sm:p-6">
            <div className="flex items-center justify-center mb-3 sm:mb-4 text-yellow-500">
              <AlertTriangle size={40} />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white text-center mb-2">
              Workload Warning
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 text-center mb-3 sm:mb-4">
              {workloadWarning.message}
            </p>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-2 sm:p-3 rounded-lg mb-3 sm:mb-4">
              <p className="text-xs sm:text-sm text-yellow-800 dark:text-yellow-300 font-medium">
                Affected Dates:
              </p>
              <p className="text-xs text-yellow-700 dark:text-yellow-400">
                {workloadWarning.conflictDates.join(', ')}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <button
                onClick={confirmApproval}
                className="w-full sm:flex-1 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-sm transition"
              >
                Approve Anyway
              </button>
              <button
                onClick={cancelApproval}
                className="w-full sm:flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg text-sm transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {pendingLeaves.map((leave) => (
        <div
          key={leave._id}
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 sm:p-5"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 mb-3 sm:mb-4">
            <div>
              <h3 className="font-semibold text-base sm:text-lg text-gray-800 dark:text-white">
                {leave.faculty?.personalDetails?.name}
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                {leave.leaveType} | {new Date(leave.startDate).toLocaleDateString()} → {new Date(leave.endDate).toLocaleDateString()}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Applied: {new Date(leave.appliedDate).toLocaleDateString()}
              </p>
            </div>

            <span className="px-2 py-1 sm:px-3 sm:py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs rounded-full">
              Pending
            </span>
          </div>

          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mb-3 sm:mb-4">
            <strong>Reason:</strong> {leave.reason}
          </p>

          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            <button
              onClick={() => handleApproval(leave._id, 'approved')}
              disabled={processingId === leave._id}
              className="w-full sm:w-auto flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckCircle size={14} className="mr-2" />
              {processingId === leave._id ? 'Processing...' : 'Approve'}
            </button>

            <button
              onClick={() => handleApproval(leave._id, 'rejected')}
              disabled={processingId === leave._id}
              className="w-full sm:w-auto flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <XCircle size={14} className="mr-2" />
              {processingId === leave._id ? 'Processing...' : 'Reject'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PendingApprovals;