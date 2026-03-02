import React from 'react';
import { User, Briefcase, Calendar, Award, MapPin, Mail, Phone } from 'lucide-react';

const FacultyDetails = ({ facultyData }) => {
  // Use props if provided, otherwise use default data
  const details = facultyData?.personalDetails || facultyData || {
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

  const leaveBalance = facultyData?.leaveBalance || {
    casualLeave: 12,
    medicalLeave: 15,
    summerLeave: 3,
    winterLeave: 3,
    permissionLeaves: {
      total: 2,
      used: 0,
      available: 2
    }
  };

  const availablePermissionLeaves = leaveBalance.permissionLeaves?.available || 
    (2 - (leaveBalance.permissionLeaves?.used || 0));

  return (
    <div className="w-full">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white mb-4 sm:mb-6">Faculty Details</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* Left Column - Personal Info */}
        <div className="space-y-4 sm:space-y-6">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-4 sm:p-6 shadow-sm">
            <div className="flex flex-col xs:flex-row items-center xs:items-start space-y-3 xs:space-y-0 xs:space-x-4 mb-4 sm:mb-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="text-blue-600 dark:text-blue-400" size={24} />
              </div>
              <div className="text-center xs:text-left">
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white break-words">{details.name}</h3>
                <p className="text-sm sm:text-base text-blue-600 dark:text-blue-400 font-medium">{details.designation}</p>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Staff ID: {details.staffId || facultyData?.staffId}</p>
              </div>
            </div>

            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-start space-x-3">
                <Briefcase className="text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0" size={18} />
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Department</p>
                  <p className="text-sm sm:text-base font-medium text-gray-800 dark:text-white break-words">{details.department}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Calendar className="text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0" size={18} />
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Date of Joining</p>
                  <p className="text-sm sm:text-base font-medium text-gray-800 dark:text-white">{details.dateOfJoining}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Award className="text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0" size={18} />
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Experience</p>
                  <p className="text-sm sm:text-base font-medium text-gray-800 dark:text-white">{details.experience}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <MapPin className="text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0" size={18} />
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Office Room</p>
                  <p className="text-sm sm:text-base font-medium text-gray-800 dark:text-white">{details.officeRoom}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white dark:bg-gray-900 rounded-xl p-4 sm:p-6 shadow-sm">
            <h4 className="font-bold text-gray-800 dark:text-white mb-3 sm:mb-4">Contact Information</h4>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <Mail className="text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0" size={18} />
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 break-all">{details.email || facultyData?.email}</p>
              </div>
              <div className="flex items-start space-x-3">
                <Phone className="text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0" size={18} />
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{details.phone}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Qualifications & Research */}
        <div className="space-y-4 sm:space-y-6">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-4 sm:p-6 shadow-sm">
            <h4 className="font-bold text-gray-800 dark:text-white mb-3 sm:mb-4">Qualifications</h4>
            <ul className="space-y-2">
              {details.qualifications?.map((qual, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 break-words">{qual}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl p-4 sm:p-6 shadow-sm">
            <h4 className="font-bold text-gray-800 dark:text-white mb-3 sm:mb-4">Research Areas</h4>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {details.researchAreas?.map((area, index) => (
                <span
                  key={index}
                  className="px-2 py-0.5 sm:px-3 sm:py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-xs"
                >
                  {area}
                </span>
              ))}
            </div>
          </div>

          {/* Leave Balance Summary */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4 sm:p-6 border border-blue-100 dark:border-blue-800">
            <h4 className="font-bold text-gray-800 dark:text-white mb-3 sm:mb-4">Leave Balance Summary</h4>
            <div className="space-y-2 sm:space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Casual Leave (Yearly)</span>
                <span className="text-sm sm:text-base font-bold text-gray-800 dark:text-white">{leaveBalance.casualLeave} Days</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Medical Leave (Yearly)</span>
                <span className="text-sm sm:text-base font-bold text-gray-800 dark:text-white">{leaveBalance.medicalLeave} Days</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Summer Leave (Yearly)</span>
                <span className="text-sm sm:text-base font-bold text-gray-800 dark:text-white">{leaveBalance.summerLeave || 3} Days</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Winter Leave (Yearly)</span>
                <span className="text-sm sm:text-base font-bold text-gray-800 dark:text-white">{leaveBalance.winterLeave || 3} Days</span>
              </div>
              <div className="flex justify-between items-center border-t border-gray-200 dark:border-gray-700 pt-2 sm:pt-3 mt-1 sm:mt-2">
                <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Permission Leave (Monthly)</span>
                <span className="text-sm sm:text-base font-bold text-gray-800 dark:text-white">
                  {availablePermissionLeaves} / 2 Leaves
                </span>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 sm:mt-2">
                *Permission leaves are half-day leaves (max 4 hours)
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacultyDetails;