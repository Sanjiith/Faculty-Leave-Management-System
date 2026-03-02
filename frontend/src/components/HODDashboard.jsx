import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Users, 
  CheckCircle, 
  XCircle, 
  Clock,
  FileText,
  LogOut,
  Moon,
  Sun,
  Bell,
  AlertTriangle
} from 'lucide-react';
import axios from 'axios';
import PendingApprovals from './hod/PendingApprovals';
import DepartmentFaculty from './hod/DepartmentFaculty';
import ApprovalHistory from './hod/ApprovalHistory';

const HODDashboard = ({ onLogout, user }) => {
  const [activeTab, setActiveTab] = useState('pending');
  const [isDark, setIsDark] = useState(localStorage.getItem('darkMode') === 'true');
  const [hodData, setHodData] = useState(null);
  const [stats, setStats] = useState({
    pendingLeaves: 0,
    totalFaculty: 0,
    approvedToday: 0,
    approvedLeaves: 0,
    rejectedLeaves: 0,
    facultyOnLeaveToday: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHODData();
  }, []);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const fetchHODData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/hod/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setHodData(response.data.hod);
        setStats(response.data.statistics);
      }
    } catch (error) {
      console.error('Error fetching HOD data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveAction = (action) => {
    setStats(prevStats => ({
      ...prevStats,
      pendingLeaves: Math.max(0, prevStats.pendingLeaves - 1),
      approvedLeaves: action === 'approved' ? prevStats.approvedLeaves + 1 : prevStats.approvedLeaves,
      rejectedLeaves: action === 'rejected' ? prevStats.rejectedLeaves + 1 : prevStats.rejectedLeaves,
      approvedToday: action === 'approved' ? prevStats.approvedToday + 1 : prevStats.approvedToday
    }));
    // Refresh data to get updated facultyOnLeaveToday
    fetchHODData();
  };

  const toggleDarkMode = () => {
    const newDarkMode = !isDark;
    setIsDark(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 sm:h-12 w-10 sm:w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-3 sm:mt-4 text-sm sm:text-base text-gray-600 dark:text-gray-400">Loading HOD Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center space-x-3 sm:space-x-4 w-full sm:w-auto">
              <div className="bg-blue-100 dark:bg-blue-900 p-1.5 sm:p-2 rounded-lg flex-shrink-0">
                <Calendar className="text-blue-600 dark:text-blue-400" size={20} />
              </div>
              <div className="min-w-0 flex-1 sm:flex-none">
                <h1 className="text-base sm:text-xl font-bold text-gray-800 dark:text-white truncate">
                  HOD Dashboard
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                  {hodData?.hodOf}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end space-x-2 sm:space-x-4 w-full sm:w-auto">
              <button
                onClick={toggleDarkMode}
                className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors bg-white dark:bg-gray-800 flex-shrink-0"
                aria-label="Toggle dark mode"
              >
                {isDark ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} className="text-gray-600" />}
              </button>

              <div className="relative">
                <button className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors bg-white dark:bg-gray-800">
                  <Bell size={18} className="text-gray-600 dark:text-gray-400" />
                  {stats.pendingLeaves > 0 && (
                    <span className="absolute top-0 right-0 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full">
                      {stats.pendingLeaves > 9 ? '9+' : stats.pendingLeaves}
                    </span>
                  )}
                </button>
              </div>

              <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0">
                  <Users className="text-blue-600 dark:text-blue-400" size={16} />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-xs sm:text-sm text-gray-800 dark:text-white truncate">
                    {hodData?.personalDetails?.name}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 truncate">HOD</p>
                </div>
              </div>

              <button
                onClick={onLogout}
                className="p-1.5 sm:p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors bg-white dark:bg-gray-800 flex-shrink-0"
                aria-label="Logout"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Stats Cards - Responsive grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow p-3 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Pending</p>
                <p className="text-lg sm:text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                  {stats.pendingLeaves}
                </p>
              </div>
              <div className="p-1.5 sm:p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                <Clock className="text-yellow-600 dark:text-yellow-400" size={18} />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow p-3 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Faculty</p>
                <p className="text-lg sm:text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {stats.totalFaculty}
                </p>
              </div>
              <div className="p-1.5 sm:p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Users className="text-blue-600 dark:text-blue-400" size={18} />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow p-3 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">On Leave</p>
                <p className={`text-lg sm:text-3xl font-bold ${stats.facultyOnLeaveToday >= 2 ? 'text-yellow-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400'}`}>
                  {stats.facultyOnLeaveToday}
                </p>
              </div>
              <div className={`p-1.5 sm:p-3 rounded-lg ${stats.facultyOnLeaveToday >= 2 ? 'bg-yellow-100 dark:bg-yellow-900/30' : 'bg-green-100 dark:bg-green-900/30'}`}>
                <AlertTriangle className={stats.facultyOnLeaveToday >= 2 ? 'text-yellow-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400'} size={18} />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow p-3 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Approved</p>
                <p className="text-lg sm:text-3xl font-bold text-green-600 dark:text-green-400">
                  {stats.approvedLeaves || 0}
                </p>
              </div>
              <div className="p-1.5 sm:p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <CheckCircle className="text-green-600 dark:text-green-400" size={18} />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow p-3 sm:p-6 col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Rejected</p>
                <p className="text-lg sm:text-3xl font-bold text-red-600 dark:text-red-400">
                  {stats.rejectedLeaves || 0}
                </p>
              </div>
              <div className="p-1.5 sm:p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <XCircle className="text-red-600 dark:text-red-400" size={18} />
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs - Responsive */}
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-1 bg-white dark:bg-gray-800 rounded-lg p-1 mb-6 sm:mb-8 shadow-sm">
          <button
            onClick={() => setActiveTab('pending')}
            className={`w-full sm:flex-1 py-2 sm:py-3 px-3 sm:px-4 rounded-md text-xs sm:text-sm font-medium transition ${
              activeTab === 'pending'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300'
            }`}
          >
            <Clock className="inline-block mr-1 sm:mr-2" size={14} />
            <span className="hidden xs:inline">Pending</span>
            <span className="xs:hidden">Pending</span> ({stats.pendingLeaves})
          </button>
          <button
            onClick={() => setActiveTab('faculty')}
            className={`w-full sm:flex-1 py-2 sm:py-3 px-3 sm:px-4 rounded-md text-xs sm:text-sm font-medium transition ${
              activeTab === 'faculty'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300'
            }`}
          >
            <Users className="inline-block mr-1 sm:mr-2" size={14} />
            <span className="hidden xs:inline">Faculty</span>
            <span className="xs:hidden">Faculty</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`w-full sm:flex-1 py-2 sm:py-3 px-3 sm:px-4 rounded-md text-xs sm:text-sm font-medium transition ${
              activeTab === 'history'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300'
            }`}
          >
            <FileText className="inline-block mr-1 sm:mr-2" size={14} />
            <span className="hidden xs:inline">History</span>
            <span className="xs:hidden">History</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 overflow-x-auto">
          {activeTab === 'pending' && (
            <PendingApprovals 
              hodDepartment={hodData?.hodOf} 
              onLeaveAction={handleLeaveAction}
            />
          )}
          {activeTab === 'faculty' && <DepartmentFaculty hodDepartment={hodData?.hodOf} />}
          {activeTab === 'history' && <ApprovalHistory hodDepartment={hodData?.hodOf} />}
        </div>
      </main>
    </div>
  );
};

export default HODDashboard;