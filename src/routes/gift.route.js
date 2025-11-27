const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const giftController = require('../controllers/gift.controller');

router.post('/create-gift', protect(), giftController.createGift);
router.patch('/accept-gift/:giftId', protect(), giftController.acceptGift);
router.patch('/reject-gift/:giftId', protect(), giftController.rejectGift);

router.get('/requested-gifts', protect(), giftController.getRequestedGifts);
router.get('/recieved-gifts', protect(), giftController.getRecievedGifts);
router.get('/gift-details/:giftId', protect(), giftController.getGiftDetails);

module.exports = router;