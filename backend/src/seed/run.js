import { prisma } from '../lib/prisma.js';
import { seedPrinciples } from './principles.js';
import { seedActivities } from './activities.js';
import { seedUsers } from './users.js';

async function main() {
  console.log('Seeding database...');
  const principles = await seedPrinciples();
  await seedActivities(principles);
  await seedUsers();
  console.log('Seed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
