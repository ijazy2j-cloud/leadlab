import 'dotenv/config';
import { setup, getPool } from '../local-modules/db.mjs';

async function main() {
  await setup();
  const pool = getPool();

  console.log('\nSeeding database...\n');

  // ── Principles ──────────────────────────────────────────────────────────
  const principlesData = [
    {
      number: 1,
      name: 'Think customer, deliver value',
      shortDescription: 'Measure success by value created for customers and those we serve',
      intent:
        'We measure success by the value we create for customers and all those we serve. We anticipate needs, exceed expectations and build solutions that drive real outcomes.',
      objectives: [
        'Make customer impact explicit in decisions and priorities',
        'Reduce internal focus and increase customer value focus',
        'Translate "customer" into measurable outcomes: goals and tracking',
      ].join('\n'),
      behaviours: [
        'Start decisions with customer benefit using 4Qs Q1',
        'Map how your work impacts customers directly or indirectly',
        'Use customer feedback and data as Symptoms in the Medical Model',
      ].join('\n'),
    },
    {
      number: 2,
      name: 'Simplify to amplify',
      shortDescription: 'Cut through complexity, make clear decisions and execute at pace',
      intent:
        'We cut through complexity, make clear decisions and execute at pace for our customers. Progress beats perfection. We start strong, drive momentum and finish stronger.',
      objectives: [
        'Reduce complexity and busy work',
        'Increase clarity and pace of execution',
        'Improve communication simplicity and decision speed',
      ].join('\n'),
      behaviours: [
        'Use ruthless prioritisation: critical few vs minor many',
        'Use mini max: maximum impact, fewest words',
        'Remove non essential steps using Jenga applied to processes',
      ].join('\n'),
    },
    {
      number: 3,
      name: 'Challenge, align and commit',
      shortDescription: 'Challenge with respect, align quickly and commit fully once decided',
      intent:
        'We challenge with respect, align quickly and commit fully once decisions are made. Clarity in decision making drives efficiency, accelerates execution and delivers better results for our customers.',
      objectives: [
        'Improve quality of decisions through healthy challenge',
        'Reduce meeting silence and corridor violence',
        'Increase commitment and follow through after decisions',
      ].join('\n'),
      behaviours: [
        'Encourage diverse perspectives and psychological safety',
        'Challenge in the room and commit after the decision',
        'Use structured methods to surface objections early',
      ].join('\n'),
    },
    {
      number: 4,
      name: 'See it through, make it happen',
      shortDescription: 'Act like owners. The job is not done until the job is done',
      intent:
        'We act like owners and never look the other way. Our job is not done until the job is done.',
      objectives: [
        'Strengthen accountability and follow through',
        'Reduce dropped actions and FYI communications that do not land',
        'Build a culture of micro inspection, not micro management',
      ].join('\n'),
      behaviours: [
        'Inspect what you expect',
        'Follow up within 48 hours of commitments',
        'Apply consequences, positive or corrective, with care',
      ].join('\n'),
    },
    {
      number: 5,
      name: 'Great leaders build better leaders',
      shortDescription: 'Nurture talent and coach for performance',
      intent:
        'We care about our people, nurturing talent and coaching for performance. By embracing diverse perspectives and celebrating individual and collective strengths, we field the right people for every challenge, develop future leaders and create a culture that endures.',
      objectives: [
        'Increase coaching frequency and quality',
        'Identify and develop talent systematically',
        'Build psychological safety and inclusion so different strengths show up',
      ].join('\n'),
      behaviours: [
        'Coach skills and performance, not just tasks',
        'Recognise and share best practices',
        'Use structured talent thinking through NEAT',
      ].join('\n'),
    },
    {
      number: 6,
      name: 'Create excitement, inspire ambition',
      shortDescription: 'Challenge norms, question assumptions, aim higher',
      intent:
        'We challenge norms, question assumptions and think beyond our role. Breaking barriers starts with the confidence to aim higher. Ambition, pride and curiosity fuel our growth.',
      objectives: [
        'Increase ambition clarity and meaning',
        'Create energy and motivation for change',
        'Encourage curiosity, innovation and constructive challenge',
      ].join('\n'),
      behaviours: [
        'Reinforce the ambition regularly as a communication responsibility',
        'Use storytelling and emotion authentically to engage',
        'Turn ambition into goals, plans and accountability',
      ].join('\n'),
    },
  ];

  let principlesInserted = 0;
  const principleRows = [];
  for (const d of principlesData) {
    const { rows } = await pool.query(
      `INSERT INTO ll_principles
         (number, name, short_description, intent, objectives, behaviours)
       VALUES ($1,$2,$3,$4,$5,$6)
       ON CONFLICT (number) DO NOTHING
       RETURNING *`,
      [d.number, d.name, d.shortDescription, d.intent, d.objectives, d.behaviours]
    );
    if (rows[0]) {
      principlesInserted++;
      principleRows.push(rows[0]);
    } else {
      // Already exists — fetch it so activities can link to it
      const { rows: existing } = await pool.query(
        'SELECT * FROM ll_principles WHERE number = $1',
        [d.number]
      );
      principleRows.push(existing[0]);
    }
  }

  // ── Activities ───────────────────────────────────────────────────────────
  const byNumber = Object.fromEntries(principleRows.map((p) => [p.number, p.id]));

  const activitiesData = [
    {
      principleId: byNumber[1],
      name: '4Qs decision check',
      duration: '10 mins per decision',
      type: 'FOUR_QS',
      steps: [
        'Pick one live decision.',
        'Run the 4Qs.',
        'Challenge any answer that is not clearly yes.',
      ].join('\n'),
    },
    {
      principleId: byNumber[1],
      name: 'Medical model mini case',
      duration: '30 to 45 mins',
      type: 'MEDICAL_MODEL',
      steps: [
        'Pick one customer pain point.',
        'Define Symptoms, Diagnosis, Treatment and Follow up.',
      ].join('\n'),
    },
    {
      principleId: byNumber[2],
      name: 'Big Five prioritisation',
      duration: '10 to 20 mins',
      type: 'BIG_FIVE',
      steps: [
        'Identify the five actions that will make the biggest difference this week.',
        'Assign owners and deadlines.',
      ].join('\n'),
    },
    {
      principleId: byNumber[3],
      name: 'Objections clinic',
      duration: '20 to 30 mins',
      type: 'OBJECTIONS_CLINIC',
      steps: [
        'List all anticipated objections to a proposal.',
        'For each, decide: address now, defer, or accept.',
        'Align the team before the meeting.',
      ].join('\n'),
    },
    {
      principleId: byNumber[4],
      name: '48 hour follow up habit',
      duration: 'ongoing',
      type: 'GENERIC',
      steps: 'For every commitment requested or received, follow up within 48 hours.',
    },
    {
      principleId: byNumber[5],
      name: 'Coaching conversation',
      duration: '30 mins',
      type: 'SIMPLE_FEEDBACK',
      steps: [
        'Open with one specific behaviour to recognise.',
        'Ask: what went well, what would you do differently?',
        'Close with one coaching question for the next period.',
      ].join('\n'),
    },
    {
      principleId: byNumber[6],
      name: 'Ambition storytelling',
      duration: '15 to 20 mins',
      type: 'GENERIC',
      steps: [
        'Articulate the team ambition in one sentence.',
        'Share a story that shows it is achievable.',
        'Ask the team: what does this mean for your role?',
      ].join('\n'),
    },
  ];

  let activitiesInserted = 0;
  for (const d of activitiesData) {
    // No unique constraint on activities — guard with an existence check so re-runs are safe
    const { rows: existing } = await pool.query(
      'SELECT id FROM ll_activities WHERE name = $1 AND principle_id = $2',
      [d.name, d.principleId]
    );
    if (existing[0]) continue;
    await pool.query(
      `INSERT INTO ll_activities (principle_id, name, duration, type, steps)
       VALUES ($1,$2,$3,$4,$5)`,
      [d.principleId, d.name, d.duration, d.type, d.steps]
    );
    activitiesInserted++;
  }

  // ── Users ────────────────────────────────────────────────────────────────
  const usersData = [
    { name: 'Aisha Khan',            email: 'aisha.khan@hsbc.com',              role: 'Product Lead',              team: 'Singapore', isAdmin: true  },
    { name: 'Ravindu Silva',         email: 'ravindu.silva@hsbc.com',           role: 'Operations Lead',           team: 'Colombo',   isAdmin: false },
    { name: 'Priya Wickramasinghe',  email: 'priya.wickramasinghe@hsbc.com',    role: 'Customer Service Manager',  team: 'Colombo',   isAdmin: false },
    { name: 'Tom Harper',            email: 'tom.harper@hsbc.com',              role: 'Regional Director',         team: 'London',    isAdmin: false },
    { name: 'Mei Lin',               email: 'mei.lin@hsbc.com',                 role: 'Digital Transformation Lead', team: 'Hong Kong', isAdmin: false },
  ];

  let usersInserted = 0;
  for (const d of usersData) {
    const { rows } = await pool.query(
      `INSERT INTO ll_users (name, email, role, team, is_admin)
       VALUES ($1,$2,$3,$4,$5)
       ON CONFLICT (email) DO NOTHING
       RETURNING id`,
      [d.name, d.email, d.role, d.team, d.isAdmin]
    );
    if (rows[0]) usersInserted++;
  }

  // ── Summary ──────────────────────────────────────────────────────────────
  const totalPrinciples = principlesData.length;
  const totalActivities = activitiesData.length;
  const totalUsers = usersData.length;

  console.log('Seed complete.\n');
  console.log(`  Principles : ${principlesInserted} inserted, ${totalPrinciples - principlesInserted} already existed`);
  console.log(`  Activities : ${activitiesInserted} inserted, ${totalActivities - activitiesInserted} already existed`);
  console.log(`  Users      : ${usersInserted} inserted, ${totalUsers - usersInserted} already existed`);
  console.log('');
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('\nSeed failed:', err.message);
    process.exit(1);
  });
