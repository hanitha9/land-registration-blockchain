const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// Generate unique User ID
const generateUserId = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `USR${timestamp}${random}`;
};

const userSchema = new mongoose.Schema({
  // Auto-generated User ID
  userId: {
    type: String,
    unique: true,
    default: generateUserId
  },

  // Role-based access control
  role: {
    type: String,
    enum: ['citizen', 'revenue_officer', 'bank_manager', 'sub_registrar', 'admin'],
    default: 'citizen'
  },

  // For officers only
  employeeId: {
    type: String,
    unique: true,
    sparse: true
  },
  
  department: {
    type: String,
    enum: ['Revenue Department', 'Bank', 'Registration Department', 'IT Department']
  },
  
  designation: {
    type: String,
    enum: ['Officer', 'Manager', 'Senior Manager', 'Administrator']
  },
  
  bankId: {
    type: String,
    sparse: true
  },

  // Personal Information
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  
  // Aadhaar Details
  aadhaarNumber: {
    type: String,
    required: function() { return this.role === 'citizen'; },
    unique: true,
    sparse: true,
    match: /^[0-9]{12}$/
  },
  aadhaarDocument: {
    type: String,
    required: function() { return this.role === 'citizen'; }
  },
  aadhaarVerified: {
    type: Boolean,
    default: false
  },
  aadhaarName: String,
  
  // PAN Details
  panNumber: {
    type: String,
    required: function() { return this.role === 'citizen'; },
    unique: true,
    sparse: true,
    match: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/
  },
  panDocument: {
    type: String,
    required: function() { return this.role === 'citizen'; }
  },
  panVerified: {
    type: Boolean,
    default: false
  },
  panName: String,
  
  // Contact
  mobileNumber: {
    type: String,
    required: function() { return this.role === 'citizen'; },
    unique: true,
    sparse: true,
    match: /^[0-9]{10}$/
  },
  mobileVerified: {
    type: Boolean,
    default: false
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    unique: true,
    sparse: true
  },
  
  // Personal Details
  dateOfBirth: {
    type: Date,
    required: function() { return this.role === 'citizen'; }
  },
  maritalStatus: {
    type: String,
    enum: ['Single', 'Married', 'Divorced', 'Widowed'],
    required: function() { return this.role === 'citizen'; }
  },
  occupation: String,
  
  // Family Details
  spouse: {
    fullName: String,
    aadhaarNumber: String,
    aadhaarDocument: String,
    verified: { type: Boolean, default: false }
  },
  
  children: [{
    fullName: String,
    aadhaarNumber: String,
    aadhaarDocument: String,
    dateOfBirth: Date,
    verified: { type: Boolean, default: false }
  }],
  
  parents: [{
    fullName: String,
    aadhaarNumber: String,
    relationship: { type: String, enum: ['Father', 'Mother', 'Guardian'] },
    verified: { type: Boolean, default: false }
  }],
  
  // Address
  address: {
    street: String,
    village: String,
    city: String,
    constituency: String,
    district: String,
    state: String,
    pincode: {
      type: String,
      match: /^[0-9]{6}$/
    }
  },
  
  // Profile Photo
  profilePhoto: String,
  
  // Account Security
  password: {
    type: String,
    required: true,
    minlength: 8,
    select: false
  },
  
  // Account Status
  isActive: {
    type: Boolean,
    default: true
  },
  kycCompleted: {
    type: Boolean,
    default: false
  },
  requiresProfileCompletion: {
    type: Boolean,
    default: false
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: Date
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to check if KYC is complete
userSchema.methods.checkKYCStatus = function() {
  return this.aadhaarVerified && this.panVerified && this.mobileVerified;
};

module.exports = mongoose.model('User', userSchema);