'use strict';

const { Gateway, Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const path = require('path');
const fs = require('fs');

class FabricNetwork {
    constructor() {
        this.channelName = 'landchannel';
        this.chaincodeName = 'landregistry';
        this.walletPath = path.join(__dirname, '../wallet');
        this.connectionProfilePath = path.join(__dirname, '../config/connection-org1.json');
    }

    async connectToNetwork(username = 'appUser') {
        try {
            // Load connection profile
            const ccpPath = this.connectionProfilePath;
            const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

            // Create wallet
            const wallet = await Wallets.newFileSystemWallet(this.walletPath);

            // Check if user exists in wallet
            const identity = await wallet.get(username);
            if (!identity) {
                console.log(`Identity for user ${username} not found in wallet`);
                console.log('Run enrollAdmin.js and registerUser.js first');
                throw new Error(`User ${username} not enrolled`);
            }

            // Create gateway
            const gateway = new Gateway();
            await gateway.connect(ccp, {
                wallet,
                identity: username,
                discovery: { enabled: true, asLocalhost: true }
            });

            // Get network and contract
            const network = await gateway.getNetwork(this.channelName);
            const contract = network.getContract(this.chaincodeName);

            return { gateway, network, contract };
        } catch (error) {
            console.error(`Failed to connect to network: ${error}`);
            throw error;
        }
    }

    async disconnectFromNetwork(gateway) {
        if (gateway) {
            await gateway.disconnect();
        }
    }

    async enrollAdmin() {
        try {
            const ccpPath = this.connectionProfilePath;
            const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

            const caInfo = ccp.certificateAuthorities['ca.org1.example.com'];
            const caTLSCACertsPath = path.resolve(__dirname, '..', caInfo.tlsCACerts.path);
            const caTLSCACerts = fs.readFileSync(caTLSCACertsPath, 'utf8');
            const ca = new FabricCAServices(caInfo.url, { trustedRoots: caTLSCACerts, verify: false }, caInfo.caName);

            const wallet = await Wallets.newFileSystemWallet(this.walletPath);

            const identity = await wallet.get('admin');
            if (identity) {
                console.log('Admin already enrolled');
                return;
            }

            const enrollment = await ca.enroll({ enrollmentID: 'admin', enrollmentSecret: 'adminpw' });
            const x509Identity = {
                credentials: {
                    certificate: enrollment.certificate,
                    privateKey: enrollment.key.toBytes(),
                },
                mspId: 'Org1MSP',
                type: 'X.509',
            };
            await wallet.put('admin', x509Identity);
            console.log('Successfully enrolled admin user and imported into wallet');
        } catch (error) {
            console.error(`Failed to enroll admin: ${error}`);
            throw error;
        }
    }

    async registerUser(username = 'appUser') {
        try {
            const ccpPath = this.connectionProfilePath;
            const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

            const caURL = ccp.certificateAuthorities['ca.org1.example.com'].url;
            const ca = new FabricCAServices(caURL);

            const wallet = await Wallets.newFileSystemWallet(this.walletPath);

            const userIdentity = await wallet.get(username);
            if (userIdentity) {
                console.log(`User ${username} already registered`);
                return;
            }

            const adminIdentity = await wallet.get('admin');
            if (!adminIdentity) {
                console.log('Admin needs to be enrolled first');
                throw new Error('Admin not enrolled');
            }

            const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
            const adminUser = await provider.getUserContext(adminIdentity, 'admin');

            let secret;
            try {
                secret = await ca.register({
                    affiliation: 'org1.department1',
                    enrollmentID: username,
                    role: 'client'
                }, adminUser);
            } catch (registerErr) {
                if (registerErr.message && registerErr.message.includes('already registered')) {
                    console.log(`User ${username} already registered in CA — re-enrolling with default secret`);
                    secret = username + 'pw'; // default secret pattern
                } else {
                    throw registerErr;
                }
            }

            let enrollment;
            try {
                enrollment = await ca.enroll({
                    enrollmentID: username,
                    enrollmentSecret: secret
                });
            } catch(enrollErr) {
                // Try with 'appUserpw' as fallback secret
                enrollment = await ca.enroll({
                    enrollmentID: username,
                    enrollmentSecret: 'appUserpw'
                });
            }

            const x509Identity = {
                credentials: {
                    certificate: enrollment.certificate,
                    privateKey: enrollment.key.toBytes(),
                },
                mspId: 'Org1MSP',
                type: 'X.509',
            };

            await wallet.put(username, x509Identity);
            console.log(`Successfully registered and enrolled user ${username}`);
        } catch (error) {
            console.error(`Failed to register user: ${error}`);
            throw error;
        }
    }
}

module.exports = FabricNetwork;
