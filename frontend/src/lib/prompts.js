const prompts = [
  {
    id: 'p1-customer-impact',
    principleNumber: 1,
    principleName: 'Think customer, deliver value',
    title: 'Customer impact check on a decision',
    description: 'Pressure-test any decision against Principle 1 by surfacing real customer value and hidden internal bias.',
    body: `Act as a senior HSBC leader who measures every decision by customer value.

I am considering this decision or initiative:
[describe what you are deciding]

The customer or customer group affected is:
[describe the customer]

Help me by:
1. Stating in one sentence what value this creates for the customer
2. Listing two ways this could be measured (specific metrics, not vague outcomes)
3. Calling out any internal-focused reasoning I may be hiding behind
4. Suggesting one question to ask my team that puts the customer back at the centre`,
  },
  {
    id: 'p2-bluf-rewrite',
    principleNumber: 2,
    principleName: 'Simplify to amplify',
    title: 'Rewrite this in BLUF format',
    description: 'Turn any wordy email or update into a crisp, Bottom Line Up Front version under 100 words.',
    body: `Act as an editor who writes in the BLUF format (Bottom Line Up Front), used by HSBC leaders to communicate clearly and quickly.

Rewrite the following message so the most important point appears in the first sentence, supporting context follows, and any action required is explicit at the end.

Original message:
[paste your message here]

Constraints:
- Keep it under 100 words
- Use plain professional English, no jargon
- Do not soften the main point with hedging
- If an action is needed, make it specific (who does what by when)`,
  },
  {
    id: 'p3-steel-man',
    principleNumber: 3,
    principleName: 'Challenge, align and commit',
    title: 'Steel-man the opposing view',
    description: 'Surface the strongest counter-argument before you commit, to catch blind spots in your reasoning.',
    body: `Act as a thoughtful colleague who can argue the opposite of my position with respect and rigour.

My position:
[describe what you currently believe or are proposing]

My reasoning:
[describe why you believe this]

Help me by:
1. Giving me the strongest possible argument against my position (the "steel man")
2. Identifying one assumption in my reasoning that may be wrong
3. Suggesting one piece of evidence that would change my mind
4. Helping me decide what to test before I commit`,
  },
  {
    id: 'p4-follow-up-plan',
    principleNumber: 4,
    principleName: 'See it through, make it happen',
    title: 'Build a 48-hour follow-up plan',
    description: 'Turn a meeting commitment into a tight follow-up plan with checkpoints and a definition of done.',
    body: `Act as an operations lead who is rigorous about closing the loop.

I made or received this commitment in a recent meeting:
[describe the commitment, who it involves, and the context]

Help me by:
1. Drafting a short follow-up message I can send within 48 hours to confirm shared understanding
2. Listing three checkpoints I should track between now and completion
3. Suggesting what "done" looks like in measurable terms
4. Identifying one risk that could cause this to drop through the cracks, and how to prevent it`,
  },
  {
    id: 'p5-coaching-conversation',
    principleNumber: 5,
    principleName: 'Great leaders build better leaders',
    title: 'Prepare a coaching conversation',
    description: 'Plan a one-to-one using the SIMPLE feedback structure (Situation, Impact, Motivation, Pause, Listen, Empower).',
    body: `Act as a coach helping me prepare for a one-to-one conversation with a team member, using the SIMPLE feedback structure (Situation, Impact, Motivation, Pause, Listen, Empower).

The team member:
[describe their role and level]

The situation I want to discuss:
[describe the behaviour, performance, or challenge]

My goal for the conversation:
[describe what good looks like after this conversation]

Help me by:
1. Drafting an opening that sets a constructive tone in two sentences
2. Naming the specific behaviour and its impact, without making it personal
3. Suggesting two open questions that invite their perspective
4. Outlining how I close with clear next steps and ownership`,
  },
  {
    id: 'p6-goal-to-story',
    principleNumber: 6,
    principleName: 'Create excitement, inspire ambition',
    title: 'Turn a goal into a story',
    description: 'Convert a numeric or abstract goal into a story that the team can rally behind.',
    body: `Act as a communications coach who helps leaders inspire their teams.

The goal or ambition I want to communicate:
[describe the goal in plain words]

The team I am speaking to:
[describe the team, their context, and what they care about]

Help me by:
1. Drafting a two-paragraph story that connects this goal to something the team already cares about
2. Suggesting one specific image or example that makes the ambition tangible
3. Identifying one number or measure that signals progress
4. Closing with a single call to action that anyone on the team can act on this week`,
  },
];

export default prompts;
