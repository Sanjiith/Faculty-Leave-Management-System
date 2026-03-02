const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Leave = require('../models/Leave');
const { protect, hodOnly } = require('../middleware/auth');

// @route   GET /api/hod/profile
router.get('/profile', protect, hodOnly, async (req, res) => {
  try {
    const hod = await User.findById(req.user._id).select('-password');
    
    // Get statistics
    const pendingLeaves = await Leave.countDocuments({
      department: hod.hodOf,
      hodStatus: 'pending'
    });

    const totalFaculty = await User.countDocuments({
      role: 'faculty',
      'personalDetails.department': hod.hodOf
    });

    // Get approved leaves for today (for workload warning)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

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

    // Get count of faculty already on leave for each date
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
        maxAllowed: 2 // Maximum 2 faculty can be on leave at once
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

    // Check if leave belongs to HOD's department
    if (leave.department !== req.user.hodOf) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // If approving, check workload
    if (status === 'approved') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Parse leave dates
      const startDate = new Date(leave.startDate);
      const endDate = new Date(leave.endDate);
      
      // Check each date in the leave range
      let workloadWarning = false;
      let conflictDates = [];
      
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        
        // Count approved leaves for this date (excluding current leave)
        const facultyOnLeave = await Leave.countDocuments({
          department: req.user.hodOf,
          status: 'approved',
          _id: { $ne: leave._id }, // Exclude current leave
          startDate: { $lte: dateStr },
          endDate: { $gte: dateStr }
        });
        
        if (facultyOnLeave >= 2) {
          workloadWarning = true;
          conflictDates.push(dateStr);
        }
      }
      
      if (workloadWarning) {
        return res.status(400).json({
          success: false,
          workloadWarning: true,
          message: `Warning: ${conflictDates.length > 1 ? 'On these dates' : 'On this date'} ${conflictDates.join(', ')}, 2 faculty members are already on leave. Approving this leave will make it 3. Do you still want to approve?`,
          conflictDates
        });
      }
    }

    // Update HOD status
    leave.hodStatus = status;
    
    // Update the main status field based on HOD action
    if (status === 'approved') {
      leave.status = 'approved';
      leave.principalStatus = 'pending';
    } else if (status === 'rejected') {
      leave.status = 'rejected';
      leave.principalStatus = 'rejected';
    }

    await leave.save();

    // If approved, update faculty's leave balance
    if (status === 'approved') {
      const faculty = await User.findById(leave.facultyId);
      
      // Update leave balances based on type
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
        case 'Permission Leave':
          // Already counted when applying
          break;
        case 'Compensation Leave':
          // Add night skill days tracking if needed
          break;
      }
      
      await faculty.save();
    }

    // Return the updated leave with populated faculty data
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

// @route   GET /api/hod/department-faculty
router.get('/department-faculty', protect, hodOnly, async (req, res) => {
  try {
    const faculty = await User.find({
      role: 'faculty',
      'personalDetails.department': req.user.hodOf
    }).select('-password');

    res.json({
      success: true,
      faculty
    });
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

    res.json({
      success: true,
      leaves
    });
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
    
    // Get faculty on leave today
    const facultyOnLeaveToday = await Leave.countDocuments({
      department: req.user.hodOf,
      status: 'approved',
      startDate: { $lte: today.toISOString().split('T')[0] },
      endDate: { $gte: today.toISOString().split('T')[0] }
    });

    // Get detailed list of faculty on leave
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
        maxAllowed: 2,
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