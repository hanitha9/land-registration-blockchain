'use strict';

const { Contract } = require('fabric-contract-api');

class LandRegistryContract extends Contract {

    async initLedger(ctx) {
        console.info('Ledger initialized');
        return JSON.stringify({ success: true });
    }

    async createLand(ctx, landId, ownerName, ownerAadhaar, areaSqFt, landType, marketValue, district, state) {
        const exists = await this.landExists(ctx, landId);
        if (exists) throw new Error(`Land ${landId} already exists on blockchain`);

        const timestamp = new Date(ctx.stub.getTxTimestamp().seconds.low * 1000).toISOString();
        const land = {
            landId, ownerName, ownerAadhaar,
            areaSqFt: Number(areaSqFt),
            landType,
            marketValue: Number(marketValue),
            district, state,
            currentStatus: 'ACTIVE',
            isMortgaged: false,
            encumbranceDetails: { bankId: null, bankName: null, loanId: null, loanAmount: 0, loanStatus: 'NONE' },
            previousOwners: [],
            registrationDate: timestamp,
            lastUpdated: timestamp,
            docType: 'land'
        };
        await ctx.stub.putState(landId, Buffer.from(JSON.stringify(land)));
        ctx.stub.setEvent('LandCreated', Buffer.from(JSON.stringify({ landId, ownerName, timestamp })));
        return JSON.stringify(land);
    }

    async queryLand(ctx, landId) {
        const landBytes = await ctx.stub.getState(landId);
        if (!landBytes || landBytes.length === 0) throw new Error(`Land ${landId} does not exist on blockchain`);
        return landBytes.toString();
    }

    async approveLoan(ctx, landId, bankId, bankName, loanId, loanAmount) {
        const landBytes = await ctx.stub.getState(landId);
        if (!landBytes || landBytes.length === 0) throw new Error(`Land ${landId} does not exist on blockchain`);

        const land = JSON.parse(landBytes.toString());

        if (land.currentStatus !== 'ACTIVE')
            throw new Error(`FRAUD BLOCKED: Land ${landId} status is ${land.currentStatus} — must be ACTIVE`);
        if (land.isMortgaged)
            throw new Error(`FRAUD BLOCKED: Land ${landId} already mortgaged with ${land.encumbranceDetails.bankName} — double financing blocked`);

        const timestamp = new Date(ctx.stub.getTxTimestamp().seconds.low * 1000).toISOString();
        land.currentStatus = 'LOCKED';
        land.isMortgaged = true;
        land.encumbranceDetails = { bankId, bankName, loanId, loanAmount: Number(loanAmount), loanStatus: 'APPROVED', mortgageDate: timestamp };
        land.lastUpdated = timestamp;

        await ctx.stub.putState(landId, Buffer.from(JSON.stringify(land)));
        ctx.stub.setEvent('LoanApproved', Buffer.from(JSON.stringify({ landId, bankName, loanId, timestamp })));
        return JSON.stringify(land);
    }

    async clearLoan(ctx, landId, loanId) {
        const landBytes = await ctx.stub.getState(landId);
        if (!landBytes || landBytes.length === 0) throw new Error(`Land ${landId} does not exist on blockchain`);

        const land = JSON.parse(landBytes.toString());
        if (!land.isMortgaged) throw new Error(`Land ${landId} is not mortgaged`);
        if (land.encumbranceDetails.loanId !== loanId) throw new Error(`Loan ID mismatch for land ${landId}`);

        const timestamp = new Date(ctx.stub.getTxTimestamp().seconds.low * 1000).toISOString();
        land.currentStatus = 'ACTIVE';
        land.isMortgaged = false;
        land.encumbranceDetails.loanStatus = 'CLEARED';
        land.encumbranceDetails.clearanceDate = timestamp;
        land.lastUpdated = timestamp;

        await ctx.stub.putState(landId, Buffer.from(JSON.stringify(land)));
        ctx.stub.setEvent('LoanCleared', Buffer.from(JSON.stringify({ landId, loanId, timestamp })));
        return JSON.stringify(land);
    }

