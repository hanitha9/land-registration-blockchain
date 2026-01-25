'use strict';

const FabricNetwork = require('./utils/fabricNetwork');

async function main() {
    try {
        const fabricNetwork = new FabricNetwork();
        await fabricNetwork.enrollAdmin();
        console.log('Admin enrollment completed successfully');
    } catch (error) {
        console.error(`Failed to enroll admin: ${error}`);
        process.exit(1);
    }
}

main();
