const express = require('express');
   const router = express.Router();
   const staffController = require('../controllers/staffController');
   const validateRequest = require('../middleware/validate');

   router.post('/', validateRequest, staffController.addStaff);
   router.get('/', staffController.getStaff);
   router.get('/search', staffController.searchStaff);
   router.get('/report/assignments', staffController.getStaffAssignmentReport);
   router.get('/:id', staffController.getStaffById);
   router.put('/:id', validateRequest, staffController.updateStaff);
   router.delete('/:id', staffController.deleteStaff);

   module.exports = router;