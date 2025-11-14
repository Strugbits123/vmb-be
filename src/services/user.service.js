const User = require("../models/User/user.model");


const getUserById = async (userId) => {
    const user = await User.findById(userId).select('-password');
    if (!user) throw new Error('User not found');
    return user;
}

const updateUser = async (userId, updateData) => {
    if(!updateData || Object.keys(updateData).length === 0) {
        throw new Error('No data provided for update');
    }
    const isValidUser = await getUserById(userId);
    if (!isValidUser) {
        throw new Error('User not found');
    }

    const user = await User.findByIdAndUpdate(userId, updateData, { new: true, runValidators: true }).select('-password');
    if (!user) throw new Error('User not found or update failed');
    return user;
}

module.exports = {
    getUserById,
    updateUser
};