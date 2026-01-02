const FleetMaintenance = require('../models/FleetMaintenance');
const Fleet = require('../models/Fleet');

exports.addMaintenance = async (req, res) => {
  try {
    const { fleet_id, maintenance_date, description, cost, next_due_date } = req.body;

    const fleet = await Fleet.findById(fleet_id);
    if (!fleet) {
      return res.status(400).json({ message: 'Invalid fleet ID' });
    }

    const maintenance = new FleetMaintenance({
      fleet_id,
      fleet_identifier: fleet.fleet_id,
      maintenance_date,
      description,
      cost,
      next_due_date,
    });

    await maintenance.validate();
    await maintenance.save();
    res.status(201).json(maintenance);
  } catch (error) {
    res.status(400).json({ message: 'Invalid maintenance data', errors: error.errors });
  }
};

exports.getMaintenanceRecords = async (req, res) => {
  try {
    const records = await FleetMaintenance.find()
      .populate('fleet_id', 'fleet_id vehicle_type status')
      .lean();
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMaintenanceById = async (req, res) => {
  try {
    const maintenance = await FleetMaintenance.findById(req.params.id)
      .populate('fleet_id', 'fleet_id vehicle_type status')
      .lean();
    if (!maintenance) return res.status(404).json({ message: 'Maintenance record not found' });
    res.json(maintenance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.searchMaintenance = async (req, res) => {
  try {
    const { fleet_identifier, maintenance_date } = req.query;

    let query = {};
    if (fleet_identifier) query.fleet_identifier = fleet_identifier;
    if (maintenance_date) {
      const startDate = new Date(maintenance_date);
      const endDate = new Date(maintenance_date);
      endDate.setDate(endDate.getDate() + 1);
      query.maintenance_date = { $gte: startDate, $lt: endDate };
    }

    const records = await FleetMaintenance.find(query)
      .populate('fleet_id', 'fleet_id vehicle_type status')
      .lean();
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMaintenanceReport = async (req, res) => {
  try {
    const records = await FleetMaintenance.find()
      .populate('fleet_id', 'fleet_id vehicle_type status')
      .lean();
    const report = records.map(record => ({
      maintenanceId: record._id,
      fleetId: record.fleet_id?._id || 'N/A',
      fleetIdentifier: record.fleet_identifier || 'N/A',
      vehicleType: record.fleet_id?.vehicle_type || 'N/A',
      maintenanceDate: record.maintenance_date,
      description: record.description,
      cost: record.cost,
      nextDueDate: record.next_due_date,
    }));
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateMaintenance = async (req, res) => {
  try {
    const { fleet_id, maintenance_date, description, cost, next_due_date } = req.body;
    const maintenance = await FleetMaintenance.findById(req.params.id);
    if (!maintenance) return res.status(404).json({ message: 'Maintenance record not found' });

    const fleet = await Fleet.findById(fleet_id);
    if (!fleet) {
      return res.status(400).json({ message: 'Invalid fleet ID' });
    }

    maintenance.fleet_id = fleet_id;
    maintenance.fleet_identifier = fleet.fleet_id;
    maintenance.maintenance_date = maintenance_date;
    maintenance.description = description;
    maintenance.cost = cost;
    maintenance.next_due_date = next_due_date;

    await maintenance.validate();
    await maintenance.save();
    res.json(maintenance);
  } catch (error) {
    res.status(400).json({ message: 'Invalid update data', errors: error.errors });
  }
};

exports.deleteMaintenance = async (req, res) => {
  try {
    const maintenance = await FleetMaintenance.findById(req.params.id);
    if (!maintenance) return res.status(404).json({ message: 'Maintenance record not found' });
    await FleetMaintenance.findByIdAndDelete(req.params.id);
    res.json({ message: 'Maintenance record deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = exports;