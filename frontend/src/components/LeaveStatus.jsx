import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, XCircle, AlertCircle, Download, Calendar, FileText, Trash2 } from 'lucide-react';
import axios from 'axios';

const LeaveStatus = ({ facultyData }) => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
    cancelled: 0
  });

  useEffect(() => {
    fetchLeaves();
    
    // Set up auto-refresh every 10 seconds
    const interval = setInterval(() => {
      fetchLeaves();
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchLeaves = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/faculty/leaves', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setLeaves(response.data.leaves);
        
        // Calculate statistics
        const total = response.data.leaves.length;
        const approved = response.data.leaves.filter(l => l.status === 'approved').length;
        const pending = response.data.leaves.filter(l => l.status === 'pending').length;
        const rejected = response.data.leaves.filter(l => l.status === 'rejected').length;
        const cancelled = response.data.leaves.filter(l => l.status === 'cancelled').length;
        
        setStats({ total, approved, pending, rejected, cancelled });
      }
    } catch (error) {
      console.error('Error fetching leaves:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelLeave = async (leaveId) => {
    if (!window.confirm('Are you sure you want to cancel this leave application?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `http://localhost:5000/api/faculty/leave/cancel/${leaveId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        alert('Leave application cancelled successfully');
        fetchLeaves(); // Refresh the list
      }
    } catch (error) {
      console.error('Error cancelling leave:', error);
      alert(error.response?.data?.message || 'Failed to cancel leave');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="text-green-500" size={16} />;
      case 'pending':
        return <Clock className="text-yellow-500" size={16} />;
      case 'rejected':
        return <XCircle className="text-red-500" size={16} />;
      case 'cancelled':
        return <Trash2 className="text-gray-500" size={16} />;
      default:
        return <AlertCircle className="text-gray-500" size={16} />;
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
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400';
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

  if (loading) {
    return (
      <div className="text-center py-8 sm:py-10">
        <div className="animate-spin rounded-full h-8 sm:h-10 w-8 sm:w-10 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-3 text-sm sm:text-base text-gray-600 dark:text-gray-400">Loading leave applications...</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">Leave Application Status</h2>
        <button className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm sm:text-base transition">
          <Download size={16} />
          <span>Export</span>
        </button>
      </div>

      {/* Statistics Cards - Responsive grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg shadow">
          <div className="text-lg sm:text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.total}</div>
          <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Total</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg shadow">
          <div className="text-lg sm:text-2xl font-bold text-green-600 dark:text-green-400">{stats.approved}</div>
          <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Approved</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg shadow">
          <div className="text-lg sm:text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pending}</div>
          <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Pending</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg shadow">
          <div className="text-lg sm:text-2xl font-bold text-red-600 dark:text-red-400">{stats.rejected}</div>
          <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Rejected</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg shadow col-span-2 sm:col-span-1">
          <div className="text-lg sm:text-2xl font-bold text-gray-600 dark:text-gray-400">{stats.cancelled}</div>
          <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Cancelled</div>
        </div>
      </div>

      {/* Table - Responsive with horizontal scroll */}
      {leaves.length === 0 ? (
        <div className="text-center py-8 sm:py-10 bg-white dark:bg-gray-800 rounded-lg">
          <FileText className="mx-auto text-gray-400" size={32} />
          <p className="mt-3 text-sm sm:text-base text-gray-600 dark:text-gray-400">No leave applications found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto -mx-4 sm:mx-0 rounded-lg border border-gray-200 dark:border-gray-700">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th scope="col" className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                  S.No
                </th>
                <th scope="col" className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                  <div className="flex items-center">
                    <Calendar className="mr-1 sm:mr-2" size={12} />
                    Leave Dates
                  </div>
                </th>
                <th scope="col" className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                  Type
                </th>
                <th scope="col" className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                  Duration
                </th>
                <th scope="col" className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                  Status
                </th>
                <th scope="col" className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                  Remarks
                </th>
                <th scope="col" className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
              {leaves.map((application, index) => (
                <tr key={application._id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                  <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900 dark:text-white">
                    {index + 1}
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                    <div className="text-xs sm:text-sm">
                      <div className="font-medium text-gray-900 dark:text-white">{formatDate(application.startDate)}</div>
                      <div className="text-gray-500 dark:text-gray-400">to {formatDate(application.endDate)}</div>
                      {application.fromTime && application.toTime && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {application.fromTime} - {application.toTime}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                    <span className={`px-2 py-0.5 sm:px-3 sm:py-1 text-xs rounded-full ${
                      application.leaveType === 'Medical Leave' 
                        ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                        : application.leaveType === 'Casual Leave'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                        : application.leaveType === 'Permission Leave'
                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
                        : application.leaveType === 'Winter Leave'
                        ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400'
                        : application.leaveType === 'Summer Leave'
                        ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
                        : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400'
                    }`}>
                      {application.leaveType === 'Permission Leave' ? 'Permission' : 
                       application.leaveType === 'Medical Leave' ? 'Medical' :
                       application.leaveType === 'Casual Leave' ? 'Casual' :
                       application.leaveType === 'Winter Leave' ? 'Winter' :
                       application.leaveType === 'Summer Leave' ? 'Summer' : 'Other'}
                    </span>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    {application.leaveType === 'Permission Leave' ? (
                      <span>{application.hours}h</span>
                    ) : (
                      <span>{application.days}d</span>
                    )}
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      {getStatusIcon(application.status)}
                      <span className={`px-2 py-0.5 sm:px-3 sm:py-1 text-xs rounded-full font-medium ${getStatusColor(application.status)}`}>
                        {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400 max-w-[120px] sm:max-w-xs">
                    <div className="truncate" title={application.reason}>
                      {application.reason}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      {formatDate(application.appliedDate)}
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                    {application.status === 'pending' && (
                      <button
                        onClick={() => handleCancelLeave(application._id)}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition"
                        title="Cancel Leave"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Additional Info Cards - Responsive */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 sm:p-4 rounded-lg">
          <div className="flex items-center">
            <CheckCircle className="text-blue-600 dark:text-blue-400 mr-2" size={16} />
            <h4 className="font-medium text-xs sm:text-sm text-blue-800 dark:text-blue-300">Approval Process</h4>
          </div>
          <p className="text-xs text-blue-700 dark:text-blue-400 mt-1 sm:mt-2">Faculty → HOD</p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 p-3 sm:p-4 rounded-lg">
          <div className="flex items-center">
            <Clock className="text-green-600 dark:text-green-400 mr-2" size={16} />
            <h4 className="font-medium text-xs sm:text-sm text-green-800 dark:text-green-300">Processing Time</h4>
          </div>
          <p className="text-xs text-green-700 dark:text-green-400 mt-1 sm:mt-2">1-2 days</p>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/20 p-3 sm:p-4 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="text-purple-600 dark:text-purple-400 mr-2" size={16} />
            <h4 className="font-medium text-xs sm:text-sm text-purple-800 dark:text-purple-300">Important</h4>
          </div>
          <p className="text-xs text-purple-700 dark:text-purple-400 mt-1 sm:mt-2">Min 8h, Permission max 4h</p>
        </div>
      </div>

      {/* Legend - Responsive */}
      <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200 dark:border-gray-700">
        <h4 className="font-medium text-xs sm:text-sm text-gray-800 dark:text-white mb-2 sm:mb-3">Status Legend</h4>
        <div className="flex flex-wrap gap-3 sm:gap-4">
          {[
            { color: 'bg-green-500', label: 'Approved' },
            { color: 'bg-yellow-500', label: 'Pending' },
            { color: 'bg-red-500', label: 'Rejected' },
            { color: 'bg-gray-500', label: 'Cancelled' }
          ].map((item, idx) => (
            <div key={idx} className="flex items-center">
              <div className={`w-2 h-2 sm:w-3 sm:h-3 ${item.color} rounded-full mr-1 sm:mr-2`}></div>
              <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LeaveStatus;