const express = require('express');
const router = express.Router();
const maintenanceController = require('../controllers/maintenanceController');
const validateRequest = require('../middleware/validate');

router.post('/', validateRequest, maintenanceController.addMaintenance);
router.get('/', maintenanceController.getMaintenanceRecords);
router.get('/search', maintenanceController.searchMaintenance);
router.get('/report', maintenanceController.getMaintenanceReport); // Add report route
router.get('/:id', maintenanceController.getMaintenanceById);
router.put('/:id', validateRequest, maintenanceController.updateMaintenance);
router.delete('/:id', maintenanceController.deleteMaintenance);

module.exports = router;