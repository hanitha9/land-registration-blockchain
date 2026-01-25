// Simple mock OCR service for development
exports.verifyAadhaar = async (imagePath, fullName, aadhaarNumber) => {
  console.log('📄 Verifying Aadhaar:', { imagePath, fullName, aadhaarNumber });
  
  if (!aadhaarNumber || aadhaarNumber.length !== 12) {
    return { success: false, message: 'Invalid Aadhaar number format' };
  }

  return {
    success: true,
    message: 'Aadhaar verified successfully',
    data: { name: fullName, aadhaarNumber }
  };
};

exports.verifyPan = async (imagePath, fullName, panNumber) => {
  console.log('📄 Verifying PAN:', { imagePath, fullName, panNumber });
  
  if (!panNumber || panNumber.length !== 10) {
    return { success: false, message: 'Invalid PAN number format' };
  }

  return {
    success: true,
    message: 'PAN verified successfully',
    data: { name: fullName, panNumber }
  };
};
