const mongoose = require('mongoose');

const fleetMaintenanceSchema = new mongoose.Schema({
  fleet_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Fleet', 
    required: [true, 'Fleet ID is required'],
    validate: {
      validator: async function(v) {
        const fleet = await mongoose.model('Fleet').findById(v);
        return fleet !== null;
      },
      message: 'Invalid fleet ID'
    }
  },
  fleet_identifier: {
    type: String,
    required: [true, 'Fleet identifier is required'],
    match: [/^F-\d{4}$/, 'Fleet identifier must follow format F-XXXX (e.g., F-1234)'],
  },
  maintenance_date: { 
    type: Date, 
    required: [true, 'Maintenance date is required'],
    validate: {
      validator: function(v) {
        return v <= new Date();
      },
      message: 'Maintenance date cannot be in the future'
    }
  },
  description: { 
    type: String, 
    required: [true, 'Description is required'],
    minlength: [10, 'Description must be at least 10 characters']
  },
  cost: { 
    type: Number, 
    required: [true, 'Cost is required'],
    min: [0, 'Cost cannot be negative']
  },
  next_due_date: { 
    type: Date,
    validate: {
      validator: function(v) {
        return !v || v > this.maintenance_date;
      },
      message: 'Next due date must be after maintenance date'
    }
  }
}, { timestamps: true });

module.exports = mongoose.model('FleetMaintenance', fleetMaintenanceSchema);