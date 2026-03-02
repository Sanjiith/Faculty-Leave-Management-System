const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Leave = require('../models/Leave');
const { protect, facultyOnly } = require('../middleware/auth');

// @route   GET /api/faculty/profile
router.get('/profile', protect, facultyOnly, async (req, res) => {
  try {
    // Reset monthly permission leaves if needed
    req.user.resetMonthlyPermissionLeaves();
    await req.user.save();
    
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
      alternateFaculty,
      nightSkillDays,
      document
    } = req.body;

    // Reset monthly permission leaves if needed
    req.user.resetMonthlyPermissionLeaves();

    const from = new Date(fromDate);
    const to = toDate ? new Date(toDate) : from;
    const currentMonth = `${from.getFullYear()}-${from.getMonth() + 1}`;
    
    // Calculate days
    const diffTime = Math.abs(to - from);
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    
    // Calculate hours for permission leave and regular leave
    let hours = 0;
    if (fromTime && toTime) {
      const fromTimeArr = fromTime.split(':');
      const toTimeArr = toTime.split(':');
      const fromMinutes = parseInt(fromTimeArr[0]) * 60 + parseInt(fromTimeArr[1]);
      const toMinutes = parseInt(toTimeArr[0]) * 60 + parseInt(toTimeArr[1]);
      hours = (toMinutes - fromMinutes) / 60;
      if (hours < 0) hours += 24;
    }

    // Check for time conflicts (for same day leaves)
    if (fromDate === toDate && fromTime && toTime) {
      const existingLeaves = await Leave.find({
        facultyId: req.user._id,
        startDate: fromDate,
        status: { $in: ['pending', 'approved'] }
      });

      for (const existing of existingLeaves) {
        if (existing.fromTime && existing.toTime) {
          const existingStart = existing.fromTime;
          const existingEnd = existing.toTime;
          
          // Check if new leave time overlaps with existing leave
          if (
            (fromTime >= existingStart && fromTime < existingEnd) ||
            (toTime > existingStart && toTime <= existingEnd) ||
            (fromTime <= existingStart && toTime >= existingEnd)
          ) {
            return res.status(400).json({
              success: false,
              message: `You already have a ${existing.leaveType} from ${existingStart} to ${existingEnd} on this date. Cannot apply for overlapping time.`
            });
          }
        }
      }
    }

    // Validate based on leave type
    const month = from.getMonth() + 1; // 1-12

    // Validation rules
    switch (leaveType) {
      case 'Casual Leave':
      case 'Medical Leave':
      case 'Maternity Leave':
      case 'Winter Leave':
      case 'Summer Leave':
      case 'Compensation Leave':
        // Check minimum 8 hours for full day leaves
        if (fromDate === toDate && hours < 8 && hours > 0) {
          return res.status(400).json({
            success: false,
            message: 'Minimum 8 hours required for full day leave. For shorter duration, please apply for Permission Leave.'
          });
        }
        break;
    }

    switch (leaveType) {
      case 'Casual Leave':
        if (req.user.leaveBalance.casualLeave < days) {
          return res.status(400).json({
            success: false,
            message: `Insufficient Casual Leave balance. Available: ${req.user.leaveBalance.casualLeave} days`
          });
        }
        break;

      case 'Medical Leave':
        if (req.user.leaveBalance.medicalLeave < days) {
          return res.status(400).json({
            success: false,
            message: `Insufficient Medical Leave balance. Available: ${req.user.leaveBalance.medicalLeave} days`
          });
        }
        // Check if document is provided
        if (!document && !req.files) {
          return res.status(400).json({
            success: false,
            message: 'Medical certificate is required for Medical Leave'
          });
        }
        break;

      case 'Maternity Leave':
        if (req.user.personalDetails?.gender !== 'female') {
          return res.status(400).json({
            success: false,
            message: 'Maternity leave is only applicable for female faculty'
          });
        }
        if (days > 182) { // 26 weeks = 182 days
          return res.status(400).json({
            success: false,
            message: 'Maternity leave cannot exceed 26 weeks (182 days)'
          });
        }
        break;

      case 'Winter Leave':
        // Winter months: November (11), December (12), January (1)
        if (![11, 12, 1].includes(month)) {
          return res.status(400).json({
            success: false,
            message: 'Winter Leave can only be applied during winter months (Nov, Dec, Jan)'
          });
        }
        if (req.user.leaveBalance.winterLeave < days) {
          return res.status(400).json({
            success: false,
            message: `Insufficient Winter Leave balance. Available: ${req.user.leaveBalance.winterLeave} days`
          });
        }
        break;

      case 'Summer Leave':
        // Summer months: April (4), May (5), June (6)
        if (![4, 5, 6].includes(month)) {
          return res.status(400).json({
            success: false,
            message: 'Summer Leave can only be applied during summer months (Apr, May, Jun)'
          });
        }
        if (req.user.leaveBalance.summerLeave < days) {
          return res.status(400).json({
            success: false,
            message: `Insufficient Summer Leave balance. Available: ${req.user.leaveBalance.summerLeave} days`
          });
        }
        break;

      case 'Permission Leave':
        // Check if it's half day or less (max 4 hours)
        if (hours > 4) {
          return res.status(400).json({
            success: false,
            message: 'Permission Leave cannot exceed 4 hours (half day)'
          });
        }
        if (hours < 1) {
          return res.status(400).json({
            success: false,
            message: 'Permission Leave must be at least 1 hour'
          });
        }
        
        // Check monthly limit (2 per month)
        const availablePermissionLeaves = 2 - (req.user.leaveBalance.permissionLeaves.used || 0);
        if (availablePermissionLeaves <= 0) {
          return res.status(400).json({
            success: false,
            message: 'You have already used your 2 permission leaves for this month'
          });
        }
        break;

      case 'Compensation Leave':
        // Calculate compensation based on night skill days
        if (!nightSkillDays || nightSkillDays < 3) {
          return res.status(400).json({
            success: false,
            message: 'Minimum 3 night skill days required for 1 compensation leave'
          });
        }
        
        const compensationDays = Math.floor(nightSkillDays / 3);
        if (compensationDays < days) {
          return res.status(400).json({
            success: false,
            message: `You are eligible for only ${compensationDays} compensation day(s) based on ${nightSkillDays} night skill days`
          });
        }
        break;

      default:
        break;
    }

    // Create leave application
    const leave = new Leave({
      facultyId: req.user._id,
      faculty: req.user._id,
      leaveType,
      startDate: fromDate,
      endDate: toDate || fromDate,
      fromTime,
      toTime,
      reason,
      alternateFaculty,
      days,
      hours,
      nightSkillDays: leaveType === 'Compensation Leave' ? nightSkillDays : 0,
      documentRequired: leaveType === 'Medical Leave',
      department: req.user.personalDetails?.department,
      hodStatus: 'pending',
      principalStatus: 'pending',
      status: 'pending'
    });

    await leave.save();

    // If it's permission leave, update the count
    if (leaveType === 'Permission Leave') {
      req.user.leaveBalance.permissionLeaves.used += 1;
      await req.user.save();
    }

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

// @route   PUT /api/faculty/leave/cancel/:id
// @desc    Cancel a pending leave application
router.put('/leave/cancel/:id', protect, facultyOnly, async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);
    
    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave not found' });
    }

    // Check if leave belongs to this faculty
    if (leave.facultyId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Check if leave is still pending
    if (leave.status !== 'pending') {
      return res.status(400).json({ 
        success: false, 
        message: `Cannot cancel leave with status: ${leave.status}` 
      });
    }

    // Update leave status to cancelled
    leave.status = 'cancelled';
    leave.hodStatus = 'cancelled';
    leave.principalStatus = 'cancelled';
    
    await leave.save();

    // If it was a permission leave, revert the used count
    if (leave.leaveType === 'Permission Leave') {
      const faculty = await User.findById(req.user._id);
      if (faculty.leaveBalance.permissionLeaves.used > 0) {
        faculty.leaveBalance.permissionLeaves.used -= 1;
        await faculty.save();
      }
    }

    res.json({
      success: true,
      message: 'Leave application cancelled successfully',
      leave
    });

  } catch (error) {
    console.error('Error cancelling leave:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/faculty/leaves
router.get('/leaves', protect, facultyOnly, async (req, res) => {
  try {
    // Reset monthly permission leaves if needed
    req.user.resetMonthlyPermissionLeaves();
    await req.user.save();

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
    // Reset monthly permission leaves if needed
    req.user.resetMonthlyPermissionLeaves();
    await req.user.save();

    const user = await User.findById(req.user._id);
    
    // Calculate available permission leaves for current month
    const availablePermissionLeaves = 2 - (user.leaveBalance.permissionLeaves.used || 0);

    res.json({
      success: true,
      leaveBalance: {
        casualLeave: user.leaveBalance.casualLeave,
        medicalLeave: user.leaveBalance.medicalLeave,
        summerLeave: user.leaveBalance.summerLeave,
        winterLeave: user.leaveBalance.winterLeave,
        permissionLeaves: {
          total: 2,
          used: user.leaveBalance.permissionLeaves.used || 0,
          available: availablePermissionLeaves,
          month: user.leaveBalance.permissionLeaves.month
        }
      }
    });
  } catch (error) {
    console.error('Error fetching leave balance:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/faculty/compensation/calculate
router.post('/compensation/calculate', protect, facultyOnly, async (req, res) => {
  try {
    const { nightSkillDays } = req.body;
    
    if (!nightSkillDays || nightSkillDays < 3) {
      return res.json({
        success: true,
        eligibleDays: 0,
        message: 'Minimum 3 days required for 1 compensation leave'
      });
    }

    const eligibleDays = Math.floor(nightSkillDays / 3);
    
    res.json({
      success: true,
      eligibleDays,
      message: `You are eligible for ${eligibleDays} compensation leave day(s)`
    });
  } catch (error) {
    console.error('Error calculating compensation:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;