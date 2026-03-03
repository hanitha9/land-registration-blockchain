// backend/controllers/landController.js
const Land = require('../models/Land');
const User = require('../models/User');
const Notification = require('../models/Notification');
const Transaction = require('../models/Transaction');

let blockchainService = null;
try {
  blockchainService = require('../services/blockchainService').blockchainService;
} catch (e) {
  console.warn('Blockchain service not available — running without blockchain');
}

// ─────────────────────────────────────────────────────────
// REQUEST LAND REGISTRATION (citizen submits)
// ─────────────────────────────────────────────────────────
exports.requestLandRegistration = async (req, res) => {
  try {
    console.log('\n=== Request Land Registration ===');
    console.log('Body:', req.body);
    console.log('Files:', req.files);
    console.log('User:', req.user?._id, req.user?.fullName);

    const { surveyNumber, areaSqFt, landType, marketValue, description } = req.body;

    const location = {
      village:  req.body['location[village]']  || req.body.location?.village  || '',
      district: req.body['location[district]'] || req.body.location?.district || '',
      state:    req.body['location[state]']    || req.body.location?.state    || '',
      pincode:  req.body['location[pincode]']  || req.body.location?.pincode  || '',
    };

    if (!surveyNumber)                        return res.status(400).json({ success: false, message: 'Survey number is required' });
    if (!areaSqFt)                            return res.status(400).json({ success: false, message: 'Area is required' });
    if (!marketValue)                         return res.status(400).json({ success: false, message: 'Market value is required' });
    if (!location.district || !location.state) return res.status(400).json({ success: false, message: 'District and state are required' });

    const existing = await Land.findOne({ surveyNumber });
    if (existing) return res.status(400).json({ success: false, message: `Survey number ${surveyNumber} is already registered` });

    const documents = [];
    if (req.files?.landDocument?.[0]) {
      documents.push({
        docType: 'land_document',
        docPath: req.files.landDocument[0].path,
        uploadedBy: req.user._id.toString(),
        description: 'Land document uploaded by citizen'
      });
    }

    const landPhotos = [];
    if (req.files?.landPhotos) {
      req.files.landPhotos.forEach(photo => landPhotos.push(photo.path));
    }

    const land = await Land.create({
      surveyNumber,
      ownerId: req.user._id.toString(),
      ownerUserId: req.user._id,
      ownerName: req.user.fullName,
      ownerAadhaar: req.user.aadhaarNumber,
      ownerMobile: req.user.mobileNumber,
      location,
      areaSqFt: Number(areaSqFt),
      landType: landType || 'Residential',
      marketValue: Number(marketValue),
      currentStatus: 'PENDING_VERIFICATION',
      documents,
      landPhotos,
      description: description || '',
      createdBy: req.user._id.toString(),
      createdByRole: 'citizen',
      registrationDate: new Date()
    });

    console.log('✅ Land registration request created:', land.landId);

    const revenueOfficers = await User.find({ role: 'revenue_officer', isActive: true });
    for (const officer of revenueOfficers) {
      await Notification.create({
        userId: officer._id,
        title: 'New Land Registration Request',
        message: `${req.user.fullName} submitted a registration request for survey number ${surveyNumber}`,
        type: 'info',
        relatedEntity: 'land',
        entityId: land.landId
      });
    }

    await Notification.create({
      userId: req.user._id,
      title: 'Registration Request Submitted',
      message: `Your land registration request for survey number ${surveyNumber} is pending revenue officer verification.`,
      type: 'success',
      relatedEntity: 'land',
      entityId: land.landId
    });

    await Transaction.create({
      type: 'CREATE',
      landId: land.landId,
      initiatedBy: req.user._id,
      affectedParties: [],
      details: `Land registration request submitted by ${req.user.fullName} for survey number ${surveyNumber}`
    });

    res.status(201).json({
      success: true,
      message: 'Land registration request submitted successfully! Pending revenue officer verification.',
      land: {
        landId: land.landId,
        surveyNumber: land.surveyNumber,
        currentStatus: land.currentStatus,
        location: land.location,
        areaSqFt: land.areaSqFt,
        marketValue: land.marketValue
      }
    });
  } catch (error) {
    console.error('Request Land Registration Error:', error);
    res.status(500).json({ success: false, message: 'Error submitting registration request: ' + error.message });
  }
};

