const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const walletController = require('../controllers/wallet.controller');

router.post('/create-wallet', walletController.createWallet);
router.get('/get-wallet', protect(), walletController.getWallet);
router.patch('/update-wallet/:walletId', protect(), walletController.updateWallet);



module.exports = router;