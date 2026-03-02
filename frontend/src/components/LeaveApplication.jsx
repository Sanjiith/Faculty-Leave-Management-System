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
    nightSkillDays: '', // For compensation leave
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

  const calculateHours = () => {
    if (leaveData.fromTime && leaveData.toTime) {
      const from = leaveData.fromTime.split(':');
      const to = leaveData.toTime.split(':');
      const fromMinutes = parseInt(from[0]) * 60 + parseInt(from[1]);
      const toMinutes = parseInt(to[0]) * 60 + parseInt(to[1]);
      const diffHours = (toMinutes - fromMinutes) / 60;
      return diffHours > 0 ? diffHours : 24 + diffHours;
    }
    return 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    // Additional frontend validations
    const hours = calculateHours();
    const days = calculateDays();

    // Check minimum hours for full day leaves (except permission leave)
    if (leaveData.leaveType !== 'Permission Leave' && leaveData.fromDate === leaveData.toDate && hours > 0 && hours < 8) {
      setMessage({ 
        type: 'error', 
        text: 'Minimum 8 hours required for full day leave. For shorter duration, please apply for Permission Leave.' 
      });
      setLoading(false);
      return;
    }

    // Check maximum hours for permission leave
    if (leaveData.leaveType === 'Permission Leave' && hours > 4) {
      setMessage({ 
        type: 'error', 
        text: 'Permission Leave cannot exceed 4 hours (half day).' 
      });
      setLoading(false);
      return;
    }

    // Check minimum hours for permission leave
    if (leaveData.leaveType === 'Permission Leave' && hours < 1) {
      setMessage({ 
        type: 'error', 
        text: 'Permission Leave must be at least 1 hour.' 
      });
      setLoading(false);
      return;
    }

    // Check if medical certificate is provided for medical leave
    if (leaveData.leaveType === 'Medical Leave' && !leaveData.document) {
      setMessage({ 
        type: 'error', 
        text: 'Medical certificate is required for Medical Leave.' 
      });
      setLoading(false);
      return;
    }

    // Check if night skill days are provided for compensation leave
    if (leaveData.leaveType === 'Compensation Leave' && (!leaveData.nightSkillDays || leaveData.nightSkillDays < 3)) {
      setMessage({ 
        type: 'error', 
        text: 'Minimum 3 night skill days required for compensation leave.' 
      });
      setLoading(false);
      return;
    }

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
          nightSkillDays: '',
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
  const hours = calculateHours();
  const isLeaveTypeSelected = leaveData.leaveType;
  
  // Check leave balance
  let balanceCheck = null;
  if (isLeaveTypeSelected && facultyData?.leaveBalance) {
    if (leaveData.leaveType === 'Casual Leave') {
      balanceCheck = facultyData.leaveBalance.casualLeave;
    } else if (leaveData.leaveType === 'Medical Leave') {
      balanceCheck = facultyData.leaveBalance.medicalLeave;
    } else if (leaveData.leaveType === 'Summer Leave') {
      balanceCheck = facultyData.leaveBalance.summerLeave;
    } else if (leaveData.leaveType === 'Winter Leave') {
      balanceCheck = facultyData.leaveBalance.winterLeave;
    }
  }

  // Get permission leaves available
  const permissionLeavesAvailable = facultyData?.leaveBalance?.permissionLeaves?.available || 2;

  return (
    <div className="w-full">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white mb-4 sm:mb-6">Apply for Leave</h2>

      {message.text && (
        <div className={`mb-4 p-3 sm:p-4 rounded-lg text-sm sm:text-base ${
          message.type === 'success' 
            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
        }`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {/* Leave Type */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
              Leave Type *
            </label>
            <select
              name="leaveType"
              value={leaveData.leaveType}
              onChange={handleChange}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 dark:bg-gray-700 dark:text-white"
              required
            >
              <option value="">Select Leave Type</option>
              {leaveTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* Number of Days / Hours */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
              {leaveData.leaveType === 'Permission Leave' ? 'Duration (Hours)' : 'Number of Days'}
            </label>
            <div className="px-3 sm:px-4 py-2 sm:py-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600">
              {leaveData.leaveType === 'Permission Leave' ? (
                <span className="text-base sm:text-lg font-bold text-blue-600 dark:text-blue-400">
                  {hours} {hours === 1 ? 'Hour' : 'Hours'}
                </span>
              ) : (
                <span className="text-base sm:text-lg font-bold text-blue-600 dark:text-blue-400">
                  {days} {days === 1 ? 'Day' : 'Days'}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Leave Balance Information */}
        {isLeaveTypeSelected && leaveData.leaveType !== 'Permission Leave' && balanceCheck !== null && (
          <div className="bg-blue-50 dark:bg-blue-900/20 p-2 sm:p-3 rounded-lg">
            <p className="text-xs sm:text-sm text-blue-700 dark:text-blue-300">
              Available {leaveData.leaveType} balance: <span className="font-bold">{balanceCheck} days</span>
            </p>
          </div>
        )}

        {leaveData.leaveType === 'Permission Leave' && (
          <div className="bg-blue-50 dark:bg-blue-900/20 p-2 sm:p-3 rounded-lg">
            <p className="text-xs sm:text-sm text-blue-700 dark:text-blue-300">
              Permission leaves available this month: <span className="font-bold">{permissionLeavesAvailable} / 2</span>
            </p>
          </div>
        )}

        {/* Leave Balance Warning */}
        {balanceCheck !== null && days > balanceCheck && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 sm:p-4">
            <p className="text-xs sm:text-sm text-red-600 dark:text-red-400 font-medium">
              Insufficient {leaveData.leaveType} balance! Available: {balanceCheck} days
            </p>
          </div>
        )}

        {/* Date Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
              <Calendar className="inline-block mr-1 sm:mr-2" size={14} />
              From Date *
            </label>
            <input
              type="date"
              name="fromDate"
              value={leaveData.fromDate}
              onChange={handleChange}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 dark:bg-gray-700 dark:text-white"
              style={{ colorScheme: 'light' }}
              required
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
              <Calendar className="inline-block mr-1 sm:mr-2" size={14} />
              To Date *
            </label>
            <input
              type="date"
              name="toDate"
              value={leaveData.toDate}
              onChange={handleChange}
              min={leaveData.fromDate}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 dark:bg-gray-700 dark:text-white"
              style={{ colorScheme: 'light' }}
              required
            />
          </div>
        </div>

        {/* Time Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
              <Clock className="inline-block mr-1 sm:mr-2" size={14} />
              From Time *
            </label>
            <input
              type="time"
              name="fromTime"
              value={leaveData.fromTime}
              onChange={handleChange}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 dark:bg-gray-700 dark:text-white"
              style={{ colorScheme: 'light' }}
              required
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
              <Clock className="inline-block mr-1 sm:mr-2" size={14} />
              To Time *
            </label>
            <input
              type="time"
              name="toTime"
              value={leaveData.toTime}
              onChange={handleChange}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 dark:bg-gray-700 dark:text-white"
              style={{ colorScheme: 'light' }}
              required
            />
          </div>
        </div>

        {/* Hour Validation Warnings */}
        {leaveData.fromTime && leaveData.toTime && leaveData.leaveType && leaveData.leaveType !== 'Permission Leave' && leaveData.fromDate === leaveData.toDate && hours < 8 && hours > 0 && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 sm:p-4">
            <div className="flex items-start">
              <AlertCircle className="text-red-600 dark:text-red-400 mt-0.5 mr-2 sm:mr-3 flex-shrink-0" size={16} />
              <div>
                <p className="font-medium text-xs sm:text-sm text-red-800 dark:text-red-300">
                  Minimum 8 Hours Required
                </p>
                <p className="text-xs text-red-700 dark:text-red-400 mt-1">
                  Current duration: {hours} hours. For shorter duration, apply for Permission Leave.
                </p>
              </div>
            </div>
          </div>
        )}

        {leaveData.leaveType === 'Permission Leave' && leaveData.fromTime && leaveData.toTime && hours > 4 && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 sm:p-4">
            <div className="flex items-start">
              <AlertCircle className="text-red-600 dark:text-red-400 mt-0.5 mr-2 sm:mr-3 flex-shrink-0" size={16} />
              <div>
                <p className="font-medium text-xs sm:text-sm text-red-800 dark:text-red-300">
                  Permission Leave Limit Exceeded
                </p>
                <p className="text-xs text-red-700 dark:text-red-400 mt-1">
                  Cannot exceed 4 hours. Current duration: {hours} hours.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Compensation Leave Field */}
        {leaveData.leaveType === 'Compensation Leave' && (
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
              Number of Night Skill Days Worked *
            </label>
            <input
              type="number"
              name="nightSkillDays"
              value={leaveData.nightSkillDays}
              onChange={handleChange}
              min="3"
              step="1"
              className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 dark:bg-gray-700 dark:text-white"
              placeholder="Enter number of days worked (minimum 3)"
              required
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              3 night skill days = 1 compensation leave
            </p>
          </div>
        )}

        {/* Reason */}
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
            Reason for Leave *
          </label>
          <textarea
            name="reason"
            value={leaveData.reason}
            onChange={handleChange}
            rows={4}
            className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 dark:bg-gray-700 dark:text-white"
            placeholder={
              leaveData.leaveType === 'Compensation Leave' 
                ? "Please provide details about the night skill duties you performed..."
                : "Please provide detailed reason for leave..."
            }
            required
          />
        </div>

        {/* Alternate Faculty */}
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
            Alternate Faculty (Optional)
          </label>
          <input
            type="text"
            name="alternateFaculty"
            value={leaveData.alternateFaculty}
            onChange={handleChange}
            className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 dark:bg-gray-700 dark:text-white"
            placeholder="Name of faculty member taking your responsibilities"
          />
        </div>

        {/* Document Upload */}
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
            <Upload className="inline-block mr-1 sm:mr-2" size={14} />
            {leaveData.leaveType === 'Medical Leave' ? 'Medical Certificate *' : 'Supporting Document (Optional)'}
          </label>
          <div className="mt-1 flex justify-center px-4 sm:px-6 pt-4 sm:pt-5 pb-4 sm:pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg bg-white dark:bg-gray-700">
            <div className="space-y-1 text-center">
              <Upload className="mx-auto text-gray-400" size={24} />
              <div className="flex flex-col xs:flex-row text-xs text-gray-600 dark:text-gray-400">
                <label className="relative cursor-pointer rounded-md font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500">
                  <span>Upload a file</span>
                  <input
                    type="file"
                    name="document"
                    onChange={handleChange}
                    className="sr-only"
                    accept=".pdf,.doc,.docx,.jpg,.png"
                    required={leaveData.leaveType === 'Medical Leave'}
                  />
                </label>
                <p className="pl-0 xs:pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                PDF, DOC, JPG, PNG up to 10MB
              </p>
              {leaveData.document && (
                <p className="text-xs sm:text-sm text-green-600 dark:text-green-400">
                  ✓ {leaveData.document.name}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Time Conflict Warning */}
        {leaveData.fromDate === leaveData.toDate && leaveData.fromTime && leaveData.toTime && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 sm:p-4">
            <div className="flex items-start">
              <AlertCircle className="text-yellow-600 dark:text-yellow-400 mt-0.5 mr-2 sm:mr-3 flex-shrink-0" size={16} />
              <div>
                <p className="font-medium text-xs sm:text-sm text-yellow-800 dark:text-yellow-300">
                  Time Conflict Prevention
                </p>
                <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-1">
                  System will check for overlapping leaves on the same day.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="pt-4 sm:pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            type="submit"
            disabled={
              loading || 
              (balanceCheck !== null && days > balanceCheck) ||
              (leaveData.leaveType !== 'Permission Leave' && leaveData.fromDate === leaveData.toDate && leaveData.fromTime && leaveData.toTime && hours < 8 && hours > 0) ||
              (leaveData.leaveType === 'Permission Leave' && leaveData.fromTime && leaveData.toTime && hours > 4) ||
              (leaveData.leaveType === 'Permission Leave' && leaveData.fromTime && leaveData.toTime && hours < 1) ||
              (leaveData.leaveType === 'Medical Leave' && !leaveData.document) ||
              (leaveData.leaveType === 'Compensation Leave' && (!leaveData.nightSkillDays || leaveData.nightSkillDays < 3))
            }
            className="w-full sm:w-auto px-6 sm:px-8 py-2 sm:py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg shadow-md transition duration-200 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Submitting...' : 'Submit Leave Application'}
          </button>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-2 sm:mt-3">
            Your leave application will be reviewed by HOD.
          </p>
        </div>
      </form>
    </div>
  );
};

export default LeaveApplication;