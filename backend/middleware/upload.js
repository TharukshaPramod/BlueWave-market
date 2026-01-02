const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const uploadPath = process.env.UPLOAD_PATH || 'uploads';
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
  console.log('Created upload directory:', uploadPath);
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `payment-${uniqueSuffix}${ext}`);
  }
});

// File filter for images only
const fileFilter = (req, file, cb) => {
  console.log('Processing file:', {
    originalname: file.originalname,
    mimetype: file.mimetype,
    size: file.size
  });

  const filetypes = /jpeg|jpg|png/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  }
  cb(new Error('Only JPEG/PNG images are allowed'));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { 
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1 // Only allow one file
  }
}).single('paymentSlip');

// Wrap multer middleware to handle errors
const uploadMiddleware = (req, res, next) => {
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      console.error('Multer error:', err);
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'File size too large. Maximum size is 5MB' });
      }
      return res.status(400).json({ message: `File upload error: ${err.message}` });
    } else if (err) {
      console.error('Other upload error:', err);
      return res.status(400).json({ message: err.message });
    }
    
    // Validate that a file was uploaded
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded. Please upload a payment slip' });
    }

    console.log('File uploaded successfully:', {
      filename: req.file.filename,
      path: req.file.path,
      size: req.file.size
    });

    // Normalize the file path to use forward slashes
    if (req.file && req.file.path) {
      req.file.path = req.file.path.replace(/\\/g, '/');
    }

    next();
  });
};

module.exports = uploadMiddleware;