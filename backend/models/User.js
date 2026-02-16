const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['faculty', 'hod'],
    required: true
  },
  staffId: {
    type: String,
    required: true,
  },
  personalDetails: {
    name: String,
    designation: String,
    department: String,
    dateOfJoining: String,
    experience: String,
    phone: String,
    officeRoom: String,
    qualifications: [String],
    researchAreas: [String],
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      default: 'male'
    }
  },
  leaveBalance: {
    casualLeave: { type: Number, default: 12 },
    medicalLeave: { type: Number, default: 15 },
    summerLeave: { type: Number, default: 3 },
    winterLeave: { type: Number, default: 3 },
    permissionLeaves: { 
      total: { type: Number, default: 2 },
      used: { type: Number, default: 0 },
      month: { type: String, default: null }
    }
  },
  hodOf: {
    type: String,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to reset monthly permission leaves
userSchema.methods.resetMonthlyPermissionLeaves = function() {
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${now.getMonth() + 1}`;
  
  if (this.leaveBalance.permissionLeaves.month !== currentMonth) {
    this.leaveBalance.permissionLeaves.used = 0;
    this.leaveBalance.permissionLeaves.month = currentMonth;
    return true;
  }
  return false;
};

module.exports = mongoose.model('User', userSchema);