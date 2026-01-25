const User = require('../models/User');
const LandRegistration = require('../models/LandRegistration');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'your-secret-key', {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// Generate unique Land ID
const generateLandId = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `LAND-${timestamp}-${random}`;
};

// Generate unique ZKP Hash ID (short reference ID)
const generateZkpHashId = () => {
  return `ZKP-${crypto.randomBytes(6).toString('hex').toUpperCase()}`;
};

// Generate document hash (simulated ZKP)
const generateDocumentHash = (documentPath) => {
  if (!documentPath) return null;
  try {
    const fullPath = path.join(__dirname, '..', documentPath);
    if (fs.existsSync(fullPath)) {
      const fileContent = fs.readFileSync(fullPath);
      return crypto.createHash('sha256').update(fileContent).digest('hex');
    }
  } catch (error) {
    console.log('Error reading file for hash:', error.message);
  }
  return crypto.createHash('sha256').update(documentPath + Date.now().toString()).digest('hex');
};

// Delete document file
const deleteDocumentFile = (documentPath) => {
  if (!documentPath) return;
  try {
    const fullPath = path.join(__dirname, '..', documentPath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      console.log('🗑️ Deleted file:', documentPath);
    }
  } catch (error) {
    console.log('Error deleting file:', error.message);
  }
};

// Authority Login
exports.authorityLogin = async (req, res) => {
  try {
    const { employeeId, password } = req.body;

    console.log('\n=== Authority Login Attempt ===');
    console.log('Employee ID:', employeeId);

    if (!employeeId || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide employee ID and password'
      });
    }

    const authority = await User.findOne({ 
      employeeId: employeeId,
      role: 'AUTHORITY' 
    }).select('+password');

    if (!authority) {
      return res.status(401).json({
        success: false,
        message: 'Invalid employee ID or not authorized'
      });
    }

    let isMatch = false;
    if (authority.comparePassword) {
      isMatch = await authority.comparePassword(password);
    } else {
      isMatch = await bcrypt.compare(password, authority.password);
    }

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid password'
      });
    }

    authority.lastLogin = new Date();
    await authority.save();

    const token = generateToken(authority._id);

    console.log('✅ Authority login successful');

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: authority._id,
        employeeId: authority.employeeId,
        fullName: authority.fullName,
        email: authority.email,
        role: authority.role
      }
    });
  } catch (error) {
    console.error('Authority Login Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error logging in: ' + error.message
    });
  }
};

// Get all pending registrations
exports.getPendingRegistrations = async (req, res) => {
  try {
    const registrations = await LandRegistration.find({
      status: { $in: ['PENDING_PAYMENT', 'PENDING_MEETING', 'MEETING_SCHEDULED', 'MEETING_COMPLETED'] }
    })
    .populate('userId', 'fullName aadhaarNumber mobileNumber email userId')
    .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: registrations.length,
      data: registrations
    });
  } catch (error) {
    console.error('Get Pending Registrations Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching registrations: ' + error.message
    });
  }
};

// Get all registrations (any status)
exports.getAllRegistrations = async (req, res) => {
  try {
    const { status } = req.query;
    
    let query = {};
    if (status && status !== 'all') {
      query.status = status;
    }

    const registrations = await LandRegistration.find(query)
      .populate('userId', 'fullName aadhaarNumber mobileNumber email userId')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: registrations.length,
      data: registrations
    });
  } catch (error) {
    console.error('Get All Registrations Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching registrations: ' + error.message
    });
  }
};

// Get single registration details
exports.getRegistrationDetails = async (req, res) => {
  try {
    const registration = await LandRegistration.findById(req.params.id)
      .populate('userId', 'fullName aadhaarNumber panNumber mobileNumber email address profilePhoto userId')
      .populate('documentVerification.verifiedBy', 'fullName employeeId')
      .populate('landIdGeneratedBy', 'fullName employeeId');

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found'
      });
    }

    res.status(200).json({
      success: true,
      data: registration
    });
  } catch (error) {
    console.error('Get Registration Details Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching registration: ' + error.message
    });
  }
};

