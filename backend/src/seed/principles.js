import { prisma } from '../lib/prisma.js';

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
    intent: 'We act like owners and never look the other way. Our job is not done until the job is done.',
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

async function seedPrinciples() {
  const principles = [];
  for (const data of principlesData) {
    const principle = await prisma.principle.upsert({
      where: { number: data.number },
      update: data,
      create: data,
    });
    principles.push(principle);
    console.log(`  Seeded principle ${principle.number}: ${principle.name}`);
  }
  return principles;
}

export { seedPrinciples };
