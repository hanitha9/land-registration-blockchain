const mongoose = require('mongoose');

const bankSchema = new mongoose.Schema({
  // ========================================
  // BANK IDENTIFICATION
  // ========================================
  bankId: {
    type: String,
    unique: true,
    required: true,
    index: true
  },
  bankName: {
    type: String,
    required: true
  },
  bankCode: {
    type: String,
    unique: true
  },
  
  // ========================================
  // BRANCH DETAILS
  // ========================================
  branchName: {
    type: String,
    default: 'Main Branch'
  },
  branchCode: String,
  ifscCode: String,
  
  // ========================================
  // CONTACT DETAILS
  // ========================================
  address: {
    street: String,
    city: String,
    district: String,
    state: String,
    pincode: String
  },
  phone: String,
  email: String,
  
  // ========================================
  // LOAN CONFIGURATION
  // ========================================
  loanConfig: {
    minAmount: { type: Number, default: 100000 },  // 1 Lakh
    maxAmount: { type: Number, default: 100000000 }, // 10 Crore
    minTenureMonths: { type: Number, default: 12 },
    maxTenureMonths: { type: Number, default: 240 },
    interestRate: { type: Number, default: 8.5 },
    processingFeePercent: { type: Number, default: 1 },
    maxLoanToValueRatio: { type: Number, default: 70 } // 70% of property value
  },
  
  // ========================================
  // STATISTICS
  // ========================================
  stats: {
    totalLoansApproved: { type: Number, default: 0 },
    totalAmountDisbursed: { type: Number, default: 0 },
    activeMortgages: { type: Number, default: 0 },
    clearedLoans: { type: Number, default: 0 }
  },
  
  // ========================================
  // STATUS
  // ========================================
  isActive: {
    type: Boolean,
    default: true
  },
  
  // ========================================
  // TIMESTAMPS
  // ========================================
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }

}, {
  timestamps: true
});

// Indexes
bankSchema.index({ bankName: 1 });
bankSchema.index({ isActive: 1 });

// Pre-save hook
bankSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Method to update stats
bankSchema.methods.updateStats = async function(action, amount = 0) {
  switch(action) {
    case 'LOAN_APPROVED':
      this.stats.totalLoansApproved += 1;
      this.stats.totalAmountDisbursed += amount;
      this.stats.activeMortgages += 1;
      break;
    case 'LOAN_CLEARED':
      this.stats.activeMortgages -= 1;
      this.stats.clearedLoans += 1;
      break;
  }
  return this.save();
};

// Static method to find active banks
bankSchema.statics.findActive = function() {
  return this.find({ isActive: true });
};

module.exports = mongoose.model('Bank', bankSchema);
