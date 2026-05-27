import { getPool } from '../local-modules/db.mjs';

const usersData = [
  { name: 'Ravindu Silva', email: 'ravindu.silva@hsbc.com', role: 'Operations Lead', team: 'Colombo', isAdmin: false },
  { name: 'Priya Wickramasinghe', email: 'priya.wickramasinghe@hsbc.com', role: 'Customer Service Manager', team: 'Colombo', isAdmin: false },
  { name: 'Tom Harper', email: 'tom.harper@hsbc.com', role: 'Regional Director', team: 'London', isAdmin: true },
  { name: 'Aisha Khan', email: 'aisha.khan@hsbc.com', role: 'Product Lead', team: 'Singapore', isAdmin: false },
];

async function seedUsers() {
  const pool = getPool();
  for (const d of usersData) {
    await pool.query(
      `INSERT INTO ll_users (name, email, role, team, is_admin)
       VALUES ($1,$2,$3,$4,$5)
       ON CONFLICT (email) DO UPDATE SET
         name=EXCLUDED.name, role=EXCLUDED.role,
         team=EXCLUDED.team, is_admin=EXCLUDED.is_admin,
         updated_at=now()`,
      [d.name, d.email, d.role, d.team, d.isAdmin]
    );
    console.log(`  Seeded user: ${d.name}`);
  }
}

export { seedUsers };
