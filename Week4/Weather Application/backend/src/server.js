import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db.js';
import weatherRoutes from './routes/weather.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

app.use(cors({ origin: CLIENT_ORIGIN, credentials: true }));
app.use(express.json({ limit: '100kb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({
    ok: true,
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      database: globalThis.dbConnected ? 'connected' : 'disconnected',
      weatherApi: process.env.WEATHER_API_KEY ? 'configured' : 'missing'
    }
  });
});

app.use('/api/weather', weatherRoutes);

app.use(notFound);
app.use(errorHandler);

async function start() {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Weather API listening on http://localhost:${PORT}`);
      if (!process.env.WEATHER_API_KEY) {
        console.warn('[config] WEATHER_API_KEY is not set — /api/weather endpoints will fail.');
      }
    });
  } catch (err) {
    console.error('[startup] Failed to start server:', err.message);
    process.exit(1);
  }
}

start();
