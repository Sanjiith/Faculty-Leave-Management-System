import React, { useState, useEffect } from 'react';
import axios from 'axios';
import HODDashboard from './HODDashboard';
import Sidebar from './Sidebar';

// Faculty imports
import {
  Calendar,
  User,
  FileText,
  Bell,
  LogOut,
  CheckCircle,
  Clock,
  XCircle,
  Moon,
  Sun
} from 'lucide-react';
import FacultyDetails from './FacultyDetails';
import LeaveApplication from './LeaveApplication';
import LeaveStatus from './LeaveStatus';

const Dashboard = ({ onLogout }) => {

  const [activeTab, setActiveTab] = useState('details');
  const [isDark, setIsDark] = useState(
    localStorage.getItem('darkMode') === 'true' ||
    document.documentElement.classList.contains('dark')
  );

  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [userType, setUserType] = useState(
    localStorage.getItem('userType') || null
  );

  const [facultyData, setFacultyData] = useState(user || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      onLogout();
      return;
    }

    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    axios.get('http://localhost:5000/api/auth/me')
      .then(res => {
        if (res.data.success) {
          setUser(res.data.user);
          localStorage.setItem('user', JSON.stringify(res.data.user));

          const role = res.data.user.role;
          setUserType(role);
          localStorage.setItem('userType', role);

          setFacultyData(res.data.user);
        }
      })
      .catch(() => {
        localStorage.clear();
        onLogout();
      })
      .finally(() => {
        setLoading(false);
      });

  }, [onLogout]);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const toggleDarkMode = () => {
    const newDarkMode = !isDark;
    setIsDark(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode);

    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    delete axios.defaults.headers.common['Authorization'];
    onLogout();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (userType === 'hod') {
    return <HODDashboard onLogout={handleLogout} user={user} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={handleLogout}
        isDark={isDark}
        toggleDarkMode={toggleDarkMode}
        userData={facultyData}
        userType={userType}
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
                    Faculty Leave Management
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    College of Engineering & Technology
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

                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <User className="text-blue-600 dark:text-blue-400" size={20} />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800 dark:text-white">
                      {facultyData?.personalDetails?.name || facultyData?.email || 'Faculty'}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {facultyData?.personalDetails?.designation || facultyData?.role || 'Faculty'}
                    </p>
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
              { id: 'details', label: 'Details', icon: User },
              { id: 'apply', label: 'Apply', icon: FileText },
              { id: 'status', label: 'Status', icon: CheckCircle }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-2 px-3 rounded-md text-xs font-medium transition ${isActive
                      ? 'bg-blue-600 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                >
                  <Icon className="inline-block mr-1" size={14} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Content Area */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 overflow-x-auto">
            {activeTab === 'details' && <FacultyDetails facultyData={facultyData} />}
            {activeTab === 'apply' && <LeaveApplication facultyData={facultyData} />}
            {activeTab === 'status' && <LeaveStatus facultyData={facultyData} />}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;