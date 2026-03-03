// OTP Service - Simple & Bulletproof
// For production, integrate Twilio, MSG91, or similar SMS provider

// Generate a 6-digit OTP
const generateOTP = () => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  console.log('Generated OTP:', otp);
  return otp;
};

// Send OTP - ALWAYS succeeds in development (just logs to console)
const sendOTP = async (mobileNumber, otp) => {
  console.log('\n' + '='.repeat(50));
  console.log('📱 OTP SERVICE - DEVELOPMENT MODE');
  console.log('='.repeat(50));
  console.log(`📞 Mobile Number: ${mobileNumber}`);
  console.log(`🔐 OTP Code: ${otp}`);
  console.log('='.repeat(50));
  console.log('⚠️  Copy this OTP and enter it in the frontend');
  console.log('='.repeat(50) + '\n');
  
  // In development, always return success
  // The OTP is logged above - user copies it manually
  return { success: true, message: 'OTP sent successfully' };
  
  /* 
  // PRODUCTION CODE - Uncomment when you have Twilio credentials
  
  const twilio = require('twilio');
  const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );
  
  await client.messages.create({
    body: `Your Land Registry OTP is: ${otp}. Valid for 5 minutes.`,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: `+91${mobileNumber}`
  });
  
  return { success: true, message: 'OTP sent via SMS' };
  */
};

// Verify OTP helper (optional - verification is done in authController)
const verifyOTPCode = (inputOTP, storedOTP) => {
  if (!inputOTP || !storedOTP) return false;
  return inputOTP.toString().trim() === storedOTP.toString().trim();
};

// Export individual functions (NOT a class)
module.exports = {
  generateOTP,
  sendOTP,
  verifyOTPCode
};