// DHP production uses pgmaker. Local dev uses a direct PostgreSQL connection via DATABASE_URL.
// Switch is automatic based on whether @hsbc/pgmaker-receiver can be imported.

import createSchemaHandler from '../schema/index.mjs';

let pool = null;
let database = null;

// ---------------------------------------------------------------------------
// Local dev fallback — direct pg Pool from DATABASE_URL
// ---------------------------------------------------------------------------
async function createLocalPool() {
  const { default: pg } = await import('pg');
  const { Pool } = pg;
  const instance = new Pool({ connectionString: process.env.DATABASE_URL });
  instance.on('error', (err) => console.error('pg pool error', err));
  return instance;
}

// ---------------------------------------------------------------------------
// pgmaker retry logic (DHP production path)
// ---------------------------------------------------------------------------
async function retryPgmakerUntil(pgMakerReceiver, { dbName, pgMakerUrl, receiptUrl }, maxMs = 60_000) {
  const start = Date.now();
  let delay = 2000;
  while (Date.now() - start < maxMs) {
    try {
      const config = await pgMakerReceiver.getConfig({ dbName, pgMakerUrl, receiptUrl });
      return config;
    } catch (err) {
      console.warn(`pgmaker not ready, retrying in ${delay}ms…`, err.message);
      await new Promise((r) => setTimeout(r, delay));
      delay = Math.min(delay * 2, 15_000);
    }
  }
  throw new Error('pgmaker did not become ready within timeout');
}

// ---------------------------------------------------------------------------
// Health check (runs every 10 minutes)
// ---------------------------------------------------------------------------
async function checkHealth() {
  try {
    if (!pool) return;
    await pool.query('SELECT 1');
    console.log('db health ok');
  } catch (err) {
    console.error('db health FAILED', err.message);
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------
function getPool() {
  if (!pool) throw new Error('db.mjs: pool not initialised — call setup() first');
  return pool;
}

function getDBHealth() {
  return pool ? pool.totalCount >= 0 : false;
}

async function getJwtKey() {
  const { rows } = await pool.query('SELECT secret FROM ll_jwt_key ORDER BY created DESC LIMIT 1');
  return rows[0]?.secret ?? null;
}

async function addKey(key, secret) {
  await pool.query(
    'INSERT INTO ll_jwt_key (key, secret) VALUES ($1, $2) ON CONFLICT (key) DO NOTHING',
    [key, secret]
  );
}

async function setup({ dbName, pgMakerUrl, receiptUrl } = {}) {
  // Try pgmaker first (DHP production). Fall back to DATABASE_URL for local dev.
  let usedPgmaker = false;
  try {
    // TODO: install @hsbc/pgmaker-receiver when deploying to DHP
    const pgMakerReceiver = await import('@hsbc/pgmaker-receiver');
    const config = await retryPgmakerUntil(pgMakerReceiver, { dbName, pgMakerUrl, receiptUrl });
    const { default: pg } = await import('pg');
    const { Pool } = pg;
    pool = new Pool(config);
    database = config.database;
    usedPgmaker = true;
    console.log(`db: connected via pgmaker (db=${database})`);
  } catch (err) {
    if (err.code !== 'ERR_MODULE_NOT_FOUND' && !err.message.includes('Cannot find')) {
      // pgmaker module loaded but threw — re-throw so we don't silently fall back
      throw err;
    }
    // pgmaker not available — local dev path
    if (!process.env.DATABASE_URL) {
      throw new Error(
        'db.mjs: no @hsbc/pgmaker-receiver and no DATABASE_URL — set DATABASE_URL in .env for local dev'
      );
    }
    pool = await createLocalPool();
    console.log('db: connected via DATABASE_URL (local dev)');
  }

  await createSchemaHandler(pool);

  if (!usedPgmaker) {
    // In local dev, schema runs once on startup. No pgmaker health loop needed.
    return;
  }

  // DHP: health check every 10 minutes
  setInterval(checkHealth, 10 * 60 * 1000);
}

export { getPool, getDBHealth, getJwtKey, addKey, setup };
