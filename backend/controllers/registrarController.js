const TransferRequest = require('../models/TransferRequest');
const Land = require('../models/Land');
const User = require('../models/User');
const Notification = require('../models/Notification');
const Transaction = require('../models/Transaction');

// Get pending transfer requests
exports.getPendingTransfers = async (req, res) => {
  try {
    const transfers = await TransferRequest.find({ status: 'PENDING' })
      .populate('sellerId buyerId', 'fullName aadhaarNumber')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: transfers.length, transfers });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching pending transfers: ' + error.message });
  }
};

// Get transfer history
exports.getTransferHistory = async (req, res) => {
  try {
    const transfers = await TransferRequest.find({ status: { $in: ['APPROVED', 'REJECTED', 'BLOCKED'] } })
      .sort({ createdAt: -1 })
      .populate('sellerId buyerId', 'fullName aadhaarNumber');
    res.status(200).json({ success: true, count: transfers.length, transfers });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching transfer history: ' + error.message });
  }
};

// Verify transfer eligibility
exports.verifyTransfer = async (req, res) => {
  try {
    const { transferId } = req.params;
    const transferRequest = await TransferRequest.findById(transferId);
    if (!transferRequest) return res.status(404).json({ success: false, message: 'Transfer request not found' });

    const land = await Land.findOne({ landId: transferRequest.landId });
    if (!land) return res.status(404).json({ success: false, message: 'Land not found' });

    const verification = {
      isSellerOwner: land.ownerId.toString() === transferRequest.sellerId.toString(),
      landStatus: land.currentStatus,
      isMortgaged: land.isMortgaged,
      hasDispute: land.currentStatus === 'DISPUTED'
    };

    res.status(200).json({ success: true, verification, transferRequest });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error verifying transfer: ' + error.message });
  }
};

// Approve transfer — calls blockchain transferOwnership
exports.approveTransfer = async (req, res) => {
  try {
    const { transferId } = req.body;
    const transferRequest = await TransferRequest.findById(transferId);
    if (!transferRequest) return res.status(404).json({ success: false, message: 'Transfer request not found' });
    if (transferRequest.status !== 'PENDING') return res.status(400).json({ success: false, message: 'Transfer is not pending' });

    const land = await Land.findOne({ landId: transferRequest.landId });
    if (!land) return res.status(404).json({ success: false, message: 'Land not found' });

    // FRAUD CHECK: block if actually mortgaged
    if (land.isMortgaged && land.encumbranceDetails?.bankName) {
      return res.status(400).json({
        success: false,
        blocked: true,
        reason: 'MORTGAGE',
        message: `🚫 FRAUD BLOCKED: Cannot transfer land — active mortgage with ${land.encumbranceDetails.bankName}. Loan Amount: ₹${land.encumbranceDetails.loanAmount?.toLocaleString()}. Clear the loan before transferring.`
      });
    }

    if (land.currentStatus === 'DISPUTED' && land.disputeDetails?.reason) {
      return res.status(400).json({
        success: false,
        blocked: true,
        reason: 'DISPUTE',
        message: `🚫 FRAUD BLOCKED: Cannot transfer land — active legal dispute: "${land.disputeDetails.reason}". Resolve the dispute first.`
      });
    }

    // BLOCKCHAIN: Transfer ownership on Fabric
    let blockchainTxId = null;
    try {
      const { transferOwnershipOnBlockchain } = require('../services/blockchainService');
      const bcResult = await transferOwnershipOnBlockchain(
        land.landId,
        transferRequest.buyerName,
        transferRequest.buyerAadhaar || '',
        transferRequest.salePrice
      );
      blockchainTxId = bcResult.txId;
      console.log(`✅ Blockchain: Ownership transferred for ${land.landId}. TxID: ${blockchainTxId}`);
    } catch (bcErr) {
      console.warn('⚠️ Blockchain transfer failed:', bcErr.message);
      // Check if chaincode also blocked it
      if (bcErr.message?.includes('LOCKED') || bcErr.message?.includes('mortgage')) {
        return res.status(400).json({
          success: false,
          blocked: true,
          reason: 'CHAINCODE',
          message: `🚫 FRAUD BLOCKED by Chaincode: ${bcErr.message}`
        });
      }
    }

    // Update transfer request
    transferRequest.status = 'APPROVED';
    transferRequest.registrarId = req.user._id;
    transferRequest.completedDate = new Date();
    transferRequest.blockchainTxId = blockchainTxId;
    await transferRequest.save();

    // Update land ownership in MongoDB
    land.previousOwners = land.previousOwners || [];
    land.previousOwners.push({
      ownerId: land.ownerId,
      name: land.ownerName,
      transferDate: new Date()
    });
    land.ownerId = transferRequest.buyerId.toString();
    land.ownerUserId = transferRequest.buyerId;
    land.ownerName = transferRequest.buyerName;
    land.ownerAadhaar = transferRequest.buyerAadhaar;
    land.currentStatus = 'ACTIVE';
    land.pendingTransfer = {};
    if (blockchainTxId) land.blockchainTxId = blockchainTxId;
    await land.save();

    // Notifications
    await Notification.create({
      userId: transferRequest.sellerId,
      title: 'Land Transfer Completed ✅',
      message: `Transfer of land ${land.surveyNumber} to ${transferRequest.buyerName} completed. TxID: ${blockchainTxId?.substring(0,20) || 'recorded'}`,
      type: 'success',
      relatedEntity: 'transfer',
      entityId: transferRequest.transferId
    });
    await Notification.create({
      userId: transferRequest.buyerId,
      title: 'Land Ownership Transferred ✅',
      message: `You are now the owner of land ${land.surveyNumber}. Recorded on blockchain.`,
      type: 'success',
      relatedEntity: 'transfer',
      entityId: transferRequest.transferId
    });

    // Transaction record
    await Transaction.create({
      type: 'TRANSFER',
      landId: land.landId,
      initiatedBy: req.user._id,
      affectedParties: [transferRequest.sellerId, transferRequest.buyerId],
      details: `Land transfer approved by registrar from ${transferRequest.sellerName} to ${transferRequest.buyerName}. Blockchain TxID: ${blockchainTxId}`
    });

    res.status(200).json({ success: true, message: 'Transfer approved and recorded on blockchain', transferRequest, blockchainTxId });
  } catch (error) {
    console.error('Approve Transfer Error:', error);
    res.status(500).json({ success: false, message: 'Error approving transfer: ' + error.message });
  }
};

