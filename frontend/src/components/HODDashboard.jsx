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
  Bell
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
    rejectedLeaves: 0
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

  // Function to update stats after approval/rejection
  const handleLeaveAction = (action) => {
    setStats(prevStats => ({
      ...prevStats,
      pendingLeaves: prevStats.pendingLeaves - 1,
      approvedLeaves: action === 'approved' ? prevStats.approvedLeaves + 1 : prevStats.approvedLeaves,
      rejectedLeaves: action === 'rejected' ? prevStats.rejectedLeaves + 1 : prevStats.rejectedLeaves,
      approvedToday: action === 'approved' ? prevStats.approvedToday + 1 : prevStats.approvedToday
    }));
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading HOD Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg">
                <Calendar className="text-blue-600 dark:text-blue-400" size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800 dark:text-white">
                  HOD Dashboard - {hodData?.hodOf}
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {hodData?.personalDetails?.name} | Head of Department
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                {isDark ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-gray-600" />}
              </button>

              <div className="relative">
                <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <Bell size={20} className="text-gray-600 dark:text-gray-400" />
                  {stats.pendingLeaves > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs flex items-center justify-center rounded-full">
                      {stats.pendingLeaves}
                    </span>
                  )}
                </button>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <Users className="text-blue-600 dark:text-blue-400" size={20} />
                </div>
                <div>
                  <p className="font-medium text-gray-800 dark:text-white">
                    {hodData?.personalDetails?.name}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">HOD - {hodData?.hodOf}</p>
                </div>
              </div>

              <button
                onClick={onLogout}
                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Pending Approvals</p>
                <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                  {stats.pendingLeaves}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                <Clock className="text-yellow-600 dark:text-yellow-400" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Faculty</p>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {stats.totalFaculty}
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Users className="text-blue-600 dark:text-blue-400" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Approved</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {stats.approvedLeaves || 0}
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <CheckCircle className="text-green-600 dark:text-green-400" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Rejected</p>
                <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                  {stats.rejectedLeaves || 0}
                </p>
              </div>
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <XCircle className="text-red-600 dark:text-red-400" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-white dark:bg-gray-800 rounded-lg p-1 mb-8 shadow-sm">
          <button
            onClick={() => setActiveTab('pending')}
            className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition ${
              activeTab === 'pending'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300'
            }`}
          >
            <Clock className="inline-block mr-2" size={16} />
            Pending Approvals ({stats.pendingLeaves})
          </button>
          <button
            onClick={() => setActiveTab('faculty')}
            className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition ${
              activeTab === 'faculty'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300'
            }`}
          >
            <Users className="inline-block mr-2" size={16} />
            Department Faculty
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition ${
              activeTab === 'history'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300'
            }`}
          >
            <FileText className="inline-block mr-2" size={16} />
            Approval History
          </button>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
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