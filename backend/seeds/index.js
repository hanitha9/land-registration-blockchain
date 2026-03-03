const mongoose = require('mongoose');
const connectDB = require('../config/database');
const User = require('../models/User');
const Land = require('../models/Land');
const LoanRequest = require('../models/LoanRequest');
const TransferRequest = require('../models/TransferRequest');
const Notification = require('../models/Notification');
const Transaction = require('../models/Transaction');

// Seed data
const usersSeed = require('./users.seed');
const banksSeed = require('./banks.seed');
const landsSeed = require('./lands.seed');
const loanRequestsSeed = require('./loanRequests.seed');
const transferRequestsSeed = require('./transferRequests.seed');
const notificationsSeed = require('./notifications.seed');
const transactionsSeed = require('./transactions.seed');

const seedDatabase = async () => {
  try {
    await connectDB();

    const args = process.argv.slice(2);
    const fresh = args.includes('--fresh');

    if (fresh) {
      console.log('Clearing existing data...');
      await User.deleteMany({});
      await Land.deleteMany({});
      await LoanRequest.deleteMany({});
      await TransferRequest.deleteMany({});
      await Notification.deleteMany({});
      await Transaction.deleteMany({});
      console.log('Existing data cleared.');
    }

    console.log('Seeding users...');
    await User.insertMany(usersSeed);
    console.log('Users seeded.');

    console.log('Seeding banks...');
    // Banks are already included in users seed
    console.log('Banks seeded.');

    console.log('Seeding lands...');
    await Land.insertMany(landsSeed);
    console.log('Lands seeded.');

    console.log('Seeding loan requests...');
    await LoanRequest.insertMany(loanRequestsSeed);
    console.log('Loan requests seeded.');

    console.log('Seeding transfer requests...');
    await TransferRequest.insertMany(transferRequestsSeed);
    console.log('Transfer requests seeded.');

    console.log('Seeding notifications...');
    await Notification.insertMany(notificationsSeed);
    console.log('Notifications seeded.');

    console.log('Seeding transactions...');
    await Transaction.insertMany(transactionsSeed);
    console.log('Transactions seeded.');

    console.log('Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();