require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const connectDB = require('./config/database');

const seedAuthority = async () => {
  try {
    await connectDB();
    
    // Check if authority already exists
    const existingAuthority = await User.findOne({ employeeId: 'AUTH001' });
    
    if (existingAuthority) {
      // Delete existing and recreate
      await User.deleteOne({ employeeId: 'AUTH001' });
      console.log('⚠️  Deleted existing authority account. Creating fresh one...');
    }

    // Create authority account
    // Password will be hashed by the User model's pre-save hook
    const authority = new User({
      userId: 'AUTH001',
      employeeId: 'AUTH001',
      role: 'AUTHORITY',
      fullName: 'Land Registry Authority',
      email: 'authority@landregistry.gov.in',
      password: 'Authority@123',  // Plain password - will be hashed by pre-save hook
      isActive: true,
      kycCompleted: true
    });

    await authority.save();

    console.log('');
    console.log('✅ Authority account created successfully!');
    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔐 AUTHORITY LOGIN CREDENTIALS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Employee ID  : AUTH001');
    console.log('Password     : Authority@123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating authority:', error.message);
    process.exit(1);
  }
};

seedAuthority();
