// backend/controllers/bankController.js
const LoanRequest = require('../models/LoanRequest');
const Land = require('../models/Land');
const User = require('../models/User');
const Notification = require('../models/Notification');
const Transaction = require('../models/Transaction');
const {
  approveLoanOnBlockchain,
  clearLoanOnBlockchain,
  createLandOnBlockchain
} = require('../services/blockchainService');
const BANK_NAMES = {
  'BANK_SBI':  'State Bank of India',
  'BANK_HDFC': 'HDFC Bank',
  'BANK_ICICI':'ICICI Bank',
  'BANK_AXIS': 'Axis Bank'
};

// ─────────────────────────────────────────────────────────
// VERIFY LAND OWNERSHIP
// ─────────────────────────────────────────────────────────
exports.verifyLandOwnership = async (req, res) => {
  try {
    const { landId } = req.params;
    const land = await Land.findOne({ landId });
    if (!land) return res.status(404).json({ success: false, message: 'Land not found' });

    res.status(200).json({
      success: true,
      verification: {
        isOwner:    true,
        landStatus: land.currentStatus,
        isMortgaged:land.isMortgaged,
        hasDispute: land.currentStatus === 'DISPUTED',
        marketValue:land.marketValue
      }
    });
  } catch (error) {
    console.error('Verify Land Ownership Error:', error);
    res.status(500).json({ success: false, message: 'Error verifying land: ' + error.message });
  }
};

// ─────────────────────────────────────────────────────────
// GET PENDING LOANS
// ─────────────────────────────────────────────────────────
exports.getPendingLoans = async (req, res) => {
  try {
    const loans = await LoanRequest.find({
      bankId: req.user.bankId,
      status: 'PENDING'
    }).sort({ requestDate: -1 });

    // Enrich each loan with live land data for the modal
    const enriched = await Promise.all(loans.map(async (loan) => {
      const land = await Land.findOne({ landId: loan.landId });
      return {
        ...loan.toObject(),
        landStatus:    land?.currentStatus   || 'ACTIVE',
        isMortgaged:   land?.isMortgaged     || false,
        hasDispute:    land?.currentStatus === 'DISPUTED',
        marketValue:   land?.marketValue     || 0,  // ← KEY FIX for LTV calculation
        landArea:      land?.areaSqFt        || 0,
        village:       land?.location?.village  || loan.landLocation?.village  || '',
        district:      land?.location?.district || loan.landLocation?.district || '',
      };
    }));

    res.status(200).json({ success: true, count: enriched.length, loans: enriched });
  } catch (error) {
    console.error('Get Pending Loans Error:', error);
    res.status(500).json({ success: false, message: 'Error fetching pending loans: ' + error.message });
  }
};

// ─────────────────────────────────────────────────────────
// GET ACTIVE MORTGAGES
// ─────────────────────────────────────────────────────────
exports.getActiveMortgages = async (req, res) => {
  try {
    const loans = await LoanRequest.find({
      bankId: req.user.bankId,
      status: 'APPROVED'
    }).sort({ approvalDate: -1 });

    const enriched = await Promise.all(loans.map(async (loan) => {
      const land = await Land.findOne({ landId: loan.landId });
      return {
        ...loan.toObject(),
        landStatus:  land?.currentStatus      || 'LOCKED',
        isMortgaged: land?.isMortgaged        || true,
        marketValue: land?.marketValue        || 0,
        landArea:    land?.areaSqFt           || 0,
        village:     land?.location?.village  || loan.landLocation?.village  || '',
        district:    land?.location?.district || loan.landLocation?.district || '',
      };
    }));

    res.status(200).json({ success: true, count: enriched.length, loans: enriched });
  } catch (error) {
    console.error('Get Active Mortgages Error:', error);
    res.status(500).json({ success: false, message: 'Error fetching active mortgages: ' + error.message });
  }
};

