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
    // unique: true, // Comment this out temporarily for seeding
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
    researchAreas: [String]
  },
  leaveBalance: {
    casualLeave: { type: Number, default: 12 },
    medicalLeave: { type: Number, default: 15 },
    earnedLeave: { type: Number, default: 30 }
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

module.exports = mongoose.model('User', userSchema);