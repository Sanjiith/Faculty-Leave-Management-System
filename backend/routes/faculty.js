const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Leave = require('../models/Leave');
const { protect, facultyOnly } = require('../middleware/auth');

// @route   GET /api/faculty/profile
router.get('/profile', protect, facultyOnly, async (req, res) => {
  try {
    const faculty = await User.findById(req.user._id).select('-password');
    
    res.json({
      success: true,
      faculty
    });
  } catch (error) {
    console.error('Error fetching faculty profile:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/faculty/leave/apply
router.post('/leave/apply', protect, facultyOnly, async (req, res) => {
  try {
    const {
      leaveType,
      fromDate,
      toDate,
      fromTime,
      toTime,
      reason,
      alternateFaculty
    } = req.body;

    // Calculate days
    const from = new Date(fromDate);
    const to = new Date(toDate);
    const diffTime = Math.abs(to - from);
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    // Check leave balance
    let leaveBalanceField = '';
    if (leaveType === 'Casual Leave') leaveBalanceField = 'casualLeave';
    else if (leaveType === 'Medical Leave') leaveBalanceField = 'medicalLeave';
    else if (leaveType === 'Earned Leave') leaveBalanceField = 'earnedLeave';

    if (leaveBalanceField && req.user.leaveBalance[leaveBalanceField] < days) {
      return res.status(400).json({
        success: false,
        message: `Insufficient ${leaveType} balance. Available: ${req.user.leaveBalance[leaveBalanceField]} days`
      });
    }

    // Create leave application
    const leave = new Leave({
      facultyId: req.user._id,
      faculty: req.user._id,
      leaveType,
      startDate: fromDate,
      endDate: toDate,
      fromTime,
      toTime,
      reason,
      alternateFaculty,
      days,
      department: req.user.personalDetails?.department,
      hodStatus: 'pending',
      principalStatus: 'pending',
      status: 'pending'
    });

    await leave.save();

    res.json({
      success: true,
      message: 'Leave application submitted successfully',
      leave
    });

  } catch (error) {
    console.error('Error applying for leave:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/faculty/leaves
router.get('/leaves', protect, facultyOnly, async (req, res) => {
  try {
    const leaves = await Leave.find({ facultyId: req.user._id })
      .sort({ appliedDate: -1 });

    res.json({
      success: true,
      leaves
    });
  } catch (error) {
    console.error('Error fetching leaves:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/faculty/leave-balance
router.get('/leave-balance', protect, facultyOnly, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    res.json({
      success: true,
      leaveBalance: user.leaveBalance
    });
  } catch (error) {
    console.error('Error fetching leave balance:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;