// ─────────────────────────────────────────────────────────
// GET CLEARED LOANS
// ─────────────────────────────────────────────────────────
exports.getClearedLoans = async (req, res) => {
  try {
    const loans = await LoanRequest.find({
      bankId: req.user.bankId,
      status: 'CLEARED'
    }).sort({ clearanceDate: -1 });

    const enriched = await Promise.all(loans.map(async (loan) => {
      const land = await Land.findOne({ landId: loan.landId });
      return {
        ...loan.toObject(),
        landStatus: land?.currentStatus      || 'ACTIVE',
        village:    land?.location?.village  || loan.landLocation?.village  || '',
        district:   land?.location?.district || loan.landLocation?.district || '',
      };
    }));

    res.status(200).json({ success: true, count: enriched.length, loans: enriched });
  } catch (error) {
    console.error('Get Cleared Loans Error:', error);
    res.status(500).json({ success: false, message: 'Error fetching cleared loans: ' + error.message });
  }
};

// ─────────────────────────────────────────────────────────
// GET REJECTED LOANS
// ─────────────────────────────────────────────────────────
exports.getRejectedLoans = async (req, res) => {
  try {
    const loans = await LoanRequest.find({
      bankId: req.user.bankId,
      status: 'REJECTED'
    }).sort({ requestDate: -1 });

    res.status(200).json({ success: true, count: loans.length, loans });
  } catch (error) {
    console.error('Get Rejected Loans Error:', error);
    res.status(500).json({ success: false, message: 'Error fetching rejected loans: ' + error.message });
  }
};

