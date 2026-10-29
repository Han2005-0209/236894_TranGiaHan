const mongoose = require('mongoose');
const dns = require('dns');

// Configure public DNS resolvers to handle SRV records reliably on all networks
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (err) {
  console.warn('Warning: Could not set custom DNS servers:', err.message);
}

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    const dbName = process.env.MONGODB_DB_NAME || '236894_TranGiaHan';

    if (!mongoURI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    const conn = await mongoose.connect(mongoURI, {
      dbName: dbName,
      serverSelectionTimeoutMS: 10000,
    });

    console.log(`[MongoDB Connected] Host: ${conn.connection.host} | DB: ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[MongoDB Connection Error] ${error.message}`);
    throw error;
  }
};

module.exports = connectDB;
