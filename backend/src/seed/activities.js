import { prisma } from '../lib/prisma.js';

function getActivitiesData(principles) {
  const byNumber = Object.fromEntries(principles.map((p) => [p.number, p.id]));

  return [
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
      steps: ['For every commitment requested or received, follow up within 48 hours.'].join('\n'),
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
}

async function seedActivities(principles) {
  // Delete existing activities so re-running the seed is safe
  await prisma.activity.deleteMany({});
  const activitiesData = getActivitiesData(principles);
  for (const data of activitiesData) {
    await prisma.activity.create({ data });
    console.log(`  Seeded activity: ${data.name}`);
  }
}

export { seedActivities };