// ─────────────────────────────────────────────────────────
// GET MY LANDS
// ─────────────────────────────────────────────────────────
exports.getMyLands = async (req, res) => {
  try {
    const lands = await Land.find({ ownerId: req.user._id.toString() }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: lands.length, lands });
  } catch (error) {
    console.error('Get My Lands Error:', error);
    res.status(500).json({ success: false, message: 'Error fetching lands: ' + error.message });
  }
};

// ─────────────────────────────────────────────────────────
// GET SINGLE LAND
// ─────────────────────────────────────────────────────────
exports.getLand = async (req, res) => {
  try {
    const land = await Land.findOne({ landId: req.params.landId, ownerId: req.user._id.toString() });
    if (!land) return res.status(404).json({ success: false, message: 'Land not found or you do not have access to it' });
    res.status(200).json({ success: true, land });
  } catch (error) {
    console.error('Get Land Error:', error);
    res.status(500).json({ success: false, message: 'Error fetching land: ' + error.message });
  }
};

// ─────────────────────────────────────────────────────────
// GET LAND HISTORY
// ─────────────────────────────────────────────────────────
exports.getLandHistory = async (req, res) => {
  try {
    const land = await Land.findOne({ landId: req.params.landId, ownerId: req.user._id.toString() });
    if (!land) return res.status(404).json({ success: false, message: 'Land not found or you do not have access to it' });
    res.status(200).json({ success: true, history: land.previousOwners });
  } catch (error) {
    console.error('Get Land History Error:', error);
    res.status(500).json({ success: false, message: 'Error fetching land history: ' + error.message });
  }
};

// ─────────────────────────────────────────────────────────
// INITIATE LAND SALE
// ─────────────────────────────────────────────────────────
exports.initiateSale = async (req, res) => {
  try {
    const { landId, buyerAadhaar, buyerName, salePrice } = req.body;

    const land = await Land.findOne({ landId, ownerId: req.user._id.toString() });
    if (!land) return res.status(404).json({ success: false, message: 'Land not found or you do not own it' });

    // Allow all lands — sub-registrar will verify eligibility on blockchain
    // Mortgaged lands CAN be submitted — sub-registrar + blockchain will block if needed

    let buyer = await User.findOne({ aadhaarNumber: buyerAadhaar });
    let newAccountCreated = false;
    if (!buyer) {
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('Welcome@1234', 10);
      buyer = new User({
        fullName: buyerName,
        aadhaarNumber: buyerAadhaar,
        password: hashedPassword,
        role: 'citizen',
        isActive: true,
        requiresProfileCompletion: true,
        kycCompleted: false,
        // Dummy values to pass validation — buyer must complete profile on first login
        mobileNumber: '0000000000',
        panNumber: 'AAAAA0000A',
        aadhaarDocument: 'pending',
        panDocument: 'pending',
        dateOfBirth: new Date('1990-01-01'),
        maritalStatus: 'Single'
      });
      await buyer.save({ validateBeforeSave: false });
      newAccountCreated = true;
      console.log('✅ Auto-created citizen account for buyer:', buyerName, buyerAadhaar);
    }

    land.pendingTransfer = {
      buyerId: buyer._id.toString(),
      buyerName,
      buyerAadhaar,
      salePrice,
      initiatedDate: new Date()
    };
    land.currentStatus = 'PENDING_TRANSFER';
    await land.save();

    const TransferRequest = require('../models/TransferRequest');
    const transferRequest = await TransferRequest.create({
      landId: land.landId,
      surveyNumber: land.surveyNumber,
      sellerId: req.user._id,
      sellerName: req.user.fullName,
      sellerAadhaar: req.user.aadhaarNumber,
      buyerId: buyer._id,
      buyerName,
      buyerAadhaar,
      salePrice,
      initiatedDate: new Date()
    });

    await Notification.create({
      userId: req.user._id,
      title: 'Sale Initiated',
      message: `Sale of land ${land.surveyNumber} to ${buyerName} is pending registrar approval`,
      type: 'info',
      relatedEntity: 'transfer',
      entityId: transferRequest.transferId
    });

    await Notification.create({
      userId: buyer._id,
      title: 'Land Sale Offer',
      message: `${req.user.fullName} wants to sell land ${land.surveyNumber} to you for ₹${Number(salePrice).toLocaleString()}`,
      type: 'info',
      relatedEntity: 'transfer',
      entityId: transferRequest.transferId
    });

    await Transaction.create({
      type: 'TRANSFER',
      landId: land.landId,
      initiatedBy: req.user._id,
      affectedParties: [buyer._id],
      details: `Sale initiated by ${req.user.fullName} to ${buyerName} for ₹${salePrice}`
    });

    res.status(200).json({
      success: true,
      message: 'Sale initiated successfully. Awaiting sub-registrar approval.',
      transferRequest,
      newAccountCreated,
      newBuyerCredentials: newAccountCreated ? {
        aadhaar: buyerAadhaar,
        password: 'Welcome@1234',
        note: 'Share these credentials with the buyer. They can change password after first login.'
      } : null
    });
  } catch (error) {
    console.error('Initiate Sale Error:', error);
    res.status(500).json({ success: false, message: 'Error initiating sale: ' + error.message });
  }
};

