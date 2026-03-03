const Land = require('../models/Land');
const User = require('../models/User');
const Notification = require('../models/Notification');
const Transaction = require('../models/Transaction');
const { blockchainService } = require('../services/blockchainService');

// Create new land record
exports.createLandRecord = async (req, res) => {
  try {
    const {
      surveyNumber,
      ownerId,
      ownerAadhaar,
      location,
      areaSqFt,
      landType,
      marketValue
    } = req.body;

    // Check if land with this survey number already exists
    const existingLand = await Land.findOne({ surveyNumber });

    if (existingLand) {
      return res.status(400).json({
        success: false,
        message: 'Land with this survey number already exists'
      });
    }

    // Find owner by Aadhaar
    const owner = await User.findOne({ aadhaarNumber: ownerAadhaar });

    if (!owner) {
      return res.status(404).json({
        success: false,
        message: 'Owner not found. Please ensure the owner has registered.'
      });
    }

    // Create land record
    const land = await Land.create({
      surveyNumber,
      ownerId: owner._id,
      ownerName: owner.fullName,
      ownerAadhaar,
      location,
      areaSqFt,
      landType,
      marketValue,
      currentStatus: 'ACTIVE'
    });

    // Create notification for owner
    await Notification.create({
      userId: owner._id,
      title: 'Land Registered',
      message: `Your land with survey number ${surveyNumber} has been registered successfully`,
      type: 'success',
      relatedEntity: 'land',
      entityId: land.landId
    });

    // Create transaction record
    await Transaction.create({
      type: 'CREATE',
      landId: land.landId,
      initiatedBy: req.user._id,
      affectedParties: [owner._id],
      details: `Land ${surveyNumber} created for ${owner.fullName} by Revenue Officer`
    });

    res.status(201).json({
      success: true,
      message: 'Land record created successfully',
      land
    });
  } catch (error) {
    console.error('Create Land Record Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating land record: ' + error.message
    });
  }
};

// Get all lands
exports.getAllLands = async (req, res) => {
  try {
    const { status, district, search } = req.query;
    let query = {};

    if (status) {
      query.currentStatus = status;
    }

    if (district) {
      query['location.district'] = district;
    }

    if (search) {
      query.$or = [
        { surveyNumber: { $regex: search, $options: 'i' } },
        { ownerName: { $regex: search, $options: 'i' } }
      ];
    }

    const lands = await Land.find(query)
      .sort({ createdAt: -1 })
      .populate('ownerId', 'fullName aadhaarNumber');

    res.status(200).json({
      success: true,
      count: lands.length,
      lands
    });
  } catch (error) {
    console.error('Get All Lands Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching lands: ' + error.message
    });
  }
};

// Update land details
exports.updateLand = async (req, res) => {
  try {
    const { landId } = req.params;
    const updates = req.body;

    // Remove fields that shouldn't be updated directly
    delete updates.landId;
    delete updates.ownerId;
    delete updates.ownerName;
    delete updates.ownerAadhaar;
    delete updates.encumbranceDetails;
    delete updates.pendingTransfer;
    delete updates.previousOwners;
    delete updates.blockchainTxId;

    const land = await Land.findOneAndUpdate(
      { landId },
      { ...updates, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!land) {
      return res.status(404).json({
        success: false,
        message: 'Land not found'
      });
    }

    // Create transaction record
    await Transaction.create({
      type: 'UPDATE',
      landId: land.landId,
      initiatedBy: req.user._id,
      details: `Land details updated by Revenue Officer`
    });

    res.status(200).json({
      success: true,
      message: 'Land updated successfully',
      land
    });
  } catch (error) {
    console.error('Update Land Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating land: ' + error.message
    });
  }
};

// Mark land as disputed
exports.markLandDisputed = async (req, res) => {
  try {
    const { landId, reason } = req.body;

    const land = await Land.findOne({ landId });

    if (!land) {
      return res.status(404).json({
        success: false,
        message: 'Land not found'
      });
    }

    // Update land status
    land.currentStatus = 'DISPUTED';
    await land.save();

    // Create notification for owner
    await Notification.create({
      userId: land.ownerId,
      title: 'Land Marked as Disputed',
      message: `Your land ${land.surveyNumber} has been marked as disputed. Reason: ${reason}`,
      type: 'warning',
      relatedEntity: 'land',
      entityId: land.landId
    });

    // Create transaction record
    await Transaction.create({
      type: 'DISPUTE',
      landId: land.landId,
      initiatedBy: req.user._id,
      affectedParties: [land.ownerId],
      details: `Land marked as disputed. Reason: ${reason}`
    });

    res.status(200).json({
      success: true,
      message: 'Land marked as disputed successfully',
      land
    });
  } catch (error) {
    console.error('Mark Land Disputed Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking land as disputed: ' + error.message
    });
  }
};

