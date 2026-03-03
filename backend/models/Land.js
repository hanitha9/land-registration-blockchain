const mongoose = require('mongoose');
const crypto = require('crypto');

// Generate unique Land ID
const generateLandId = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `LAND_${timestamp}${random}`;
};

const landSchema = new mongoose.Schema({
  // ========================================
  // UNIQUE IDENTIFIERS
  // ========================================
  landId: {
    type: String,
    unique: true,
    default: generateLandId,
    index: true
  },
  surveyNumber: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  // ========================================
  // CURRENT OWNER DETAILS
  // ========================================
  ownerId: {
    type: String,
    required: true,
    index: true
  },
  ownerUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  ownerName: {
    type: String,
    required: true
  },
  ownerAadhaar: {
    type: String,
    required: true
  },
  ownerMobile: {
    type: String
  },
  
  // ========================================
  // LOCATION DETAILS
  // ========================================
  location: {
    street: String,
    village: String,
    city: String,
    district: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    pincode: String,
    exactLocation: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  
  // ========================================
  // LAND DETAILS
  // ========================================
  areaSqFt: {
    type: Number,
    required: true
  },
  areaSqMeters: {
    type: Number
  },
  areaAcres: {
    type: Number
  },
  landType: {
    type: String,
    enum: ['Residential', 'Agricultural', 'Commercial', 'Industrial', 'Mixed'],
    default: 'Residential'
  },
  marketValue: {
    type: Number,
    required: true
  },
  
  // Surrounding lands
  surroundingLands: {
    north: String,
    south: String,
    east: String,
    west: String
  },
  
  // ========================================
  // STATUS (CRITICAL FOR FRAUD PREVENTION)
  // ========================================
  currentStatus: {
    type: String,
    enum: ['ACTIVE', 'LOCKED', 'PENDING_TRANSFER', 'DISPUTED', 'PENDING_VERIFICATION'],
    default: 'ACTIVE',
    index: true
  },
  
  // ========================================
  // MORTGAGE DETAILS (CRITICAL FOR FRAUD PREVENTION)
  // ========================================
  isMortgaged: {
    type: Boolean,
    default: false,
    index: true
  },
  encumbranceDetails: {
    bankId: { type: String, default: null },
    bankName: { type: String, default: null },
    loanId: { type: String, default: null },
    loanRequestId: { type: String, default: null },
    loanAmount: { type: Number, default: 0 },
    loanStatus: {
      type: String,
      enum: ['NONE', 'PENDING', 'APPROVED', 'CLEARED'],
      default: 'NONE'
    },
    mortgageDate: { type: Date, default: null },
    clearanceDate: { type: Date, default: null }
  },
  
  // ========================================
  // PENDING TRANSFER DETAILS
  // ========================================
  pendingTransfer: {
    transferId: { type: String, default: null },
    buyerId: { type: String, default: null },
    buyerName: { type: String, default: null },
    buyerAadhaar: { type: String, default: null },
    salePrice: { type: Number, default: null },
    initiatedDate: { type: Date, default: null },
    initiatedBy: { type: String, default: null }
  },
  
  // ========================================
  // DISPUTE DETAILS
  // ========================================
  disputeDetails: {
    reason: { type: String, default: null },
    disputedBy: { type: String, default: null },
    disputeDate: { type: Date, default: null },
    resolved: { type: Boolean, default: false },
    resolution: { type: String, default: null },
    resolvedBy: { type: String, default: null },
    resolvedDate: { type: Date, default: null }
  },
  
  // ========================================
  // OWNERSHIP HISTORY
  // ========================================
  previousOwners: [{
    ownerId: String,
    ownerName: String,
    ownerAadhaar: String,
    transferDate: Date,
    salePrice: Number,
    transferId: String
  }],
  
  // ========================================
  // DOCUMENTS
  // ========================================
  documents: [{
    docType: {
      type: String,
      enum: ['land_document', 'survey_map', 'ownership_proof', 'photo', 'other']
    },
    docPath: String,
    uploadedAt: { type: Date, default: Date.now },
    uploadedBy: String,
    description: String
  }],
  
  landPhotos: [String],
  
  // ========================================
  // METADATA
  // ========================================
  registrationDate: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: String,
    required: true
  },
  createdByRole: {
    type: String,
    default: 'revenue_officer'
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  lastUpdatedBy: String,
  
  // ========================================
  // BLOCKCHAIN REFERENCE
  // ========================================
  blockchainTxId: String,
  blockchainLandId: String,
  lastSyncedAt: Date,
  
  // Description
  description: String

}, {
  timestamps: true
});

// Indexes for common queries
landSchema.index({ currentStatus: 1, isMortgaged: 1 });
landSchema.index({ 'location.district': 1, 'location.state': 1 });
landSchema.index({ ownerId: 1, currentStatus: 1 });
landSchema.index({ 'encumbranceDetails.bankId': 1 });

// Pre-save hook
landSchema.pre('save', function(next) {
  this.lastUpdated = new Date();
  
  // Calculate area in other units
  if (this.areaSqFt) {
    this.areaSqMeters = parseFloat((this.areaSqFt * 0.092903).toFixed(2));
    this.areaAcres = parseFloat((this.areaSqFt / 43560).toFixed(4));
  }
  
  next();
});

// Method to check if land can be sold
landSchema.methods.canBeSold = function() {
  if (this.currentStatus !== 'ACTIVE') {
    return { canSell: false, reason: `Land status is ${this.currentStatus}` };
  }
  if (this.isMortgaged) {
    return { canSell: false, reason: `Land is mortgaged to ${this.encumbranceDetails.bankName}` };
  }
  return { canSell: true, reason: null };
};

// Method to check if land can be mortgaged
landSchema.methods.canBeMortgaged = function() {
  if (this.currentStatus !== 'ACTIVE') {
    return { canMortgage: false, reason: `Land status is ${this.currentStatus}` };
  }
  if (this.isMortgaged) {
    return { canMortgage: false, reason: `Land already mortgaged to ${this.encumbranceDetails.bankName}` };
  }
  return { canMortgage: true, reason: null };
};

// Static method to find by owner
landSchema.statics.findByOwner = function(ownerId) {
  return this.find({ ownerId });
};

// Static method to find mortgaged lands
landSchema.statics.findMortgaged = function(bankId = null) {
  const query = { isMortgaged: true };
  if (bankId) {
    query['encumbranceDetails.bankId'] = bankId;
  }
  return this.find(query);
};

// Static method to find pending transfers
landSchema.statics.findPendingTransfers = function() {
  return this.find({ currentStatus: 'PENDING_TRANSFER' });
};

// Static method to find disputed lands
landSchema.statics.findDisputed = function() {
  return this.find({ currentStatus: 'DISPUTED' });
};

module.exports = mongoose.model('Land', landSchema);
