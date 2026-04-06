import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Users, Mail, Phone } from 'lucide-react';
import { API_BASE_URL } from '../utils/api';

const DepartmentFaculty = ({ hodDepartment }) => {

  const [facultyList, setFacultyList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFaculty();
  }, []);

  const fetchFaculty = async () => {
    try {
      const token = localStorage.getItem('token');

      const response = await axios.get(
        `${API_BASE_URL}/hod/department-faculty`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setFacultyList(response.data.faculty);
      }

    } catch (error) {
      console.error('Error fetching department faculty:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8 sm:py-10">
        <div className="animate-spin rounded-full h-8 sm:h-10 w-8 sm:w-10 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-3 text-sm sm:text-base text-gray-600 dark:text-gray-400">Loading faculty...</p>
      </div>
    );
  }

  if (facultyList.length === 0) {
    return (
      <div className="text-center py-8 sm:py-10">
        <Users className="mx-auto text-gray-400" size={32} />
        <p className="mt-3 text-sm sm:text-base text-gray-600 dark:text-gray-400">
          No faculty found in this department.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {facultyList.map((faculty) => (
        <div
          key={faculty._id}
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 sm:p-5"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
            <div className="w-full sm:w-auto">
              <h3 className="font-semibold text-base sm:text-lg text-gray-800 dark:text-white">
                {faculty.personalDetails?.name}
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                {faculty.personalDetails?.designation}
              </p>
              <div className="flex items-center mt-2 text-xs text-gray-500 dark:text-gray-400">
                <Mail size={12} className="mr-1 flex-shrink-0" />
                <span className="truncate max-w-[200px] sm:max-w-xs">{faculty.email}</span>
              </div>
              {faculty.personalDetails?.phone && (
                <div className="flex items-center mt-1 text-xs text-gray-500 dark:text-gray-400">
                  <Phone size={12} className="mr-1 flex-shrink-0" />
                  <span>{faculty.personalDetails.phone}</span>
                </div>
              )}
            </div>

            <span className="px-2 py-1 sm:px-3 sm:py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs rounded-full self-start sm:self-center">
              Active
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DepartmentFaculty;