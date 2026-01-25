const OTP = require('../models/OTP');

class OTPService {
  constructor() {
    // Check if Twilio credentials are provided
    this.twilioEnabled = process.env.TWILIO_ACCOUNT_SID && 
                         process.env.TWILIO_ACCOUNT_SID.startsWith('AC') &&
                         process.env.TWILIO_AUTH_TOKEN;
    
    if (this.twilioEnabled) {
      const twilio = require('twilio');
      this.client = twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      );
      console.log('Twilio SMS service enabled');
    } else {
      console.log('Twilio not configured - OTPs will be logged to console');
    }
  }
  
  // Generate 6-digit OTP
  generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
  
  // Send OTP via SMS
  async sendOTP(mobileNumber) {
    try {
      const otp = this.generateOTP();
      
      // Save OTP to database
      await OTP.create({
        mobileNumber,
        otp
      });
      
      // Send SMS if Twilio is configured
      if (this.twilioEnabled) {
        try {
          await this.client.messages.create({
            body: `Your Land Registry verification OTP is: ${otp}. Valid for 5 minutes.`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: `+91${mobileNumber}`
          });
          console.log(`OTP sent via SMS to ${mobileNumber}`);
        } catch (smsError) {
          console.error('SMS sending failed:', smsError.message);
          // Continue anyway - OTP is saved in DB
        }
      }
      
      // For development: ALWAYS log OTP to console
      console.log(`\n🔐 OTP for ${mobileNumber}: ${otp}\n`);
      
      return { success: true, message: 'OTP sent successfully' };
    } catch (error) {
      console.error('OTP Send Error:', error);
      throw new Error('Failed to send OTP');
    }
  }
  
  // Verify OTP
  async verifyOTP(mobileNumber, otp) {
    try {
      const otpRecord = await OTP.findOne({
        mobileNumber,
        otp
      }).sort({ createdAt: -1 });
      
      if (!otpRecord) {
        return { success: false, message: 'Invalid OTP' };
      }
      
      // Delete OTP after verification
      await OTP.deleteOne({ _id: otpRecord._id });
      
      return { success: true, message: 'OTP verified successfully' };
    } catch (error) {
      console.error('OTP Verify Error:', error);
      throw new Error('Failed to verify OTP');
    }
  }
}

module.exports = new OTPService();
