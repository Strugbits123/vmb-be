const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const salonServiceController = require('../controllers/salon-service.controller');

router.post('/create-service', protect("salon-owner"), salonServiceController.createSalonService);
router.get('/get-services', protect("salon-owner"), salonServiceController.getSalonServices);
router.patch('/update-service/:serviceId', protect("salon-owner"), salonServiceController.updateSalonService);
router.delete('/delete-service/:serviceId', protect("salon-owner"), salonServiceController.deleteSalonService);

module.exports = router;