const mongoose = require('mongoose');
const crypto = require('crypto');

const landRegistrationSchema = new mongoose.Schema({
  landId: {
    type: String,
    unique: true,
    sparse: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  registrationType: {
    type: String,
    enum: ['WITH_HISTORY', 'WITHOUT_HISTORY'],
    required: true
  },

  // Basic Information
  surveyNumber: String,
  claimedOwnerName: String,
  ownerLivePhoto: String,

  // Address
  address: {
    village: String,
    district: String,
    state: String,
    pincode: String,
    exactLocation: String
  },

  // Measurements
  measurements: {
    squareFeet: Number,
    squareMeters: Number,
    acres: Number,
    hectares: Number
  },

  // Surrounding Lands
  surroundingLands: {
    north: String,
    south: String,
    east: String,
    west: String
  },

  // Documents (paths - will be null after ZKP verification)
  documents: {
    landDocument: String,
    previousOwnerDocument: String,
    ownershipProof: String,
    surveyMap: String,
    landPhotos: [String]
  },

  // Document Verification with ZKP
  documentVerification: {
    isVerified: { type: Boolean, default: false },
    verifiedAt: Date,
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    verificationNotes: String,
    
    // ZKP Hash IDs (short reference IDs shown to user)
    zkpHashIds: {
      landDocumentZkpId: String,
      previousOwnerDocumentZkpId: String,
      ownershipProofZkpId: String,
      surveyMapZkpId: String,
      landPhotosZkpIds: [String],
      ownerLivePhotoZkpId: String
    },
    
    // Actual cryptographic hashes (stored securely)
    documentHashes: {
      landDocumentHash: String,
      previousOwnerDocumentHash: String,
      ownershipProofHash: String,
      surveyMapHash: String,
      landPhotosHash: [String],
      ownerLivePhotoHash: String
    },
    
    zkpEnabled: { type: Boolean, default: false }
  },

  // Land ID Generation
  landIdGenerated: { type: Boolean, default: false },
  landIdGeneratedAt: Date,
  landIdGeneratedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  // Ownership Status
  ownershipStatus: {
    type: String,
    enum: ['OWNED', 'TRANSFERRED', 'DISPUTED', 'PENDING'],
    default: 'PENDING'
  },

  // Transfer History
  transferHistory: [{
    fromOwner: String,
    toOwner: String,
    transferDate: Date,
    transferredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }],

  landDescription: String,

  // Registration Status
  status: {
    type: String,
    enum: [
      'DRAFT',
      'PENDING_VERIFICATION',
      'UNDER_REVIEW',
      'PENDING_PAYMENT',
      'PENDING_MEETING',
      'MEETING_SCHEDULED',
      'MEETING_COMPLETED',
      'DOCUMENTS_VERIFIED',
      'APPROVED',
      'REJECTED',
      'REGISTERED_ON_BLOCKCHAIN'
    ],
    default: 'DRAFT'
  },

  // Payment Details
  payment: {
    baseAmount: Number,
    gstAmount: Number,
    totalAmount: Number,
    status: {
      type: String,
      enum: ['PENDING', 'COMPLETED', 'FAILED'],
      default: 'PENDING'
    },
    paymentMethod: String,
    transactionId: String,
    bankName: String,
    paymentProof: String,
    paidAt: Date
  },

  // Meeting Details
  meeting: {
    scheduledDate: Date,
    scheduledTime: String,
    venue: String,
    status: {
      type: String,
      enum: ['NOT_SCHEDULED', 'SCHEDULED', 'COMPLETED', 'CANCELLED', 'RESCHEDULED'],
      default: 'NOT_SCHEDULED'
    },
    attendedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    notes: String,
    completedAt: Date
  },

  // Registrar Actions
  registrarId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  verificationNotes: String,
  rejectionReason: String,

  // Blockchain Details
  blockchainTxId: String,
  blockchainLandId: String,

  // Timestamps
  submittedAt: Date,
  verifiedAt: Date,
  approvedAt: Date,
  rejectedAt: Date,
  registeredAt: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

landRegistrationSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  
  // Set ownership status based on registration status
  if (this.status === 'APPROVED' && this.ownershipStatus === 'PENDING') {
    this.ownershipStatus = 'OWNED';
  }
  
  next();
});

landRegistrationSchema.methods.isReadyForSubmission = function () {
  const required = [
    this.surveyNumber,
    this.claimedOwnerName,
    this.ownerLivePhoto,
    this.address?.village,
    this.address?.district,
    this.address?.state,
    this.address?.pincode,
    this.measurements?.squareFeet,
    this.measurements?.squareMeters,
    this.surroundingLands?.north,
    this.surroundingLands?.south,
    this.surroundingLands?.east,
    this.surroundingLands?.west
  ];

  if (this.registrationType === 'WITH_HISTORY') {
    required.push(this.documents?.landDocument);
  } else {
    required.push(this.documents?.ownershipProof);
  }

  return required.every(field => field !== null && field !== undefined && field !== '');
};

landRegistrationSchema.index({ landId: 1 });
landRegistrationSchema.index({ userId: 1, status: 1 });
landRegistrationSchema.index({ status: 1 });

module.exports = mongoose.model('LandRegistration', landRegistrationSchema);
