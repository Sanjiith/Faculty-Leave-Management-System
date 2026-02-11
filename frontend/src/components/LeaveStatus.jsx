import React from 'react';
import { CheckCircle, Clock, XCircle, AlertCircle, Download, Calendar, Users, FileText } from 'lucide-react';

const LeaveStatus = () => {
  const leaveApplications = [
    {
      id: 1,
      leaveType: 'Medical Leave',
      fromDate: '2024-01-15',
      toDate: '2024-01-17',
      days: 3,
      appliedDate: '2024-01-10',
      alternateFaculty: 'Dr. Robert Chen',
      hodStatus: 'approved',
      principalStatus: 'pending',
      remarks: 'Medical certificate submitted',
    },
    {
      id: 2,
      leaveType: 'Casual Leave',
      fromDate: '2024-01-22',
      toDate: '2024-01-22',
      days: 1,
      appliedDate: '2024-01-18',
      alternateFaculty: 'Prof. Emily Davis',
      hodStatus: 'approved',
      principalStatus: 'approved',
      remarks: 'Approved for personal work',
    },
    {
      id: 3,
      leaveType: 'Permission Leave',
      fromDate: '2024-01-25',
      toDate: '2024-01-25',
      days: 1,
      appliedDate: '2024-01-20',
      alternateFaculty: '-',
      hodStatus: 'pending',
      principalStatus: 'pending',
      remarks: 'Awaiting HOD review',
    },
    {
      id: 4,
      leaveType: 'Compensation Leave',
      fromDate: '2024-02-01',
      toDate: '2024-02-01',
      days: 1,
      appliedDate: '2024-01-28',
      alternateFaculty: 'Dr. Michael Brown',
      hodStatus: 'rejected',
      principalStatus: 'rejected',
      remarks: 'Insufficient compensatory hours',
    },
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="text-green-500" size={18} />;
      case 'pending':
        return <Clock className="text-yellow-500" size={18} />;
      case 'rejected':
        return <XCircle className="text-red-500" size={18} />;
      default:
        return <AlertCircle className="text-gray-500" size={18} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-400';
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

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Leave Application Status</h2>
        <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition">
          <Download size={18} />
          <span>Export Report</span>
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">4</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Applications</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">1</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Approved</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">1</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Pending</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">1</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Rejected</div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                S.No
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <div className="flex items-center">
                  <Calendar className="mr-2" size={16} />
                  Leave Dates
                </div>
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Leave Type
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <div className="flex items-center">
                  <Users className="mr-2" size={16} />
                  Alternate Faculty
                </div>
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                HOD Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Principal Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <div className="flex items-center">
                  <FileText className="mr-2" size={16} />
                  Remarks
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
            {leaveApplications.map((application, index) => (
              <tr key={application.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                  {index + 1}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-white">
                    <div className="font-medium">{formatDate(application.fromDate)}</div>
                    <div className="text-gray-500 dark:text-gray-400">to {formatDate(application.toDate)}</div>
                    <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                      {application.days} {application.days === 1 ? 'Day' : 'Days'}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1 text-xs rounded-full ${application.leaveType === 'Medical Leave' 
                    ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                    : application.leaveType === 'Casual Leave'
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                    : application.leaveType === 'Permission Leave'
                    ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
                    : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400'
                  }`}>
                    {application.leaveType}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {application.alternateFaculty}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {getStatusIcon(application.hodStatus)}
                    <span className={`ml-2 px-3 py-1 text-xs rounded-full ${getStatusColor(application.hodStatus)}`}>
                      {application.hodStatus.charAt(0).toUpperCase() + application.hodStatus.slice(1)}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {getStatusIcon(application.principalStatus)}
                    <span className={`ml-2 px-3 py-1 text-xs rounded-full ${getStatusColor(application.principalStatus)}`}>
                      {application.principalStatus.charAt(0).toUpperCase() + application.principalStatus.slice(1)}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                  <div className="max-w-xs truncate" title={application.remarks}>
                    {application.remarks}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    Applied: {formatDate(application.appliedDate)}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Additional Info */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <div className="flex items-center">
            <CheckCircle className="text-blue-600 dark:text-blue-400 mr-2" size={18} />
            <h4 className="font-medium text-blue-800 dark:text-blue-300">Approval Process</h4>
          </div>
          <p className="text-sm text-blue-700 dark:text-blue-400 mt-2">
            1. Faculty applies → 2. HOD reviews → 3. Principal approves
          </p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
          <div className="flex items-center">
            <Clock className="text-green-600 dark:text-green-400 mr-2" size={18} />
            <h4 className="font-medium text-green-800 dark:text-green-300">Processing Time</h4>
          </div>
          <p className="text-sm text-green-700 dark:text-green-400 mt-2">
            Typically 2-3 working days for complete approval
          </p>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="text-purple-600 dark:text-purple-400 mr-2" size={18} />
            <h4 className="font-medium text-purple-800 dark:text-purple-300">Important Note</h4>
          </div>
          <p className="text-sm text-purple-700 dark:text-purple-400 mt-2">
            Apply at least 3 days in advance for non-emergency leaves
          </p>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
        <h4 className="font-medium text-gray-800 dark:text-white mb-3">Status Legend</h4>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <span className="text-sm text-gray-700 dark:text-gray-300">Approved</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
            <span className="text-sm text-gray-700 dark:text-gray-300">Pending</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
            <span className="text-sm text-gray-700 dark:text-gray-300">Rejected</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
            <span className="text-sm text-gray-700 dark:text-gray-300">Medical Leave</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-indigo-500 rounded-full mr-2"></div>
            <span className="text-sm text-gray-700 dark:text-gray-300">Other Leaves</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaveStatus;