import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { CheckCircle, XCircle, FileText } from 'lucide-react';

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
        'http://localhost:5000/api/hod/approval-history',
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

  if (loading) {
    return (
      <div className="text-center py-10">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-3 text-gray-600 dark:text-gray-400">Loading approval history...</p>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-10">
        <FileText className="mx-auto text-gray-400" size={40} />
        <p className="mt-3 text-gray-600 dark:text-gray-400">
          No approval history available.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {history.map((leave) => (
        <div
          key={leave._id}
          className="border border-gray-200 dark:border-gray-700 rounded-lg p-5"
        >
          <div className="flex justify-between items-center mb-2">
            <div>
              <h3 className="font-semibold text-gray-800 dark:text-white">
                {leave.faculty?.personalDetails?.name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {leave.leaveType} Leave | {leave.startDate} → {leave.endDate}
              </p>
            </div>

            {leave.status === 'approved' ? (
              <span className="flex items-center px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded-full">
                <CheckCircle size={14} className="mr-1" />
                Approved
              </span>
            ) : (
              <span className="flex items-center px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs rounded-full">
                <XCircle size={14} className="mr-1" />
                Rejected
              </span>
            )}
          </div>

          <p className="text-gray-600 dark:text-gray-300">
            <strong>Reason:</strong> {leave.reason}
          </p>
        </div>
      ))}
    </div>
  );
};

export default ApprovalHistory;
