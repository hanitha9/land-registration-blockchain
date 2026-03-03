const mongoose = require('mongoose');
const crypto = require('crypto');

// Generate unique Loan Request ID
const generateRequestId = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(2).toString('hex').toUpperCase();
  return `LN_${timestamp}${random}`;
};

const loanRequestSchema = new mongoose.Schema({
  // ========================================
  // REQUEST IDENTIFICATION
  // ========================================
  requestId: {
    type: String,
    unique: true,
    default: generateRequestId,
    index: true
  },
  
  // ========================================
  // LAND DETAILS
  // ========================================
  landId: {
    type: String,
    required: true,
    index: true
  },
  landObjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Land'
  },
  surveyNumber: {
    type: String,
    required: true
  },
  landLocation: {
    village: String,
    district: String,
    state: String
  },
  landArea: Number,
  landMarketValue: Number,
  
  // ========================================
  // APPLICANT DETAILS
  // ========================================
  applicantId: {
    type: String,
    required: true,
    index: true
  },
  applicantUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  applicantName: {
    type: String,
    required: true
  },
  applicantAadhaar: {
    type: String,
    required: true
  },
  applicantMobile: String,
  applicantEmail: String,
  
  // ========================================
  // LOAN DETAILS
  // ========================================
  requestedAmount: {
    type: Number,
    required: true
  },
  approvedAmount: {
    type: Number,
    default: null
  },
  purpose: {
    type: String,
    required: true
  },
  tenureMonths: {
    type: Number,
    default: 12
  },
  interestRate: {
    type: Number,
    default: null
  },
  
  // ========================================
  // BANK DETAILS
  // ========================================
  bankId: {
    type: String,
    required: true,
    index: true
  },
  bankName: {
    type: String,
    required: true
  },
  branchName: String,
  assignedManagerId: {
    type: String,
    default: null
  },
  assignedManagerName: {
    type: String,
    default: null
  },
  
  // ========================================
  // STATUS
  // ========================================
  status: {
    type: String,
    enum: ['PENDING', 'UNDER_REVIEW', 'VERIFIED', 'APPROVED', 'REJECTED', 'CLEARED', 'CANCELLED'],
    default: 'PENDING',
    index: true
  },
  
  // ========================================
  // VERIFICATION FLAGS
  // ========================================
  verification: {
    ownershipVerified: { type: Boolean, default: false },
    landValueVerified: { type: Boolean, default: false },
    documentsVerified: { type: Boolean, default: false },
    noExistingMortgage: { type: Boolean, default: false },
    noDisputes: { type: Boolean, default: false },
    verifiedAt: Date,
    verifiedBy: String
  },
  
  // ========================================
  // DATES
  // ========================================
  requestDate: {
    type: Date,
    default: Date.now
  },
  reviewStartDate: Date,
  approvalDate: Date,
  rejectionDate: Date,
  disbursementDate: Date,
  clearanceDate: Date,
  
  // ========================================
  // NOTES & COMMENTS
  // ========================================
  notes: [{
    message: String,
    addedBy: String,
    addedByName: String,
    addedAt: { type: Date, default: Date.now }
  }],
  
  rejectionReason: String,
  approvalNotes: String,
  clearanceNotes: String,
  
  // ========================================
  // BLOCKCHAIN REFERENCE
  // ========================================
  blockchainTxId: String,
  mortgageTxId: String,
  clearanceTxId: String

}, {
  timestamps: true
});

// Indexes
loanRequestSchema.index({ status: 1, bankId: 1 });
loanRequestSchema.index({ applicantId: 1, status: 1 });
loanRequestSchema.index({ landId: 1 });

// Pre-save hook
loanRequestSchema.pre('save', function(next) {
  // Auto-update dates based on status change
  if (this.isModified('status')) {
    const now = new Date();
    switch (this.status) {
      case 'UNDER_REVIEW':
        this.reviewStartDate = now;
        break;
      case 'APPROVED':
        this.approvalDate = now;
        break;
      case 'REJECTED':
        this.rejectionDate = now;
        break;
      case 'CLEARED':
        this.clearanceDate = now;
        break;
    }
  }
  next();
});

// Method to add note
loanRequestSchema.methods.addNote = function(message, addedBy, addedByName) {
  this.notes.push({
    message,
    addedBy,
    addedByName,
    addedAt: new Date()
  });
  return this.save();
};

// Static methods
loanRequestSchema.statics.findPending = function(bankId = null) {
  const query = { status: 'PENDING' };
  if (bankId) query.bankId = bankId;
  return this.find(query).sort({ requestDate: -1 });
};

loanRequestSchema.statics.findByApplicant = function(applicantId) {
  return this.find({ applicantId }).sort({ requestDate: -1 });
};

loanRequestSchema.statics.findActive = function(bankId = null) {
  const query = { status: 'APPROVED' };
  if (bankId) query.bankId = bankId;
  return this.find(query).sort({ approvalDate: -1 });
};

loanRequestSchema.statics.findByLand = function(landId) {
  return this.find({ landId }).sort({ requestDate: -1 });
};

module.exports = mongoose.model('LoanRequest', loanRequestSchema);
