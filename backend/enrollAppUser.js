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

    // Get admin identity
    const adminIdentity = await wallet.get('admin');
    const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
    const adminUser = await provider.getUserContext(adminIdentity, 'admin');

    // Modify identity to reset secret and revocation
    try {
        await ca.newIdentityService().update('appUser', {
            secret: 'appUser123',
            maxEnrollments: -1
        }, adminUser);
        console.log('Identity updated');
    } catch(e) {
        console.log('Update skipped:', e.message);
    }

    // Force enroll
    try {
        const enrollment = await ca.enroll({
            enrollmentID: 'appUser',
            enrollmentSecret: 'appUser123'
        });
        const x509Identity = {
            credentials: {
                certificate: enrollment.certificate,
                privateKey: enrollment.key.toBytes(),
            },
            mspId: 'Org1MSP',
            type: 'X.509',
        };
        await wallet.put('appUser', x509Identity);
        console.log('✅ appUser enrolled successfully');
    } catch(e) {
        console.error('❌ Enroll failed:', e.message);
    }
}
main();
