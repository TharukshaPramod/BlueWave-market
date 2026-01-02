const express = require('express');
   const router = express.Router();
   const fishItemController = require('../controllers/fishItemController');
   const validateRequest = require('../middleware/validate');

   router.post('/', fishItemController.upload.single('photo'), validateRequest, fishItemController.addFishItem); // Admin
   router.get('/', fishItemController.getFishItems); // Customer
   router.get('/search', fishItemController.searchFishItems); // Admin
   router.get('/report/low-stock', fishItemController.getLowStockReport); // Admin
   router.get('/:id', fishItemController.getFishItemById); // Customer
   router.put('/:id', fishItemController.upload.single('photo'), validateRequest, fishItemController.updateFishItem); // Admin
   router.delete('/:id', fishItemController.deleteFishItem); // Admin

   module.exports = router;