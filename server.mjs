import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import os from 'os';
import cookieParser from 'cookie-parser';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { setup } from './local-modules/db.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));

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

// DHP health endpoint — must be at /health (not /api/health).
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

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/users', usersRouter);
app.use('/api/principles', principlesRouter);
app.use('/api/activities', activitiesRouter);
app.use('/api/decisions', decisionsRouter);
app.use('/api/medical-cases', medicalCasesRouter);
app.use('/api/big-five', bigFiveRouter);
app.use('/api/follow-ups', followUpsRouter);
app.use('/api/dashboard', dashboardRouter);

// Serve Vite build from /static (always, not just in production)
app.use(express.static(join(__dirname, 'static')));

// SPA catch-all: return index.html for any non-API, non-asset request
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  res.sendFile(join(__dirname, 'static', 'index.html'));
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'Internal server error',
  });
});

// ── Startup ─────────────────────────────────────────────────────────────────
async function start() {
  try {
    await setup();
    console.log('Database ready.');
  } catch (err) {
    console.error('Database setup failed:', err.message);
    process.exit(1);
  }

  app.listen(PORT, async () => {
    console.log(`Server listening on port ${PORT}.`);
    // Post-verification self-test (pvt pattern required by DHP)
    try {
      const res = await fetch(`http://localhost:${PORT}/health`);
      if (res.status !== 200) {
        console.error('FAILED PVT');
        process.exit(1);
      }
      console.log('SUCCESS PVT — /health ok.');
    } catch (err) {
      console.error('FAILED PVT', err.message);
      process.exit(1);
    }
  });
}

start();
