const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Leave = require('../models/Leave');
const Notification = require('../models/Notification');
const { protect, hodOnly } = require('../middleware/auth');

// @route   GET /api/hod/profile
router.get('/profile', protect, hodOnly, async (req, res) => {
  try {
    const hod = await User.findById(req.user._id).select('-password');
    
    const pendingLeaves = await Leave.countDocuments({
      department: hod.hodOf,
      hodStatus: 'pending'
    });

    const totalFaculty = await User.countDocuments({
      role: 'faculty',
      'personalDetails.department': hod.hodOf
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const facultyOnLeaveToday = await Leave.countDocuments({
      department: hod.hodOf,
      status: 'approved',
      startDate: { $lte: today.toISOString().split('T')[0] },
      endDate: { $gte: today.toISOString().split('T')[0] }
    });

    const approvedLeaves = await Leave.countDocuments({
      department: hod.hodOf,
      hodStatus: 'approved',
      appliedDate: { $gte: new Date(new Date().setHours(0,0,0,0)) }
    });

    const rejectedLeaves = await Leave.countDocuments({
      department: hod.hodOf,
      hodStatus: 'rejected'
    });

    res.json({
      success: true,
      hod,
      statistics: {
        pendingLeaves,
        totalFaculty,
        approvedLeaves,
        rejectedLeaves,
        approvedToday: approvedLeaves,
        facultyOnLeaveToday
      }
    });
  } catch (error) {
    console.error('Error fetching HOD profile:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/hod/pending-leaves
router.get('/pending-leaves', protect, hodOnly, async (req, res) => {
  try {
    const leaves = await Leave.find({
      department: req.user.hodOf,
      hodStatus: 'pending'
    }).populate('faculty', 'personalDetails email');

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const facultyOnLeaveToday = await Leave.countDocuments({
      department: req.user.hodOf,
      status: 'approved',
      startDate: { $lte: today.toISOString().split('T')[0] },
      endDate: { $gte: today.toISOString().split('T')[0] }
    });

    res.json({
      success: true,
      leaves,
      workload: {
        facultyOnLeaveToday,
        maxAllowed: 3
      }
    });
  } catch (error) {
    console.error('Error fetching pending leaves:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/hod/approve-leave/:id
router.put('/approve-leave/:id', protect, hodOnly, async (req, res) => {
  try {
    const { status } = req.body;
    const leave = await Leave.findById(req.params.id);
    
    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave not found' });
    }

    if (leave.department !== req.user.hodOf) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Check substitute requirement at approval time
    if (status === 'approved' && leave.leaveType !== 'Permission Leave') {
      const from = new Date(leave.startDate);
      const to = new Date(leave.endDate);
      let maxFacultyOnLeave = 0;
      let requiresSubstitute = false;
      
      for (let d = new Date(from); d <= to; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        
        const count = await Leave.countDocuments({
          department: req.user.hodOf,
          status: 'approved',
          startDate: { $lte: dateStr },
          endDate: { $gte: dateStr }
        });
        
        const totalWithThisLeave = count + 1;
        if (totalWithThisLeave > maxFacultyOnLeave) maxFacultyOnLeave = totalWithThisLeave;
        
        if (totalWithThisLeave >= 4) {
          requiresSubstitute = true;
        }
      }
      
      if (requiresSubstitute && !leave.substituteConfirmed) {
        if (leave.substituteFacultyId) {
          return res.status(400).json({
            success: false,
            requiresSubstitute: true,
            message: `This leave would make ${maxFacultyOnLeave} faculty on leave. Please wait for substitute confirmation before approving.`,
            waitingForSubstitute: true,
            leaveId: leave._id
          });
        } else {
          return res.status(400).json({
            success: false,
            requiresSubstitute: true,
            message: `${maxFacultyOnLeave} faculty would be on leave. A request has been sent to the faculty to nominate a substitute.`,
            leaveId: leave._id,
            facultyId: leave.facultyId
          });
        }
      }
    }

    // Check if substitute is already required and not confirmed
    if (status === 'approved' && leave.requiresSubstitute && !leave.substituteConfirmed) {
      return res.status(400).json({
        success: false,
        requiresSubstitute: true,
        message: 'Substitute faculty confirmation is required before approving this leave.',
        waitingForSubstitute: true,
        leaveId: leave._id
      });
    }

    leave.hodStatus = status;
    
    if (status === 'approved') {
      leave.status = 'approved';
      leave.principalStatus = 'pending';
      
      const applicantNotification = new Notification({
        userId: leave.facultyId,
        type: 'leave_approved',
        title: 'Leave Application Approved',
        message: `Your ${leave.leaveType} application from ${leave.startDate} to ${leave.endDate} has been approved by HOD.`,
        relatedLeaveId: leave._id
      });
      await applicantNotification.save();
      
    } else if (status === 'rejected') {
      leave.status = 'rejected';
      leave.principalStatus = 'rejected';
      
      const applicantNotification = new Notification({
        userId: leave.facultyId,
        type: 'leave_rejected',
        title: 'Leave Application Rejected',
        message: `Your ${leave.leaveType} application from ${leave.startDate} to ${leave.endDate} has been rejected by HOD.`,
        relatedLeaveId: leave._id
      });
      await applicantNotification.save();
    }

    await leave.save();

    if (status === 'approved') {
      const faculty = await User.findById(leave.facultyId);
      
      switch (leave.leaveType) {
        case 'Casual Leave':
          faculty.leaveBalance.casualLeave -= leave.days;
          break;
        case 'Medical Leave':
          faculty.leaveBalance.medicalLeave -= leave.days;
          break;
        case 'Summer Leave':
          faculty.leaveBalance.summerLeave -= leave.days;
          break;
        case 'Winter Leave':
          faculty.leaveBalance.winterLeave -= leave.days;
          break;
      }
      await faculty.save();
    }

    const updatedLeave = await Leave.findById(leave._id).populate('faculty', 'personalDetails email');

    res.json({
      success: true,
      message: `Leave ${status} successfully`,
      leave: updatedLeave
    });

  } catch (error) {
    console.error('Error approving leave:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/hod/request-substitute/:leaveId
router.put('/request-substitute/:leaveId', protect, hodOnly, async (req, res) => {
  try {
    const { facultyId } = req.body;
    const leave = await Leave.findById(req.params.leaveId);
    
    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave not found' });
    }

    if (leave.department !== req.user.hodOf) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Mark that substitute is required for this leave
    leave.requiresSubstitute = true;
    await leave.save();

    // Send notification to faculty to nominate substitute
    const facultyNotification = new Notification({
      userId: facultyId,
      type: 'substitute_request',
      title: 'Substitute Faculty Required',
      message: `Your leave from ${leave.startDate} to ${leave.endDate} requires a substitute faculty because 3 faculty members are already on leave. Please nominate a substitute in your Leave Status section.`,
      relatedLeaveId: leave._id
    });
    await facultyNotification.save();

    res.json({
      success: true,
      message: 'Substitute request sent to faculty',
      leave
    });

  } catch (error) {
    console.error('Error requesting substitute:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/hod/confirm-substitute/:leaveId
router.put('/confirm-substitute/:leaveId', protect, hodOnly, async (req, res) => {
  try {
    const { confirmed } = req.body;
    const leave = await Leave.findById(req.params.leaveId);
    
    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave not found' });
    }

    if (leave.department !== req.user.hodOf) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    leave.substituteConfirmed = confirmed;
    leave.substituteResponseDate = new Date();
    
    if (confirmed) {
      if (leave.substituteFacultyId) {
        const substituteNotification = new Notification({
          userId: leave.substituteFacultyId,
          type: 'substitute_confirm',
          title: 'Substitute Confirmation',
          message: `You have been confirmed as the substitute faculty for ${leave.faculty?.personalDetails?.name} during their leave from ${leave.startDate} to ${leave.endDate}. Please coordinate with the HOD.`,
          relatedLeaveId: leave._id,
          relatedUserId: leave.facultyId
        });
        await substituteNotification.save();
      }
      
      const applicantNotification = new Notification({
        userId: leave.facultyId,
        type: 'substitute_assigned',
        title: 'Substitute Confirmed',
        message: `Your substitute faculty (${leave.substituteFacultyName}) has been confirmed by HOD.`,
        relatedLeaveId: leave._id
      });
      await applicantNotification.save();
    }
    
    await leave.save();

    res.json({
      success: true,
      message: confirmed ? 'Substitute confirmed successfully' : 'Substitute rejected',
      leave
    });

  } catch (error) {
    console.error('Error confirming substitute:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/hod/department-faculty
router.get('/department-faculty', protect, hodOnly, async (req, res) => {
  try {
    const faculty = await User.find({
      role: 'faculty',
      'personalDetails.department': req.user.hodOf
    }).select('-password');

    res.json({ success: true, faculty });
  } catch (error) {
    console.error('Error fetching department faculty:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/hod/approval-history
router.get('/approval-history', protect, hodOnly, async (req, res) => {
  try {
    const leaves = await Leave.find({
      department: req.user.hodOf,
      hodStatus: { $in: ['approved', 'rejected'] }
    })
    .populate('faculty', 'personalDetails email')
    .sort({ appliedDate: -1 })
    .limit(50);

    res.json({ success: true, leaves });
  } catch (error) {
    console.error('Error fetching approval history:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/hod/workload-status
router.get('/workload-status', protect, hodOnly, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const facultyOnLeaveToday = await Leave.countDocuments({
      department: req.user.hodOf,
      status: 'approved',
      startDate: { $lte: today.toISOString().split('T')[0] },
      endDate: { $gte: today.toISOString().split('T')[0] }
    });

    const facultyOnLeave = await Leave.find({
      department: req.user.hodOf,
      status: 'approved',
      startDate: { $lte: today.toISOString().split('T')[0] },
      endDate: { $gte: today.toISOString().split('T')[0] }
    }).populate('faculty', 'personalDetails email');

    res.json({
      success: true,
      workload: {
        facultyOnLeaveToday,
        maxAllowed: 3,
        facultyOnLeave: facultyOnLeave.map(l => ({
          name: l.faculty?.personalDetails?.name,
          leaveType: l.leaveType,
          fromTime: l.fromTime,
          toTime: l.toTime
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching workload status:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;