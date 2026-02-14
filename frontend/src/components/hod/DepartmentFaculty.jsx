import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Users } from 'lucide-react';

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
        'http://localhost:5000/api/hod/department-faculty',
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
      <div className="text-center py-10">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-3 text-gray-600 dark:text-gray-400">Loading faculty...</p>
      </div>
    );
  }

  if (facultyList.length === 0) {
    return (
      <div className="text-center py-10">
        <Users className="mx-auto text-gray-400" size={40} />
        <p className="mt-3 text-gray-600 dark:text-gray-400">
          No faculty found in this department.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {facultyList.map((faculty) => (
        <div
          key={faculty._id}
          className="border border-gray-200 dark:border-gray-700 rounded-lg p-5 flex justify-between items-center"
        >
          <div>
            <h3 className="font-semibold text-gray-800 dark:text-white">
              {faculty.personalDetails?.name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {faculty.personalDetails?.designation}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {faculty.email}
            </p>
          </div>

          <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs rounded-full">
            Active
          </span>
        </div>
      ))}
    </div>
  );
};

export default DepartmentFaculty;