// ─────────────────────────────────────────────────────────
// APPROVE LOAN  ← FIXED
// ─────────────────────────────────────────────────────────
exports.approveLoan = async (req, res) => {
  try {
    const { requestId, approvedAmount } = req.body;

    if (!requestId)     return res.status(400).json({ success: false, message: 'Request ID is required' });
    if (!approvedAmount) return res.status(400).json({ success: false, message: 'Approved amount is required' });

    const loanRequest = await LoanRequest.findOne({ requestId, bankId: req.user.bankId });
    if (!loanRequest) return res.status(404).json({ success: false, message: 'Loan request not found' });
    if (loanRequest.status !== 'PENDING') return res.status(400).json({ success: false, message: 'Loan request is not in pending status' });

    const land = await Land.findOne({ landId: loanRequest.landId });
    if (!land) return res.status(404).json({ success: false, message: 'Land not found' });

    // FRAUD CHECK 1: MongoDB check
    if (land.isMortgaged && land.encumbranceDetails?.bankName) {
      return res.status(400).json({
        success: false,
        blocked: true,
        reason: 'MORTGAGE',
        message: `🚫 FRAUD BLOCKED: Land already has an active mortgage with ${land.encumbranceDetails.bankName}. Loan Amount: ₹${land.encumbranceDetails.loanAmount?.toLocaleString()}. Double financing is not allowed.`
      });
    }
    if (land.currentStatus === 'DISPUTED') {
      return res.status(400).json({
        success: false,
        blocked: true,
        reason: 'DISPUTE',
        message: `🚫 FRAUD BLOCKED: Land is under legal dispute — cannot approve loan.`
      });
    }
    // FRAUD CHECK 2: Blockchain check — verify on ledger
    try {
      const { queryLand } = require('../services/blockchainService');
      const bcResult = await queryLand(land.landId);
      const bcLand = bcResult.data;
      if (bcLand.isMortgaged === true || bcLand.isMortgaged === 'true') {
        return res.status(400).json({
          success: false,
          blocked: true,
          reason: 'BLOCKCHAIN_MORTGAGE',
          message: `🚫 FRAUD BLOCKED by Blockchain: Land ${land.landId} is recorded as MORTGAGED on Hyperledger Fabric ledger. Double financing rejected by chaincode.`
        });
      }
      if (bcLand.currentStatus === 'LOCKED') {
        return res.status(400).json({
          success: false,
          blocked: true,
          reason: 'BLOCKCHAIN_LOCKED',
          message: `🚫 FRAUD BLOCKED by Blockchain: Land ${land.landId} is LOCKED on Hyperledger Fabric ledger. Cannot approve another loan.`
        });
      }
    } catch (bcErr) {
      console.warn('⚠️ Blockchain verification warning:', bcErr.message);
      // Continue if blockchain check fails — MongoDB check already passed
    }

    const bankName = BANK_NAMES[req.user.bankId] || req.user.bankId;

    // Update loan request in MongoDB
    loanRequest.status         = 'APPROVED';
    loanRequest.approvedAmount = Number(approvedAmount);
    loanRequest.approvalDate   = new Date();
    await loanRequest.save();

    // ── BLOCKCHAIN: Lock land on Fabric ledger ──────────────
    let blockchainTxId = null;
    try {
      const bcResult = await approveLoanOnBlockchain(
        land.landId,
        req.user.bankId,
        bankName,
        loanRequest.requestId,
        Number(approvedAmount)
      );
      blockchainTxId = bcResult.txId;
      console.log(`✅ Blockchain approveLoan TxID: ${blockchainTxId}`);
    } catch (bcError) {
      console.error('❌ Blockchain approveLoan failed:', bcError.message);
      // Rollback MongoDB changes
      loanRequest.status = 'PENDING';
      loanRequest.approvedAmount = null;
      loanRequest.approvalDate = null;
      await loanRequest.save();
      return res.status(500).json({ success: false, message: 'Blockchain transaction failed: ' + bcError.message });
    }

    // Update MongoDB to match blockchain state
    land.currentStatus = 'LOCKED';
    land.isMortgaged   = true;
    land.encumbranceDetails = {
      bankId:        req.user.bankId,
      bankName:      bankName,
      loanId:        loanRequest.requestId,
      loanRequestId: loanRequest._id.toString(),
      loanAmount:    Number(approvedAmount),
      loanStatus:    'APPROVED',
      mortgageDate:  new Date(),
      blockchainTxId
    };
    await land.save();

    // Notify citizen
    await Notification.create({
      userId:        loanRequest.applicantUserId || loanRequest.applicantId,
      title:         '✅ Loan Approved',
      message:       `Your loan of ₹${Number(approvedAmount).toLocaleString('en-IN')} for land ${land.surveyNumber} has been approved by ${bankName}. Land is now LOCKED.`,
      type:          'success',
      relatedEntity: 'loan',
      entityId:      loanRequest.requestId
    });

    // FIX: use valid Transaction type 'MORTGAGE' not 'LOAN_APPROVAL'
    await Transaction.create({
      type:           'MORTGAGE',
      landId:         land.landId,
      initiatedBy:    req.user._id,
      affectedParties:[loanRequest.applicantUserId || loanRequest.applicantId],
      details:        `Loan approved by ${bankName} for ₹${approvedAmount}. Land ${land.landId} LOCKED.`
    });

    res.status(200).json({
      success: true,
      message: `Loan approved. Land ${land.surveyNumber} is now LOCKED on blockchain.`,
      loanRequest: loanRequest.toObject()
    });
  } catch (error) {
    console.error('Approve Loan Error:', error);
    res.status(500).json({ success: false, message: 'Error approving loan: ' + error.message });
  }
};

// ─────────────────────────────────────────────────────────
// REJECT LOAN
// ─────────────────────────────────────────────────────────
exports.rejectLoan = async (req, res) => {
  try {
    const { requestId, rejectionReason } = req.body;

    if (!requestId)       return res.status(400).json({ success: false, message: 'Request ID is required' });
    if (!rejectionReason) return res.status(400).json({ success: false, message: 'Rejection reason is required' });

    const loanRequest = await LoanRequest.findOne({ requestId, bankId: req.user.bankId });
    if (!loanRequest) return res.status(404).json({ success: false, message: 'Loan request not found' });
    if (loanRequest.status !== 'PENDING') return res.status(400).json({ success: false, message: 'Loan request is not in pending status' });

    loanRequest.status          = 'REJECTED';
    loanRequest.rejectionReason = rejectionReason;
    await loanRequest.save();

    await Notification.create({
      userId:        loanRequest.applicantUserId || loanRequest.applicantId,
      title:         '❌ Loan Rejected',
      message:       `Your loan application for land ${loanRequest.surveyNumber} was rejected. Reason: ${rejectionReason}`,
      type:          'error',
      relatedEntity: 'loan',
      entityId:      loanRequest.requestId
    });

    // FIX: use valid Transaction type 'LOAN_REJECTION'
    await Transaction.create({
      type:           'LOAN_REJECTION',
      landId:         loanRequest.landId,
      initiatedBy:    req.user._id,
      affectedParties:[loanRequest.applicantUserId || loanRequest.applicantId],
      details:        `Loan rejected. Reason: ${rejectionReason}`
    });

    res.status(200).json({ success: true, message: 'Loan rejected successfully', loanRequest });
  } catch (error) {
    console.error('Reject Loan Error:', error);
    res.status(500).json({ success: false, message: 'Error rejecting loan: ' + error.message });
  }
};

