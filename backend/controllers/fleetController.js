const Fleet = require('../models/Fleet');
   const FleetMaintenance = require('../models/FleetMaintenance');

   exports.addFleet = async (req, res) => {
     try {
       const fleet = new Fleet(req.body);
       await fleet.validate();
       await fleet.save();
       res.status(201).json(fleet);
     } catch (error) {
       res.status(400).json({ message: 'Invalid fleet data', errors: error.errors });
     }
   };

   exports.getFleets = async (req, res) => {
     try {
       const fleets = await Fleet.find()
         .populate('assigned_driver_id', 'full_name role staff_id')
         .lean();
       const fleetsWithMaintenance = await Promise.all(
         fleets.map(async (f) => {
           const maintenanceRecords = await FleetMaintenance.find({ fleet_id: f._id })
             .select('maintenance_date description cost next_due_date');
           return { ...f, maintenanceRecords };
         })
       );
       res.json(fleetsWithMaintenance);
     } catch (error) {
       res.status(500).json({ message: error.message });
     }
   };

   exports.getFleetById = async (req, res) => {
     try {
       const fleet = await Fleet.findById(req.params.id)
         .populate('assigned_driver_id', 'full_name role staff_id')
         .lean();
       if (!fleet) return res.status(404).json({ message: 'Fleet not found' });
       const maintenanceRecords = await FleetMaintenance.find({ fleet_id: fleet._id })
         .select('maintenance_date description cost next_due_date');
       res.json({ ...fleet, maintenanceRecords });
     } catch (error) {
       res.status(500).json({ message: error.message });
     }
   };

   exports.updateFleet = async (req, res) => {
     try {
       const fleet = await Fleet.findById(req.params.id);
       if (!fleet) return res.status(404).json({ message: 'Fleet not found' });

       Object.assign(fleet, req.body);
       await fleet.validate();
       await fleet.save();
       res.json(fleet);
     } catch (error) {
       res.status(400).json({ message: 'Invalid update data', errors: error.errors });
     }
   };

   exports.deleteFleet = async (req, res) => {
     try {
       const fleet = await Fleet.findById(req.params.id);
       if (!fleet) return res.status(404).json({ message: 'Fleet not found' });
       if (fleet.status === 'In Use') {
         return res.status(400).json({ message: 'Cannot delete fleet in use' });
       }
       await Fleet.findByIdAndDelete(req.params.id);
       res.json({ message: 'Fleet deleted' });
     } catch (error) {
       res.status(500).json({ message: error.message });
     }
   };

   // Search Fleet
   exports.searchFleet = async (req, res) => {
     try {
       const { fleet_id, vehicle_type } = req.query;
       const query = {};
       if (fleet_id) query.fleet_id = { $regex: fleet_id, $options: 'i' };
       if (vehicle_type) query.vehicle_type = { $regex: vehicle_type, $options: 'i' };
       const fleet = await Fleet.find(query)
         .populate('assigned_driver_id', 'full_name role staff_id')
         .lean();
       const fleetsWithMaintenance = await Promise.all(
         fleet.map(async (f) => {
           const maintenanceRecords = await FleetMaintenance.find({ fleet_id: f._id })
             .select('maintenance_date description cost next_due_date');
           return { ...f, maintenanceRecords };
         })
       );
       res.json(fleetsWithMaintenance);
     } catch (error) {
       res.status(500).json({ message: error.message });
     }
   };

   // Fleet Usage Report
   exports.getFleetUsageReport = async (req, res) => {
     try {
       const fleet = await Fleet.find()
         .populate('assigned_driver_id', 'full_name role staff_id')
         .lean();
       const report = await Promise.all(
         fleet.map(async (f) => {
           const maintenanceCount = await FleetMaintenance.countDocuments({ fleet_id: f._id });
           return {
             fleet_id: f.fleet_id,
             vehicle_type: f.vehicle_type,
             status: f.status,
             assigned_driver: f.assigned_driver_id ? f.assigned_driver_id.full_name : 'None',
             maintenanceCount,
           };
         })
       );
       res.json(report);
     } catch (error) {
       res.status(500).json({ message: error.message });
     }
   };

   module.exports = exports;