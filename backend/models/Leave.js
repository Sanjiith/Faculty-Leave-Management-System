const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({
  facultyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  faculty: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  leaveType: {
    type: String,
    enum: ['Casual Leave', 'Medical Leave', 'Maternity Leave', 'Winter Leave', 'Summer Leave', 'Permission Leave', 'Compensation Leave'],
    required: true
  },
  startDate: {
    type: String,
    required: true
  },
  endDate: {
    type: String,
    required: true
  },
  fromTime: String,
  toTime: String,
  reason: {
    type: String,
    required: true
  },
  alternateFaculty: String,
  documentName: String,
  documentPath: String,
  documentRequired: {
    type: Boolean,
    default: false
  },
  days: {
    type: Number,
    required: true
  },
  hours: {
    type: Number,
    default: 0
  },
  nightSkillDays: {
    type: Number,
    default: 0
  },
  // Substitute Faculty Fields
  requiresSubstitute: {
    type: Boolean,
    default: false
  },
  substituteFacultyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  substituteFacultyName: {
    type: String,
    default: null
  },
  substituteFacultyEmail: {
    type: String,
    default: null
  },
  substituteFacultyDepartment: {
    type: String,
    default: null
  },
  substituteConfirmed: {
    type: Boolean,
    default: false
  },
  substituteNotificationSent: {
    type: Boolean,
    default: false
  },
  substituteResponseDate: {
    type: Date,
    default: null
  },
  hodStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'cancelled'],
    default: 'pending'
  },
  principalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'cancelled'],
    default: 'pending'
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'cancelled'],
    default: 'pending'
  },
  hodRemarks: String,
  principalRemarks: String,
  appliedDate: {
    type: Date,
    default: Date.now
  },
  department: String,
  academicYear: {
    type: String,
    default: function() {
      const date = new Date();
      const year = date.getFullYear();
      const month = date.getMonth();
      if (month >= 3) {
        return `${year}-${year + 1}`;
      } else {
        return `${year - 1}-${year}`;
      }
    }
  }
});

module.exports = mongoose.model('Leave', leaveSchema);