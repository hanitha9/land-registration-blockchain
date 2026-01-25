'use strict';

const { Contract } = require('fabric-contract-api');

class LandRegistryContract extends Contract {

    async initLedger(ctx) {
        console.info('============= START : Initialize Ledger ===========');
        
        const timestamp = new Date(ctx.stub.getTxTimestamp().seconds.low * 1000).toISOString();
        
        const lands = [
            {
                landId: 'LAND001',
                ownerName: 'aravindha',
                area: '500 sq meters',
                location: 'Plot 123, Sector 5, City',
                marketValue: '5000000',
                status: 'REGISTERED',
                registrationDate: timestamp,
                docType: 'land'
            }
        ];

        for (const land of lands) {
            await ctx.stub.putState(land.landId, Buffer.from(JSON.stringify(land)));
            console.info(`Land ${land.landId} added`);
        }
        console.info('============= END : Initialize Ledger ===========');
    }

    async registerLand(ctx, landId, ownerName, area, location, marketValue) {
        console.info('============= START : Register Land ===========');

        // Check if land already exists
        const exists = await this.landExists(ctx, landId);
        if (exists) {
            throw new Error(`Land ${landId} already exists`);
        }

        // Use transaction timestamp for deterministic behavior
        const timestamp = new Date(ctx.stub.getTxTimestamp().seconds.low * 1000).toISOString();

        const land = {
            landId,
            ownerName,
            area,
            location,
            marketValue,
            status: 'REGISTERED',
            registrationDate: timestamp,
            docType: 'land'
        };

        await ctx.stub.putState(landId, Buffer.from(JSON.stringify(land)));
        console.info('============= END : Register Land ===========');
        return JSON.stringify(land);
    }

    async readLand(ctx, landId) {
        const landBytes = await ctx.stub.getState(landId);
        if (!landBytes || landBytes.length === 0) {
            throw new Error(`Land ${landId} does not exist`);
        }
        return landBytes.toString();
    }

    async transferLand(ctx, landId, newOwnerName) {
        console.info('============= START : Transfer Land ===========');

        const landBytes = await ctx.stub.getState(landId);
        if (!landBytes || landBytes.length === 0) {
            throw new Error(`Land ${landId} does not exist`);
        }

        const land = JSON.parse(landBytes.toString());
        land.ownerName = newOwnerName;
        land.status = 'TRANSFERRED';
        
        // Use transaction timestamp
        const timestamp = new Date(ctx.stub.getTxTimestamp().seconds.low * 1000).toISOString();
        land.lastTransferDate = timestamp;

        await ctx.stub.putState(landId, Buffer.from(JSON.stringify(land)));
        console.info('============= END : Transfer Land ===========');
        return JSON.stringify(land);
    }

    async deleteLand(ctx, landId) {
        console.info('============= START : Delete Land ===========');
        
        const exists = await this.landExists(ctx, landId);
        if (!exists) {
            throw new Error(`Land ${landId} does not exist`);
        }

        await ctx.stub.deleteState(landId);
        console.info('============= END : Delete Land ===========');
        return `Land ${landId} deleted from registry`;
    }

    async landExists(ctx, landId) {
        const landBytes = await ctx.stub.getState(landId);
        return landBytes && landBytes.length > 0;
    }

    async getAllLands(ctx) {
        const allResults = [];
        const iterator = await ctx.stub.getStateByRange('', '');
        let result = await iterator.next();
        
        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
                if (record.docType === 'land') {
                    allResults.push(record);
                }
            } catch (err) {
                console.log(err);
            }
            result = await iterator.next();
        }
        return JSON.stringify(allResults);
    }
}

module.exports = LandRegistryContract;
