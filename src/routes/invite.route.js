const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const inviteController = require('../controllers/invite.controller');

router.post("/create-invite/", protect("salon-owner"), inviteController.createInvite)


module.exports = router;