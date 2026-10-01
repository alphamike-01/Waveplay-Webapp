import mongoose from 'mongoose';

let isConnected = false;
let usingMemoryFallback = false;

export const connectDB = async (): Promise<boolean> => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/waveplay';

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2000,
    });
    isConnected = true;
    usingMemoryFallback = false;
    console.log(`[WavePlay DB] MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.warn(`[WavePlay DB] MongoDB connection not available: ${(error as Error).message}`);
    console.log('[WavePlay DB] Activating in-memory mock repository for seamless demo mode.');
    isConnected = false;
    usingMemoryFallback = true;
    return false;
  }
};

export const getDBStatus = () => ({
  isConnected,
  usingMemoryFallback,
});
