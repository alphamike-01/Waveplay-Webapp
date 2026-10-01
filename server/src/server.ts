import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

import { connectDB, getDBStatus } from './config/db.js';
import { errorHandler } from './middleware/errorHandler.js';

import authRoutes from './routes/authRoutes.js';
import trackRoutes from './routes/trackRoutes.js';
import artistRoutes from './routes/artistRoutes.js';
import albumRoutes from './routes/albumRoutes.js';
import playlistRoutes from './routes/playlistRoutes.js';
import meRoutes from './routes/meRoutes.js';
import searchRoutes from './routes/searchRoutes.js';
import recommendationRoutes from './routes/recommendationRoutes.js';
import audioRoutes from './routes/audioRoutes.js';
import { DBStore } from './storage/dbStore.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security and utility middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

const allowedOrigins = process.env.CLIENT_URL
  ? [process.env.CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173']
  : ['http://localhost:5173', 'http://127.0.0.1:5173'];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl) or allowed origins
      if (!origin || allowedOrigins.includes(origin) || origin.startsWith('http://localhost:')) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive in dev/demo
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Rate limiting (generous for music player app)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' }
});
app.use('/api', limiter);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/tracks', trackRoutes);
app.use('/api/artists', artistRoutes);
app.use('/api/albums', albumRoutes);
app.use('/api/playlists', playlistRoutes);
app.use('/api/me', meRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/audio', audioRoutes);

// Health check endpoint
app.get('/api/health', async (_req, res) => {
  const status = getDBStatus();
  const trackCount = (await DBStore.getAllTracks()).length;
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'WavePlay Backend API',
    version: '1.0.0',
    database: {
      connected: status.isConnected,
      mode: status.usingMemoryFallback ? 'In-Memory Demo Engine' : 'MongoDB Mongoose'
    },
    catalog: {
      tracks: trackCount,
      artists: (await DBStore.getAllArtists()).length,
      albums: (await DBStore.getAllAlbums()).length
    }
  });
});

// Central Error Handler
app.use(errorHandler);

// Start server immediately so frontend proxy never encounters ECONNREFUSED
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`
  ======================================================
  🌊 WavePlay Server is running!
  📡 URL: http://localhost:${PORT}
  🎵 Health Check: http://localhost:${PORT}/api/health
  ======================================================
    `);
    // Connect DB in background without blocking server startup
    connectDB().catch((err) => {
      console.warn('[WavePlay DB] Startup DB notice:', err.message);
    });
  });
}

export default app;
