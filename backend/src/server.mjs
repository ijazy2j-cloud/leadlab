import express from 'express';
import cors from 'cors';
import os from 'os';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
dotenv.config();

// Route imports
import usersRouter from './routes/users.js';
import principlesRouter from './routes/principles.js';
import activitiesRouter from './routes/activities.js';
import decisionsRouter from './routes/decisions.js';
import medicalCasesRouter from './routes/medical-cases.js';
import bigFiveRouter from './routes/big-five.js';
import followUpsRouter from './routes/follow-ups.js';
import dashboardRouter from './routes/dashboard.js';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(cookieParser());
app.use(express.json());

// --- Phase I.2: DHP health endpoint ---
// Must be at /health (not /api/health) as required by DHP platform.
app.get('/health', (req, res) => {
  res.json({
    isAvailable: true,
    description: 'LeadLab, How We Lead practice tool',
    'stash-url': 'TODO: replace with internal Bitbucket URL once repo is created',
    'node-version': process.version,
    os: {
      release: os.release(),
      type: os.type(),
      version: os.version(),
    },
    env: process.env.NODE_ENV || 'development',
  });
});

// Internal health check (kept for backwards compatibility)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Production static file serving — only active when NODE_ENV=production.
// In development, the Vite dev server (port 5173) serves the frontend directly.
if (process.env.NODE_ENV === 'production') {
  const { fileURLToPath } = await import('url');
  const { dirname, join } = await import('path');
  const __dirname = dirname(fileURLToPath(import.meta.url));
  app.use(express.static(join(__dirname, '..', 'public')));
  app.get('*', (req, res) => {
    res.sendFile(join(__dirname, '..', 'public', 'index.html'));
  });
}

// API routes
app.use('/api/users', usersRouter);
app.use('/api/principles', principlesRouter);
app.use('/api/activities', activitiesRouter);
app.use('/api/decisions', decisionsRouter);
app.use('/api/medical-cases', medicalCasesRouter);
app.use('/api/big-five', bigFiveRouter);
app.use('/api/follow-ups', followUpsRouter);
app.use('/api/dashboard', dashboardRouter);

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'Internal server error',
  });
});

// --- Phase I.3: Post-verification self-test (pvt pattern) ---
app.listen(PORT, async () => {
  try {
    const res = await fetch(`http://localhost:${PORT}/health`);
    if (res.status !== 200) {
      console.error('FAILED PVT');
      process.exit(1);
    }
    console.log(`SUCCESS, running on port ${PORT}`);
  } catch (err) {
    console.error('FAILED PVT', err.message);
    process.exit(1);
  }
});
