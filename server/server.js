require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const foodRoutes = require('./routes/foodRoutes');

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
    message: 'Hệ thống API quản lý món ăn trên nền tảng đám mây',
    student: 'Tran Gia Han - 236894 - DH23TIN08',
    endpoints: {
      health: 'GET /health',
      foods: 'GET /api/foods',
      search: 'GET /api/foods?search=:keyword',
      getFood: 'GET /api/foods/:id',
      createFood: 'POST /api/foods',
      updateFood: 'PUT /api/foods/:id',
      deleteFood: 'DELETE /api/foods/:id',
    },
  });
});

// Mount Routes
app.use('/api/foods', foodRoutes);

// 404 Handler
app.use((req, res) => {
  return res.status(404).json({
    success: false,
    message: `Đường dẫn '${req.originalUrl}' không tồn tại trên hệ thống API`,
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err.stack);
  return res.status(500).json({
    success: false,
    message: 'Lỗi hệ thống nội bộ máy chủ',
    error: process.env.NODE_ENV === 'production' ? null : err.message,
  });
});

// Connect to MongoDB & Start Server
const startServer = async () => {
  try {
    if (process.env.MONGODB_URI) {
      await connectDB();
    } else {
      console.warn('CẢNH BÁO: MONGODB_URI chưa được thiết lập. Server khởi động nhưng chưa kết nối database.');
    }
  } catch (err) {
    console.error('Không thể kết nối MongoDB:', err.message);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server Ready] Backend chạy tại cổng ${PORT} (http://localhost:${PORT})`);
  });
};

if (require.main === module) {
  startServer();
}

module.exports = app;
