import { prisma } from '../lib/prisma.js';

const usersData = [
  {
    name: 'Ravindu Silva',
    email: 'ravindu.silva@hsbc.com',
    role: 'Operations Lead',
    team: 'Colombo',
    isAdmin: false,
  },
  {
    name: 'Priya Wickramasinghe',
    email: 'priya.wickramasinghe@hsbc.com',
    role: 'Customer Service Manager',
    team: 'Colombo',
    isAdmin: false,
  },
  {
    name: 'Tom Harper',
    email: 'tom.harper@hsbc.com',
    role: 'Regional Director',
    team: 'London',
    isAdmin: true,
  },
  {
    name: 'Aisha Khan',
    email: 'aisha.khan@hsbc.com',
    role: 'Product Lead',
    team: 'Singapore',
    isAdmin: false,
  },
];

async function seedUsers() {
  for (const data of usersData) {
    await prisma.user.upsert({
      where: { email: data.email },
      update: data,
      create: data,
    });
    console.log(`  Seeded user: ${data.name}`);
  }
}

export { seedUsers };
