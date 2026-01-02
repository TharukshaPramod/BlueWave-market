const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Payment = require('../models/Payment');
const fs = require('fs').promises;
const path = require('path');

dotenv.config();

const migratePaymentPaths = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/seafood-marketplace');
    console.log('Connected to MongoDB');

    // Find all payments
    const payments = await Payment.find({});
    console.log(`Found ${payments.length} payments to migrate`);

    let updatedCount = 0;
    let errorCount = 0;

    // Update each payment
    for (const payment of payments) {
      try {
        if (payment.paymentSlip) {
          // Get the filename from the path
          const filename = path.basename(payment.paymentSlip);
          
          // Check if the filename already has the payment- prefix
          let updatedFilename = filename;
          if (!filename.startsWith('payment-')) {
            updatedFilename = `payment-${filename}`;
          }
          
          // Create the new path with forward slashes
          const updatedPath = `/uploads/${updatedFilename}`;
          
          // Use updateOne to bypass validation
          await Payment.updateOne(
            { _id: payment._id },
            { $set: { paymentSlip: updatedPath } }
          );
          
          updatedCount++;
          console.log(`Updated payment ${payment._id}: ${updatedPath}`);
        }
      } catch (err) {
        errorCount++;
        console.error(`Error updating payment ${payment._id}:`, err.message);
      }
    }

    console.log(`Migration complete. Updated ${updatedCount} payments. Errors: ${errorCount}`);
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the migration
migratePaymentPaths(); 