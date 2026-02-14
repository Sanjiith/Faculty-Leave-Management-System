import React, { useState } from 'react';
import { Calendar, Clock, AlertCircle, Upload } from 'lucide-react';
import axios from 'axios';

const LeaveApplication = ({ facultyData }) => {
  const [leaveData, setLeaveData] = useState({
    leaveType: '',
    fromDate: '',
    toDate: '',
    fromTime: '',
    toTime: '',
    reason: '',
    alternateFaculty: '',
    document: null,
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const leaveTypes = [
    'Casual Leave',
    'Medical Leave',
    'Maternity Leave',
    'Winter Leave',
    'Summer Leave',
    'Permission Leave',
    'Compensation Leave'
  ];

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'document') {
      setLeaveData({ ...leaveData, document: files[0] });
    } else {
      setLeaveData({ ...leaveData, [name]: value });
    }
    setMessage({ type: '', text: '' });
  };

  const calculateDays = () => {
    if (leaveData.fromDate && leaveData.toDate) {
      const from = new Date(leaveData.fromDate);
      const to = new Date(leaveData.toDate);
      const diffTime = Math.abs(to - from);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      return diffDays;
    }
    return 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5000/api/faculty/leave/apply',
        leaveData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        setMessage({ 
          type: 'success', 
          text: 'Leave application submitted successfully! It will be reviewed by HOD.' 
        });
        setLeaveData({
          leaveType: '',
          fromDate: '',
          toDate: '',
          fromTime: '',
          toTime: '',
          reason: '',
          alternateFaculty: '',
          document: null,
        });
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to submit leave application' 
      });
    } finally {
      setLoading(false);
    }
  };

  const days = calculateDays();
  const isLeaveTypeSelected = leaveData.leaveType;
  
  // Check leave balance
  let balanceCheck = null;
  if (isLeaveTypeSelected && facultyData?.leaveBalance) {
    if (leaveData.leaveType === 'Casual Leave') {
      balanceCheck = facultyData.leaveBalance.casualLeave;
    } else if (leaveData.leaveType === 'Medical Leave') {
      balanceCheck = facultyData.leaveBalance.medicalLeave;
    } else if (leaveData.leaveType === 'Earned Leave') {
      balanceCheck = facultyData.leaveBalance.earnedLeave;
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Apply for Leave</h2>

      {message.text && (
        <div className={`mb-4 p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
        }`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Leave Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Leave Type *
            </label>
            <select
              name="leaveType"
              value={leaveData.leaveType}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 dark:bg-gray-700 dark:text-white"
              required
            >
              <option value="">Select Leave Type</option>
              {leaveTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* Number of Days */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Number of Days
            </label>
            <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600">
              <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                {days} {days === 1 ? 'Day' : 'Days'}
              </span>
            </div>
          </div>
        </div>

        {/* Leave Balance Warning */}
        {balanceCheck !== null && days > balanceCheck && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-600 dark:text-red-400 font-medium">
              Insufficient {leaveData.leaveType} balance! Available: {balanceCheck} days
            </p>
          </div>
        )}

        {/* Date Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Calendar className="inline-block mr-2" size={16} />
              From Date *
            </label>
            <input
              type="date"
              name="fromDate"
              value={leaveData.fromDate}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Calendar className="inline-block mr-2" size={16} />
              To Date *
            </label>
            <input
              type="date"
              name="toDate"
              value={leaveData.toDate}
              onChange={handleChange}
              min={leaveData.fromDate}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>
        </div>

        {/* Time Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Clock className="inline-block mr-2" size={16} />
              From Time *
            </label>
            <input
              type="time"
              name="fromTime"
              value={leaveData.fromTime}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Clock className="inline-block mr-2" size={16} />
              To Time *
            </label>
            <input
              type="time"
              name="toTime"
              value={leaveData.toTime}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>
        </div>

        {/* Reason */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Reason for Leave *
          </label>
          <textarea
            name="reason"
            value={leaveData.reason}
            onChange={handleChange}
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 dark:bg-gray-700 dark:text-white"
            placeholder="Please provide detailed reason for leave..."
            required
          />
        </div>

        {/* Alternate Faculty */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Alternate Faculty (Optional)
          </label>
          <input
            type="text"
            name="alternateFaculty"
            value={leaveData.alternateFaculty}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 dark:bg-gray-700 dark:text-white"
            placeholder="Name of faculty member taking your responsibilities"
          />
        </div>

        {/* Document Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Upload className="inline-block mr-2" size={16} />
            Supporting Document (Optional)
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg bg-white dark:bg-gray-700">
            <div className="space-y-1 text-center">
              <div className="flex text-sm text-gray-600 dark:text-gray-400">
                <label className="relative cursor-pointer rounded-md font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500">
                  <span>Upload a file</span>
                  <input
                    type="file"
                    name="document"
                    onChange={handleChange}
                    className="sr-only"
                    accept=".pdf,.doc,.docx,.jpg,.png"
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                PDF, DOC, JPG, PNG up to 10MB
              </p>
              {leaveData.document && (
                <p className="text-sm text-green-600 dark:text-green-400">
                  ✓ {leaveData.document.name}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Minimum Hours Alert */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="text-yellow-600 dark:text-yellow-400 mt-0.5 mr-3" size={20} />
            <div>
              <p className="font-medium text-yellow-800 dark:text-yellow-300">
                Minimum Leave Duration: 8 Hours
              </p>
              <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
                Please ensure your leave duration meets the minimum requirement.
              </p>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            type="submit"
            disabled={loading || (balanceCheck !== null && days > balanceCheck)}
            className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg shadow-md transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Submitting...' : 'Submit Leave Application'}
          </button>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
            Your leave application will be reviewed by HOD.
          </p>
        </div>
      </form>
    </div>
  );
};

export default LeaveApplication;