import React, { useState, useEffect } from 'react';
import { Calendar, Clock, AlertCircle, Upload, UserPlus, X } from 'lucide-react';
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
    nightSkillDays: '',
    substituteFacultyId: '',
    substituteFacultyName: ''
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [requiresSubstitute, setRequiresSubstitute] = useState(false);
  const [facultyOnLeave, setFacultyOnLeave] = useState(0);
  const [showSubstituteModal, setShowSubstituteModal] = useState(false);
  const [availableFaculty, setAvailableFaculty] = useState([]);
  const [substituteSearch, setSubstituteSearch] = useState('');
  const [selectedSubstitute, setSelectedSubstitute] = useState(null);

  const leaveTypes = [
    'Casual Leave',
    'Medical Leave',
    'Maternity Leave',
    'Winter Leave',
    'Summer Leave',
    'Permission Leave',
    'Compensation Leave'
  ];

  useEffect(() => {
    fetchAvailableFaculty();
  }, []);

  const fetchAvailableFaculty = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/faculty/all-faculty', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAvailableFaculty(response.data.faculty);
    } catch (error) {
      console.error('Error fetching faculty:', error);
    }
  };

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

  const checkSubstituteRequirement = async () => {
    if (!leaveData.fromDate || !leaveData.toDate) return false;
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5000/api/faculty/leave/check-substitute',
        {
          fromDate: leaveData.fromDate,
          toDate: leaveData.toDate
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.requiresSubstitute) {
        setRequiresSubstitute(true);
        setFacultyOnLeave(response.data.facultyOnLeave);
        setShowSubstituteModal(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error checking substitute:', error);
      return false;
    }
  };

  const submitLeave = async () => {
    setLoading(true);
    
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
        let successMessage = 'Leave application submitted successfully!';
        if (response.data.requiresSubstitute) {
          successMessage += ` A substitute request has been sent to ${selectedSubstitute?.personalDetails?.name}.`;
        }
        setMessage({ type: 'success', text: successMessage });
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
          substituteFacultyId: '',
          substituteFacultyName: ''
        });
        setSelectedSubstitute(null);
        setShowSubstituteModal(false);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    const hours = calculateHours();
    const days = calculateDays();

    if (leaveData.leaveType !== 'Permission Leave' && leaveData.fromDate === leaveData.toDate && hours > 0 && hours < 8) {
      setMessage({ 
        type: 'error', 
        text: 'Minimum 8 hours required for full day leave. For shorter duration, please apply for Permission Leave.' 
      });
      return;
    }

    if (leaveData.leaveType === 'Permission Leave' && hours > 4) {
      setMessage({ 
        type: 'error', 
        text: 'Permission Leave cannot exceed 4 hours (half day).' 
      });
      return;
    }

    if (leaveData.leaveType === 'Permission Leave' && hours < 1) {
      setMessage({ 
        type: 'error', 
        text: 'Permission Leave must be at least 1 hour.' 
      });
      return;
    }

    if (leaveData.leaveType === 'Medical Leave' && !leaveData.document) {
      setMessage({ 
        type: 'error', 
        text: 'Medical certificate is required for Medical Leave.' 
      });
      return;
    }

    if (leaveData.leaveType === 'Compensation Leave' && (!leaveData.nightSkillDays || leaveData.nightSkillDays < 3)) {
      setMessage({ 
        type: 'error', 
        text: 'Minimum 3 night skill days required for compensation leave.' 
      });
      return;
    }

    // Check if substitute is required
    const needsSubstitute = await checkSubstituteRequirement();
    if (needsSubstitute) return;

    await submitLeave();
  };

  const selectSubstitute = (faculty) => {
    setSelectedSubstitute(faculty);
    setLeaveData({
      ...leaveData,
      substituteFacultyId: faculty._id,
      substituteFacultyName: faculty.personalDetails?.name
    });
  };

  const confirmSubstituteAndSubmit = () => {
    if (!selectedSubstitute) {
      alert('Please select a substitute faculty member');
      return;
    }
    setShowSubstituteModal(false);
    submitLeave();
  };

  const days = calculateDays();
  const hours = calculateHours();
  const isLeaveTypeSelected = leaveData.leaveType;
  
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

        {balanceCheck !== null && days > balanceCheck && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 sm:p-4">
            <p className="text-xs sm:text-sm text-red-600 dark:text-red-400 font-medium">
              Insufficient {leaveData.leaveType} balance! Available: {balanceCheck} days
            </p>
          </div>
        )}

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

      {/* Substitute Faculty Modal */}
      {showSubstituteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Substitute Faculty Required
              </h3>
              <button
                onClick={() => setShowSubstituteModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg mb-4">
              <p className="text-sm text-yellow-800 dark:text-yellow-300">
                ⚠️ {facultyOnLeave} faculty members are already on leave during this period.
              </p>
              <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-1">
                Please nominate a substitute faculty member to manage workload.
              </p>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Search for Faculty
              </label>
              <input
                type="text"
                value={substituteSearch}
                onChange={(e) => setSubstituteSearch(e.target.value)}
                placeholder="Search by name or department..."
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
            
            <div className="max-h-60 overflow-y-auto space-y-2 mb-4">
              {availableFaculty
                .filter(f => f.personalDetails?.name?.toLowerCase().includes(substituteSearch.toLowerCase()) ||
                           f.personalDetails?.department?.toLowerCase().includes(substituteSearch.toLowerCase()))
                .map(faculty => (
                  <div
                    key={faculty._id}
                    onClick={() => selectSubstitute(faculty)}
                    className={`p-3 rounded-lg cursor-pointer transition ${
                      selectedSubstitute?._id === faculty._id
                        ? 'bg-blue-100 dark:bg-blue-900/30 border-2 border-blue-500'
                        : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border border-transparent'
                    }`}
                  >
                    <p className="font-medium text-gray-900 dark:text-white">
                      {faculty.personalDetails?.name}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {faculty.personalDetails?.designation} | {faculty.personalDetails?.department}
                    </p>
                  </div>
                ))}
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={confirmSubstituteAndSubmit}
                disabled={!selectedSubstitute}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
              >
                Submit with Substitute
              </button>
              <button
                onClick={() => setShowSubstituteModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveApplication;