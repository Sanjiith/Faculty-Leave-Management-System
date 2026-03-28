const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Leave = require('../models/Leave');
const Notification = require('../models/Notification');
const { protect, facultyOnly } = require('../middleware/auth');

// @route   GET /api/faculty/profile
router.get('/profile', protect, facultyOnly, async (req, res) => {
  try {
    req.user.resetMonthlyPermissionLeaves();
    await req.user.save();
    const faculty = await User.findById(req.user._id).select('-password');
    res.json({ success: true, faculty });
  } catch (error) {
    console.error('Error fetching faculty profile:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/faculty/all-faculty
router.get('/all-faculty', protect, facultyOnly, async (req, res) => {
  try {
    const faculty = await User.find({ role: 'faculty', isActive: true })
      .select('personalDetails email _id');
    res.json({ success: true, faculty });
  } catch (error) {
    console.error('Error fetching faculty:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/faculty/leave/check-substitute
router.post('/leave/check-substitute', protect, facultyOnly, async (req, res) => {
  try {
    const { fromDate, toDate } = req.body;
    const department = req.user.personalDetails?.department;
    const from = new Date(fromDate);
    const to = new Date(toDate);
    let maxFacultyOnLeave = 0;

    for (let d = new Date(from); d <= to; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      const count = await Leave.countDocuments({
        department: department,
        status: 'approved',
        startDate: { $lte: dateStr },
        endDate: { $gte: dateStr }
      });
      if (count > maxFacultyOnLeave) maxFacultyOnLeave = count;
    }

    res.json({
      success: true,
      requiresSubstitute: maxFacultyOnLeave >= 3,
      facultyOnLeave: maxFacultyOnLeave,
      threshold: 3
    });
  } catch (error) {
    console.error('Error checking substitute:', error);
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
      document,
      substituteFacultyId,
      substituteFacultyName
    } = req.body;

    req.user.resetMonthlyPermissionLeaves();

    const from = new Date(fromDate);
    const to = toDate ? new Date(toDate) : from;
    const currentMonth = `${from.getFullYear()}-${from.getMonth() + 1}`;
    const diffTime = Math.abs(to - from);
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    let hours = 0;
    if (fromTime && toTime) {
      const fromTimeArr = fromTime.split(':');
      const toTimeArr = toTime.split(':');
      const fromMinutes = parseInt(fromTimeArr[0]) * 60 + parseInt(fromTimeArr[1]);
      const toMinutes = parseInt(toTimeArr[0]) * 60 + parseInt(toTimeArr[1]);
      hours = (toMinutes - fromMinutes) / 60;
      if (hours < 0) hours += 24;
    }

    // Check for time conflicts
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

    const month = from.getMonth() + 1;
    let requiresSubstitute = false;
    let facultyOnLeaveCount = 0;

    // Check if substitute is required (3+ faculty already on leave)
    if (leaveType !== 'Permission Leave') {
      for (let d = new Date(from); d <= to; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        const count = await Leave.countDocuments({
          department: req.user.personalDetails?.department,
          status: 'approved',
          startDate: { $lte: dateStr },
          endDate: { $gte: dateStr }
        });
        if (count >= 3) {
          requiresSubstitute = true;
          facultyOnLeaveCount = count;
        }
      }
    }

    if (requiresSubstitute && !substituteFacultyId) {
      return res.status(400).json({
        success: false,
        requiresSubstitute: true,
        facultyOnLeave: facultyOnLeaveCount,
        message: `${facultyOnLeaveCount} faculty already on leave. Please nominate a substitute faculty member.`
      });
    }

    // Get substitute faculty details if provided
    let substituteDetails = null;
    if (substituteFacultyId) {
      const substitute = await User.findById(substituteFacultyId);
      if (substitute) {
        substituteDetails = {
          id: substitute._id,
          name: substitute.personalDetails?.name,
          email: substitute.email,
          department: substitute.personalDetails?.department
        };
      }
    }

    // Validate leave type specific rules
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
        if (days > 182) {
          return res.status(400).json({
            success: false,
            message: 'Maternity leave cannot exceed 26 weeks (182 days)'
          });
        }
        break;

      case 'Winter Leave':
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
        const availablePermissionLeaves = 2 - (req.user.leaveBalance.permissionLeaves.used || 0);
        if (availablePermissionLeaves <= 0) {
          return res.status(400).json({
            success: false,
            message: 'You have already used your 2 permission leaves for this month'
          });
        }
        break;

      case 'Compensation Leave':
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
      status: 'pending',
      requiresSubstitute: requiresSubstitute,
      substituteFacultyId: substituteDetails?.id || null,
      substituteFacultyName: substituteDetails?.name || null,
      substituteFacultyEmail: substituteDetails?.email || null,
      substituteFacultyDepartment: substituteDetails?.department || null,
      substituteConfirmed: false,
      substituteNotificationSent: false
    });

    await leave.save();

    // Send notification to substitute if assigned
    if (requiresSubstitute && substituteDetails) {
      const notification = new Notification({
        userId: substituteDetails.id,
        type: 'substitute_request',
        title: 'Substitute Faculty Request',
        message: `${req.user.personalDetails?.name} from ${req.user.personalDetails?.department} has requested you to be their substitute during their leave from ${fromDate} to ${toDate}. Please respond to this request in your dashboard.`,
        relatedLeaveId: leave._id,
        relatedUserId: req.user._id
      });
      await notification.save();
    }

    // If it's permission leave, update the count
    if (leaveType === 'Permission Leave') {
      req.user.leaveBalance.permissionLeaves.used += 1;
      await req.user.save();
    }

    res.json({
      success: true,
      message: 'Leave application submitted successfully',
      leave,
      requiresSubstitute,
      substituteAssigned: !!substituteDetails
    });

  } catch (error) {
    console.error('Error applying for leave:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/faculty/leave/cancel/:id
router.put('/leave/cancel/:id', protect, facultyOnly, async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave not found' });
    }

    if (leave.facultyId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (leave.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel leave with status: ${leave.status}`
      });
    }

    const leaveType = leave.leaveType;
    const substituteId = leave.substituteFacultyId;
    const faculty = await User.findById(req.user._id);

    // Update leave status
    leave.status = 'cancelled';
    leave.hodStatus = 'cancelled';
    leave.principalStatus = 'cancelled';

    await leave.save();

    // If it was a permission leave, refund the used permission leave
    if (leaveType === 'Permission Leave' && faculty) {
      if (faculty.leaveBalance.permissionLeaves.used > 0) {
        faculty.leaveBalance.permissionLeaves.used = Math.max(0, faculty.leaveBalance.permissionLeaves.used - 1);
        await faculty.save();
      }
    }

    // If substitute was assigned, send notification that leave is cancelled
    if (substituteId) {
      const substituteNotification = new Notification({
        userId: substituteId,
        type: 'leave_rejected',
        title: 'Leave Cancelled',
        message: `The leave application from ${faculty?.personalDetails?.name || 'a faculty member'} that you were substitute for has been cancelled. You are no longer required to substitute.`,
        relatedLeaveId: leave._id,
        relatedUserId: faculty?._id
      });
      await substituteNotification.save();
    }

    // Delete any pending substitute request notifications related to this leave
    await Notification.deleteMany({
      relatedLeaveId: leave._id,
      type: 'substitute_request'
    });

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
    req.user.resetMonthlyPermissionLeaves();
    await req.user.save();

    const leaves = await Leave.find({ facultyId: req.user._id })
      .sort({ appliedDate: -1 });

    res.json({ success: true, leaves });
  } catch (error) {
    console.error('Error fetching leaves:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/faculty/leave-balance
router.get('/leave-balance', protect, facultyOnly, async (req, res) => {
  try {
    req.user.resetMonthlyPermissionLeaves();
    await req.user.save();

    const user = await User.findById(req.user._id);
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

// @route   GET /api/faculty/substitute-requests
router.get('/substitute-requests', protect, facultyOnly, async (req, res) => {
  try {
    const requests = await Leave.find({
      substituteFacultyId: req.user._id,
      substituteConfirmed: false,
      status: 'pending',
      hodStatus: 'pending'
    })
      .populate('faculty', 'personalDetails email')
      .sort({ appliedDate: -1 });

    res.json({
      success: true,
      requests
    });
  } catch (error) {
    console.error('Error fetching substitute requests:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/faculty/substitute-respond/:leaveId
router.put('/substitute-respond/:leaveId', protect, facultyOnly, async (req, res) => {
  try {
    const { accept } = req.body;
    const leave = await Leave.findById(req.params.leaveId).populate('faculty', 'personalDetails email');

    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave not found' });
    }

    if (leave.substituteFacultyId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (leave.substituteConfirmed) {
      return res.status(400).json({ success: false, message: 'You have already responded to this request' });
    }

    if (leave.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'This leave request is no longer pending' });
    }

    leave.substituteConfirmed = accept;
    leave.substituteResponseDate = new Date();
    await leave.save();

    const applicantNotification = new Notification({
      userId: leave.facultyId,
      type: accept ? 'substitute_confirm' : 'substitute_reject',
      title: accept ? 'Substitute Confirmed' : 'Substitute Declined',
      message: accept
        ? `${req.user.personalDetails?.name} has accepted to be your substitute during your leave from ${leave.startDate} to ${leave.endDate}.`
        : `${req.user.personalDetails?.name} has declined to be your substitute. Please nominate another faculty member.`,
      relatedLeaveId: leave._id,
      relatedUserId: req.user._id
    });
    await applicantNotification.save();

    const hod = await User.findOne({ role: 'hod', hodOf: leave.department });
    if (hod) {
      const hodNotification = new Notification({
        userId: hod._id,
        type: accept ? 'substitute_confirm' : 'substitute_reject',
        title: accept ? 'Substitute Confirmed' : 'Substitute Declined',
        message: accept
          ? `${req.user.personalDetails?.name} has accepted to be substitute for ${leave.faculty?.personalDetails?.name}'s leave.`
          : `${req.user.personalDetails?.name} has declined substitute request for ${leave.faculty?.personalDetails?.name}.`,
        relatedLeaveId: leave._id,
        relatedUserId: req.user._id
      });
      await hodNotification.save();
    }

    res.json({
      success: true,
      message: accept ? 'Substitute request accepted!' : 'Substitute request declined.',
      leave
    });

  } catch (error) {
    console.error('Error responding to substitute request:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/faculty/leave/add-substitute/:leaveId
router.put('/leave/add-substitute/:leaveId', protect, facultyOnly, async (req, res) => {
  try {
    const { substituteId, substituteName } = req.body;
    const leave = await Leave.findById(req.params.leaveId);

    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave not found' });
    }

    if (leave.facultyId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (leave.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Cannot add substitute to non-pending leave' });
    }

    const substitute = await User.findById(substituteId);

    if (!substitute) {
      return res.status(404).json({ success: false, message: 'Substitute faculty not found' });
    }

    leave.substituteFacultyId = substitute._id;
    leave.substituteFacultyName = substitute.personalDetails?.name;
    leave.substituteFacultyEmail = substitute.email;
    leave.substituteFacultyDepartment = substitute.personalDetails?.department;
    leave.requiresSubstitute = true;
    await leave.save();

    const notification = new Notification({
      userId: substitute._id,
      type: 'substitute_request',
      title: 'Substitute Faculty Request',
      message: `${req.user.personalDetails?.name} from ${req.user.personalDetails?.department} has nominated you as a substitute during their leave from ${leave.startDate} to ${leave.endDate}. Please respond in your Substitute Requests tab.`,
      relatedLeaveId: leave._id,
      relatedUserId: req.user._id
    });
    await notification.save();

    const hod = await User.findOne({ role: 'hod', hodOf: leave.department });
    if (hod) {
      const hodNotification = new Notification({
        userId: hod._id,
        type: 'substitute_request',
        title: 'Substitute Nominated',
        message: `${req.user.personalDetails?.name} has nominated ${substitute.personalDetails?.name} as substitute for their leave from ${leave.startDate} to ${leave.endDate}.`,
        relatedLeaveId: leave._id,
        relatedUserId: req.user._id
      });
      await hodNotification.save();
    }

    res.json({
      success: true,
      message: 'Substitute added successfully. The substitute will be notified.',
      leave
    });

  } catch (error) {
    console.error('Error adding substitute:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/faculty/pending-substitute-requests
router.get('/pending-substitute-requests', protect, facultyOnly, async (req, res) => {
  try {
    const pendingRequests = await Leave.find({
      facultyId: req.user._id,
      requiresSubstitute: true,
      substituteFacultyId: null,
      status: 'pending',
      hodStatus: 'pending'
    }).sort({ appliedDate: -1 });

    res.json({
      success: true,
      pendingRequests
    });
  } catch (error) {
    console.error('Error fetching pending substitute requests:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;