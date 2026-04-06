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
import Sidebar from './Sidebar';
import NotificationBell from './NotificationBell';
import { API_BASE_URL } from '../utils/api';

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

  // Tab change listener for notifications
  useEffect(() => {
    const handleTabChange = (event) => {
      setActiveTab(event.detail.tab);
    };
    
    window.addEventListener('changeTab', handleTabChange);
    return () => window.removeEventListener('changeTab', handleTabChange);
  }, []);

  const fetchHODData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/hod/profile`, {
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={onLogout}
        isDark={isDark}
        toggleDarkMode={toggleDarkMode}
        userData={hodData}
        userType="hod"
        hodStats={stats}
      />

      {/* Main Content */}
      <main className="flex-1 transition-all duration-300">
        {/* Header - Hidden on mobile (now in sidebar) */}
        <header className="hidden lg:block bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4">
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
                  className="p-2 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                  aria-label="Toggle dark mode"
                >
                  {isDark ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-gray-600" />}
                </button>

                {/* Notification Bell Component */}
                <NotificationBell userType="hod" />

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
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 sm:p-6 lg:p-8">
          {/* Mobile Tabs (hidden on desktop) */}
          <div className="lg:hidden flex space-x-1 bg-white dark:bg-gray-800 rounded-lg p-1 mb-6 shadow-sm">
            {[
              { id: 'pending', label: 'Pending', icon: Clock, badge: stats.pendingLeaves },
              { id: 'faculty', label: 'Faculty', icon: Users },
              { id: 'history', label: 'History', icon: FileText }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-2 px-3 rounded-md text-xs font-medium transition relative ${isActive
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                >
                  <Icon className="inline-block mr-1" size={14} />
                  {tab.label}
                  {tab.badge > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 bg-yellow-500 text-white text-[10px] rounded-full">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Stats Cards - all screen sizes */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-3">
              <p className="text-xs text-gray-500 dark:text-gray-400">Pending</p>
              <p className="text-xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pendingLeaves}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-3">
              <p className="text-xs text-gray-500 dark:text-gray-400">Total Faculty</p>
              <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{stats.totalFaculty}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-3">
              <p className="text-xs text-gray-500 dark:text-gray-400">On Leave Today</p>
              <p className={`text-xl font-bold ${stats.facultyOnLeaveToday >= 2 ? 'text-yellow-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400'}`}>
                {stats.facultyOnLeaveToday}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-3">
              <p className="text-xs text-gray-500 dark:text-gray-400">Approved</p>
              <p className="text-xl font-bold text-green-600 dark:text-green-400">{stats.approvedLeaves || 0}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-3 col-span-2 sm:col-span-1">
              <p className="text-xs text-gray-500 dark:text-gray-400">Rejected</p>
              <p className="text-xl font-bold text-red-600 dark:text-red-400">{stats.rejectedLeaves || 0}</p>
            </div>
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
        </div>
      </main>
    </div>
  );
};

export default HODDashboard;