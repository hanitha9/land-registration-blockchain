// backend/services/otpService.js
const OTP = require('../models/OTP');

class OTPService {
  constructor() {
    // ✅ FIX: Wrap in !!() to force boolean — original returned string/undefined not true/false
    this.twilioEnabled = !!(
      process.env.TWILIO_ACCOUNT_SID &&
      process.env.TWILIO_ACCOUNT_SID.startsWith('AC') &&
      process.env.TWILIO_AUTH_TOKEN &&
      process.env.TWILIO_PHONE_NUMBER
    );

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

  // Send OTP via SMS or console
  async sendOTP(mobileNumber, otp) {
    try {
      // ✅ FIX: Use findOneAndUpdate with upsert — prevents duplicate OTP records
      // Original used OTP.create() which stacked multiple records per number
      await OTP.findOneAndUpdate(
        { mobileNumber },
        { otp, createdAt: new Date() },
        { upsert: true, new: true }
      );

      // Send via Twilio if configured
      if (this.twilioEnabled) {
        try {
          await this.client.messages.create({
            body: `Your Land Registry verification OTP is: ${otp}. Valid for 5 minutes.`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: `+91${mobileNumber}`
          });
          console.log(`✅ OTP sent via SMS to +91${mobileNumber}`);
        } catch (smsError) {
          console.error('❌ SMS sending failed:', smsError.message);
          // Continue anyway — OTP is saved in DB
        }
      }

      // Always log to console in development
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
      const otpRecord = await OTP.findOne({ mobileNumber }).sort({ createdAt: -1 });

      if (!otpRecord) {
        return { success: false, message: 'OTP not found. Please request a new one.' };
      }

      // Check expiry — 5 minutes
      const otpAge = Date.now() - new Date(otpRecord.createdAt).getTime();
      if (otpAge > 5 * 60 * 1000) {
        await OTP.deleteOne({ _id: otpRecord._id });
        return { success: false, message: 'OTP expired. Please request a new one.' };
      }

      // ✅ FIX: .toString() on both sides prevents type mismatch ("123456" !== 123456)
      if (otpRecord.otp.toString() !== otp.toString()) {
        return { success: false, message: 'Invalid OTP. Please try again.' };
      }

      // Delete used OTP
      await OTP.deleteOne({ _id: otpRecord._id });

      return { success: true, message: 'OTP verified successfully' };
    } catch (error) {
      console.error('OTP Verify Error:', error);
      throw new Error('Failed to verify OTP');
    }
  }
}

// Export as singleton instance
module.exports = new OTPService();