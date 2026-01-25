const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads directory structure
const uploadDir = './uploads';
const subdirs = ['documents', 'profiles', 'aadhaar', 'pan', 'land-docs', 'land-photos'];

subdirs.forEach(dir => {
  const dirPath = path.join(uploadDir, dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
});

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let folder = 'documents';
    
    if (file.fieldname === 'profilePhoto') {
      folder = 'profiles';
    } else if (file.fieldname === 'aadhaarDocument') {
      folder = 'aadhaar';
    } else if (file.fieldname === 'panDocument') {
      folder = 'pan';
    } else if (file.fieldname === 'landDocument' || file.fieldname === 'previousOwnerDocument' || file.fieldname === 'ownershipProof' || file.fieldname === 'surveyMap' || file.fieldname === 'ownerLivePhoto') {
      folder = 'land-docs';
    } else if (file.fieldname === 'landPhotos') {
      folder = 'land-photos';
    }
    
    const folderPath = path.join(uploadDir, folder);
    cb(null, folderPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|pdf/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only .png, .jpg, .jpeg and .pdf files are allowed!'));
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 // 10MB
  },
  fileFilter: fileFilter
});

module.exports = upload;
