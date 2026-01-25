const LandRegistration = require('../models/LandRegistration');
const User = require('../models/User');
const FabricNetwork = require('../utils/fabricNetwork');

// @desc    Get all pending land registrations
// @route   GET /api/registrar/pending
exports.getPendingRegistrations = async (req, res) => {
  try {
    const registrations = await LandRegistration.find({
      status: { $in: ['PAYMENT_VERIFIED', 'UNDER_VERIFICATION'] }
    })
    .populate('userId', 'userId fullName mobileNumber email')
    .sort({ submittedAt: -1 });
    
    res.status(200).json({
      success: true,
      count: registrations.length,
      data: registrations
    });
  } catch (error) {
    console.error('Get Pending Registrations Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching registrations'
    });
  }
};

// @desc    Verify and approve land registration
// @route   POST /api/registrar/verify/:id
exports.verifyLandRegistration = async (req, res) => {
  try {
    const { 
      documentVerified, 
      paymentVerified, 
      physicalVerificationDone, 
      approved, 
      remarks 
    } = req.body;
    
    const landRegistration = await LandRegistration.findById(req.params.id);
    
    if (!landRegistration) {
      return res.status(404).json({
        success: false,
        message: 'Land registration not found'
      });
    }
    
    // Update verification details
    landRegistration.verification.documentVerified = documentVerified;
    landRegistration.verification.paymentVerified = paymentVerified;
    landRegistration.verification.physicalVerificationDone = physicalVerificationDone;
    landRegistration.verification.registrarApproved = approved;
    landRegistration.verification.verifiedBy = req.user.userId;
    landRegistration.verification.verificationDate = new Date();
    landRegistration.verification.remarks = remarks;
    
    if (approved) {
      const blockchainLandId = `BLK${landRegistration.landId}`;
      landRegistration.blockchainLandId = blockchainLandId;
      landRegistration.status = 'APPROVED';
      landRegistration.onBlockchain = false;
      landRegistration.approvedAt = new Date();
      landRegistration.registeredAt = new Date();
    } else {
      landRegistration.status = 'REJECTED';
    }
    
    await landRegistration.save();
    
    res.status(200).json({
      success: true,
      message: approved ? 'Land registration approved' : 'Land registration rejected',
      data: landRegistration
    });
  } catch (error) {
    console.error('Verify Land Registration Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Register approved land on blockchain
// @route   POST /api/registrar/register-blockchain/:id
exports.registerOnBlockchain = async (req, res) => {
  try {
    const landRegistration = await LandRegistration.findById(req.params.id);
    
    if (!landRegistration) {
      return res.status(404).json({
        success: false,
        message: 'Land registration not found'
      });
    }
    
    if (landRegistration.status !== 'APPROVED') {
      return res.status(400).json({
        success: false,
        message: 'Land must be approved first'
      });
    }
    
    if (landRegistration.onBlockchain) {
      return res.status(400).json({
        success: false,
        message: 'Land already registered on blockchain'
      });
    }
    
    const fabricNetwork = new FabricNetwork();
    const { gateway, contract } = await fabricNetwork.connectToNetwork();
    
    try {
      const result = await contract.submitTransaction(
        'registerLand',
        landRegistration.blockchainLandId,
        landRegistration.claimedOwnerName,
        `${landRegistration.measurements.squareMeters} sq meters`,
        `${landRegistration.address.village}, ${landRegistration.address.district}, ${landRegistration.address.state}`,
        landRegistration.payment.calculatedAmount.toString()
      );
      
      landRegistration.onBlockchain = true;
      landRegistration.blockchainTxId = 'TX_' + Date.now();
      await landRegistration.save();
      
      await fabricNetwork.disconnectFromNetwork(gateway);
      
      res.status(200).json({
        success: true,
        message: 'Land successfully registered on blockchain',
        data: {
          landId: landRegistration.blockchainLandId,
          blockchainData: JSON.parse(result.toString())
        }
      });
    } catch (blockchainError) {
      await fabricNetwork.disconnectFromNetwork(gateway);
      throw blockchainError;
    }
  } catch (error) {
    console.error('Register on Blockchain Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all registrations (with filters)
// @route   GET /api/registrar/all
exports.getAllRegistrations = async (req, res) => {
  try {
    const { status, startDate, endDate, district, state } = req.query;
    
    const query = {};
    
    if (status) query.status = status;
    if (district) query['address.district'] = district;
    if (state) query['address.state'] = state;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    
    const registrations = await LandRegistration.find(query)
      .populate('userId', 'userId fullName mobileNumber email')
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
      message: 'Error fetching registrations'
    });
  }
};

// @desc    Update meeting schedule
// @route   PUT /api/registrar/meeting/:id
exports.updateMeeting = async (req, res) => {
  try {
    const { scheduledDate, scheduledTime, registrarOfficerId } = req.body;
    
    const landRegistration = await LandRegistration.findById(req.params.id);
    
    if (!landRegistration) {
      return res.status(404).json({
        success: false,
        message: 'Land registration not found'
      });
    }
    
    landRegistration.meeting.scheduledDate = scheduledDate;
    landRegistration.meeting.scheduledTime = scheduledTime;
    landRegistration.meeting.registrarOfficerId = registrarOfficerId;
    landRegistration.meeting.status = 'SCHEDULED';
    
    await landRegistration.save();
    
    res.status(200).json({
      success: true,
      message: 'Meeting schedule updated',
      data: landRegistration
    });
  } catch (error) {
    console.error('Update Meeting Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = exports;
