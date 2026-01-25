'use strict';

const FabricNetwork = require('./utils/fabricNetwork');

async function main() {
    try {
        const fabricNetwork = new FabricNetwork();
        await fabricNetwork.registerUser('appUser');
        console.log('User registration completed successfully');
    } catch (error) {
        console.error(`Failed to register user: ${error}`);
        process.exit(1);
    }
}

main();