// Schedule meeting
exports.scheduleMeeting = async (req, res) => {
  try {
    const { scheduledDate, scheduledTime, venue } = req.body;

    const registration = await LandRegistration.findById(req.params.id);

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found'
      });
    }

    registration.meeting = {
      scheduledDate: new Date(scheduledDate),
      scheduledTime,
      venue,
      status: 'SCHEDULED',
      attendedBy: req.user._id
    };
    registration.status = 'MEETING_SCHEDULED';

    await registration.save();

    console.log('✅ Meeting scheduled for registration:', registration._id);

    res.status(200).json({
      success: true,
      message: 'Meeting scheduled successfully',
      data: registration
    });
  } catch (error) {
    console.error('Schedule Meeting Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error scheduling meeting: ' + error.message
    });
  }
};

// Mark meeting as completed
exports.completeMeeting = async (req, res) => {
  try {
    const { notes } = req.body;

    const registration = await LandRegistration.findById(req.params.id);

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found'
      });
    }

    registration.meeting.status = 'COMPLETED';
    registration.meeting.completedAt = new Date();
    registration.meeting.notes = notes || '';
    registration.status = 'MEETING_COMPLETED';

    await registration.save();

    console.log('✅ Meeting completed for registration:', registration._id);

    res.status(200).json({
      success: true,
      message: 'Meeting marked as completed',
      data: registration
    });
  } catch (error) {
    console.error('Complete Meeting Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error completing meeting: ' + error.message
    });
  }
};

// Verify documents (with ZKP hash generation and DELETE ORIGINAL FILES)
exports.verifyDocuments = async (req, res) => {
  try {
    const { verificationNotes } = req.body;

    const registration = await LandRegistration.findById(req.params.id);

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found'
      });
    }

    console.log('\n=== Generating ZKP Hashes ===');

    // Generate ZKP Hash IDs (short reference IDs)
    const zkpHashIds = {
      landDocumentZkpId: registration.documents?.landDocument ? generateZkpHashId() : null,
      previousOwnerDocumentZkpId: registration.documents?.previousOwnerDocument ? generateZkpHashId() : null,
      ownershipProofZkpId: registration.documents?.ownershipProof ? generateZkpHashId() : null,
      surveyMapZkpId: registration.documents?.surveyMap ? generateZkpHashId() : null,
      landPhotosZkpIds: registration.documents?.landPhotos?.map(() => generateZkpHashId()) || [],
      ownerLivePhotoZkpId: registration.ownerLivePhoto ? generateZkpHashId() : null
    };

    // Generate actual cryptographic hashes
    const documentHashes = {
      landDocumentHash: generateDocumentHash(registration.documents?.landDocument),
      previousOwnerDocumentHash: generateDocumentHash(registration.documents?.previousOwnerDocument),
      ownershipProofHash: generateDocumentHash(registration.documents?.ownershipProof),
      surveyMapHash: generateDocumentHash(registration.documents?.surveyMap),
      landPhotosHash: registration.documents?.landPhotos?.map(photo => generateDocumentHash(photo)) || [],
      ownerLivePhotoHash: generateDocumentHash(registration.ownerLivePhoto)
    };

    console.log('ZKP Hash IDs generated:', zkpHashIds);

    // DELETE ORIGINAL DOCUMENTS after generating hashes
    console.log('\n=== Deleting Original Documents (ZKP Security) ===');
    
    if (registration.documents?.landDocument) {
      deleteDocumentFile(registration.documents.landDocument);
    }
    if (registration.documents?.previousOwnerDocument) {
      deleteDocumentFile(registration.documents.previousOwnerDocument);
    }
    if (registration.documents?.ownershipProof) {
      deleteDocumentFile(registration.documents.ownershipProof);
    }
    if (registration.documents?.surveyMap) {
      deleteDocumentFile(registration.documents.surveyMap);
    }
    if (registration.documents?.landPhotos) {
      registration.documents.landPhotos.forEach(photo => deleteDocumentFile(photo));
    }
    if (registration.ownerLivePhoto) {
      deleteDocumentFile(registration.ownerLivePhoto);
    }

    // Update registration with ZKP data
    registration.documentVerification = {
      isVerified: true,
      verifiedAt: new Date(),
      verifiedBy: req.user._id,
      verificationNotes: verificationNotes || '',
      documentHashes,
      zkpHashIds,
      zkpEnabled: true
    };

    // Clear document paths (files are deleted)
    registration.documents = {
      landDocument: null,
      previousOwnerDocument: null,
      ownershipProof: null,
      surveyMap: null,
      landPhotos: []
    };
    registration.ownerLivePhoto = null;

    registration.status = 'DOCUMENTS_VERIFIED';
    registration.verifiedAt = new Date();

    await registration.save();

    console.log('✅ Documents verified and deleted. ZKP hashes stored.');

    res.status(200).json({
      success: true,
      message: 'Documents verified with ZKP. Original files securely deleted.',
      data: registration
    });
  } catch (error) {
    console.error('Verify Documents Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying documents: ' + error.message
    });
  }
};

