'use strict';

const { Gateway, Wallets } = require('fabric-network');
const path = require('path');
const fs = require('fs');

const CHANNEL_NAME    = 'landchannel';
const CHAINCODE_NAME  = 'landregistry';
const WALLET_PATH     = path.join(__dirname, '../wallet');
const CONNECTION_PATH = path.join(__dirname, '../config/connection-org1.json');
const IDENTITY        = 'appUser2';

async function reEnrollWallet() {
    try {
        const fs = require('fs');
        if (fs.existsSync(WALLET_PATH + '/admin.id')) fs.unlinkSync(WALLET_PATH + '/admin.id');
        if (fs.existsSync(WALLET_PATH + '/appUser.id')) fs.unlinkSync(WALLET_PATH + '/appUser.id');
        const FabricNetwork = require('../utils/fabricNetwork');
        const fabric = new FabricNetwork();
        await fabric.enrollAdmin();
        await fabric.registerUser('appUser');
        console.log('✅ Wallet re-enrolled successfully');
        return true;
    } catch (err) {
        console.error('❌ Re-enroll failed:', err.message);
        return false;
    }
}

async function getContract() {
    const wallet = await Wallets.newFileSystemWallet(WALLET_PATH);
    const identity = await wallet.get(IDENTITY);
    if (!identity) {
        throw new Error(`Identity "${IDENTITY}" not found in wallet.`);
    }
    const connectionProfile = JSON.parse(fs.readFileSync(CONNECTION_PATH, 'utf8'));
    const gateway = new Gateway();
    await gateway.connect(connectionProfile, {
        wallet,
        identity: IDENTITY,
        discovery: { enabled: false, asLocalhost: true }
    });
    const network  = await gateway.getNetwork(CHANNEL_NAME);
    const contract = network.getContract(CHAINCODE_NAME);
    return { gateway, contract };
}

async function createLandOnBlockchain(landData) {
    let gateway;
    try {
        const conn = await getContract();
        gateway = conn.gateway;
        const tx = conn.contract.createTransaction('createLand');
        const result = await tx.submit(
            landData.landId,
            landData.ownerName,
            landData.ownerAadhaar || '',
            String(landData.areaSqFt || 0),
            landData.landType || 'Residential',
            String(landData.marketValue || 0),
            landData.district || '',
            landData.state || ''
        );
        const txId = tx.getTransactionId();
        console.log(`✅ Blockchain: Land ${landData.landId} created. TxID: ${txId}`);
        return { success: true, txId, data: JSON.parse(result.toString()) };
    } catch (error) {
        console.error('❌ Blockchain createLand error:', error.message);
        throw error;
    } finally {
        if (gateway) gateway.disconnect();
    }
}

async function withAutoReEnroll(fn) {
    try {
        return await fn();
    } catch (err) {
        if (err.message && err.message.includes('creator org unknown')) {
            console.log('🔄 Wallet expired — auto re-enrolling...');
            await reEnrollWallet();
            return await fn(); // retry once
        }
        throw err;
    }
}

async function queryLand(landId) {
    let gateway;
    try {
        const conn = await getContract();
        gateway = conn.gateway;
        const result = await conn.contract.evaluateTransaction('queryLand', landId);
        return { success: true, data: JSON.parse(result.toString()) };
    } catch (error) {
        console.error('❌ Blockchain queryLand error:', error.message);
        throw error;
    } finally {
        if (gateway) gateway.disconnect();
    }
}

async function approveLoanOnBlockchain(landId, bankId, bankName, loanId, loanAmount) {
    let gateway;
    try {
        const conn = await getContract();
        gateway = conn.gateway;
        const tx = conn.contract.createTransaction('approveLoan');
        const result = await tx.submit(landId, bankId, bankName, loanId, String(loanAmount));
        const txId = tx.getTransactionId();
        console.log(`✅ Blockchain: Land ${landId} LOCKED. TxID: ${txId}`);
        return { success: true, txId, data: JSON.parse(result.toString()) };
    } catch (error) {
        console.error('❌ Blockchain approveLoan error:', error.message);
        throw error;
    } finally {
        if (gateway) gateway.disconnect();
    }
}

