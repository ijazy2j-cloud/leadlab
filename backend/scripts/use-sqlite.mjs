// Switches local dev to SQLite: updates DATABASE_URL in .env and regenerates the Prisma client.
// Run via: npm run db:use-sqlite
import { readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, '..', '.env');

let env = readFileSync(envPath, 'utf8');
env = env.replace(/^DATABASE_URL=.*/m, 'DATABASE_URL="file:./prisma/dev.db"');
writeFileSync(envPath, env);

console.log('Updated .env: DATABASE_URL set to SQLite (file:./prisma/dev.db)');
console.log('Regenerating Prisma client from schema-sqlite.prisma...');

execSync('npx prisma generate --schema ./prisma/schema-sqlite.prisma', {
  stdio: 'inherit',
  cwd: join(__dirname, '..'),
});

console.log('Done. Run npm run db:migrate-sqlite if this is a fresh setup, then npm run dev.');
