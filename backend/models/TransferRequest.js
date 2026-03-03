const mongoose = require('mongoose');
const crypto = require('crypto');

// Generate unique Transfer Request ID
const generateTransferId = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `TR_${timestamp}${random}`;
};

const transferRequestSchema = new mongoose.Schema({
  transferId: {
    type: String,
    unique: true,
    default: generateTransferId
  },
  
  // Land
  landId: {
    type: String,
    required: true
  },
  surveyNumber: {
    type: String,
    required: true
  },
  
  // Parties
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sellerName: {
    type: String,
    required: true
  },
  sellerAadhaar: {
    type: String,
    required: true
  },
  
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  buyerName: {
    type: String,
    required: true
  },
  buyerAadhaar: {
    type: String,
    required: true
  },
  
  // Sale Details
  salePrice: {
    type: Number,
    required: true
  },
  
  // Status
  status: {
    type: String,
    enum: ['PENDING', 'VERIFIED', 'APPROVED', 'REJECTED', 'BLOCKED'],
    default: 'PENDING'
  },
  blockReason: String,
  
  // Registrar
  registrarId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Dates
  initiatedDate: {
    type: Date,
    default: Date.now
  },
  verifiedDate: Date,
  completedDate: Date,
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

transferRequestSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('TransferRequest', transferRequestSchema);