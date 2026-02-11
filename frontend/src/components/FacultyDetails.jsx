import React from 'react';
import { User, Briefcase, Calendar, Award, MapPin } from 'lucide-react';

const FacultyDetails = () => {
  const facultyDetails = {
    staffId: "CS-2022-045",
    name: "Dr. Sarah Johnson",
    department: "Computer Science & Engineering",
    designation: "Associate Professor",
    dateOfJoining: "15-06-2018",
    experience: "6 years, 3 months",
    email: "sarah.johnson@college.edu",
    phone: "+1 (555) 123-4567",
    officeRoom: "CS-302",
    qualifications: ["Ph.D. in Computer Science", "M.Tech in Software Engineering"],
    researchAreas: ["Machine Learning", "Data Science", "Cloud Computing"],
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Faculty Details</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column - Personal Info */}
        <div className="space-y-6">
          <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 rounded-full flex items-center justify-center">
                <User className="text-blue-600 dark:text-blue-400" size={32} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">{facultyDetails.name}</h3>
                <p className="text-blue-600 dark:text-blue-400 font-medium">{facultyDetails.designation}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Staff ID: {facultyDetails.staffId}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Briefcase className="text-gray-500 dark:text-gray-400" size={18} />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Department</p>
                  <p className="font-medium text-gray-800 dark:text-white">{facultyDetails.department}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Calendar className="text-gray-500 dark:text-gray-400" size={18} />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Date of Joining</p>
                  <p className="font-medium text-gray-800 dark:text-white">{facultyDetails.dateOfJoining}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Award className="text-gray-500 dark:text-gray-400" size={18} />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Experience</p>
                  <p className="font-medium text-gray-800 dark:text-white">{facultyDetails.experience}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <MapPin className="text-gray-500 dark:text-gray-400" size={18} />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Office Room</p>
                  <p className="font-medium text-gray-800 dark:text-white">{facultyDetails.officeRoom}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6">
            <h4 className="font-bold text-gray-800 dark:text-white mb-4">Contact Information</h4>
            <div className="space-y-3">
              <p className="text-sm text-gray-600 dark:text-gray-400">Email: {facultyDetails.email}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Phone: {facultyDetails.phone}</p>
            </div>
          </div>
        </div>

        {/* Right Column - Qualifications & Research */}
        <div className="space-y-6">
          <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6">
            <h4 className="font-bold text-gray-800 dark:text-white mb-4">Qualifications</h4>
            <ul className="space-y-2">
              {facultyDetails.qualifications.map((qual, index) => (
                <li key={index} className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-700 dark:text-gray-300">{qual}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6">
            <h4 className="font-bold text-gray-800 dark:text-white mb-4">Research Areas</h4>
            <div className="flex flex-wrap gap-2">
              {facultyDetails.researchAreas.map((area, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-sm"
                >
                  {area}
                </span>
              ))}
            </div>
          </div>

          {/* Leave Balance Summary */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-100 dark:border-blue-800">
            <h4 className="font-bold text-gray-800 dark:text-white mb-4">Leave Balance Summary</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Casual Leave</span>
                <span className="font-bold text-gray-800 dark:text-white">12 Days</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Medical Leave</span>
                <span className="font-bold text-gray-800 dark:text-white">15 Days</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Earned Leave</span>
                <span className="font-bold text-gray-800 dark:text-white">30 Days</span>
              </div>
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center">
                  <span className="text-gray-800 dark:text-white font-bold">Total Available</span>
                  <span className="text-xl font-bold text-blue-600 dark:text-blue-400">57 Days</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacultyDetails;