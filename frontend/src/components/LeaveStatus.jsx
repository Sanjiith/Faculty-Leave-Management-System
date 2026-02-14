import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, XCircle, AlertCircle, Download, Calendar, FileText } from 'lucide-react';
import axios from 'axios';

const LeaveStatus = ({ facultyData }) => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0
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
        
        setStats({ total, approved, pending, rejected });
      }
    } catch (error) {
      console.error('Error fetching leaves:', error);
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) {
    return (
      <div className="text-center py-10">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-3 text-gray-600 dark:text-gray-400">Loading leave applications...</p>
      </div>
    );
  }

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
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.total}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Applications</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.approved}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Approved</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pending}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Pending</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.rejected}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Rejected</div>
        </div>
      </div>

      {/* Table */}
      {leaves.length === 0 ? (
        <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-lg">
          <FileText className="mx-auto text-gray-400" size={40} />
          <p className="mt-3 text-gray-600 dark:text-gray-400">No leave applications found.</p>
        </div>
      ) : (
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
                  Status
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
              {leaves.map((application, index) => (
                <tr key={application._id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      <div className="font-medium">{formatDate(application.startDate)}</div>
                      <div className="text-gray-500 dark:text-gray-400">to {formatDate(application.endDate)}</div>
                      <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                        {application.days} {application.days === 1 ? 'Day' : 'Days'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 text-xs rounded-full ${
                      application.leaveType === 'Medical Leave' 
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
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusIcon(application.status)}
                      <span className={`ml-2 px-3 py-1 text-xs rounded-full ${getStatusColor(application.status)}`}>
                        {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                    <div className="max-w-xs truncate" title={application.reason}>
                      {application.reason}
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
      )}

      {/* Additional Info */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <div className="flex items-center">
            <CheckCircle className="text-blue-600 dark:text-blue-400 mr-2" size={18} />
            <h4 className="font-medium text-blue-800 dark:text-blue-300">Approval Process</h4>
          </div>
          <p className="text-sm text-blue-700 dark:text-blue-400 mt-2">
            1. Faculty applies → 2. HOD reviews
          </p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
          <div className="flex items-center">
            <Clock className="text-green-600 dark:text-green-400 mr-2" size={18} />
            <h4 className="font-medium text-green-800 dark:text-green-300">Processing Time</h4>
          </div>
          <p className="text-sm text-green-700 dark:text-green-400 mt-2">
            Typically 1-2 working days for approval
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
        </div>
      </div>
    </div>
  );
};

export default LeaveStatus;