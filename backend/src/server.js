const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Health check (no auth required)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes (mounted after auth middleware in each router)
app.use('/api/users', require('./routes/users'));
app.use('/api/principles', require('./routes/principles'));
app.use('/api/activities', require('./routes/activities'));
app.use('/api/decisions', require('./routes/decisions'));
app.use('/api/medical-cases', require('./routes/medical-cases'));
app.use('/api/big-five', require('./routes/big-five'));
app.use('/api/follow-ups', require('./routes/follow-ups'));
app.use('/api/dashboard', require('./routes/dashboard'));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'Internal server error',
  });
});

app.listen(PORT, () => {
  console.log(`LeadLab backend running on http://localhost:${PORT}`);
});