// Resolve land dispute
exports.resolveLandDispute = async (req, res) => {
  try {
    const { landId } = req.body;

    const land = await Land.findOne({ landId });

    if (!land) {
      return res.status(404).json({
        success: false,
        message: 'Land not found'
      });
    }

    if (land.currentStatus !== 'DISPUTED') {
      return res.status(400).json({
        success: false,
        message: 'Land is not marked as disputed'
      });
    }

    // Update land status to ACTIVE
    land.currentStatus = 'ACTIVE';
    await land.save();

    // Create notification for owner
    await Notification.create({
      userId: land.ownerId,
      title: 'Land Dispute Resolved',
      message: `The dispute on your land ${land.surveyNumber} has been resolved`,
      type: 'success',
      relatedEntity: 'land',
      entityId: land.landId
    });

    // Create transaction record
    await Transaction.create({
      type: 'RESOLVE_DISPUTE',
      landId: land.landId,
      initiatedBy: req.user._id,
      affectedParties: [land.ownerId],
      details: `Land dispute resolved`
    });

    res.status(200).json({
      success: true,
      message: 'Land dispute resolved successfully',
      land
    });
  } catch (error) {
    console.error('Resolve Land Dispute Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error resolving land dispute: ' + error.message
    });
  }
};

// Get statistics
exports.getStatistics = async (req, res) => {
  try {
    const totalLands = await Land.countDocuments();
    const activeLands = await Land.countDocuments({ currentStatus: 'ACTIVE' });
    const lockedLands = await Land.countDocuments({ currentStatus: 'LOCKED' });
    const disputedLands = await Land.countDocuments({ currentStatus: 'DISPUTED' });
    const pendingTransfers = await Land.countDocuments({ currentStatus: 'PENDING_TRANSFER' });

    res.status(200).json({
      success: true,
      statistics: {
        totalLands,
        activeLands,
        lockedLands,
        disputedLands,
        pendingTransfers
      }
    });
  } catch (error) {
    console.error('Get Statistics Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics: ' + error.message
    });
  }
};
// ─────────────────────────────────────────────────────────
// GET PENDING REGISTRATIONS
// ─────────────────────────────────────────────────────────
exports.getPendingRegistrations = async (req, res) => {
  try {
    const lands = await Land.find({ currentStatus: 'PENDING_VERIFICATION' }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, lands });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────
// APPROVE LAND REGISTRATION — creates on blockchain
// ─────────────────────────────────────────────────────────
exports.approveLandRegistration = async (req, res) => {
  try {
    const { landId } = req.body;
    const land = await Land.findOne({ landId });
    if (!land) return res.status(404).json({ success: false, message: 'Land not found' });
    // Allow approval/verification for any land status

    // ── BLOCKCHAIN: Register land on Fabric (skip if already exists) ──
    let blockchainTxId = null;
    try {
      const { createLandOnBlockchain, queryLand } = require('../services/blockchainService');
      // Check if already on blockchain
      let alreadyExists = false;
      try {
        await queryLand(land.landId);
        alreadyExists = true;
        console.log(`ℹ️ Land ${land.landId} already on blockchain — skipping createLand`);
      } catch (qErr) {
        alreadyExists = false;
      }
      if (!alreadyExists) {
        const bcResult = await createLandOnBlockchain({
          landId:       land.landId,
          ownerName:    land.ownerName,
          ownerAadhaar: land.ownerAadhaar || '',
          areaSqFt:     land.areaSqFt,
          landType:     land.landType,
          marketValue:  land.marketValue,
          district:     land.location?.district || '',
          state:        land.location?.state || ''
        });
        blockchainTxId = bcResult.txId;
        console.log(`✅ Blockchain: Land ${landId} registered. TxID: ${blockchainTxId}`);
      }
    } catch (bcErr) {
      console.warn('⚠️ Blockchain registration failed:', bcErr.message);
    }

    land.currentStatus = 'ACTIVE';
    land.approvedBy = req.user._id.toString();
    land.approvalDate = new Date();
    if (blockchainTxId) land.blockchainTxId = blockchainTxId;
    await land.save();

    // Notify citizen
    const Notification = require('../models/Notification');
    await Notification.create({
      userId: land.ownerUserId,
      title: 'Land Registration Approved ✅',
      message: `Your land registration for survey number ${land.surveyNumber} has been approved by revenue officer.`,
      type: 'success',
      relatedEntity: 'land',
      entityId: land.landId
    });

    const Transaction = require('../models/Transaction');
    await Transaction.create({
      type: 'CREATE',
      landId: land.landId,
      initiatedBy: req.user._id,
      details: `Land registration approved by ${req.user.fullName}. Blockchain TxID: ${blockchainTxId || 'N/A'}`
    });

    res.status(200).json({ success: true, message: 'Land registration approved and recorded on blockchain', land, blockchainTxId });
  } catch (error) {
    console.error('Approve Registration Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────
// REJECT LAND REGISTRATION
// ─────────────────────────────────────────────────────────
exports.rejectLandRegistration = async (req, res) => {
  try {
    const { landId, reason } = req.body;
    const land = await Land.findOne({ landId });
    if (!land) return res.status(404).json({ success: false, message: 'Land not found' });

    land.currentStatus = 'DISPUTED';
    land.rejectionReason = reason || 'Rejected by revenue officer';
    land.approvedBy = req.user._id.toString();
    land.approvalDate = new Date();
    await land.save();

    const Notification = require('../models/Notification');
    await Notification.create({
      userId: land.ownerUserId,
      title: 'Land Registration Rejected ❌',
      message: `Your land registration for survey number ${land.surveyNumber} was rejected. Reason: ${reason || 'Not specified'}`,
      type: 'error',
      relatedEntity: 'land',
      entityId: land.landId
    });

    res.status(200).json({ success: true, message: 'Land registration rejected', land });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
