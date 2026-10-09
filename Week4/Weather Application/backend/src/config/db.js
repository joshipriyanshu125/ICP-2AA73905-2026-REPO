import mongoose from 'mongoose';

/**
 * Connect to MongoDB. Non-fatal in development: the server still boots
 * so /health reports the disconnected state and API errors are visible.
 */
export async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/weather_dashboard';

  mongoose.connection.on('connected', () => {
    globalThis.dbConnected = true;
    console.log('[db] MongoDB connected');
  });
  mongoose.connection.on('disconnected', () => {
    globalThis.dbConnected = false;
  });
  mongoose.connection.on('error', (err) => {
    globalThis.dbConnected = false;
    console.error('[db] MongoDB error:', err.message);
  });

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
  } catch (err) {
    globalThis.dbConnected = false;
    console.warn('[db] Could not connect:', err.message);
    if (process.env.NODE_ENV === 'production') throw err;
  }

  return mongoose.connection;
}
