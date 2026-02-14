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
        approvedToday: approvedLeaves
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

    res.json({
      success: true,
      leaves
    });
  } catch (error) {
    console.error('Error fetching pending leaves:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/hod/approve-leave/:id
// @route   PUT /api/hod/approve-leave/:id
// @desc    Approve or reject leave
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

    // Update HOD status
    leave.hodStatus = status;
    
    // IMPORTANT: Update the main status field based on HOD action
    if (status === 'approved') {
      leave.status = 'approved'; // Set main status to approved
      leave.principalStatus = 'pending'; // Keep principal as pending if needed
    } else if (status === 'rejected') {
      leave.status = 'rejected'; // Set main status to rejected
      leave.principalStatus = 'rejected';
    }

    await leave.save();

    // If approved, update faculty's leave balance
    if (status === 'approved') {
      const faculty = await User.findById(leave.facultyId);
      
      let leaveBalanceField = '';
      if (leave.leaveType === 'Casual Leave') leaveBalanceField = 'casualLeave';
      else if (leave.leaveType === 'Medical Leave') leaveBalanceField = 'medicalLeave';
      else if (leave.leaveType === 'Earned Leave') leaveBalanceField = 'earnedLeave';
      
      if (leaveBalanceField && faculty) {
        faculty.leaveBalance[leaveBalanceField] -= leave.days;
        await faculty.save();
      }
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

module.exports = router;