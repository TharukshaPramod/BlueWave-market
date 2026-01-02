const mongoose = require('mongoose');

const fleetSchema = new mongoose.Schema({
  fleet_id: { 
    type: String, 
    required: [true, 'Fleet ID is required'], 
    unique: true,
    match: [/^F-\d{4}$/, 'Fleet ID must follow format F-XXXX (e.g., F-1234)']
  },
  vehicle_type: { 
    type: String, 
    enum: {
      values: ['Boat', 'Truck', 'Bike'],
      message: '{VALUE} is not a valid vehicle type'
    }, 
    required: [true, 'Vehicle type is required'] 
  },
  status: { 
    type: String, 
    enum: {
      values: ['Available', 'In Use', 'Under Maintenance'],
      message: '{VALUE} is not a valid status'
    }, 
    default: 'Available' 
  },
  assigned_driver_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Staff', 
    default: null,
    validate: {
      validator: async function(v) {
        if (!v) return true; // Allow null
        const staff = await mongoose.model('Staff').findById(v);
        return staff && staff.role === 'Rider'; // Only riders can be assigned
      },
      message: 'Assigned driver must be a Rider'
    }
  },
  last_serviced_date: { 
    type: Date,
    validate: {
      validator: function(v) {
        return !v || v <= new Date(); // Must be in the past or null
      },
      message: 'Last serviced date cannot be in the future'
    }
  }
}, { timestamps: true });

module.exports = mongoose.model('Fleet', fleetSchema);