// Generate Land ID and approve
exports.generateLandIdAndApprove = async (req, res) => {
  try {
    const registration = await LandRegistration.findById(req.params.id);

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found'
      });
    }

    if (!registration.documentVerification?.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'Documents must be verified before generating Land ID'
      });
    }

    // Generate Land ID
    const landId = generateLandId();
    
    registration.landId = landId;
    registration.landIdGenerated = true;
    registration.landIdGeneratedAt = new Date();
    registration.landIdGeneratedBy = req.user._id;
    registration.status = 'APPROVED';
    registration.approvedAt = new Date();
    registration.registrarId = req.user._id;

    await registration.save();

    console.log('✅ Land ID generated:', landId);

    res.status(200).json({
      success: true,
      message: 'Land ID generated and registration approved',
      data: {
        landId,
        registration
      }
    });
  } catch (error) {
    console.error('Generate Land ID Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating Land ID: ' + error.message
    });
  }
};

// Reject registration
exports.rejectRegistration = async (req, res) => {
  try {
    const { rejectionReason } = req.body;

    if (!rejectionReason) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required'
      });
    }

    const registration = await LandRegistration.findById(req.params.id);

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found'
      });
    }

    registration.status = 'REJECTED';
    registration.rejectionReason = rejectionReason;
    registration.rejectedAt = new Date();
    registration.registrarId = req.user._id;

    await registration.save();

    console.log('❌ Registration rejected:', registration._id);

    res.status(200).json({
      success: true,
      message: 'Registration rejected',
      data: registration
    });
  } catch (error) {
    console.error('Reject Registration Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error rejecting registration: ' + error.message
    });
  }
};

// Get dashboard stats
exports.getDashboardStats = async (req, res) => {
  try {
    const totalRegistrations = await LandRegistration.countDocuments();
    const pendingPayment = await LandRegistration.countDocuments({ status: 'PENDING_PAYMENT' });
    const pendingMeeting = await LandRegistration.countDocuments({ status: { $in: ['PENDING_MEETING', 'MEETING_SCHEDULED'] } });
    const meetingCompleted = await LandRegistration.countDocuments({ status: 'MEETING_COMPLETED' });
    const documentsVerified = await LandRegistration.countDocuments({ status: 'DOCUMENTS_VERIFIED' });
    const approved = await LandRegistration.countDocuments({ status: 'APPROVED' });
    const rejected = await LandRegistration.countDocuments({ status: 'REJECTED' });

    res.status(200).json({
      success: true,
      data: {
        totalRegistrations,
        pendingPayment,
        pendingMeeting,
        pendingVerification: meetingCompleted,
        documentsVerified,
        approved,
        rejected
      }
    });
  } catch (error) {
    console.error('Get Dashboard Stats Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching stats: ' + error.message
    });
  }
};
