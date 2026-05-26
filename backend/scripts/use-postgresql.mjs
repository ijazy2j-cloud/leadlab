// Switches to PostgreSQL: updates DATABASE_URL in .env and regenerates the Prisma client.
// Run via: npm run db:use-postgresql
import { readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, '..', '.env');

let env = readFileSync(envPath, 'utf8');
env = env.replace(
  /^DATABASE_URL=.*/m,
  'DATABASE_URL="postgresql://user:password@localhost:5432/leadlab?schema=public"'
);
writeFileSync(envPath, env);

console.log('Updated .env: DATABASE_URL set to PostgreSQL placeholder.');
console.log('Regenerating Prisma client from schema.prisma (postgresql)...');

execSync('npx prisma generate --schema ./prisma/schema.prisma', {
  stdio: 'inherit',
  cwd: join(__dirname, '..'),
});

console.log('Done. Update DATABASE_URL in .env with real credentials before running.');
