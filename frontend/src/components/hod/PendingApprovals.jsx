import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { CheckCircle, XCircle, Clock, AlertTriangle, UserPlus, Check } from 'lucide-react';

const PendingApprovals = ({ hodDepartment, onLeaveAction }) => {

  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [showSubstituteModal, setShowSubstituteModal] = useState(null);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [showRequestSubstituteModal, setShowRequestSubstituteModal] = useState(null);
  const [requestingLeave, setRequestingLeave] = useState(null);

  useEffect(() => {
    fetchPendingLeaves();
  }, []);

  const fetchPendingLeaves = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        'http://localhost:5000/api/hod/pending-leaves',
        { headers: { Authorization: `Bearer ${token}` } }
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
      const leave = pendingLeaves.find(l => l._id === leaveId);
      
      const response = await axios.put(
        `http://localhost:5000/api/hod/approve-leave/${leaveId}`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setPendingLeaves(prev => prev.filter(leave => leave._id !== leaveId));
        if (onLeaveAction) onLeaveAction(status);
        alert(`Leave ${status} successfully!`);
      }
    } catch (error) {
      if (error.response?.data?.requiresSubstitute) {
        if (error.response.data.waitingForSubstitute) {
          setSelectedLeave(pendingLeaves.find(l => l._id === leaveId));
          setShowSubstituteModal(leaveId);
        } else if (error.response.data.leaveId) {
          setRequestingLeave({
            leaveId: error.response.data.leaveId,
            facultyId: error.response.data.facultyId,
            message: error.response.data.message
          });
          setShowRequestSubstituteModal(leaveId);
        } else {
          alert(error.response.data.message);
        }
      } else {
        console.error('Error updating leave:', error);
        alert(error.response?.data?.message || 'Failed to update leave status.');
      }
    } finally {
      setProcessingId(null);
    }
  };

  const handleRequestSubstitute = async () => {
    if (!requestingLeave) return;
    
    setProcessingId(requestingLeave.leaveId);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `http://localhost:5000/api/hod/request-substitute/${requestingLeave.leaveId}`,
        { facultyId: requestingLeave.facultyId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setShowRequestSubstituteModal(null);
        setRequestingLeave(null);
        alert('Substitute request sent to faculty. They will need to nominate a substitute before approval.');
        fetchPendingLeaves();
      }
    } catch (error) {
      console.error('Error requesting substitute:', error);
      alert('Failed to send substitute request.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleSubstituteConfirm = async (leaveId, confirmed) => {
    setProcessingId(leaveId);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `http://localhost:5000/api/hod/confirm-substitute/${leaveId}`,
        { confirmed },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setShowSubstituteModal(null);
        setSelectedLeave(null);
        fetchPendingLeaves();
        alert(confirmed ? 'Substitute confirmed successfully! Leave can now be approved.' : 'Substitute rejected. Leave cannot be approved.');
      }
    } catch (error) {
      console.error('Error confirming substitute:', error);
      alert('Failed to confirm substitute. Please try again.');
    } finally {
      setProcessingId(null);
    }
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
      {pendingLeaves.map((leave) => (
        <div key={leave._id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 mb-3 sm:mb-4">
            <div>
              <h3 className="font-semibold text-base sm:text-lg text-gray-800 dark:text-white">{leave.faculty?.personalDetails?.name}</h3>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{leave.leaveType} | {new Date(leave.startDate).toLocaleDateString()} → {new Date(leave.endDate).toLocaleDateString()}</p>
              <p className="text-xs text-gray-400 mt-1">Applied: {new Date(leave.appliedDate).toLocaleDateString()}</p>
            </div>
            <span className="px-2 py-1 sm:px-3 sm:py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs rounded-full">Pending</span>
          </div>

          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mb-3 sm:mb-4"><strong>Reason:</strong> {leave.reason}</p>

          {/* Substitute Faculty Info */}
          {leave.requiresSubstitute && (
            <div className="mb-3 sm:mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-start space-x-2">
                <UserPlus size={16} className="text-blue-600 dark:text-blue-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs font-medium text-blue-800 dark:text-blue-300">Substitute Faculty Required</p>
                  {leave.substituteFacultyName ? (
                    <>
                      <p className="text-xs text-blue-700 dark:text-blue-400 mt-1"><strong>Nominated:</strong> {leave.substituteFacultyName}{leave.substituteFacultyDepartment && ` (${leave.substituteFacultyDepartment})`}</p>
                      <p className="text-xs text-blue-600 dark:text-blue-500 mt-1">Status: {leave.substituteConfirmed ? <span className="text-green-600 dark:text-green-400 flex items-center gap-1"><Check size={12} /> Confirmed by Substitute</span> : <span className="text-yellow-600 dark:text-yellow-400">Awaiting substitute response</span>}</p>
                    </>
                  ) : (
                    <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">No substitute nominated. Faculty will be notified to nominate a substitute.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            <button onClick={() => handleApproval(leave._id, 'approved')} disabled={processingId === leave._id || (leave.requiresSubstitute && !leave.substituteConfirmed)} className="w-full sm:w-auto flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm disabled:opacity-50 disabled:cursor-not-allowed" title={leave.requiresSubstitute && !leave.substituteConfirmed ? 'Waiting for substitute confirmation' : ''}>
              <CheckCircle size={14} className="mr-2" />{processingId === leave._id ? 'Processing...' : 'Approve'}
            </button>
            <button onClick={() => handleApproval(leave._id, 'rejected')} disabled={processingId === leave._id} className="w-full sm:w-auto flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm disabled:opacity-50 disabled:cursor-not-allowed">
              <XCircle size={14} className="mr-2" />{processingId === leave._id ? 'Processing...' : 'Reject'}
            </button>
          </div>
        </div>
      ))}

      {/* Substitute Confirmation Modal */}
      {showSubstituteModal && selectedLeave && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-center mb-4 text-yellow-500"><AlertTriangle size={48} /></div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white text-center mb-2">Substitute Confirmation Required</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-4">This leave requires a substitute faculty to manage workload.</p>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg mb-4">
              <p className="text-sm font-medium text-blue-800 dark:text-blue-300">Nominated Substitute: {selectedLeave.substituteFacultyName}</p>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Department: {selectedLeave.substituteFacultyDepartment || 'N/A'}</p>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-4">Do you want to confirm this substitute arrangement?</p>
            <div className="flex space-x-3">
              <button onClick={() => handleSubstituteConfirm(showSubstituteModal, true)} className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">Confirm Substitute</button>
              <button onClick={() => handleSubstituteConfirm(showSubstituteModal, false)} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">Reject Substitute</button>
            </div>
          </div>
        </div>
      )}

      {/* Request Substitute Modal */}
      {showRequestSubstituteModal && requestingLeave && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-center mb-4 text-orange-500"><UserPlus size={48} /></div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white text-center mb-2">Substitute Required</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-4">{requestingLeave.message}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-4">Would you like to send a request to the faculty to nominate a substitute?</p>
            <div className="flex space-x-3">
              <button onClick={handleRequestSubstitute} disabled={processingId === requestingLeave.leaveId} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">{processingId === requestingLeave.leaveId ? 'Sending...' : 'Send Request'}</button>
              <button onClick={() => setShowRequestSubstituteModal(false)} className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingApprovals;