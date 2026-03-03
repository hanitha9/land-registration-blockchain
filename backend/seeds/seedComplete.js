/**
 * COMPLETE FIXED SEED SCRIPT
 * 
 * Run: node seeds/seedComplete.js --fresh
 * 
 * Fixes:
 * 1. Passwords properly hashed (uses .save() not insertMany)
 * 2. Real MongoDB _id captured and used in all related records
 * 3. All 25 lands, 12 loans, 10 transfers, transactions seeded correctly
 */

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

const seed = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://admin:admin123@localhost:27017/landregistry?authSource=admin';
    await mongoose.connect(mongoURI);
    console.log('✅ MongoDB Connected');

    // ─────────────────────────────────────────────
    // CLEAR EXISTING DATA
    // ─────────────────────────────────────────────
    console.log('\n🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Land.deleteMany({});
    await LoanRequest.deleteMany({});
    await TransferRequest.deleteMany({});
    await Notification.deleteMany({});
    await Transaction.deleteMany({});
    console.log('✅ All collections cleared');

    // ─────────────────────────────────────────────
    // SEED USERS (one by one to trigger pre-save password hashing)
    // ─────────────────────────────────────────────
    console.log('\n👤 Seeding users...');

    const citizenData = [
      { fullName: "Hanitha Ganisetti",  aadhaarNumber: "243107701114", panNumber: "ABCDE1234F", mobileNumber: "9876543210", email: "hanitha@example.com",  dateOfBirth: new Date("1990-05-15"), maritalStatus: "Single",  occupation: "Software Engineer", address: { street: "123 Main St",    village: "Madhapur",      city: "Hyderabad",      district: "Hyderabad",                    state: "Telangana",      pincode: "500081" }, password: "Test@1234" },
      { fullName: "Ravi Kumar Sharma",  aadhaarNumber: "354218812225", panNumber: "FGHIJ5678G", mobileNumber: "9876543211", email: "ravi@example.com",     dateOfBirth: new Date("1985-08-20"), maritalStatus: "Married", occupation: "Business Owner",    address: { street: "456 Oak Ave",    village: "Gachibowli",    city: "Hyderabad",      district: "Hyderabad",                    state: "Telangana",      pincode: "500032" }, password: "Test@1234" },
      { fullName: "Priya Reddy",        aadhaarNumber: "465329923336", panNumber: "KLMNO9012H", mobileNumber: "9876543212", email: "priya@example.com",    dateOfBirth: new Date("1992-12-10"), maritalStatus: "Married", occupation: "Doctor",            address: { street: "789 Pine Rd",    village: "Jubilee Hills", city: "Hyderabad",      district: "Hyderabad",                    state: "Telangana",      pincode: "500033" }, password: "Test@1234" },
      { fullName: "Arun Krishnan",      aadhaarNumber: "576430034447", panNumber: "PQRST3456I", mobileNumber: "9876543213", email: "arun@example.com",     dateOfBirth: new Date("1988-03-25"), maritalStatus: "Single",  occupation: "Teacher",           address: { street: "101 Maple Dr",   village: "Vijayawada",    city: "Vijayawada",     district: "Krishna",                      state: "Andhra Pradesh", pincode: "520001" }, password: "Test@1234" },
      { fullName: "Lakshmi Devi",       aadhaarNumber: "687541145558", panNumber: "UVWXY7890J", mobileNumber: "9876543214", email: "lakshmi@example.com",  dateOfBirth: new Date("1980-07-30"), maritalStatus: "Widowed", occupation: "Retired",           address: { street: "202 Elm St",     village: "Guntur",        city: "Guntur",         district: "Guntur",                       state: "Andhra Pradesh", pincode: "522001" }, password: "Test@1234" },
      { fullName: "Suresh Babu",        aadhaarNumber: "798652256669", panNumber: "ZABCD1234K", mobileNumber: "9876543215", email: "suresh@example.com",   dateOfBirth: new Date("1975-11-12"), maritalStatus: "Married", occupation: "Farmer",            address: { street: "303 Cedar Ln",   village: "Kukatpally",    city: "Hyderabad",      district: "Hyderabad",                    state: "Telangana",      pincode: "500072" }, password: "Test@1234" },
      { fullName: "Anita Kumari",       aadhaarNumber: "809763367770", panNumber: "EFGHI5678L", mobileNumber: "9876543216", email: "anita@example.com",    dateOfBirth: new Date("1995-02-18"), maritalStatus: "Single",  occupation: "Accountant",        address: { street: "404 Birch Blvd", village: "Secunderabad",  city: "Secunderabad",   district: "Medchal",                      state: "Telangana",      pincode: "500003" }, password: "Test@1234" },
      { fullName: "Venkat Rao",         aadhaarNumber: "910874478881", panNumber: "MNOPQ9012M", mobileNumber: "9876543217", email: "venkat@example.com",   dateOfBirth: new Date("1982-09-05"), maritalStatus: "Married", occupation: "Architect",         address: { street: "505 Spruce Way", village: "Tirupati",      city: "Tirupati",       district: "Chittoor",                     state: "Andhra Pradesh", pincode: "517501" }, password: "Test@1234" },
      { fullName: "Meera Singh",        aadhaarNumber: "101985589992", panNumber: "RSTUV3456N", mobileNumber: "9876543218", email: "meera@example.com",    dateOfBirth: new Date("1993-04-22"), maritalStatus: "Single",  occupation: "Lawyer",            address: { street: "606 Willow Pl",  village: "Nellore",       city: "Nellore",        district: "Sri Potti Sri Ramulu Nellore", state: "Andhra Pradesh", pincode: "524001" }, password: "Test@1234" },
      { fullName: "Rajesh Gupta",       aadhaarNumber: "212096690003", panNumber: "WXYZA7890O", mobileNumber: "9876543219", email: "rajesh@example.com",   dateOfBirth: new Date("1987-01-14"), maritalStatus: "Married", occupation: "Engineer",          address: { street: "707 Ash Ct",     village: "Warangal",      city: "Warangal",       district: "Warangal",                     state: "Telangana",      pincode: "506001" }, password: "Test@1234" },
      { fullName: "Sunita Patel",       aadhaarNumber: "323107701114", panNumber: "BCDEF1234P", mobileNumber: "9876543220", email: "sunita@example.com",   dateOfBirth: new Date("1991-06-30"), maritalStatus: "Married", occupation: "Designer",          address: { street: "808 Poplar Ave", village: "Karimnagar",    city: "Karimnagar",     district: "Karimnagar",                   state: "Telangana",      pincode: "505001" }, password: "Test@1234" },
      { fullName: "Kiran Kumar",        aadhaarNumber: "434218812225", panNumber: "GHIJK5678Q", mobileNumber: "9876543221", email: "kiran@example.com",    dateOfBirth: new Date("1989-10-08"), maritalStatus: "Single",  occupation: "Consultant",        address: { street: "909 Fir St",     village: "Khammam",       city: "Khammam",        district: "Khammam",                      state: "Telangana",      pincode: "507001" }, password: "Test@1234" },
      { fullName: "Deepa Nair",         aadhaarNumber: "545329923336", panNumber: "LMNOP9012R", mobileNumber: "9876543222", email: "deepa@example.com",    dateOfBirth: new Date("1984-12-17"), maritalStatus: "Married", occupation: "Manager",           address: { street: "1010 Cypress Rd",village: "Rajahmundry",   city: "Rajahmundry",    district: "East Godavari",                state: "Andhra Pradesh", pincode: "533101" }, password: "Test@1234" },
      { fullName: "Ramesh Choudhary",   aadhaarNumber: "656430034447", panNumber: "QRSTU3456S", mobileNumber: "9876543223", email: "ramesh@example.com",   dateOfBirth: new Date("1978-03-03"), maritalStatus: "Married", occupation: "Contractor",        address: { street: "1111 Redwood Ln",village: "Anantapur",     city: "Anantapur",      district: "Anantapur",                    state: "Andhra Pradesh", pincode: "515001" }, password: "Test@1234" },
      { fullName: "Kavitha Reddy",      aadhaarNumber: "767541145558", panNumber: "VWXYZ7890T", mobileNumber: "9876543224", email: "kavitha@example.com",  dateOfBirth: new Date("1994-07-25"), maritalStatus: "Single",  occupation: "Writer",            address: { street: "1212 Sequoia Pl",village: "Kurnool",       city: "Kurnool",        district: "Kurnool",                      state: "Andhra Pradesh", pincode: "518001" }, password: "Test@1234" },
    ];

    // Save citizens one by one (triggers pre-save password hashing)
    const citizens = [];
    for (const data of citizenData) {
      const user = new User({
        ...data,
        role: 'citizen',
        aadhaarDocument: 'seeded/aadhaar/placeholder.jpg',
        panDocument: 'seeded/pan/placeholder.jpg',
        aadhaarVerified: true,
        panVerified: true,
        mobileVerified: true,
        kycCompleted: true,
        isActive: true,
      });
      await user.save();
      citizens.push(user);
      console.log(`  ✅ ${user.fullName}`);
    }

    // Officers
    const officerData = [
      { fullName: "Revenue Officer 1",  role: "revenue_officer", employeeId: "REV001",   department: "Revenue Department",      designation: "Officer",         email: "revenue1@land.gov.in",   password: "Rev@1234"   },
      { fullName: "Revenue Officer 2",  role: "revenue_officer", employeeId: "REV002",   department: "Revenue Department",      designation: "Officer",         email: "revenue2@land.gov.in",   password: "Rev@1234"   },
      { fullName: "SBI Bank Manager",   role: "bank_manager",    employeeId: "SBI001",   department: "Bank",                    designation: "Manager",         email: "sbimanager@bank.com",    password: "Bank@1234", bankId: "BANK_SBI"  },
      { fullName: "HDFC Bank Manager",  role: "bank_manager",    employeeId: "HDFC001",  department: "Bank",                    designation: "Manager",         email: "hdfcmanager@bank.com",   password: "Bank@1234", bankId: "BANK_HDFC" },
      { fullName: "Sub-Registrar",      role: "sub_registrar",   employeeId: "REG001",   department: "Registration Department", designation: "Officer",         email: "registrar@land.gov.in",  password: "Reg@1234"  },
      { fullName: "System Admin",       role: "admin",           employeeId: "ADMIN001", department: "IT Department",           designation: "Administrator",   email: "admin@land.gov.in",      password: "Admin@123" },
    ];

    const officers = [];
    for (const data of officerData) {
      const user = new User({ ...data, isActive: true });
      await user.save();
      officers.push(user);
      console.log(`  ✅ ${user.fullName} (${user.employeeId})`);
    }

    // Named references for easy use below
    const [
      hanitha, ravi, priya, arun, lakshmi,
      suresh, anita, venkat, meera, rajesh,
      sunita, kiran, deepa, ramesh, kavitha
    ] = citizens;

    const [rev1, rev2, sbiManager, hdfcManager, registrar, admin] = officers;

    console.log('\n✅ All users seeded');

    // ─────────────────────────────────────────────
    // SEED LANDS (ownerId = real user _id string)
    // ─────────────────────────────────────────────
    console.log('\n🏘️  Seeding lands...');

    const landsData = [
      // Hanitha - 3 lands (1 mortgaged)
      { landId: "LAND_001", surveyNumber: "SV_2024_001", owner: hanitha, location: { village: "Madhapur",      district: "Hyderabad",                    state: "Telangana",      pincode: "500081" }, areaSqFt: 2400, landType: "Residential",  marketValue: 5000000,  currentStatus: "ACTIVE",           isMortgaged: false },
      { landId: "LAND_002", surveyNumber: "SV_2024_002", owner: hanitha, location: { village: "Gachibowli",    district: "Hyderabad",                    state: "Telangana",      pincode: "500032" }, areaSqFt: 1200, landType: "Residential",  marketValue: 3500000,  currentStatus: "LOCKED",           isMortgaged: true,  mortgage: { bankId: "BANK_SBI",  bankName: "State Bank of India", loanId: "SEED_LN_001", loanAmount: 2500000, mortgageDate: new Date("2025-01-05") } },
      { landId: "LAND_003", surveyNumber: "SV_2024_003", owner: hanitha, location: { village: "Kondapur",      district: "Hyderabad",                    state: "Telangana",      pincode: "500084" }, areaSqFt: 3000, landType: "Commercial",   marketValue: 7500000,  currentStatus: "ACTIVE",           isMortgaged: false },
      // Ravi - 2 active lands
      { landId: "LAND_004", surveyNumber: "SV_2024_004", owner: ravi,    location: { village: "Vizag Beach",   district: "Visakhapatnam",                state: "Andhra Pradesh", pincode: "530003" }, areaSqFt: 5000, landType: "Residential",  marketValue: 12000000, currentStatus: "ACTIVE",           isMortgaged: false },
      { landId: "LAND_005", surveyNumber: "SV_2024_005", owner: ravi,    location: { village: "MVP Colony",    district: "Visakhapatnam",                state: "Andhra Pradesh", pincode: "530012" }, areaSqFt: 1800, landType: "Residential",  marketValue: 4500000,  currentStatus: "ACTIVE",           isMortgaged: false },
      // Priya - 1 pending transfer, 1 active
      { landId: "LAND_006", surveyNumber: "SV_2024_006", owner: priya,   location: { village: "Jubilee Hills", district: "Hyderabad",                    state: "Telangana",      pincode: "500033" }, areaSqFt: 4000, landType: "Residential",  marketValue: 20000000, currentStatus: "PENDING_TRANSFER", isMortgaged: false, pendingTransferData: { buyerId: venkat._id.toString(), buyerName: "Venkat Rao", buyerAadhaar: venkat.aadhaarNumber, salePrice: 21000000, initiatedDate: new Date("2025-01-15") } },
      { landId: "LAND_007", surveyNumber: "SV_2024_007", owner: priya,   location: { village: "Banjara Hills", district: "Hyderabad",                    state: "Telangana",      pincode: "500034" }, areaSqFt: 2200, landType: "Residential",  marketValue: 9000000,  currentStatus: "ACTIVE",           isMortgaged: false },
      // Arun - 1 active
      { landId: "LAND_008", surveyNumber: "SV_2024_008", owner: arun,    location: { village: "Vijayawada",    district: "Krishna",                      state: "Andhra Pradesh", pincode: "520001" }, areaSqFt: 3500, landType: "Agricultural", marketValue: 6500000,  currentStatus: "ACTIVE",           isMortgaged: false },
      // Lakshmi - 1 disputed, 1 active
      { landId: "LAND_009", surveyNumber: "SV_2024_009", owner: lakshmi, location: { village: "Guntur",        district: "Guntur",                       state: "Andhra Pradesh", pincode: "522001" }, areaSqFt: 2800, landType: "Agricultural", marketValue: 5500000,  currentStatus: "DISPUTED",         isMortgaged: false },
      { landId: "LAND_010", surveyNumber: "SV_2024_010", owner: lakshmi, location: { village: "Tenali",        district: "Guntur",                       state: "Andhra Pradesh", pincode: "524101" }, areaSqFt: 1500, landType: "Residential",  marketValue: 3000000,  currentStatus: "ACTIVE",           isMortgaged: false },
      // Suresh - 1 mortgaged
      { landId: "LAND_011", surveyNumber: "SV_2024_011", owner: suresh,  location: { village: "Kukatpally",    district: "Hyderabad",                    state: "Telangana",      pincode: "500072" }, areaSqFt: 2000, landType: "Residential",  marketValue: 6000000,  currentStatus: "LOCKED",           isMortgaged: true,  mortgage: { bankId: "BANK_HDFC", bankName: "HDFC Bank",           loanId: "SEED_LN_002", loanAmount: 4000000, mortgageDate: new Date("2025-01-07") } },
      // Anita - 2 active
      { landId: "LAND_012", surveyNumber: "SV_2024_012", owner: anita,   location: { village: "Secunderabad",  district: "Medchal",                      state: "Telangana",      pincode: "500003" }, areaSqFt: 1800, landType: "Residential",  marketValue: 4200000,  currentStatus: "ACTIVE",           isMortgaged: false },
      { landId: "LAND_013", surveyNumber: "SV_2024_013", owner: anita,   location: { village: "Malkajgiri",    district: "Medchal",                      state: "Telangana",      pincode: "500047" }, areaSqFt: 2600, landType: "Commercial",   marketValue: 5800000,  currentStatus: "ACTIVE",           isMortgaged: false },
      // Venkat - 1 active
      { landId: "LAND_014", surveyNumber: "SV_2024_014", owner: venkat,  location: { village: "Tirupati",      district: "Chittoor",                     state: "Andhra Pradesh", pincode: "517501" }, areaSqFt: 4200, landType: "Agricultural", marketValue: 8500000,  currentStatus: "ACTIVE",           isMortgaged: false },
      // Meera - 1 pending transfer, 1 active
      { landId: "LAND_015", surveyNumber: "SV_2024_015", owner: meera,   location: { village: "Nellore",       district: "Sri Potti Sri Ramulu Nellore", state: "Andhra Pradesh", pincode: "524001" }, areaSqFt: 3200, landType: "Residential",  marketValue: 4800000,  currentStatus: "PENDING_TRANSFER", isMortgaged: false, pendingTransferData: { buyerId: rajesh._id.toString(), buyerName: "Rajesh Gupta", buyerAadhaar: rajesh.aadhaarNumber, salePrice: 5200000, initiatedDate: new Date("2025-01-16") } },
      { landId: "LAND_016", surveyNumber: "SV_2024_016", owner: meera,   location: { village: "Ongole",        district: "Prakasam",                     state: "Andhra Pradesh", pincode: "523001" }, areaSqFt: 2100, landType: "Residential",  marketValue: 3800000,  currentStatus: "ACTIVE",           isMortgaged: false },
      // Rajesh - 1 active
      { landId: "LAND_017", surveyNumber: "SV_2024_017", owner: rajesh,  location: { village: "Warangal",      district: "Warangal",                     state: "Telangana",      pincode: "506001" }, areaSqFt: 2900, landType: "Commercial",   marketValue: 5200000,  currentStatus: "ACTIVE",           isMortgaged: false },
      // Sunita - 2 active
      { landId: "LAND_018", surveyNumber: "SV_2024_018", owner: sunita,  location: { village: "Karimnagar",    district: "Karimnagar",                   state: "Telangana",      pincode: "505001" }, areaSqFt: 3600, landType: "Agricultural", marketValue: 6800000,  currentStatus: "ACTIVE",           isMortgaged: false },
      { landId: "LAND_019", surveyNumber: "SV_2024_019", owner: sunita,  location: { village: "Nizamabad",     district: "Nizamabad",                    state: "Telangana",      pincode: "503001" }, areaSqFt: 1900, landType: "Residential",  marketValue: 3500000,  currentStatus: "ACTIVE",           isMortgaged: false },
      // Kiran - 1 mortgaged
      { landId: "LAND_020", surveyNumber: "SV_2024_020", owner: kiran,   location: { village: "Khammam",       district: "Khammam",                      state: "Telangana",      pincode: "507001" }, areaSqFt: 2500, landType: "Commercial",   marketValue: 4700000,  currentStatus: "LOCKED",           isMortgaged: true,  mortgage: { bankId: "BANK_SBI",  bankName: "State Bank of India", loanId: "SEED_LN_003", loanAmount: 3000000, mortgageDate: new Date("2025-01-08") } },
      // Deepa - 2 active
      { landId: "LAND_021", surveyNumber: "SV_2024_021", owner: deepa,   location: { village: "Rajahmundry",   district: "East Godavari",                state: "Andhra Pradesh", pincode: "533101" }, areaSqFt: 3100, landType: "Agricultural", marketValue: 6200000,  currentStatus: "ACTIVE",           isMortgaged: false },
      { landId: "LAND_022", surveyNumber: "SV_2024_022", owner: deepa,   location: { village: "Kakinada",      district: "East Godavari",                state: "Andhra Pradesh", pincode: "533001" }, areaSqFt: 2300, landType: "Residential",  marketValue: 4400000,  currentStatus: "ACTIVE",           isMortgaged: false },
      // Ramesh - 1 active
      { landId: "LAND_023", surveyNumber: "SV_2024_023", owner: ramesh,  location: { village: "Anantapur",     district: "Anantapur",                    state: "Andhra Pradesh", pincode: "515001" }, areaSqFt: 4500, landType: "Agricultural", marketValue: 7200000,  currentStatus: "ACTIVE",           isMortgaged: false },
      // Kavitha - 2 active
      { landId: "LAND_024", surveyNumber: "SV_2024_024", owner: kavitha, location: { village: "Kurnool",       district: "Kurnool",                      state: "Andhra Pradesh", pincode: "518001" }, areaSqFt: 2700, landType: "Residential",  marketValue: 5100000,  currentStatus: "ACTIVE",           isMortgaged: false },
      { landId: "LAND_025", surveyNumber: "SV_2024_025", owner: kavitha, location: { village: "Kadapa",        district: "YSR Kadapa",                   state: "Andhra Pradesh", pincode: "516001" }, areaSqFt: 1600, landType: "Residential",  marketValue: 3200000,  currentStatus: "ACTIVE",           isMortgaged: false },
    ];

    const landMap = {}; // landId -> Land document
    for (const d of landsData) {
      const landDoc = new Land({
        landId: d.landId,
        surveyNumber: d.surveyNumber,
        // KEY FIX: ownerId = real _id string, ownerUserId = ObjectId ref
        ownerId: d.owner._id.toString(),
        ownerUserId: d.owner._id,
        ownerName: d.owner.fullName,
        ownerAadhaar: d.owner.aadhaarNumber,
        ownerMobile: d.owner.mobileNumber,
        location: d.location,
        areaSqFt: d.areaSqFt,
        landType: d.landType,
        marketValue: d.marketValue,
        currentStatus: d.currentStatus,
        isMortgaged: d.isMortgaged,
        encumbranceDetails: d.mortgage ? {
          bankId: d.mortgage.bankId,
          bankName: d.mortgage.bankName,
          loanId: d.mortgage.loanId,
          loanAmount: d.mortgage.loanAmount,
          loanStatus: 'APPROVED',
          mortgageDate: d.mortgage.mortgageDate
        } : { bankId: null, bankName: null, loanId: null, loanAmount: 0, loanStatus: 'NONE' },
        pendingTransfer: d.pendingTransferData || {},
        createdBy: rev1._id.toString(),
        createdByRole: 'revenue_officer',
      });
      await landDoc.save();
      landMap[d.landId] = landDoc;
      console.log(`  ✅ ${d.landId} → ${d.owner.fullName} [${d.currentStatus}]`);
    }

    console.log('\n✅ All lands seeded');

    // ─────────────────────────────────────────────
    // SEED LOAN REQUESTS
    // ─────────────────────────────────────────────
    console.log('\n💰 Seeding loan requests...');

    const loansData = [
      // APPROVED (active mortgages)
      { requestId: "SEED_LN_001", land: landMap["LAND_002"], applicant: hanitha, bank: sbiManager, bankId: "BANK_SBI", bankName: "State Bank of India", requestedAmount: 2500000, approvedAmount: 2500000, purpose: "Home Construction",      status: "APPROVED", requestDate: new Date("2025-01-05"), approvalDate: new Date("2025-01-05") },
      { requestId: "SEED_LN_002", land: landMap["LAND_011"], applicant: suresh,  bank: hdfcManager, bankId: "BANK_HDFC", bankName: "HDFC Bank",           requestedAmount: 4000000, approvedAmount: 4000000, purpose: "Agricultural Investment", status: "APPROVED", requestDate: new Date("2025-01-07"), approvalDate: new Date("2025-01-07") },
      { requestId: "SEED_LN_003", land: landMap["LAND_020"], applicant: kiran,   bank: sbiManager, bankId: "BANK_SBI", bankName: "State Bank of India", requestedAmount: 3000000, approvedAmount: 3000000, purpose: "Business Expansion",     status: "APPROVED", requestDate: new Date("2025-01-08"), approvalDate: new Date("2025-01-08") },
      // PENDING
      { requestId: "SEED_LN_004", land: landMap["LAND_025"], applicant: kavitha, bank: sbiManager,  bankId: "BANK_SBI",  bankName: "State Bank of India", requestedAmount: 2000000, purpose: "Home Renovation",         status: "PENDING",   requestDate: new Date("2025-01-15") },
      { requestId: "SEED_LN_005", land: landMap["LAND_024"], applicant: kavitha, bank: hdfcManager, bankId: "BANK_HDFC", bankName: "HDFC Bank",           requestedAmount: 3500000, purpose: "Agricultural Equipment",  status: "PENDING",   requestDate: new Date("2025-01-15") },
      { requestId: "SEED_LN_006", land: landMap["LAND_004"], applicant: ravi,    bank: sbiManager,  bankId: "BANK_SBI",  bankName: "State Bank of India", requestedAmount: 8000000, purpose: "Real Estate Investment",  status: "PENDING",   requestDate: new Date("2025-01-16") },
      { requestId: "SEED_LN_007", land: landMap["LAND_008"], applicant: arun,    bank: hdfcManager, bankId: "BANK_HDFC", bankName: "HDFC Bank",           requestedAmount: 4500000, purpose: "Farm Modernization",      status: "PENDING",   requestDate: new Date("2025-01-16") },
      // REJECTED
      { requestId: "SEED_LN_008", land: landMap["LAND_014"], applicant: venkat,  bank: sbiManager,  bankId: "BANK_SBI",  bankName: "State Bank of India", requestedAmount: 6000000, purpose: "Business Setup",          status: "REJECTED",  requestDate: new Date("2025-01-10"), rejectionReason: "Insufficient documentation provided" },
      { requestId: "SEED_LN_009", land: landMap["LAND_017"], applicant: rajesh,  bank: hdfcManager, bankId: "BANK_HDFC", bankName: "HDFC Bank",           requestedAmount: 3500000, purpose: "Property Development",    status: "REJECTED",  requestDate: new Date("2025-01-11"), rejectionReason: "Land value too low for requested amount" },
      // CLEARED
      { requestId: "SEED_LN_010", land: landMap["LAND_012"], applicant: anita,   bank: sbiManager,  bankId: "BANK_SBI",  bankName: "State Bank of India", requestedAmount: 3000000, approvedAmount: 2800000, purpose: "Home Construction",      status: "CLEARED",   requestDate: new Date("2025-01-01"), approvalDate: new Date("2025-01-02"), clearanceDate: new Date("2025-01-14") },
      { requestId: "SEED_LN_011", land: landMap["LAND_018"], applicant: sunita,  bank: hdfcManager, bankId: "BANK_HDFC", bankName: "HDFC Bank",           requestedAmount: 5000000, approvedAmount: 4800000, purpose: "Agricultural Investment", status: "CLEARED",   requestDate: new Date("2025-01-03"), approvalDate: new Date("2025-01-04"), clearanceDate: new Date("2025-01-15") },
      { requestId: "SEED_LN_012", land: landMap["LAND_021"], applicant: deepa,   bank: sbiManager,  bankId: "BANK_SBI",  bankName: "State Bank of India", requestedAmount: 4000000, approvedAmount: 3800000, purpose: "Business Expansion",     status: "CLEARED",   requestDate: new Date("2025-01-06"), approvalDate: new Date("2025-01-07"), clearanceDate: new Date("2025-01-16") },
    ];

    for (const d of loansData) {
      await LoanRequest.create({
        requestId: d.requestId,
        landId: d.land.landId,
        landObjectId: d.land._id,
        surveyNumber: d.land.surveyNumber,
        // KEY FIX: applicantId = real _id string
        applicantId: d.applicant._id.toString(),
        applicantUserId: d.applicant._id,
        applicantName: d.applicant.fullName,
        applicantAadhaar: d.applicant.aadhaarNumber,
        requestedAmount: d.requestedAmount,
        approvedAmount: d.approvedAmount || null,
        purpose: d.purpose,
        bankId: d.bankId,
        bankName: d.bankName,
        assignedManagerId: d.bank._id.toString(),
        assignedManagerName: d.bank.fullName,
        status: d.status,
        requestDate: d.requestDate,
        approvalDate: d.approvalDate || null,
        clearanceDate: d.clearanceDate || null,
        rejectionReason: d.rejectionReason || null,
      });
      console.log(`  ✅ ${d.requestId} [${d.status}] → ${d.applicant.fullName}`);
    }

    console.log('\n✅ All loan requests seeded');

    // ─────────────────────────────────────────────
    // SEED TRANSFER REQUESTS
    // ─────────────────────────────────────────────
    console.log('\n🔄 Seeding transfer requests...');

    const transfersData = [
      // PENDING
      { transferId: "SEED_TR_001", land: landMap["LAND_006"], seller: priya,   buyer: venkat,  salePrice: 21000000, status: "PENDING",   initiatedDate: new Date("2025-01-15") },
      { transferId: "SEED_TR_002", land: landMap["LAND_015"], seller: meera,   buyer: rajesh,  salePrice: 5200000,  status: "PENDING",   initiatedDate: new Date("2025-01-16") },
      { transferId: "SEED_TR_003", land: landMap["LAND_007"], seller: priya,   buyer: anita,   salePrice: 9500000,  status: "PENDING",   initiatedDate: new Date("2025-01-17") },
      // BLOCKED (fraud prevention demo)
      { transferId: "SEED_TR_004", land: landMap["LAND_002"], seller: hanitha, buyer: suresh,  salePrice: 4000000,  status: "BLOCKED",   initiatedDate: new Date("2025-01-10"), blockReason: "Land has active mortgage with State Bank of India" },
      { transferId: "SEED_TR_005", land: landMap["LAND_011"], seller: suresh,  buyer: kiran,   salePrice: 6500000,  status: "BLOCKED",   initiatedDate: new Date("2025-01-12"), blockReason: "Land has active mortgage with HDFC Bank" },
      { transferId: "SEED_TR_006", land: landMap["LAND_009"], seller: lakshmi, buyer: kavitha, salePrice: 5800000,  status: "BLOCKED",   initiatedDate: new Date("2025-01-14"), blockReason: "Land is under dispute" },
      // APPROVED (completed)
      { transferId: "SEED_TR_007", land: landMap["LAND_012"], seller: anita,   buyer: deepa,   salePrice: 4500000,  status: "APPROVED",  initiatedDate: new Date("2025-01-05"), completedDate: new Date("2025-01-08"), registrar },
      { transferId: "SEED_TR_008", land: landMap["LAND_018"], seller: sunita,  buyer: ramesh,  salePrice: 7000000,  status: "APPROVED",  initiatedDate: new Date("2025-01-06"), completedDate: new Date("2025-01-09"), registrar },
      { transferId: "SEED_TR_009", land: landMap["LAND_021"], seller: deepa,   buyer: sunita,  salePrice: 6500000,  status: "APPROVED",  initiatedDate: new Date("2025-01-07"), completedDate: new Date("2025-01-10"), registrar },
      // REJECTED
      { transferId: "SEED_TR_010", land: landMap["LAND_017"], seller: rajesh,  buyer: priya,   salePrice: 5500000,  status: "REJECTED",  initiatedDate: new Date("2025-01-09"), registrar, notes: "Document mismatch - buyer's Aadhaar not verified" },
    ];

    for (const d of transfersData) {
      await TransferRequest.create({
        transferId: d.transferId,
        landId: d.land.landId,
        surveyNumber: d.land.surveyNumber,
        // KEY FIX: all IDs are real _id strings
        sellerId: d.seller._id,
        sellerName: d.seller.fullName,
        sellerAadhaar: d.seller.aadhaarNumber,
        buyerId: d.buyer._id,
        buyerName: d.buyer.fullName,
        buyerAadhaar: d.buyer.aadhaarNumber,
        salePrice: d.salePrice,
        status: d.status,
        blockReason: d.blockReason || null,
        registrarId: d.registrar ? d.registrar._id : null,
        initiatedDate: d.initiatedDate,
        completedDate: d.completedDate || null,
        notes: d.notes || null,
      });
      console.log(`  ✅ ${d.transferId} [${d.status}] → ${d.seller.fullName} → ${d.buyer.fullName}`);
    }

    console.log('\n✅ All transfer requests seeded');

    // ─────────────────────────────────────────────
    // SEED TRANSACTIONS (audit trail)
    // ─────────────────────────────────────────────
    console.log('\n📋 Seeding transactions...');

    const txns = [
      // Land creations
      { type: "CREATE",        landId: "LAND_001", initiatedBy: rev1._id,        affectedParties: [hanitha._id], details: "Land SV_2024_001 created for Hanitha Ganisetti" },
      { type: "CREATE",        landId: "LAND_002", initiatedBy: rev1._id,        affectedParties: [hanitha._id], details: "Land SV_2024_002 created for Hanitha Ganisetti" },
      { type: "CREATE",        landId: "LAND_003", initiatedBy: rev1._id,        affectedParties: [hanitha._id], details: "Land SV_2024_003 created for Hanitha Ganisetti" },
      { type: "CREATE",        landId: "LAND_004", initiatedBy: rev1._id,        affectedParties: [ravi._id],    details: "Land SV_2024_004 created for Ravi Kumar Sharma" },
      { type: "CREATE",        landId: "LAND_005", initiatedBy: rev1._id,        affectedParties: [ravi._id],    details: "Land SV_2024_005 created for Ravi Kumar Sharma" },
      // Mortgages
      { type: "MORTGAGE",      landId: "LAND_002", initiatedBy: sbiManager._id,  affectedParties: [hanitha._id], details: "Loan approved by State Bank of India for ₹25,00,000" },
      { type: "MORTGAGE",      landId: "LAND_011", initiatedBy: hdfcManager._id, affectedParties: [suresh._id],  details: "Loan approved by HDFC Bank for ₹40,00,000" },
      { type: "MORTGAGE",      landId: "LAND_020", initiatedBy: sbiManager._id,  affectedParties: [kiran._id],   details: "Loan approved by State Bank of India for ₹30,00,000" },
      // Transfers
      { type: "TRANSFER",      landId: "LAND_012", initiatedBy: registrar._id,   affectedParties: [anita._id, deepa._id],   details: "Transfer approved: Anita Kumari → Deepa Nair" },
      { type: "TRANSFER",      landId: "LAND_018", initiatedBy: registrar._id,   affectedParties: [sunita._id, ramesh._id],  details: "Transfer approved: Sunita Patel → Ramesh Choudhary" },
      { type: "TRANSFER",      landId: "LAND_021", initiatedBy: registrar._id,   affectedParties: [deepa._id, sunita._id],   details: "Transfer approved: Deepa Nair → Sunita Patel" },
      // Loan clearances
      { type: "CLEAR_MORTGAGE",landId: "LAND_012", initiatedBy: sbiManager._id,  affectedParties: [anita._id],   details: "Loan cleared by State Bank of India" },
      { type: "CLEAR_MORTGAGE",landId: "LAND_018", initiatedBy: hdfcManager._id, affectedParties: [sunita._id],  details: "Loan cleared by HDFC Bank" },
      { type: "CLEAR_MORTGAGE",landId: "LAND_021", initiatedBy: sbiManager._id,  affectedParties: [deepa._id],   details: "Loan cleared by State Bank of India" },
      // Dispute
      { type: "DISPUTE",       landId: "LAND_009", initiatedBy: rev1._id,        affectedParties: [lakshmi._id], details: "Land marked as disputed. Reason: Boundary conflict reported" },
      // Blocked transfers
      { type: "BLOCK_TRANSFER",landId: "LAND_002", initiatedBy: rev1._id,        affectedParties: [hanitha._id, suresh._id], details: "Transfer blocked — land has active mortgage" },
      { type: "BLOCK_TRANSFER",landId: "LAND_011", initiatedBy: rev1._id,        affectedParties: [suresh._id, kiran._id],   details: "Transfer blocked — land has active mortgage" },
      { type: "BLOCK_TRANSFER",landId: "LAND_009", initiatedBy: rev1._id,        affectedParties: [lakshmi._id, kavitha._id],details: "Transfer blocked — land is disputed" },
      // Loan rejections
      { type: "LOAN_REJECTION",landId: "LAND_014", initiatedBy: sbiManager._id,  affectedParties: [venkat._id],  details: "Loan rejected: Insufficient documentation" },
      { type: "LOAN_REJECTION",landId: "LAND_017", initiatedBy: hdfcManager._id, affectedParties: [rajesh._id],  details: "Loan rejected: Land value too low" },
    ];

    await Transaction.insertMany(txns);
    console.log(`  ✅ ${txns.length} transactions seeded`);

    // ─────────────────────────────────────────────
    // SEED NOTIFICATIONS
    // ─────────────────────────────────────────────
    console.log('\n🔔 Seeding notifications...');

    const notifs = [
      // Citizen notifications
      { userId: hanitha._id, title: "Land Registration Approved",    message: "Your land SV_2024_001 has been registered successfully.", type: "success", read: false },
      { userId: hanitha._id, title: "Loan Approved",                 message: "Your loan of ₹25,00,000 for LAND_002 has been approved by SBI.", type: "success", read: false },
      { userId: hanitha._id, title: "⚠️ Transfer Blocked",           message: "Attempted sale of LAND_002 was blocked. Land is mortgaged.", type: "warning", read: false },
      { userId: suresh._id,  title: "Loan Approved",                 message: "Your loan of ₹40,00,000 for LAND_011 has been approved by HDFC.", type: "success", read: false },
      { userId: suresh._id,  title: "⚠️ Transfer Blocked",           message: "Attempted sale of LAND_011 was blocked. Land is mortgaged.", type: "warning", read: false },
      { userId: kiran._id,   title: "Loan Approved",                 message: "Your loan of ₹30,00,000 for LAND_020 has been approved by SBI.", type: "success", read: false },
      { userId: priya._id,   title: "Sale Initiated",                message: "Your sale request for LAND_006 to Venkat Rao is pending registrar review.", type: "info", read: false },
      { userId: venkat._id,  title: "Land Sale Offer",               message: "Priya Reddy wants to sell LAND_006 to you for ₹2.1 Cr.", type: "info", read: false },
      { userId: meera._id,   title: "Sale Initiated",                message: "Your sale request for LAND_015 to Rajesh Gupta is pending registrar review.", type: "info", read: false },
      { userId: lakshmi._id, title: "Land Disputed",                 message: "Your land LAND_009 has been marked as disputed. Contact revenue office.", type: "warning", read: false },
      { userId: kavitha._id, title: "Loan Application Submitted",    message: "Your loan application for LAND_025 has been submitted to SBI.", type: "info", read: false },
      { userId: anita._id,   title: "Loan Cleared",                  message: "Your loan for LAND_012 has been cleared. Land is now free.", type: "success", read: true },
      // Officer notifications
      { userId: rev1._id,    title: "New Land Registration Request", message: "A new land registration request is pending your review.", type: "info", read: false },
      { userId: sbiManager._id,  title: "New Loan Applications",    message: "You have 2 new loan applications pending review.", type: "info", read: false },
      { userId: hdfcManager._id, title: "New Loan Applications",    message: "You have 2 new loan applications pending review.", type: "info", read: false },
      { userId: registrar._id,   title: "Pending Transfers",        message: "You have 3 transfer requests pending your approval.", type: "info", read: false },
    ];

    await Notification.insertMany(notifs);
    console.log(`  ✅ ${notifs.length} notifications seeded`);

    // ─────────────────────────────────────────────
    // SUMMARY
    // ─────────────────────────────────────────────
    console.log('\n' + '═'.repeat(50));
    console.log('✅ DATABASE SEEDING COMPLETE');
    console.log('═'.repeat(50));
    console.log('\n🧑‍💻 CITIZEN LOGIN (Aadhaar + Password):');
    console.log('  Hanitha  : 243107701114 / Test@1234  (3 lands, 1 mortgaged)');
    console.log('  Ravi     : 354218812225 / Test@1234  (2 active lands)');
    console.log('  Priya    : 465329923336 / Test@1234  (1 pending sale)');
    console.log('  Lakshmi  : 687541145558 / Test@1234  (1 disputed land)');
    console.log('  Kavitha  : 767541145558 / Test@1234  (2 active, pending loan)');
    console.log('\n👔 OFFICER LOGIN (Employee ID + Password):');
    console.log('  Revenue  : REV001   / Rev@1234');
    console.log('  SBI Bank : SBI001   / Bank@1234');
    console.log('  HDFC Bank: HDFC001  / Bank@1234');
    console.log('  Registrar: REG001   / Reg@1234');
    console.log('  Admin    : ADMIN001 / Admin@123');
    console.log('═'.repeat(50));

    process.exit(0);
  } catch (err) {
    console.error('\n❌ Seeding failed:', err.message);
    console.error(err);
    process.exit(1);
  }
};

seed();