// ─────────────────────────────────────────────────────────
// APPLY FOR LOAN  ← FIXED
// ─────────────────────────────────────────────────────────

// Bank name map — frontend sends bankId, we resolve the display name
const BANK_NAMES = {
  'BANK_SBI':  'State Bank of India',
  'BANK_HDFC': 'HDFC Bank',
  'BANK_ICICI':'ICICI Bank',
  'BANK_AXIS': 'Axis Bank'
};

exports.applyLoan = async (req, res) => {
  try {
    console.log('\n=== Apply Loan ===');
    console.log('Body:', req.body);
    console.log('User:', req.user?._id, req.user?.fullName);

    const { landId, bankId, requestedAmount, purpose } = req.body;

    // Validate inputs
    if (!landId)           return res.status(400).json({ success: false, message: 'Land ID is required' });
    if (!bankId)           return res.status(400).json({ success: false, message: 'Bank is required' });
    if (!requestedAmount)  return res.status(400).json({ success: false, message: 'Loan amount is required' });
    if (!purpose)          return res.status(400).json({ success: false, message: 'Purpose is required' });

    // Verify land ownership
    const land = await Land.findOne({ landId, ownerId: req.user._id.toString() });
    if (!land) {
      return res.status(404).json({ success: false, message: 'Land not found or you do not own it' });
    }

    // Allow all loan applications — bank manager will verify on blockchain
    // Do NOT block here — fraud check happens at bank approval level

    // Find bank manager for this bank
    // FIX: query by bankId field on User, get actual bank name from map
    const bankManager = await User.findOne({ bankId: bankId, role: 'bank_manager' });
    const bankName = BANK_NAMES[bankId] || bankId;

    const LoanRequest = require('../models/LoanRequest');

    const loanRequest = await LoanRequest.create({
      landId: land.landId,
      landObjectId: land._id,
      surveyNumber: land.surveyNumber,
      landLocation: {
        village: land.location.village,
        district: land.location.district,
        state: land.location.state
      },
      landArea: land.areaSqFt,
      landMarketValue: land.marketValue,
      // FIX: applicantId must be String (model schema), not ObjectId
      applicantId: req.user._id.toString(),
      applicantUserId: req.user._id,
      applicantName: req.user.fullName,
      applicantAadhaar: req.user.aadhaarNumber,
      applicantMobile: req.user.mobileNumber,
      requestedAmount: Number(requestedAmount),
      purpose,
      bankId,
      // FIX: bankName from map, not bank manager's fullName
      bankName,
      assignedManagerId: bankManager ? bankManager._id.toString() : null,
      assignedManagerName: bankManager ? bankManager.fullName : null,
      status: 'PENDING',
      requestDate: new Date()
    });

    console.log('✅ Loan request created:', loanRequest.requestId);

    // Notify bank manager if one exists for this bank
    if (bankManager) {
      await Notification.create({
        userId: bankManager._id,
        title: 'New Loan Application',
        message: `${req.user.fullName} applied for a loan of ₹${Number(requestedAmount).toLocaleString()} on land ${land.surveyNumber}`,
        type: 'info',
        relatedEntity: 'loan',
        entityId: loanRequest.requestId
      });
    }

    // Notify citizen
    await Notification.create({
      userId: req.user._id,
      title: 'Loan Application Submitted',
      message: `Your loan application of ₹${Number(requestedAmount).toLocaleString()} for land ${land.surveyNumber} has been submitted to ${bankName}`,
      type: 'success',
      relatedEntity: 'loan',
      entityId: loanRequest.requestId
    });

    await Transaction.create({
      type: 'MORTGAGE',
      landId: land.landId,
      initiatedBy: req.user._id,
      affectedParties: bankManager ? [bankManager._id] : [],
      details: `Loan application submitted by ${req.user.fullName} to ${bankName} for ₹${requestedAmount}`
    });

    res.status(201).json({
      success: true,
      message: `Loan application submitted successfully to ${bankName}!`,
      loanRequest: {
        requestId: loanRequest.requestId,
        status: loanRequest.status,
        bankName,
        requestedAmount: loanRequest.requestedAmount,
        landId: loanRequest.landId,
        surveyNumber: loanRequest.surveyNumber
      }
    });
  } catch (error) {
    console.error('Apply Loan Error:', error);
    res.status(500).json({ success: false, message: 'Error applying for loan: ' + error.message });
  }
};
// ─────────────────────────────────────────────────────────
// GET LAND BY ID — with blockchain data (all roles)
// ─────────────────────────────────────────────────────────
exports.getLandById = async (req, res) => {
  try {
    const { landId } = req.params;

    // Citizens can only see their own lands
    // Officers/bank/registrar can see any land
    let query = { landId };
    if (req.user.role === 'citizen') {
      query.ownerId = req.user._id.toString();
    }

    const land = await Land.findOne(query);
    if (!land) return res.status(404).json({ success: false, message: 'Land not found or access denied' });

    // Fetch blockchain data
    let blockchainData = null;
    let history = [];
    try {
      const { queryLand, getLandHistoryFromBlockchain } = require('../services/blockchainService');
      const bcResult = await queryLand(landId);
      blockchainData = bcResult.data;
      const histResult = await getLandHistoryFromBlockchain(landId);
      history = histResult.history || [];
    } catch (bcErr) {
      console.warn('Blockchain fetch failed:', bcErr.message);
    }

    res.status(200).json({ success: true, land, blockchainData, history });
  } catch (error) {
    console.error('Get Land By ID Error:', error);
    res.status(500).json({ success: false, message: 'Error fetching land: ' + error.message });
  }
};

// ─────────────────────────────────────────────────────────
// GET LAND BY ID — with blockchain data (all roles)
// ─────────────────────────────────────────────────────────
exports.getLandById = async (req, res) => {
  try {
    const { landId } = req.params;

    let query = { landId };
    if (req.user.role === 'citizen') {
      query.ownerId = req.user._id.toString();
    }

    const land = await Land.findOne(query);
    if (!land) return res.status(404).json({ success: false, message: 'Land not found or access denied' });

    let blockchainData = null;
    let history = [];
    try {
      const { queryLand, getLandHistoryFromBlockchain } = require('../services/blockchainService');
      const bcResult = await queryLand(landId);
      blockchainData = bcResult.data;
      const histResult = await getLandHistoryFromBlockchain(landId);
      history = histResult.history || [];
    } catch (bcErr) {
      console.warn('Blockchain fetch failed:', bcErr.message);
    }

    res.status(200).json({ success: true, land, blockchainData, history });
  } catch (error) {
    console.error('Get Land By ID Error:', error);
    res.status(500).json({ success: false, message: 'Error fetching land: ' + error.message });
  }
};
