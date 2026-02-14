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
  days: {
    type: Number,
    required: true
  },
  hodStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  principalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  hodRemarks: String,
  principalRemarks: String,
  appliedDate: {
    type: Date,
    default: Date.now
  },
  department: String
});

module.exports = mongoose.model('Leave', leaveSchema);