async function clearLoanOnBlockchain(landId, loanId) {
    let gateway;
    try {
        const conn = await getContract();
        gateway = conn.gateway;
        const tx = conn.contract.createTransaction('clearLoan');
        const result = await tx.submit(landId, loanId);
        const txId = tx.getTransactionId();
        console.log(`✅ Blockchain: Land ${landId} UNLOCKED. TxID: ${txId}`);
        return { success: true, txId, data: JSON.parse(result.toString()) };
    } catch (error) {
        console.error('❌ Blockchain clearLoan error:', error.message);
        throw error;
    } finally {
        if (gateway) gateway.disconnect();
    }
}

async function transferOwnershipOnBlockchain(landId, newOwnerName, newOwnerAadhaar, salePrice, transferId) {
    let gateway;
    try {
        const conn = await getContract();
        gateway = conn.gateway;
        const tx = conn.contract.createTransaction('transferOwnership');
        const result = await tx.submit(landId, newOwnerName, newOwnerAadhaar || '', String(salePrice), transferId);
        const txId = tx.getTransactionId();
        console.log(`✅ Blockchain: Land ${landId} transferred. TxID: ${txId}`);
        return { success: true, txId, data: JSON.parse(result.toString()) };
    } catch (error) {
        console.error('❌ Blockchain transferOwnership error:', error.message);
        throw error;
    } finally {
        if (gateway) gateway.disconnect();
    }
}

async function getLandHistoryFromBlockchain(landId) {
    let gateway;
    try {
        const conn = await getContract();
        gateway = conn.gateway;
        const result = await conn.contract.evaluateTransaction('getLandHistory', landId);
        return { success: true, history: JSON.parse(result.toString()) };
    } catch (error) {
        console.error('❌ Blockchain getLandHistory error:', error.message);
        throw error;
    } finally {
        if (gateway) gateway.disconnect();
    }
}

async function testConnection() {
    let gateway;
    try {
        const conn = await getContract();
        gateway = conn.gateway;
        console.log('✅ Blockchain connection successful');
        return true;
    } catch (error) {
        console.error('❌ Blockchain connection failed:', error.message);
        return false;
    } finally {
        if (gateway) gateway.disconnect();
    }
}

module.exports = {
    markDisputedOnBlockchain,
    createLandOnBlockchain,
    queryLand,
    approveLoanOnBlockchain,
    clearLoanOnBlockchain,
    transferOwnershipOnBlockchain,
    getLandHistoryFromBlockchain,
    testConnection,
    blockchainService: {
        isConnected: true,
        connect: async () => true,
        createLandRecord: async (d) => createLandOnBlockchain(d),
        mortgageLand: async (landId, bankId, amount) => approveLoanOnBlockchain(landId, bankId, '', '', amount),
        clearMortgage: async (landId) => clearLoanOnBlockchain(landId, ''),
        transferLand: async (landId, _, toOwner) => transferOwnershipOnBlockchain(landId, toOwner, '', 0, ''),
        getLandRecord: async (landId) => queryLand(landId),
    }
};

async function markDisputedOnBlockchain(landId, reason) {
    let gateway;
    try {
        const conn = await getContract();
        gateway = conn.gateway;
        const tx = conn.contract.createTransaction('markDisputed');
        const result = await tx.submit(landId, reason);
        const txId = tx.getTransactionId();
        console.log(`✅ Blockchain: Land ${landId} marked DISPUTED. TxID: ${txId}`);
        return { success: true, txId, data: JSON.parse(result.toString()) };
    } catch (error) {
        console.error('❌ Blockchain markDisputed error:', error.message);
        throw error;
    } finally {
        if (gateway) gateway.disconnect();
    }
}

module.exports.markDisputedOnBlockchain = markDisputedOnBlockchain;
