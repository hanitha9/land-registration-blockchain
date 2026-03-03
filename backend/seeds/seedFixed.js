// backend/seeds/seedFixed.js
// Run: MONGO_URI="mongodb://admin:admin123@localhost:27017/landregistry?authSource=admin" node seeds/seedFixed.js
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Land = require('../models/Land');
const LoanRequest = require('../models/LoanRequest');
const TransferRequest = require('../models/TransferRequest');
const Notification = require('../models/Notification');
const Transaction = require('../models/Transaction');

const hash = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

const seedDatabase = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://admin:admin123@localhost:27017/landregistry?authSource=admin';
    await mongoose.connect(mongoURI);
    console.log('✅ MongoDB Connected');

    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Land.deleteMany({});
    await LoanRequest.deleteMany({});
    await TransferRequest.deleteMany({});
    await Notification.deleteMany({});
    await Transaction.deleteMany({});
    console.log('✅ Existing data cleared');

    console.log('Seeding users...');
    const users = [
      // Citizens
      {
        userId: "USR_CIT_001",
        fullName: "Hanitha Ganisetti", role: "citizen",
        aadhaarNumber: "243107701114", aadhaarVerified: true,
        aadhaarDocument: "seeded/aadhaar/citizen1.jpg",
        panNumber: "ABCDE1234F", panVerified: true,
        panDocument: "seeded/pan/citizen1.jpg",
        mobileNumber: "9876543210", mobileVerified: true,
        email: "hanitha@example.com", dateOfBirth: new Date("1990-05-15"),
        maritalStatus: "Single", occupation: "Software Engineer",
        address: { street: "123 Main St", village: "Madhapur", city: "Hyderabad", district: "Hyderabad", state: "Telangana", pincode: "500081" },
        password: await hash("Test@1234"), kycCompleted: true, isActive: true
      },
      {
        userId: "USR_CIT_002",
        fullName: "Ravi Kumar Sharma", role: "citizen",
        aadhaarNumber: "354218812225", aadhaarVerified: true,
        aadhaarDocument: "seeded/aadhaar/citizen2.jpg",
        panNumber: "FGHIJ5678G", panVerified: true,
        panDocument: "seeded/pan/citizen2.jpg",
        mobileNumber: "9876543211", mobileVerified: true,
        email: "ravi@example.com", dateOfBirth: new Date("1985-08-20"),
        maritalStatus: "Married", occupation: "Business Owner",
        address: { street: "456 Oak Ave", village: "Gachibowli", city: "Hyderabad", district: "Hyderabad", state: "Telangana", pincode: "500032" },
        password: await hash("Test@1234"), kycCompleted: true, isActive: true
      },
      {
        userId: "USR_CIT_003",
        fullName: "Priya Reddy", role: "citizen",
        aadhaarNumber: "465329923336", aadhaarVerified: true,
        aadhaarDocument: "seeded/aadhaar/citizen3.jpg",
        panNumber: "KLMNO9012H", panVerified: true,
        panDocument: "seeded/pan/citizen3.jpg",
        mobileNumber: "9876543212", mobileVerified: true,
        email: "priya@example.com", dateOfBirth: new Date("1992-12-10"),
        maritalStatus: "Married", occupation: "Doctor",
        address: { street: "789 Pine Rd", village: "Jubilee Hills", city: "Hyderabad", district: "Hyderabad", state: "Telangana", pincode: "500033" },
        password: await hash("Test@1234"), kycCompleted: true, isActive: true
      },
      {
        userId: "USR_CIT_004",
        fullName: "Arun Krishnan", role: "citizen",
        aadhaarNumber: "576430034447", aadhaarVerified: true,
        aadhaarDocument: "seeded/aadhaar/citizen4.jpg",
        panNumber: "PQRST3456I", panVerified: true,
        panDocument: "seeded/pan/citizen4.jpg",
        mobileNumber: "9876543213", mobileVerified: true,
        email: "arun@example.com", dateOfBirth: new Date("1988-03-25"),
        maritalStatus: "Single", occupation: "Teacher",
        address: { street: "101 Maple Dr", village: "Vijayawada", city: "Vijayawada", district: "Krishna", state: "Andhra Pradesh", pincode: "520001" },
        password: await hash("Test@1234"), kycCompleted: true, isActive: true
      },
      {
        userId: "USR_CIT_005",
        fullName: "Lakshmi Devi", role: "citizen",
        aadhaarNumber: "687541145558", aadhaarVerified: true,
        aadhaarDocument: "seeded/aadhaar/citizen5.jpg",
        panNumber: "UVWXY7890J", panVerified: true,
        panDocument: "seeded/pan/citizen5.jpg",
        mobileNumber: "9876543214", mobileVerified: true,
        email: "lakshmi@example.com", dateOfBirth: new Date("1980-07-30"),
        maritalStatus: "Widowed", occupation: "Retired",
        address: { street: "202 Elm St", village: "Guntur", city: "Guntur", district: "Guntur", state: "Andhra Pradesh", pincode: "522001" },
        password: await hash("Test@1234"), kycCompleted: true, isActive: true
      },
      {
        userId: "USR_CIT_006",
        fullName: "Suresh Babu", role: "citizen",
        aadhaarNumber: "798652256669", aadhaarVerified: true,
        aadhaarDocument: "seeded/aadhaar/citizen6.jpg",
        panNumber: "ZABCD1234K", panVerified: true,
        panDocument: "seeded/pan/citizen6.jpg",
        mobileNumber: "9876543215", mobileVerified: true,
        email: "suresh@example.com", dateOfBirth: new Date("1975-11-12"),
        maritalStatus: "Married", occupation: "Farmer",
        address: { street: "303 Cedar Ln", village: "Kukatpally", city: "Hyderabad", district: "Hyderabad", state: "Telangana", pincode: "500072" },
        password: await hash("Test@1234"), kycCompleted: true, isActive: true
      },
      {
        userId: "USR_CIT_007",
        fullName: "Anita Kumari", role: "citizen",
        aadhaarNumber: "809763367770", aadhaarVerified: true,
        aadhaarDocument: "seeded/aadhaar/citizen7.jpg",
        panNumber: "EFGHI5678L", panVerified: true,
        panDocument: "seeded/pan/citizen7.jpg",
        mobileNumber: "9876543216", mobileVerified: true,
        email: "anita@example.com", dateOfBirth: new Date("1995-02-18"),
        maritalStatus: "Single", occupation: "Accountant",
        address: { street: "404 Birch Blvd", village: "Secunderabad", city: "Secunderabad", district: "Medchal", state: "Telangana", pincode: "500003" },
        password: await hash("Test@1234"), kycCompleted: true, isActive: true
      },
      {
        userId: "USR_CIT_008",
        fullName: "Venkat Rao", role: "citizen",
        aadhaarNumber: "910874478881", aadhaarVerified: true,
        aadhaarDocument: "seeded/aadhaar/citizen8.jpg",
        panNumber: "MNOPQ9012M", panVerified: true,
        panDocument: "seeded/pan/citizen8.jpg",
        mobileNumber: "9876543217", mobileVerified: true,
        email: "venkat@example.com", dateOfBirth: new Date("1982-09-05"),
        maritalStatus: "Married", occupation: "Architect",
        address: { street: "505 Spruce Way", village: "Tirupati", city: "Tirupati", district: "Chittoor", state: "Andhra Pradesh", pincode: "517501" },
        password: await hash("Test@1234"), kycCompleted: true, isActive: true
      },
      {
        userId: "USR_CIT_009",
        fullName: "Meera Singh", role: "citizen",
        aadhaarNumber: "101985589992", aadhaarVerified: true,
        aadhaarDocument: "seeded/aadhaar/citizen9.jpg",
        panNumber: "RSTUV3456N", panVerified: true,
        panDocument: "seeded/pan/citizen9.jpg",
        mobileNumber: "9876543218", mobileVerified: true,
        email: "meera@example.com", dateOfBirth: new Date("1993-04-22"),
        maritalStatus: "Single", occupation: "Lawyer",
        address: { street: "606 Willow Pl", village: "Nellore", city: "Nellore", district: "Sri Potti Sri Ramulu Nellore", state: "Andhra Pradesh", pincode: "524001" },
        password: await hash("Test@1234"), kycCompleted: true, isActive: true
      },
      {
        userId: "USR_CIT_010",
        fullName: "Rajesh Gupta", role: "citizen",
        aadhaarNumber: "212096690003", aadhaarVerified: true,
        aadhaarDocument: "seeded/aadhaar/citizen10.jpg",
        panNumber: "WXYZA7890O", panVerified: true,
        panDocument: "seeded/pan/citizen10.jpg",
        mobileNumber: "9876543219", mobileVerified: true,
        email: "rajesh@example.com", dateOfBirth: new Date("1987-01-14"),
        maritalStatus: "Married", occupation: "Engineer",
        address: { street: "707 Ash Ct", village: "Warangal", city: "Warangal", district: "Warangal", state: "Telangana", pincode: "506001" },
        password: await hash("Test@1234"), kycCompleted: true, isActive: true
      },
      // Officers
      {
        userId: "USR_OFF_001",
        fullName: "Revenue Officer 1", role: "revenue_officer",
        employeeId: "REV001", department: "Revenue Department", designation: "Officer",
        email: "revenue1@land.gov.in",
        password: await hash("Rev@123"), isActive: true
      },
      {
        userId: "USR_OFF_002",
        fullName: "Revenue Officer 2", role: "revenue_officer",
        employeeId: "REV002", department: "Revenue Department", designation: "Officer",
        email: "revenue2@land.gov.in",
        password: await hash("Rev@123"), isActive: true
      },
      {
        userId: "USR_OFF_003",
        fullName: "SBI Bank Manager", role: "bank_manager",
        employeeId: "SBI001", department: "Bank", designation: "Manager",
        bankId: "BANK_SBI", email: "sbimanager@bank.com",
        password: await hash("Bank@123"), isActive: true
      },
      {
        userId: "USR_OFF_004",
        fullName: "HDFC Bank Manager", role: "bank_manager",
        employeeId: "HDFC001", department: "Bank", designation: "Manager",
        bankId: "BANK_HDFC", email: "hdfcmanager@bank.com",
        password: await hash("Bank@123"), isActive: true
      },
      {
        userId: "USR_OFF_005",
        fullName: "Sub-Registrar", role: "sub_registrar",
        employeeId: "REG001", department: "Registration Department", designation: "Officer",
        email: "registrar@land.gov.in",
        password: await hash("Reg@123"), isActive: true
      },
      {
        userId: "USR_OFF_006",
        fullName: "System Admin", role: "admin",
        employeeId: "ADMIN001", department: "IT Department", designation: "Administrator",
        email: "admin@land.gov.in",
        password: await hash("Admin@123"), isActive: true
      }
    ];

    // Insert directly to bypass pre-save hook (passwords already hashed)
    for (const userData of users) {
      await User.collection.insertOne({ ...userData, createdAt: new Date() });
      console.log(`  ✅ ${userData.fullName} (${userData.role})`);
    }

    console.log('\n✅ All users seeded successfully!');
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('CITIZEN LOGIN:');
    console.log('  Aadhaar : 243107701114');
    console.log('  Password: Test@1234');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('OFFICER LOGINS:');
    console.log('  Revenue  : REV001   / Rev@123');
    console.log('  Bank SBI : SBI001   / Bank@123');
    console.log('  Bank HDFC: HDFC001  / Bank@123');
    console.log('  Registrar: REG001   / Reg@123');
    console.log('  Admin    : ADMIN001 / Admin@123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    process.exit(1);
  }
};

seedDatabase();