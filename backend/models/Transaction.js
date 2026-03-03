const mongoose = require('mongoose');
const crypto = require('crypto');

// Generate unique Transaction ID
const generateTransactionId = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `TXN_${timestamp}${random}`;
};

const transactionSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    unique: true,
    default: generateTransactionId
  },
  
  type: {
    type: String,
    enum: [
      'CREATE', 'UPDATE', 'DELETE', 
      'MORTGAGE', 'CLEAR_MORTGAGE', 
      'TRANSFER', 'BLOCK_TRANSFER', 
      'DISPUTE', 'RESOLVE_DISPUTE',
      'LOAN_APPROVAL', 'LOAN_REJECTION', 'LOAN_CLEARANCE'
    ],
    required: true
  },
  
  landId: {
    type: String,
    required: true
  },
  
  // Parties involved
  initiatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  affectedParties: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  // Details
  details: {
    type: String,
    required: true
  },
  
  // Status
  status: {
    type: String,
    enum: ['SUCCESS', 'FAILED', 'PENDING'],
    default: 'SUCCESS'
  },
  
  // Blockchain details
  blockchainTxId: String,
  
  // Related entities
  relatedEntities: [{
    entityType: String,
    entityId: String
  }],
  
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Transaction', transactionSchema);