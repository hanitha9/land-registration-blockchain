// backend/server.js
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/database');

// Import routes
const authRoutes = require('./routes/authRoutes');
const landRoutes = require('./routes/landRoutes');
const revenueRoutes = require('./routes/revenueRoutes');
const bankRoutes = require('./routes/bankRoutes');
const registrarRoutes = require('./routes/registrarRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const transactionRoutes = require('./routes/transactionRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3001',
    'http://127.0.0.1:3001',
    'http://172.26.215.215:3001'
  ],
  credentials: true
}));

// Increase payload limits for file uploads
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/lands', landRoutes);
app.use('/api/revenue', revenueRoutes);
app.use('/api/bank', bankRoutes);
app.use('/api/registrar', registrarRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/transactions', transactionRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  // Handle body parsing errors
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      success: false,
      message: 'Invalid request data format',
      error: 'Data format error'
    });
  }
  
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: err.message
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
// Auto re-enroll blockchain identity on startup
async function initBlockchain() {
  try {
    const { testConnection } = require('./services/blockchainService');
    const connected = await testConnection();
    if (!connected) {
      console.log('🔄 Re-enrolling blockchain identity...');
      const FabricNetwork = require('./utils/fabricNetwork');
      const fabric = new FabricNetwork();
      const fs = require('fs');
      if (fs.existsSync('./wallet/admin.id')) fs.unlinkSync('./wallet/admin.id');
      if (fs.existsSync('./wallet/appUser.id')) fs.unlinkSync('./wallet/appUser.id');
      await fabric.enrollAdmin();
      await fabric.registerUser('appUser2');
      console.log('✅ Blockchain identity re-enrolled');
    } else {
      console.log('✅ Blockchain connected');
    }
  } catch (err) {
    console.warn('⚠️ Blockchain init failed:', err.message);
  }
}
initBlockchain();
