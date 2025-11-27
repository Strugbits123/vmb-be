const walletService = require("../services/wallet.service");
const { ErrorHandler,
    getValidationErrorMessage,
    SuccessHandler } = require("../utils/responseHandler");


const getWallet = async (req, res) => {
    try {
        const userId = req.user.id;
        const result = await walletService.getWalletByUserId(userId);
        return SuccessHandler("Wallet fetched successfully", result, 200, res, req);
    }catch (error) {
        const message = getValidationErrorMessage(error);
        return ErrorHandler(message, 400, req, res);
    }
};

const updateWallet = async (req, res) => {
    try {        
        const userId = req.user.id;
        const wallet = await walletService.getWalletByUserId(userId);
        if (!wallet) {
            throw new Error('Wallet not found for the user');
        }
        const updateData = req.body;
        const result = await walletService.updateWallet(wallet._id, updateData);
        return SuccessHandler("Wallet updated successfully", result, 200, res, req);
    } catch (error) {
        console.log("error", error);
        
        const message = getValidationErrorMessage(error);
        return ErrorHandler(message, 400, req, res);
    }
};

const createWallet = async (req, res) => {
    try {
        const walletData = req.body || {};
        walletData.userId = req.user.id;
        const result = await walletService.createWallet(walletData);
        return SuccessHandler("Wallet created successfully", result, 201, res, req);
    } catch (error) {
        const message = getValidationErrorMessage(error);
        return ErrorHandler(message, 400, req, res);
    }
};

module.exports = {
    getWallet,
    createWallet,
    updateWallet
}