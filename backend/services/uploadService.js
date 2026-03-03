const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const uploadDirs = [
  'uploads/aadhaar',
  'uploads/pan',
  'uploads/profiles',
  'uploads/land-docs',
  'uploads/land-photos'
];

uploadDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath = 'uploads/';
    
    // Determine upload path based on field name
    if (file.fieldname === 'aadhaarDocument') {
      uploadPath += 'aadhaar/';
    } else if (file.fieldname === 'panDocument') {
      uploadPath += 'pan/';
    } else if (file.fieldname === 'profilePhoto') {
      uploadPath += 'profiles/';
    } else if (file.fieldname === 'landDocument' || file.fieldname === 'previousOwnerDocument') {
      uploadPath += 'land-docs/';
    } else if (file.fieldname === 'landPhotos') {
      uploadPath += 'land-photos/';
    } else {
      uploadPath += 'misc/';
    }
    
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    const filename = file.fieldname + '-' + uniqueSuffix + extension;
    cb(null, filename);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  // Allowed file types
  const allowedTypes = /jpeg|jpg|png|pdf/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only images (jpeg, jpg, png) and PDF files are allowed!'));
  }
};

// Upload configuration
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: fileFilter
});

module.exports = upload;