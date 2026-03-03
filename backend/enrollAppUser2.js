'use strict';
const FabricCAServices = require('fabric-ca-client');
const { Wallets } = require('fabric-network');
const path = require('path');
const fs = require('fs');

async function main() {
    const ccpPath = path.join(__dirname, 'config/connection-org1.json');
    const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
    const caInfo = ccp.certificateAuthorities['ca.org1.example.com'];
    const caTLSCACerts = fs.readFileSync(path.resolve(__dirname, caInfo.tlsCACerts.path), 'utf8');
    const ca = new FabricCAServices(caInfo.url, { trustedRoots: caTLSCACerts, verify: false }, caInfo.caName);
    const wallet = await Wallets.newFileSystemWallet(path.join(__dirname, 'wallet'));

    const enrollment = await ca.enroll({
        enrollmentID: 'appUser2',
        enrollmentSecret: 'appUser2pw'
    });
    const x509Identity = {
        credentials: {
            certificate: enrollment.certificate,
            privateKey: enrollment.key.toBytes(),
        },
        mspId: 'Org1MSP',
        type: 'X.509',
    };
    await wallet.put('appUser2', x509Identity);
    console.log('✅ appUser2 added to wallet successfully');
}
main();
