'use strict';

const FabricNetwork = require('../utils/fabricNetwork');

class LandController {
    async registerLand(req, res) {
        try {
            const { landId, ownerName, area, location, marketValue } = req.body;

            if (!landId || !ownerName || !area || !location || !marketValue) {
                return res.status(400).json({
                    success: false,
                    message: 'All fields are required'
                });
            }

            const fabricNetwork = new FabricNetwork();
            const { gateway, contract } = await fabricNetwork.connectToNetwork();

            const result = await contract.submitTransaction(
                'registerLand',
                landId,
                ownerName,
                area,
                location,
                marketValue
            );

            await fabricNetwork.disconnectFromNetwork(gateway);

            res.status(201).json({
                success: true,
                message: 'Land registered successfully',
                data: JSON.parse(result.toString())
            });
        } catch (error) {
            console.error(`Error registering land: ${error}`);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    async getLand(req, res) {
        try {
            const { landId } = req.params;

            const fabricNetwork = new FabricNetwork();
            const { gateway, contract } = await fabricNetwork.connectToNetwork();

            const result = await contract.evaluateTransaction('readLand', landId);

            await fabricNetwork.disconnectFromNetwork(gateway);

            res.status(200).json({
                success: true,
                data: JSON.parse(result.toString())
            });
        } catch (error) {
            console.error(`Error getting land: ${error}`);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    async getAllLands(req, res) {
        try {
            const fabricNetwork = new FabricNetwork();
            const { gateway, contract } = await fabricNetwork.connectToNetwork();

            const result = await contract.evaluateTransaction('getAllLands');

            await fabricNetwork.disconnectFromNetwork(gateway);

            res.status(200).json({
                success: true,
                data: JSON.parse(result.toString())
            });
        } catch (error) {
            console.error(`Error getting all lands: ${error}`);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    async transferLand(req, res) {
        try {
            const { landId } = req.params;
            const { newOwnerName } = req.body;

            if (!newOwnerName) {
                return res.status(400).json({
                    success: false,
                    message: 'New owner name is required'
                });
            }

            const fabricNetwork = new FabricNetwork();
            const { gateway, contract } = await fabricNetwork.connectToNetwork();

            const result = await contract.submitTransaction('transferLand', landId, newOwnerName);

            await fabricNetwork.disconnectFromNetwork(gateway);

            res.status(200).json({
                success: true,
                message: 'Land transferred successfully',
                data: JSON.parse(result.toString())
            });
        } catch (error) {
            console.error(`Error transferring land: ${error}`);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    async deleteLand(req, res) {
        try {
            const { landId } = req.params;

            const fabricNetwork = new FabricNetwork();
            const { gateway, contract } = await fabricNetwork.connectToNetwork();

            const result = await contract.submitTransaction('deleteLand', landId);

            await fabricNetwork.disconnectFromNetwork(gateway);

            res.status(200).json({
                success: true,
                message: result.toString()
            });
        } catch (error) {
            console.error(`Error deleting land: ${error}`);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
}

module.exports = new LandController();
