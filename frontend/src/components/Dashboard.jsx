import React, { useState } from 'react';
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
  const [isDark, setIsDark] = useState(false);
  const [notifications] = useState(3);

  const userData = {
    name: "Dr. Sarah Johnson",
    role: "Associate Professor",
    department: "Computer Science",
  };

  const toggleDarkMode = () => {
  const newDarkMode = !isDark;
  setIsDark(newDarkMode);
  
  // Update localStorage
  localStorage.setItem('darkMode', newDarkMode);
  
  // Update HTML class
  if (newDarkMode) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};

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
                  Faculty Leave Management System
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  College of Engineering & Technology
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {isDark ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-gray-600" />}
              </button>

              <div className="relative">
                <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                  <Bell size={20} className="text-gray-600 dark:text-gray-400" />
                  {notifications > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                  )}
                </button>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <User className="text-blue-600 dark:text-blue-400" size={20} />
                </div>
                <div>
                  <p className="font-medium text-gray-800 dark:text-white">{userData.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{userData.role}</p>
                </div>
              </div>

              <button
                onClick={onLogout}
                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-white dark:bg-gray-800 rounded-lg p-1 mb-8 shadow-sm">
          <button
            onClick={() => setActiveTab('details')}
            className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition ${activeTab === 'details'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300'
              }`}
          >
            <User className="inline-block mr-2" size={16} />
            Faculty Details
          </button>
          <button
            onClick={() => setActiveTab('apply')}
            className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition ${activeTab === 'apply'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300'
              }`}
          >
            <FileText className="inline-block mr-2" size={16} />
            Apply Leave
          </button>
          <button
            onClick={() => setActiveTab('status')}
            className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition ${activeTab === 'status'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300'
              }`}
          >
            <CheckCircle className="inline-block mr-2" size={16} />
            Leave Status
          </button>
        </div>

        {/* Content Sections */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          {activeTab === 'details' && <FacultyDetails />}
          {activeTab === 'apply' && <LeaveApplication />}
          {activeTab === 'status' && <LeaveStatus />}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Leave Balance</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">24 Days</p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <CheckCircle className="text-green-600 dark:text-green-400" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Pending Approvals</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">3 Requests</p>
              </div>
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                <Clock className="text-yellow-600 dark:text-yellow-400" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Rejected Leaves</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">2 Requests</p>
              </div>
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <XCircle className="text-red-600 dark:text-red-400" size={24} />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;