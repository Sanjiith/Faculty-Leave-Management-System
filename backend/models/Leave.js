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
  // For compensation leave
  nightSkillDays: {
    type: Number,
    default: 0
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
      // Academic year runs from April to March
      if (month >= 3) { // April to December
        return `${year}-${year + 1}`;
      } else { // January to March
        return `${year - 1}-${year}`;
      }
    }
  }
});

module.exports = mongoose.model('Leave', leaveSchema);