    async transferOwnership(ctx, landId, newOwnerName, newOwnerAadhaar, salePrice, transferId) {
        const landBytes = await ctx.stub.getState(landId);
        if (!landBytes || landBytes.length === 0) throw new Error(`Land ${landId} does not exist on blockchain`);

        const land = JSON.parse(landBytes.toString());

        if (land.currentStatus === 'LOCKED')
            throw new Error(`FRAUD BLOCKED: Land ${landId} is LOCKED — active mortgage with ${land.encumbranceDetails.bankName}`);
        if (land.currentStatus === 'DISPUTED')
            throw new Error(`FRAUD BLOCKED: Land ${landId} has active legal dispute`);
        if (land.isMortgaged)
            throw new Error(`FRAUD BLOCKED: Cannot transfer mortgaged land — clear loan first`);

        const timestamp = new Date(ctx.stub.getTxTimestamp().seconds.low * 1000).toISOString();
        land.previousOwners.push({ ownerName: land.ownerName, ownerAadhaar: land.ownerAadhaar, transferDate: timestamp, salePrice: Number(salePrice), transferId });
        land.ownerName = newOwnerName;
        land.ownerAadhaar = newOwnerAadhaar;
        land.currentStatus = 'ACTIVE';
        land.marketValue = Number(salePrice);
        land.lastUpdated = timestamp;

        await ctx.stub.putState(landId, Buffer.from(JSON.stringify(land)));
        ctx.stub.setEvent('OwnershipTransferred', Buffer.from(JSON.stringify({ landId, newOwnerName, salePrice, transferId, timestamp })));
        return JSON.stringify(land);
    }

    async markDisputed(ctx, landId, reason) {
        const landBytes = await ctx.stub.getState(landId);
        if (!landBytes || landBytes.length === 0) throw new Error(`Land ${landId} does not exist`);

        const land = JSON.parse(landBytes.toString());
        const timestamp = new Date(ctx.stub.getTxTimestamp().seconds.low * 1000).toISOString();
        land.currentStatus = 'DISPUTED';
        land.disputeDetails = { reason, disputeDate: timestamp };
        land.lastUpdated = timestamp;

        await ctx.stub.putState(landId, Buffer.from(JSON.stringify(land)));
        ctx.stub.setEvent('LandDisputed', Buffer.from(JSON.stringify({ landId, reason, timestamp })));
        return JSON.stringify(land);
    }

    async getLandHistory(ctx, landId) {
        const iterator = await ctx.stub.getHistoryForKey(landId);
        const history = [];
        let result = await iterator.next();
        while (!result.done) {
            history.push({
                txId: result.value.txId,
                timestamp: new Date(result.value.timestamp.seconds.low * 1000).toISOString(),
                isDelete: result.value.isDelete,
                data: result.value.value ? JSON.parse(result.value.value.toString()) : null
            });
            result = await iterator.next();
        }
        await iterator.close();
        return JSON.stringify(history);
    }

    async getAllLands(ctx) {
        const allResults = [];
        const iterator = await ctx.stub.getStateByRange('', '');
        let result = await iterator.next();
        while (!result.done) {
            try {
                const record = JSON.parse(Buffer.from(result.value.value.toString()).toString('utf8'));
                if (record.docType === 'land') allResults.push(record);
            } catch (err) { console.log(err); }
            result = await iterator.next();
        }
        await iterator.close();
        return JSON.stringify(allResults);
    }

    async landExists(ctx, landId) {
        const landBytes = await ctx.stub.getState(landId);
        return landBytes && landBytes.length > 0;
    }

    async registerLand(ctx, landId, ownerName, area, location, marketValue) {
        return await this.createLand(ctx, landId, ownerName, '', area, 'Residential', marketValue, location, '');
    }

    async readLand(ctx, landId) {
        return await this.queryLand(ctx, landId);
    }

    async transferLand(ctx, landId, newOwnerName) {
        return await this.transferOwnership(ctx, landId, newOwnerName, '', '0', 'LEGACY');
    }
}

module.exports = LandRegistryContract;
