'use strict';

// Script: syncToBlockchain.js
// Reads all lands from MongoDB and registers them on Hyperledger Fabric
// Run: node syncToBlockchain.js

require('dotenv').config();
const mongoose = require('mongoose');
const Land = require('./models/Land');
const {
  createLandOnBlockchain,
  approveLoanOnBlockchain,
  queryLand
} = require('./services/blockchainService');

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function syncToBlockchain() {
  // Connect MongoDB
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ MongoDB Connected');

  const lands = await Land.find({}).sort({ createdAt: 1 });
  console.log(`\n📋 Found ${lands.length} lands in MongoDB\n`);

  let created = 0, locked = 0, skipped = 0, failed = 0;

  for (const land of lands) {
    process.stdout.write(`Processing ${land.landId} (${land.currentStatus})... `);

    // Check if already on blockchain
    try {
      await queryLand(land.landId);
      console.log(`⏭️  Already on blockchain, skipping`);
      skipped++;
      continue;
    } catch (e) {
      // Not on blockchain yet — register it
    }

    // Step 1: Create land on blockchain as ACTIVE
    try {
      const result = await createLandOnBlockchain({
        landId:       land.landId,
        ownerName:    land.ownerName,
        ownerAadhaar: land.ownerAadhaar || '',
        areaSqFt:     land.areaSqFt || 0,
        landType:     land.landType || 'Residential',
        marketValue:  land.marketValue || 0,
        district:     land.location?.district || '',
        state:        land.location?.state || ''
      });
      console.log(`✅ Created TxID: ${result.txId}`);
      created++;
    } catch (err) {
      console.log(`❌ Create failed: ${err.message}`);
      failed++;
      continue;
    }

    await sleep(300); // small delay between transactions

    // Step 2: If land is mortgaged/locked, call approveLoan on blockchain
    if (land.isMortgaged && land.encumbranceDetails?.bankId) {
      process.stdout.write(`  🔒 Locking ${land.landId} on blockchain... `);
      try {
        const result = await approveLoanOnBlockchain(
          land.landId,
          land.encumbranceDetails.bankId,
          land.encumbranceDetails.bankName || 'Bank',
          land.encumbranceDetails.loanId   || `LOAN_${land.landId}`,
          land.encumbranceDetails.loanAmount || 0
        );
        console.log(`✅ Locked TxID: ${result.txId}`);
        locked++;
      } catch (err) {
        console.log(`❌ Lock failed: ${err.message}`);
      }
      await sleep(300);
    }
  }

  console.log('\n═══════════════════════════════════════');
  console.log(`✅ Created on blockchain : ${created}`);
  console.log(`🔒 Locked (mortgaged)   : ${locked}`);
  console.log(`⏭️  Already existed      : ${skipped}`);
  console.log(`❌ Failed               : ${failed}`);
  console.log('═══════════════════════════════════════');
  console.log('\n🎉 Blockchain sync complete!');
  console.log('All lands are now on Hyperledger Fabric ledger.');

  await mongoose.disconnect();
  process.exit(0);
}

syncToBlockchain().catch(err => {
  console.error('Sync failed:', err);
  process.exit(1);
});