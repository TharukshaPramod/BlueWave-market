const express = require('express');
   const router = express.Router();
   const fleetController = require('../controllers/fleetController');
   const validateRequest = require('../middleware/validate');

   router.post('/', validateRequest, fleetController.addFleet);
   router.get('/', fleetController.getFleets);
   router.get('/search', fleetController.searchFleet);
   router.get('/report/usage', fleetController.getFleetUsageReport);
   router.get('/:id', fleetController.getFleetById);
   router.put('/:id', validateRequest, fleetController.updateFleet);
   router.delete('/:id', fleetController.deleteFleet);

   module.exports = router;