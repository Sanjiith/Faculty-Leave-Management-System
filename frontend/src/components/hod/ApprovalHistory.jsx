import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { CheckCircle, XCircle, FileText, Calendar } from 'lucide-react';
import { API_BASE_URL } from '../../utils/api';

const ApprovalHistory = ({ hodDepartment }) => {

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApprovalHistory();
  }, []);

  const fetchApprovalHistory = async () => {
    try {
      const token = localStorage.getItem('token');

      const response = await axios.get(
        `${API_BASE_URL}/hod/approval-history`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setHistory(response.data.leaves);
      }

    } catch (error) {
      console.error('Error fetching approval history:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="text-center py-8 sm:py-10">
        <div className="animate-spin rounded-full h-8 sm:h-10 w-8 sm:w-10 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-3 text-sm sm:text-base text-gray-600 dark:text-gray-400">Loading approval history...</p>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-8 sm:py-10">
        <FileText className="mx-auto text-gray-400" size={32} />
        <p className="mt-3 text-sm sm:text-base text-gray-600 dark:text-gray-400">
          No approval history available.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {history.map((leave) => (
        <div
          key={leave._id}
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 sm:p-5"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 mb-2">
            <div>
              <h3 className="font-semibold text-sm sm:text-base text-gray-800 dark:text-white">
                {leave.faculty?.personalDetails?.name}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {leave.leaveType} Leave
              </p>
            </div>

            <div className="flex items-center">
              {leave.status === 'approved' ? (
                <span className="flex items-center px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded-full">
                  <CheckCircle size={12} className="mr-1" />
                  Approved
                </span>
              ) : (
                <span className="flex items-center px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs rounded-full">
                  <XCircle size={12} className="mr-1" />
                  Rejected
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-2">
            <Calendar size={12} className="mr-1 flex-shrink-0" />
            <span>{formatDate(leave.startDate)} → {formatDate(leave.endDate)}</span>
          </div>

          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-2">
            <strong>Reason:</strong> {leave.reason}
          </p>
        </div>
      ))}
    </div>
  );
};

export default ApprovalHistory;