// Reject transfer
exports.rejectTransfer = async (req, res) => {
  try {
    const { transferId, rejectionReason } = req.body;
    const transferRequest = await TransferRequest.findById(transferId);
    if (!transferRequest) return res.status(404).json({ success: false, message: 'Transfer request not found' });
    if (transferRequest.status !== 'PENDING') return res.status(400).json({ success: false, message: 'Transfer is not pending' });

    transferRequest.status = 'REJECTED';
    transferRequest.registrarId = req.user._id;
    transferRequest.completedDate = new Date();
    transferRequest.notes = rejectionReason;
    await transferRequest.save();

    const land = await Land.findOne({ landId: transferRequest.landId });
    if (land) {
      land.currentStatus = 'ACTIVE';
      land.pendingTransfer = {};
      await land.save();
    }

    await Notification.create({
      userId: transferRequest.sellerId,
      title: 'Land Transfer Rejected ❌',
      message: `Transfer of land ${land?.surveyNumber} was rejected. Reason: ${rejectionReason}`,
      type: 'error', relatedEntity: 'transfer', entityId: transferRequest.transferId
    });
    await Notification.create({
      userId: transferRequest.buyerId,
      title: 'Land Purchase Rejected ❌',
      message: `Your purchase of land ${land?.surveyNumber} was rejected. Reason: ${rejectionReason}`,
      type: 'error', relatedEntity: 'transfer', entityId: transferRequest.transferId
    });

    await Transaction.create({
      type: 'TRANSFER_REJECTION',
      landId: transferRequest.landId,
      initiatedBy: req.user._id,
      affectedParties: [transferRequest.sellerId, transferRequest.buyerId],
      details: `Land transfer rejected by registrar. Reason: ${rejectionReason}`
    });

    res.status(200).json({ success: true, message: 'Transfer rejected successfully', transferRequest });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error rejecting transfer: ' + error.message });
  }
};