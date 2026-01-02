const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Name is required'], 
    minlength: [2, 'Name must be at least 2 characters long'] 
  },
  email: { 
    type: String, 
    required: [true, 'Email is required'], 
    unique: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'] 
  },
  phoneNumber: { 
    type: String, 
    required: [true, 'Phone number is required'], 
    match: [/^\d{10}$/, 'Phone number must be 10 digits'] 
  },
  password: { 
    type: String, 
    required: [true, 'Password is required'], 
    minlength: [8, 'Password must be at least 8 characters long'] 
  },
  role: { 
    type: String, 
    enum: ['customer', 'admin'], 
    default: 'customer' 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
});

module.exports = mongoose.model('User', userSchema);