// ─────────────────────────────────────────────────────────
// CLEAR LOAN  ← FIXED
// ─────────────────────────────────────────────────────────
exports.clearLoan = async (req, res) => {
  try {
    const { loanId } = req.body;

    if (!loanId) return res.status(400).json({ success: false, message: 'Loan ID is required' });

    const loanRequest = await LoanRequest.findOne({ requestId: loanId, bankId: req.user.bankId });
    if (!loanRequest) return res.status(404).json({ success: false, message: 'Loan request not found' });
    if (loanRequest.status !== 'APPROVED') return res.status(400).json({ success: false, message: 'Loan is not in approved status' });

    const land = await Land.findOne({ landId: loanRequest.landId });
    if (!land) return res.status(404).json({ success: false, message: 'Land not found' });

    // Clear loan in MongoDB
    loanRequest.status        = 'CLEARED';
    loanRequest.clearanceDate = new Date();
    await loanRequest.save();

    // ── BLOCKCHAIN: Unlock land on Fabric ledger ────────────
    let blockchainTxId = null;
    try {
      const bcResult = await clearLoanOnBlockchain(land.landId, loanId);
      blockchainTxId = bcResult.txId;
      console.log(`✅ Blockchain clearLoan TxID: ${blockchainTxId}`);
    } catch (bcError) {
      console.error('❌ Blockchain clearLoan failed:', bcError.message);
      // Rollback
      loanRequest.status = 'APPROVED';
      loanRequest.clearanceDate = null;
      await loanRequest.save();
      return res.status(500).json({ success: false, message: 'Blockchain transaction failed: ' + bcError.message });
    }

    // Update MongoDB to match blockchain state
    land.currentStatus = 'ACTIVE';
    land.isMortgaged   = false;
    land.encumbranceDetails.loanStatus    = 'CLEARED';
    land.encumbranceDetails.clearanceDate = new Date();
    land.encumbranceDetails.clearanceTxId = blockchainTxId;
    await land.save();

    await Notification.create({
      userId:        loanRequest.applicantUserId || loanRequest.applicantId,
      title:         '🔓 Loan Cleared — Land Released',
      message:       `Your loan for land ${land.surveyNumber} has been cleared. The land is now ACTIVE and free for sale or new loan.`,
      type:          'success',
      relatedEntity: 'loan',
      entityId:      loanRequest.requestId
    });

    // FIX: use valid Transaction type 'CLEAR_MORTGAGE' not 'LOAN_CLEARANCE'
    await Transaction.create({
      type:           'CLEAR_MORTGAGE',
      landId:         land.landId,
      initiatedBy:    req.user._id,
      affectedParties:[loanRequest.applicantUserId || loanRequest.applicantId],
      details:        `Loan ${loanId} cleared. Land ${land.landId} released — status ACTIVE.`
    });

    res.status(200).json({
      success: true,
      message: `Loan cleared. Land ${land.surveyNumber} is now ACTIVE and released from mortgage.`,
      loanRequest: loanRequest.toObject()
    });
  } catch (error) {
    console.error('Clear Loan Error:', error);
    res.status(500).json({ success: false, message: 'Error clearing loan: ' + error.message });
  }
};