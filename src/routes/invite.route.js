const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const inviteController = require('../controllers/invite.controller');

router.post("/create-invite/", protect("salon-owner"), inviteController.createInvite)
router.patch("/accept-invite/:inviteId", protect("customer"), inviteController.acceptInvite)

router.get("/get-user-invites/", protect("customer"), inviteController.getUserInvites)
router.get("/get-salon-invites/", protect("salon-owner"), inviteController.getSalonInvites)
router.get("/get-admin-invites/", protect("admin"), inviteController.getAdminInvites)

router.get("/get-invite-details/:id", protect(), inviteController.getInvite)


module.exports = router;