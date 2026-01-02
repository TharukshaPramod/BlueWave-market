const bcrypt = require('bcrypt');
   const jwt = require('jsonwebtoken');
   const User = require('../models/User');

   const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

   // Register a new user (Create)
   exports.register = async (req, res) => {
     try {
       const { name, email, phoneNumber, password, role } = req.body;

       const existingUser = await User.findOne({ email: { $regex: `^${email.trim()}$`, $options: 'i' } });
       if (existingUser) {
         return res.status(400).json({ message: 'Email already exists' });
       }

       const hashedPassword = await bcrypt.hash(password.trim(), 10);

       const user = new User({
         name,
         email: email.trim(),
         phoneNumber,
         password: hashedPassword,
         role: (role || 'customer').toLowerCase(),
       });

       await user.save();

       res.status(201).json({ message: 'User registered successfully' });
     } catch (error) {
       res.status(500).json({ message: 'Failed to register user', error: error.message });
     }
   };

   // Login a user (Read)
   exports.login = async (req, res) => {
     try {
       console.log('Login request body:', req.body);
       const { email, password } = req.body;

       if (!email || !password) {
         console.log('Missing email or password:', { email, password });
         return res.status(400).json({ message: 'Email and password are required' });
       }

       const trimmedEmail = email.trim();
       const trimmedPassword = password.trim();
       console.log('Trimmed email:', trimmedEmail);
       console.log('Trimmed password:', trimmedPassword);

       console.log('Looking up user with email:', trimmedEmail);
       const user = await User.findOne({ email: { $regex: `^${trimmedEmail}$`, $options: 'i' } });
       if (!user) {
         console.log('User not found for email:', trimmedEmail);
         return res.status(400).json({ message: 'Invalid email or password' });
       }

       console.log('User found:', user.email);
       const isMatch = await bcrypt.compare(trimmedPassword, user.password);
       console.log('Password match:', isMatch);
       if (!isMatch) {
         console.log('Password mismatch for user:', user.email);
         return res.status(400).json({ message: 'Invalid email or password' });
       }

       const token = jwt.sign(
         { userId: user._id, role: user.role },
         JWT_SECRET,
         { expiresIn: '1h' }
       );

       res.json({ 
         token, 
         user: { 
           id: user._id, 
           name: user.name, 
           email: user.email, 
           phoneNumber: user.phoneNumber, 
           role: user.role 
         } 
       });
     } catch (error) {
       console.error('Login error:', error.message);
       res.status(500).json({ message: 'Failed to login', error: error.message });
     }
   };

   // Get authenticated user's profile (Read)
   exports.getMe = async (req, res) => {
     try {
       const user = await User.findById(req.user.userId).select('-password');
       if (!user) {
         return res.status(404).json({ message: 'User not found' });
       }
       res.json(user);
     } catch (error) {
       res.status(500).json({ message: 'Failed to fetch user profile', error: error.message });
     }
   };

   // Update authenticated user's profile (Update)
   exports.updateMe = async (req, res) => {
     try {
       const { name, email, phoneNumber, role } = req.body;

       const user = await User.findById(req.user.userId);
       if (!user) {
         return res.status(404).json({ message: 'User not found' });
       }

       if (email && email !== user.email) {
         const existingUser = await User.findOne({ email: { $regex: `^${email.trim()}$`, $options: 'i' } });
         if (existingUser) {
           return res.status(400).json({ message: 'Email already exists' });
         }
       }

       user.name = name || user.name;
       user.email = email ? email.trim() : user.email;
       user.phoneNumber = phoneNumber || user.phoneNumber;
       user.role = (role || user.role).toLowerCase();

       await user.save();

       res.json({
         id: user._id,
         name: user.name,
         email: user.email,
         phoneNumber: user.phoneNumber,
         role: user.role,
       });
     } catch (error) {
       res.status(500).json({ message: 'Failed to update user profile', error: error.message });
     }
   };

   // Get all users (Admin only) (Read)
   exports.getAllUsers = async (req, res) => {
     try {
       const users = await User.find().select('-password');
       res.json(users);
     } catch (error) {
       res.status(500).json({ message: 'Failed to fetch users', error: error.message });
     }
   };

   // Update a user (Admin only) (Update)
   exports.updateUser = async (req, res) => {
     try {
       const { name, email, phoneNumber, role } = req.body;
       const userId = req.params.id;

       const user = await User.findById(userId);
       if (!user) {
         return res.status(404).json({ message: 'User not found' });
       }

       if (email && email !== user.email) {
         const existingUser = await User.findOne({ email: { $regex: `^${email.trim()}$`, $options: 'i' } });
         if (existingUser) {
           return res.status(400).json({ message: 'Email already exists' });
         }
       }

       user.name = name || user.name;
       user.email = email ? email.trim() : user.email;
       user.phoneNumber = phoneNumber || user.phoneNumber;
       user.role = (role || user.role).toLowerCase();

       await user.save();

       res.json({
         id: user._id,
         name: user.name,
         email: user.email,
         phoneNumber: user.phoneNumber,
         role: user.role,
       });
     } catch (error) {
       res.status(500).json({ message: 'Failed to update user', error: error.message });
     }
   };

   // Delete a user (Admin only) (Delete)
   exports.deleteUser = async (req, res) => {
     try {
       const userId = req.params.id;
       const user = await User.findById(userId);
       if (!user) {
         return res.status(404).json({ message: 'User not found' });
       }

       await user.deleteOne();
       res.json({ message: 'User deleted successfully' });
     } catch (error) {
       res.status(500).json({ message: 'Failed to delete user', error: error.message });
     }
   };

   // Middleware to protect routes
   exports.protect = async (req, res, next) => {
     try {
       const token = req.headers.authorization?.split(' ')[1];
       if (!token) {
         return res.status(401).json({ message: 'No token provided' });
       }

       const decoded = jwt.verify(token, JWT_SECRET);
       req.user = decoded;
       next();
     } catch (error) {
       res.status(401).json({ message: 'Invalid token', error: error.message });
     }
   };

   // Middleware to restrict access to admins
   exports.restrictToAdmin = (req, res, next) => {
     if (req.user.role !== 'admin') {
       return res.status(403).json({ message: 'Access denied: Admins only' });
     }
     next();
   };

   module.exports = exports;