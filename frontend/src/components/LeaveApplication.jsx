import React, { useState } from 'react';
import { Calendar, Clock, AlertCircle, Upload } from 'lucide-react';

const LeaveApplication = () => {
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

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Leave Application Submitted:', leaveData);
    alert('Leave application submitted successfully! It will be reviewed by HOD.');
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
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Apply for Leave</h2>

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
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition"
              required
            >
              <option value="">Select Leave Type</option>
              {leaveTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* Number of Days (Auto-calculated) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Number of Days
            </label>
            <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600">
              <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                {calculateDays()} {calculateDays() === 1 ? 'Day' : 'Days'}
              </span>
            </div>
          </div>
        </div>

        {/* Date and Time Selection */}
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
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition"
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
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition"
              required
            />
          </div>
        </div>

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
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition"
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
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition"
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
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition"
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
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition"
            placeholder="Name of faculty member taking your responsibilities"
          />
        </div>

        {/* Document Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Upload className="inline-block mr-2" size={16} />
            Supporting Document (Optional)
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg">
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
            className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg shadow-md transition duration-200"
          >
            Submit Leave Application
          </button>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
            Your leave application will be first reviewed by HOD, then by Principal.
          </p>
        </div>
      </form>
    </div>
  );
};

export default LeaveApplication;