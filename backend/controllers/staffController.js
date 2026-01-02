const Staff = require('../models/Staff');
   const Fleet = require('../models/Fleet');

   exports.addStaff = async (req, res) => {
     try {
       const staff = new Staff(req.body);
       await staff.validate();
       await staff.save();
       res.status(201).json(staff);
     } catch (error) {
       res.status(400).json({ message: 'Invalid staff data', errors: error.errors });
     }
   };

   exports.getStaff = async (req, res) => {
     try {
       const staff = await Staff.find().lean();
       const staffWithFleets = await Promise.all(
         staff.map(async (s) => {
           const assignedFleet = await Fleet.findOne({ assigned_driver_id: s._id })
             .select('fleet_id vehicle_type status');
           return { ...s, assignedFleet: assignedFleet || null };
         })
       );
       res.json(staffWithFleets);
     } catch (error) {
       res.status(500).json({ message: error.message });
     }
   };

   exports.getStaffById = async (req, res) => {
     try {
       const staff = await Staff.findById(req.params.id).lean();
       if (!staff) return res.status(404).json({ message: 'Staff not found' });
       const assignedFleet = await Fleet.findOne({ assigned_driver_id: staff._id })
         .select('fleet_id vehicle_type status');
       res.json({ ...staff, assignedFleet: assignedFleet || null });
     } catch (error) {
       res.status(500).json({ message: error.message });
     }
   };

   exports.updateStaff = async (req, res) => {
     try {
       const staff = await Staff.findById(req.params.id);
       if (!staff) return res.status(404).json({ message: 'Staff not found' });

       Object.assign(staff, req.body);
       await staff.validate();
       await staff.save();
       res.json(staff);
     } catch (error) {
       res.status(400).json({ message: 'Invalid update data', errors: error.errors });
     }
   };

   exports.deleteStaff = async (req, res) => {
     try {
       const staff = await Staff.findById(req.params.id);
       if (!staff) return res.status(404).json({ message: 'Staff not found' });
       const assignedFleet = await Fleet.findOne({ assigned_driver_id: staff._id });
       if (assignedFleet) {
         return res.status(400).json({ message: 'Cannot delete staff assigned to a fleet' });
       }
       await Staff.findByIdAndDelete(req.params.id);
       res.json({ message: 'Staff deleted' });
     } catch (error) {
       res.status(500).json({ message: error.message });
     }
   };

   // Search Staff
   exports.searchStaff = async (req, res) => {
     try {
       const { full_name, role } = req.query;
       const query = {};
       if (full_name) query.full_name = { $regex: full_name, $options: 'i' };
       if (role) query.role = { $regex: role, $options: 'i' };
       const staff = await Staff.find(query).lean();
       const staffWithFleets = await Promise.all(
         staff.map(async (s) => {
           const assignedFleet = await Fleet.findOne({ assigned_driver_id: s._id })
             .select('fleet_id vehicle_type status');
           return { ...s, assignedFleet: assignedFleet || null };
         })
       );
       res.json(staffWithFleets);
     } catch (error) {
       res.status(500).json({ message: error.message });
     }
   };

   // Staff Assignment Report
   exports.getStaffAssignmentReport = async (req, res) => {
     try {
       const staff = await Staff.find().lean();
       const report = await Promise.all(
         staff.map(async (s) => {
           const assignedFleet = await Fleet.findOne({ assigned_driver_id: s._id })
             .select('fleet_id vehicle_type status');
           return {
             staff_id: s.staff_id,
             full_name: s.full_name,
             role: s.role,
             email: s.email,
             assigned_fleet_id: assignedFleet ? assignedFleet.fleet_id : 'None',
             vehicle_type: assignedFleet ? assignedFleet.vehicle_type : 'N/A',
           };
         })
       );
       res.json(report);
     } catch (error) {
       res.status(500).json({ message: error.message });
     }
   };

   module.exports = exports;