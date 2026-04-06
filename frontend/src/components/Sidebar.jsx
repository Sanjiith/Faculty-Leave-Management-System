import React, { useState, useEffect } from 'react';
import {
  User,
  FileText,
  CheckCircle,
  Clock,
  Users,
  Menu,
  X,
  LogOut,
  Moon,
  Sun,
  Calendar,
  UserPlus
} from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../utils/api';

const Sidebar = ({
  activeTab,
  onTabChange,
  onLogout,
  isDark,
  toggleDarkMode,
  userData,
  userType,
  hodStats
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [substituteRequestCount, setSubstituteRequestCount] = useState(0);

  // Fetch substitute request count for faculty
  useEffect(() => {
    if (userType === 'faculty') {
      fetchSubstituteRequestCount();
      // Refresh every 30 seconds
      const interval = setInterval(fetchSubstituteRequestCount, 30000);
      return () => clearInterval(interval);
    }
  }, [userType]);

  const fetchSubstituteRequestCount = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/faculty/substitute-requests`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setSubstituteRequestCount(response.data.requests.length);
      }
    } catch (error) {
      console.error('Error fetching substitute request count:', error);
    }
  };

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Define tabs based on user type
  const getTabs = () => {
    if (userType === 'hod') {
      return [
        {
          id: 'pending',
          label: 'Pending Approvals',
          icon: Clock,
          mobileLabel: 'Pending',
          badge: hodStats?.pendingLeaves || 0,
          badgeColor: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
        },
        {
          id: 'faculty',
          label: 'Department Faculty',
          icon: Users,
          mobileLabel: 'Faculty',
          badge: null
        },
        {
          id: 'history',
          label: 'Approval History',
          icon: FileText,
          mobileLabel: 'History',
          badge: null
        }
      ];
    } else {
      return [
        { id: 'details', label: 'Faculty Details', icon: User, mobileLabel: 'Details', badge: null },
        { id: 'apply', label: 'Apply Leave', icon: FileText, mobileLabel: 'Apply', badge: null },
        { id: 'status', label: 'Leave Status', icon: CheckCircle, mobileLabel: 'Status', badge: null },
        { 
          id: 'substitute', 
          label: 'Substitute Requests', 
          icon: UserPlus, 
          mobileLabel: 'Requests',
          badge: substituteRequestCount,
          badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
        }
      ];
    }
  };

  const tabs = getTabs();

  const handleTabClick = (tabId) => {
    onTabChange(tabId);
    setIsMobileMenuOpen(false);
    // If clicking on substitute tab, refresh count
    if (tabId === 'substitute') {
      fetchSubstituteRequestCount();
    }
  };

  const getDashboardTitle = () => {
    return userType === 'hod' ? 'HOD Portal' : 'Faculty Portal';
  };

  const getDashboardSubtitle = () => {
    if (userType === 'hod') {
      return userData?.hodOf || 'Department';
    }
    return 'Leave Management';
  };

  return (
    <>
      {/* Mobile Header with Menu Button */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-30 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition text-gray-700 dark:text-gray-200"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <div className="flex items-center space-x-2">
              <div className="bg-blue-100 dark:bg-blue-900 p-1.5 rounded-lg">
                <Calendar className="text-blue-600 dark:text-blue-400" size={20} />
              </div>
              <div>
                <span className="font-semibold text-gray-800 dark:text-white">{getDashboardTitle()}</span>
                <p className="text-xs text-gray-600 dark:text-gray-400 truncate max-w-[150px]">
                  {getDashboardSubtitle()}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              aria-label="Toggle dark mode"
            >
              {isDark ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-gray-700 dark:text-gray-200" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Desktop & Mobile */}
      <aside
        className={`
          fixed top-0 left-0 h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700
          transition-all duration-300 ease-in-out z-50
          ${isCollapsed ? 'w-20' : userType === 'hod' ? 'w-72' : 'w-64'}
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg flex-shrink-0">
              <Calendar className="text-blue-600 dark:text-blue-400" size={24} />
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <h2 className="font-bold text-gray-800 dark:text-white truncate">{getDashboardTitle()}</h2>
                <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{getDashboardSubtitle()}</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Toggle Button */}
        <div className="hidden lg:flex p-3 border-b border-gray-200 dark:border-gray-700 justify-center">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`
              flex items-center rounded-lg px-3 py-2.5 transition-all font-medium text-sm
              bg-gray-100 hover:bg-gray-200 text-gray-700
              dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200
              ${isCollapsed ? 'justify-center w-10 h-10 p-0' : 'w-full space-x-2'}
            `}
            aria-label="Toggle sidebar"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <Menu size={18} />
            {!isCollapsed && <span>Collapse Sidebar</span>}
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-300px)]">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`
                  w-full flex items-center px-3 py-2.5 sm:py-3 rounded-lg transition-all relative
                  ${isCollapsed ? 'justify-center' : 'space-x-3'}
                  ${isActive
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }
                `}
                title={isCollapsed ? tab.label : ''}
              >
                <Icon size={20} className={isActive ? 'text-blue-600 dark:text-blue-400' : ''} />
                {!isCollapsed && (
                  <>
                    <span className="text-sm font-medium flex-1 text-left hidden sm:block">
                      {tab.label}
                    </span>
                    <span className="text-sm font-medium flex-1 text-left sm:hidden">
                      {tab.mobileLabel}
                    </span>
                    {tab.badge !== null && tab.badge > 0 && (
                      <span className={`px-2 py-0.5 text-xs rounded-full ${tab.badgeColor || 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}>
                        {tab.badge}
                      </span>
                    )}
                  </>
                )}
                {isCollapsed && tab.badge !== null && tab.badge > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-blue-500 text-white text-[10px] flex items-center justify-center rounded-full px-1">
                    {tab.badge > 9 ? '9+' : tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          {/* Logout Button */}
          <button
            onClick={onLogout}
            className={`
              w-full flex items-center px-3 py-2.5 rounded-lg transition-all
              bg-red-50 hover:bg-red-100 text-red-600
              dark:bg-red-900/20 dark:hover:bg-red-900/40 dark:text-red-400
              ${isCollapsed ? 'justify-center' : ''}
            `}
          >
            <div className={`flex items-center ${isCollapsed ? 'justify-center w-full' : 'space-x-3'}`}>
              <LogOut size={20} />
              {!isCollapsed && <span className="text-sm font-medium">Logout</span>}
            </div>
          </button>
        </div>
      </aside>

      {/* Main Content Spacing for Sidebar */}
      <div className={`transition-all duration-300 ${isCollapsed ? 'lg:ml-20' : userType === 'hod' ? 'lg:ml-72' : 'lg:ml-64'} ml-0`} />
    </>
  );
};

export default Sidebar;