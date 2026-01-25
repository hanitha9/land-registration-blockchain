const LandRegistration = require('../models/LandRegistration');

// 1. Start a new land registration (create draft)
exports.startRegistration = async (req, res) => {
  try {
    console.log('\n=== Starting New Registration ===');
    console.log('User ID:', req.user._id);
    console.log('Registration Type:', req.body.registrationType);

    const registration = await LandRegistration.create({
      userId: req.user._id,
      registrationType: req.body.registrationType || 'WITHOUT_HISTORY',
      status: 'DRAFT'
    });

    console.log('✅ Draft created with ID:', registration._id);

    res.status(201).json({
      success: true,
      message: 'Registration draft created',
      data: registration
    });
  } catch (error) {
    console.error('❌ Start registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start registration: ' + error.message
    });
  }
};

// 2. Submit / update main details
exports.submitDetails = async (req, res) => {
  try {
    console.log('\n=== Submitting Land Details ===');
    console.log('Body:', JSON.stringify(req.body, null, 2));
    console.log('Files:', req.files);
    console.log('User ID:', req.user._id);

    // Get ID from body (FormData) or params
    const landRegistrationId = req.body.landRegistrationId || req.params.id;
    
    if (!landRegistrationId) {
      return res.status(400).json({
        success: false,
        message: 'Land registration ID is required'
      });
    }

    console.log('Looking for draft with ID:', landRegistrationId);

    // Find the draft
    const registration = await LandRegistration.findOne({
      _id: landRegistrationId,
      userId: req.user._id,
      status: 'DRAFT'
    });

    if (!registration) {
      console.log('Draft not found, checking if it exists at all...');
      const anyReg = await LandRegistration.findById(landRegistrationId);
      if (anyReg) {
        console.log('Found registration but:', {
          ownerId: anyReg.userId,
          requestUserId: req.user._id,
          status: anyReg.status
        });
      }

      return res.status(404).json({
        success: false,
        message: 'Draft not found or not owned by you'
      });
    }

    console.log('✅ Found draft:', registration._id);

    // Update basic fields
    if (req.body.surveyNumber) registration.surveyNumber = req.body.surveyNumber;
    if (req.body.claimedOwnerName) registration.claimedOwnerName = req.body.claimedOwnerName;
    if (req.body.landDescription) registration.landDescription = req.body.landDescription;

    // Parse JSON fields from FormData
    if (req.body.address) {
      try {
        registration.address = typeof req.body.address === 'string' 
          ? JSON.parse(req.body.address) 
          : req.body.address;
      } catch (e) {
        console.log('Address parse error:', e.message);
      }
    }

    if (req.body.measurements) {
      try {
        const measurements = typeof req.body.measurements === 'string'
          ? JSON.parse(req.body.measurements)
          : req.body.measurements;
        
        registration.measurements = {
          squareFeet: parseFloat(measurements.squareFeet) || 0,
          squareMeters: parseFloat(measurements.squareMeters) || 0,
          acres: parseFloat(measurements.acres) || 0,
          hectares: parseFloat(measurements.hectares) || 0
        };
      } catch (e) {
        console.log('Measurements parse error:', e.message);
      }
    }

    if (req.body.surroundingLands) {
      try {
        registration.surroundingLands = typeof req.body.surroundingLands === 'string'
          ? JSON.parse(req.body.surroundingLands)
          : req.body.surroundingLands;
      } catch (e) {
        console.log('Surrounding lands parse error:', e.message);
      }
    }

    // Handle file uploads
    if (req.files) {
      if (!registration.documents) registration.documents = {};

      if (req.files.ownerLivePhoto && req.files.ownerLivePhoto[0]) {
        registration.ownerLivePhoto = req.files.ownerLivePhoto[0].path;
      }
      if (req.files.landDocument && req.files.landDocument[0]) {
        registration.documents.landDocument = req.files.landDocument[0].path;
      }
      if (req.files.previousOwnerDocument && req.files.previousOwnerDocument[0]) {
        registration.documents.previousOwnerDocument = req.files.previousOwnerDocument[0].path;
      }
      if (req.files.ownershipProof && req.files.ownershipProof[0]) {
        registration.documents.ownershipProof = req.files.ownershipProof[0].path;
      }
      if (req.files.surveyMap && req.files.surveyMap[0]) {
        registration.documents.surveyMap = req.files.surveyMap[0].path;
      }
      if (req.files.landPhotos && req.files.landPhotos.length > 0) {
        registration.documents.landPhotos = req.files.landPhotos.map(f => f.path);
      }
    }

    // Calculate payment
    const squareFeet = registration.measurements?.squareFeet || 0;
    const baseAmount = squareFeet * 10; // Rs. 10 per sq ft
    const gstAmount = baseAmount * 0.18;
    const totalAmount = baseAmount + gstAmount;

    registration.payment = {
      ...registration.payment,
      baseAmount,
      gstAmount,
      totalAmount,
      status: 'PENDING'
    };

    // Check if ready for submission
    if (registration.isReadyForSubmission && registration.isReadyForSubmission()) {
      registration.status = 'PENDING_PAYMENT';
      registration.submittedAt = new Date();
    }

    await registration.save();

    console.log('✅ Registration saved, status:', registration.status);

    res.json({
      success: true,
      message: 'Details submitted successfully',
      data: registration
    });
  } catch (error) {
    console.error('❌ Submit Details Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting details: ' + error.message
    });
  }
};

// 3. Get my registrations
exports.getMyRegistrations = async (req, res) => {
  try {
    const registrations = await LandRegistration.find({ userId: req.user._id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: registrations.length,
      data: registrations
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 4. Get single registration
exports.getRegistration = async (req, res) => {
  try {
    const registration = await LandRegistration.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!registration) {
      return res.status(404).json({ success: false, message: 'Registration not found' });
    }

    res.json({ success: true, data: registration });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 5. Make payment
exports.makePayment = async (req, res) => {
  try {
    const { paymentMethod, transactionId, bankName } = req.body;
    
    console.log('\n=== Processing Payment ===');
    console.log('Registration ID:', req.params.id);
    
    const registration = await LandRegistration.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Land registration not found'
      });
    }

    registration.payment.status = 'COMPLETED';
    registration.payment.paidAt = new Date();
    registration.payment.paymentMethod = paymentMethod;
    registration.payment.transactionId = transactionId;
    registration.payment.bankName = bankName;
    
    if (req.file) {
      registration.payment.paymentProof = req.file.path;
    }
    
    registration.status = 'PENDING_MEETING';

    await registration.save();

    console.log('✅ Payment recorded successfully');

    res.status(200).json({
      success: true,
      message: 'Payment recorded successfully',
      data: registration
    });
  } catch (error) {
    console.error('❌ Payment Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing payment: ' + error.message
    });
  }
};

// 6. Get payment details
exports.getPaymentDetails = async (req, res) => {
  try {
    const registration = await LandRegistration.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found'
      });
    }

    res.json({
      success: true,
      data: {
        registrationId: registration._id,
        surveyNumber: registration.surveyNumber,
        measurements: registration.measurements,
        payment: registration.payment,
        status: registration.status
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
