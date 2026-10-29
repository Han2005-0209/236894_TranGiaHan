require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const foodRoutes = require('./routes/foodRoutes');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const corsOrigin = process.env.CORS_ORIGIN || '*';
app.use(cors({
  origin: corsOrigin === '*' ? '*' : corsOrigin.split(','),
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/images', express.static(path.join(__dirname, 'public/images')));

// Endpoint GET /health kiểm tra trạng thái hoạt động backend
app.get('/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  return res.status(200).json({
    status: 'ok',
    service: 'api-236894',
    message: 'Backend API quản lý món ăn đang hoạt động bình thường',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: {
      status: dbStatus,
      name: process.env.MONGODB_DB_NAME || '236894_TranGiaHan',
    },
  });
});

// Root API information
app.get('/', (req, res) => {
  return res.status(200).json({
    service: 'Food Management API',
    author: 'Trần Gia Hân',
    mssv: '236894',
    class: 'DH23TIN08',
    status: 'running',
    endpoints: {
      health: 'GET /health',
      getAllFoods: 'GET /api/foods',
      searchFoods: 'GET /api/foods?search=keyword',
      getFoodById: 'GET /api/foods/:id',
      createFood: 'POST /api/foods',
      updateFood: 'PUT /api/foods/:id',
      deleteFood: 'DELETE /api/foods/:id',
    },
  });
});

// Routes
app.use('/api/foods', foodRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Đường dẫn ${req.originalUrl} không tồn tại trên hệ thống API`,
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Đã xảy ra lỗi máy chủ nội bộ',
    error: process.env.NODE_ENV === 'production' ? null : err.message,
  });
});

// Start Server after connecting to MongoDB
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`[SERVER] Đang chạy tại cổng ${PORT} (Environment: ${process.env.NODE_ENV || 'development'})`);
  });
}).catch((err) => {
  console.error('[SERVER] Lỗi khởi động máy chủ:', err.message);
  process.exit(1);
});
