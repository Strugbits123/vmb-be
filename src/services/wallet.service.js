const Wallet = require("../models/Wallet/wallet.model");

const createWallet = async (walletData) => {
    const existingWallet = await Wallet.findOne({ userId: walletData.userId });
    if (existingWallet) {
        throw new Error('Wallet already exists for this user');
    }
    const wallet = new Wallet(walletData);
    await wallet.save();
    return wallet;
}

const getWalletByUserId = async (userId) => {
    const wallet = await Wallet.findOne({ userId });
    return wallet;
}

const updateWallet = async (walletId, updateData) => {
    if(!updateData || Object.keys(updateData).length === 0) {
        throw new Error('No data provided for update');
    }
    const isValidWallet = await Wallet.findById(walletId);
    if (!isValidWallet) {
        throw new Error('Wallet not found');
    }

    const updateQuery = { ...updateData };
    if (updateData.transactions) {
        updateQuery.$push = { transactions: { $each: updateData.transactions } };
        delete updateQuery.transactions;
    }

    const wallet = await Wallet.findByIdAndUpdate(walletId, updateQuery, { new: true, runValidators: true });
    return wallet;
}

module.exports = {
    createWallet,
    getWalletByUserId,
    updateWallet,
};
