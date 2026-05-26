# LeadLab Developer Brief

A practice support tool for HSBC's How We Lead leadership framework.

This document is a complete brief for Claude Code. It is written for a non developer owner who will guide Claude Code through the build. Hand this file to Claude Code in your terminal and ask it to follow it step by step.

---

## 1. How to use this brief

You are building this app with Claude Code, an AI coding assistant that runs in your terminal. Follow these steps before pasting anything:

1. Install Node.js version 20 or higher from nodejs.org
2. Install Git from git-scm.com
3. Install VS Code from code.visualstudio.com
4. Install Claude Code by following the instructions at docs.claude.com
5. Add the two skills below by running these commands in your terminal:
   - `npx skills add https://github.com/vercel-labs/agent-skills --skill web-design-guidelines`
   - `npx skills add https://github.com/anthropics/skills --skill frontend-design`
6. Create a new empty folder called `leadlab` somewhere on your computer
7. Open that folder in VS Code, then open the integrated terminal
8. Start Claude Code in that terminal
9. Paste this entire document into Claude Code and tell it: "Follow this brief from Section 2 onwards. Build the project step by step. Pause after each phase so I can review."

Claude Code will then ask you questions as it goes. If anything is unclear, stop and ask the original planner (Claude on claude.ai) for help.

---

## 2. Project overview

**Name**: LeadLab

**Purpose**: An internal web app that helps HSBC leaders practise the How We Lead framework in their day to day work. It is not a learning library. Every screen must lead to an action: a decision logged, a follow up scheduled, a reflection captured.

**Core promise**: A leader should be able to log a practice entry in under 5 minutes, and the tool should remind them to follow up 48 hours later.

**Tech stack**:
- Backend: Node.js with Express, Prisma ORM, SQLite database
- Frontend: React with Vite, React Router, TanStack Query, Tailwind CSS
- Auth: Mock for now (dropdown user picker), wrapped in a swappable middleware for future HSBC SSO
- Charts: Recharts for the dashboard

**Project layout**:
```
leadlab/
  backend/
  frontend/
  README.md
  .gitignore
  package.json (root, for running both at once)
```

Two separate Node projects, run together from the root with `npm run dev`.

---

## 3. Brand and visual direction

LeadLab must look like an internal HSBC product. Quiet, minimal, professional.

**Colours** (define these as Tailwind tokens):
- `hsbc-red`: `#DB0011`
- `hsbc-grey`: `#9FA1A4`
- `hsbc-black`: `#000000`
- `hsbc-white`: `#FFFFFF`
- `hsbc-bg`: `#F7F7F5` (page background, warm off white)
- `hsbc-border`: `#E5E5E2`

**Typography**:
- Use Inter from Google Fonts as the primary typeface
- Headings: weight 500, never 700
- Body: weight 400, line height 1.6
- Always sentence case, never Title Case or ALL CAPS

**Visual rules**:
- White card surfaces on a warm off white page background
- Thin 0.5px to 1px borders, never shadows
- HSBC red used only for: primary buttons, the brand bar, overdue badges, the active principle highlight
- All other accents in black and grey
- A hexagon shape (HSBC's brand anchor) used in the logo and as a quiet decorative element in empty states
- Generous whitespace, no decorative gradients, no neon effects
- Mobile first, the app must work cleanly on a phone

**Inspiration**: Look at how Stripe Dashboard and Linear handle data dense screens. Calm, clear, no visual noise. HSBC's brand is famously minimal: red, black, white, grey. Stay disciplined.

---

## 4. Data model

Use Prisma with SQLite. The schema goes in `backend/prisma/schema.prisma`.

### Entities

**User**
- id (cuid)
- name (string)
- email (string, unique)
- role (string, optional)
- team (string, optional)
- isAdmin (boolean, default false)
- createdAt, updatedAt

**Principle** (seeded, read only in the app)
- id (cuid)
- number (int, 1 to 6)
- name (string)
- intent (string, long text)
- objectives (string, long text, newline separated)
- behaviours (string, long text, newline separated)
- shortDescription (string)

**Activity** (seeded, read only)
- id (cuid)
- principleId (relation to Principle)
- name (string)
- duration (string, e.g. "10 to 20 mins")
- steps (string, long text, newline separated)
- type (enum: FOUR_QS, MEDICAL_MODEL, BIG_FIVE, SIMPLE_FEEDBACK, OBJECTIONS_CLINIC, GENERIC)

**PracticeLog**
- id (cuid)
- userId
- principleId
- activityId (optional)
- date (DateTime, default now)
- notes (string)
- status (enum: DRAFT, COMPLETE)
- createdAt, updatedAt

**DecisionLog** (the 4Qs form)
- id (cuid)
- userId
- decision (string, the question being decided)
- q1Answer (enum: YES, NO, UNSURE), q1Why (string)
- q2Answer, q2Why
- q3Answer, q3Why
- q4Answer, q4Why
- outcome (enum: PROCEED, PAUSE, AMEND, STOP)
- followUpDate (DateTime, optional)
- followUpNote (string, optional)
- createdAt, updatedAt

**MedicalCase**
- id (cuid)
- userId
- title (string, short label for the case)
- symptoms (string, long text)
- diagnosis (string, long text)
- treatment (string, long text)
- followUp (string, long text)
- followUpDate (DateTime, optional)
- createdAt, updatedAt

**BigFive**
- id (cuid)
- userId
- topic (string)
- priorities (JSON string, an array of objects: { text, owner, deadline })
- followUpDate (DateTime, optional)
- createdAt, updatedAt

**FollowUp**
- id (cuid)
- userId
- sourceType (enum: DECISION, MEDICAL, BIG_FIVE, COACHING, MANUAL)
- sourceId (string, the id of the source record, nullable for MANUAL)
- commitment (string)
- owner (string, default "me")
- dueDate (DateTime)
- status (enum: OPEN, DONE, CANCELLED)
- outcome (string, optional, filled when marked done)
- createdAt, updatedAt

### Auto follow up logic

When a DecisionLog, MedicalCase or BigFive is created with a followUpDate, the API must automatically create a matching FollowUp record. This is the heart of the 48 hour rule.

---

## 5. Backend build

### Setup

In `backend/`:

```bash
npm init -y
npm install express prisma @prisma/client cors zod dotenv
npm install -D nodemon
npx prisma init --datasource-provider sqlite
```

In `backend/package.json` scripts:
```json
"dev": "nodemon src/server.js",
"start": "node src/server.js",
"db:migrate": "prisma migrate dev",
"db:seed": "node src/seed/run.js",
"db:reset": "prisma migrate reset --force"
```

In `backend/prisma/schema.prisma`, write the schema from Section 4.

### Folder structure

```
backend/
  src/
    server.js              (express app entry)
    routes/
      principles.js
      activities.js
      decisions.js
      medical-cases.js
      big-five.js
      follow-ups.js
      dashboard.js
      users.js
    middleware/
      auth.js              (mock auth, future SSO swap point)
      error.js
      validate.js          (zod validation helper)
    lib/
      prisma.js            (single prisma client instance)
      followUpHelper.js    (auto creates FollowUp from other records)
    seed/
      run.js               (entry point)
      principles.js        (six principles data)
      activities.js        (activity data)
      users.js             (4 demo users)
  prisma/
    schema.prisma
  .env
```

### Server entry (`src/server.js`)

- Express with cors, json body parser
- Mount all route files under `/api`
- Global error handler
- Listen on port from env (default 4000)
- Health check at `/api/health`

### Auth middleware (`src/middleware/auth.js`)

This is the swap point for future SSO. For now:

```javascript
// Read x-user-id header, find user, attach to req.user
// If header missing or user not found, return 401
// TODO: replace with HSBC SSO middleware later
```

Keep this file small and clearly commented. It must be the only place that knows how to identify a user.

### API routes

All routes require the auth middleware. All write routes use Zod validation.

**Principles** (`routes/principles.js`)
- `GET /api/principles` returns the six principles
- `GET /api/principles/:id` returns one principle with its activities

**Activities** (`routes/activities.js`)
- `GET /api/activities?principleId=...` returns activities, optionally filtered

**Decisions** (`routes/decisions.js`)
- `POST /api/decisions` creates a decision log, auto creates a FollowUp if followUpDate is set
- `GET /api/decisions` returns my decisions, paginated, newest first
- `GET /api/decisions/:id` returns one
- `PATCH /api/decisions/:id` updates
- `DELETE /api/decisions/:id` removes (and any linked FollowUp)

**Medical cases** (`routes/medical-cases.js`)
- Same shape as decisions

**Big Five** (`routes/big-five.js`)
- Same shape

**Follow ups** (`routes/follow-ups.js`)
- `GET /api/follow-ups?status=OPEN|OVERDUE|DONE` lists my follow ups
- `POST /api/follow-ups` create a manual follow up
- `PATCH /api/follow-ups/:id` update status, outcome
- `DELETE /api/follow-ups/:id`

**Dashboard** (`routes/dashboard.js`)
- `GET /api/dashboard` returns:
  ```
  {
    activitiesThisWeek: number,
    openFollowUps: number,
    overdueFollowUps: number,
    principlesPractised: number,
    upcomingFollowUps: [first 5 FollowUps ordered by dueDate],
    currentPrincipleFocus: { id, name } | null  // most recent PracticeLog
  }
  ```

**Users** (`routes/users.js`)
- `GET /api/users` returns the list of seeded users (used by the mock login dropdown). This route is the only one without auth, since it powers the picker.
- `GET /api/me` returns the current user

### Follow up helper (`src/lib/followUpHelper.js`)

A single function:
```javascript
async function createFollowUpFrom(sourceType, sourceId, userId, commitment, dueDate)
```

Used by the decisions, medical cases and big five routes when they create a record with a followUpDate.

### Seed data

Write the six principles and their activities into `src/seed/principles.js` and `src/seed/activities.js`. Use the content from Section 9 below verbatim. Create 4 demo users in `src/seed/users.js`:

- Ravindu Silva, Operations Lead, Colombo team, not admin
- Priya Wickramasinghe, Customer Service Manager, Colombo team, not admin
- Tom Harper, Regional Director, London team, admin
- Aisha Khan, Product Lead, Singapore team, not admin

Run the seed after migration with `npm run db:seed`.

---

## 6. Frontend build

### Setup

In `frontend/`:

```bash
npm create vite@latest . -- --template react
npm install
npm install react-router-dom @tanstack/react-query axios date-fns
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

In `frontend/package.json`, add a proxy config for dev. Set Vite's `vite.config.js` to proxy `/api` to `http://localhost:4000`.

### Tailwind config

In `tailwind.config.js`:

```javascript
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        'hsbc-red': '#DB0011',
        'hsbc-grey': '#9FA1A4',
        'hsbc-black': '#000000',
        'hsbc-bg': '#F7F7F5',
        'hsbc-border': '#E5E5E2',
        'hsbc-overdue': '#DB0011',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '6px',
        'md': '8px',
        'lg': '12px',
      },
    },
  },
}
```

Load Inter from Google Fonts in `index.html`.

### Folder structure

```
frontend/
  src/
    main.jsx
    App.jsx
    pages/
      LoginPage.jsx
      DashboardPage.jsx
      PrincipleHubPage.jsx
      PrincipleDetailPage.jsx
      FourQsFormPage.jsx
      MedicalModelFormPage.jsx
      BigFiveFormPage.jsx
      FollowUpsPage.jsx
      MyPracticePage.jsx
    components/
      AppShell.jsx          (top bar, nav, layout wrapper)
      Hexagon.jsx           (HSBC hexagon SVG)
      Button.jsx
      Card.jsx
      MetricCard.jsx
      FollowUpItem.jsx
      PrincipleCard.jsx
      EmptyState.jsx
      GlossaryDrawer.jsx
      FormField.jsx
    lib/
      api.js                (axios instance with x-user-id header)
      auth.js               (currentUser stored in localStorage)
      queries.js            (TanStack Query hooks for each endpoint)
      glossary.js           (term to definition map)
    index.css
```

### Routing (`App.jsx`)

```
/                    redirects to /dashboard if logged in, else /login
/login               LoginPage
/dashboard           DashboardPage
/principles          PrincipleHubPage
/principles/:id      PrincipleDetailPage
/practice/4qs        FourQsFormPage
/practice/4qs/:id    FourQsFormPage (edit mode)
/practice/medical    MedicalModelFormPage
/practice/big-five   BigFiveFormPage
/follow-ups          FollowUpsPage
/my-practice         MyPracticePage
```

Wrap all routes except /login in a `RequireAuth` component that checks `localStorage.getItem('userId')` and redirects to /login if missing.

### App shell

A persistent top bar across all logged in pages. From left to right:
- LeadLab logo: hexagon icon in HSBC red, plus the word "LeadLab" in black, weight 500
- Subtitle in grey: "How We Lead practice tool"
- Nav links: My practice, Library, Follow ups, Glossary (Glossary opens a slide over)
- User avatar circle on the right with initials and a small dropdown to switch user (for mock login) and sign out

On mobile, the nav collapses to a hamburger that opens a side drawer.

### Pages

**LoginPage**
- Centred card on the page background
- Hexagon logo at the top
- Title: "Sign in to LeadLab"
- Subtitle: "Select a user. HSBC SSO will be added later."
- Dropdown of seeded users
- Sign in button (HSBC red)
- On submit, store the userId in localStorage and redirect to /dashboard

**DashboardPage**
- Greeting line: "Good morning, {firstName}"
- Current focus line: "This week you are practising {principle name in HSBC red}" or "Pick a principle to focus on this week" if none
- Four metric cards in a row (stacks to 2x2 on mobile): Activities this week, Open follow ups, Overdue (red number if greater than 0), Principles practised
- "Start a practice" section: three buttons in cards for 4Qs, Medical model, Big Five, each with an icon and short description
- "Due in the next 48 hours" section: list of upcoming follow ups, each row shows commitment, source (e.g. "from decision log, Tue meeting"), due date or "Overdue" in red

**PrincipleHubPage**
- Header: "The six leadership principles"
- Sub: "Pick one to focus on for one to two weeks"
- Six principle cards in a responsive grid (3 columns desktop, 1 column mobile). Each card shows:
  - Principle number in a small grey circle
  - Principle name in weight 500
  - Short description, two lines
  - A small footer link "Open"
- Active principle (the one matching dashboard's current focus) has a thin HSBC red left border

**PrincipleDetailPage**
- Back to all principles link
- Principle number, name, intent
- Two columns on desktop: "Objectives" and "Key behaviours to practise"
- "Activities" section: list of activities with name, duration, and a "Start practice" button that routes to the relevant form, pre filled with the principle id
- "Reflection prompts" section (read only, from the playbook)

**FourQsFormPage**
- Title: "4Qs decision log"
- Short intro: "Test a live decision against the four guardrails"
- Field: Decision (textarea, label: "What are you deciding?")
- For each of the four questions, show:
  - The question text
  - Three radio buttons: Yes, No, Unsure
  - A textarea for "Why" (optional but encouraged)
- Outcome: four radio buttons: Proceed, Pause, Amend, Stop
- Follow up date picker (default 48 hours from now)
- Follow up note (optional)
- Save button (red, primary)
- Cancel link
- On save, show a confirmation toast "Decision logged. Follow up set for {date}." and route back to the dashboard

The four questions (from the playbook):
1. Does it benefit our customers?
2. Does it contribute to being simple and agile?
3. Will it stand the test of time?
4. Does it align with our values and risk appetite?

**MedicalModelFormPage**
- Title: "Medical model mini case"
- Title field
- Four textareas in order: Symptoms, Diagnosis, Treatment, Follow up
- Each has a small grey helper text under the label, taken from the playbook
- Follow up date picker
- Save button

**BigFiveFormPage**
- Title: "Big Five priorities"
- Topic field
- Five rows, each with: priority text, owner (default "me"), deadline (date)
- Follow up date picker (when to review)
- Save button

**FollowUpsPage**
- Three tabs: Open, Overdue, Done
- Each tab shows a list of FollowUp items
- Each row: commitment text, source label, due date, status badge, action buttons (Mark done, Edit, Delete)
- Mark done opens a small inline form to capture the outcome
- "Add manual follow up" button at the top right

**MyPracticePage**
- A simple timeline of all my logs across decisions, medical cases, big five, follow ups marked done
- Filter by type and principle
- Click any item to view or edit it

### Components

**Hexagon** (`components/Hexagon.jsx`)
- An SVG hexagon, accepts colour and size props
- Used in the logo, empty states, and the small principle number badges if you like

**Card**: white background, 1px border in hsbc-border, rounded md, padding 16 to 20px

**Button**: three variants:
- Primary: hsbc-red background, white text, hover slight darken
- Secondary: white background, hsbc-border, black text
- Ghost: transparent, hsbc-grey text, no border

**MetricCard**: small label in grey, large number below in weight 500, optional red colour for overdue

**FollowUpItem**: title, source line, date, status badge, action buttons. Overdue items show the date in red

**EmptyState**: faint hexagon icon, short message, optional call to action button

**GlossaryDrawer**: slides in from the right. Header "Glossary", list of terms from `lib/glossary.js`. Each term shows name and definition. Search box at the top.

### Glossary content

In `lib/glossary.js`, export an object with all terms from Section 11 of the playbook. Key terms: How We Lead, Leadership 8, Medical Model, 4Qs, SIMPLE, NEAT, Big Five, BLUF, Minto Pyramid Principle, Hook Line and Sinker, Jenga Technique, Mini max, T Bar, Flight Plan, Success Triangle, Attitude Matrix, Rubber Band Rule.

---

## 7. Root level setup

In the root `leadlab/` folder:

`package.json`:
```json
{
  "name": "leadlab",
  "private": true,
  "scripts": {
    "dev": "concurrently -n backend,frontend -c red,blue \"npm:dev:backend\" \"npm:dev:frontend\"",
    "dev:backend": "npm --prefix backend run dev",
    "dev:frontend": "npm --prefix frontend run dev",
    "install:all": "npm install && npm --prefix backend install && npm --prefix frontend install",
    "db:setup": "npm --prefix backend run db:migrate && npm --prefix backend run db:seed"
  },
  "devDependencies": {
    "concurrently": "^9.0.0"
  }
}
```

`.gitignore`:
```
node_modules
backend/prisma/dev.db
backend/prisma/dev.db-journal
backend/.env
frontend/dist
.DS_Store
.env
.env.local
```

`README.md`: short instructions for getting started, running the dev server, resetting the database.

---

## 8. Build phases

Tell Claude Code to work in this order and pause at the end of each phase for review:

**Phase A: Skeleton**
1. Create folder structure
2. Initialise backend with Prisma schema and SQLite
3. Initialise frontend with Vite, Tailwind, routing
4. Wire up the dev script that runs both
5. Confirm `npm run dev` works and a placeholder page loads

**Phase B: Data and seed**
1. Write the Prisma schema in full
2. Run the first migration
3. Write the seed scripts with the six principles, activities, and demo users
4. Confirm the seed runs cleanly

**Phase C: Backend API**
1. Build the auth middleware (mock)
2. Build all route files
3. Build the follow up helper
4. Test each endpoint with curl or a REST client

**Phase D: Frontend shell and login**
1. Build the app shell, hexagon logo, and the brand bar
2. Build the login page with the user picker
3. Wire up the api.js axios instance with the x-user-id header

**Phase E: Dashboard and principles**
1. Build the dashboard page
2. Build the principle hub and principle detail pages

**Phase F: Practice forms**
1. Build the 4Qs form (highest priority, this is the headline feature)
2. Build the Medical model form
3. Build the Big Five form
4. Confirm each one auto creates a follow up

**Phase G: Follow ups and my practice**
1. Build the follow ups page with tabs
2. Build the my practice timeline

**Phase H: Polish**
1. Build the glossary drawer
2. Add empty states across all pages
3. Mobile responsiveness pass
4. Accessibility pass (keyboard navigation, focus rings, ARIA labels on icon only buttons)
5. Final visual review against the design rules in Section 3

After each phase, Claude Code should stop and report what was built. The owner reviews and approves before moving on.

---

## 9. Seed content (copy verbatim into seed files)

### The six principles

**Principle 1: Think customer, deliver value**
- Short description: Measure success by value created for customers and those we serve
- Intent: We measure success by the value we create for customers and all those we serve. We anticipate needs, exceed expectations and build solutions that drive real outcomes.
- Objectives:
  - Make customer impact explicit in decisions and priorities
  - Reduce internal focus and increase customer value focus
  - Translate "customer" into measurable outcomes: goals and tracking
- Behaviours:
  - Start decisions with customer benefit using 4Qs Q1
  - Map how your work impacts customers directly or indirectly
  - Use customer feedback and data as Symptoms in the Medical Model

**Principle 2: Simplify to amplify**
- Short description: Cut through complexity, make clear decisions and execute at pace
- Intent: We cut through complexity, make clear decisions and execute at pace for our customers. Progress beats perfection. We start strong, drive momentum and finish stronger.
- Objectives:
  - Reduce complexity and busy work
  - Increase clarity and pace of execution
  - Improve communication simplicity and decision speed
- Behaviours:
  - Use ruthless prioritisation: critical few vs minor many
  - Use mini max: maximum impact, fewest words
  - Remove non essential steps using Jenga applied to processes

**Principle 3: Challenge, align and commit**
- Short description: Challenge with respect, align quickly and commit fully once decided
- Intent: We challenge with respect, align quickly and commit fully once decisions are made. Clarity in decision making drives efficiency, accelerates execution and delivers better results for our customers.
- Objectives:
  - Improve quality of decisions through healthy challenge
  - Reduce meeting silence and corridor violence
  - Increase commitment and follow through after decisions
- Behaviours:
  - Encourage diverse perspectives and psychological safety
  - Challenge in the room and commit after the decision
  - Use structured methods to surface objections early

**Principle 4: See it through, make it happen**
- Short description: Act like owners. The job is not done until the job is done
- Intent: We act like owners and never look the other way. Our job is not done until the job is done.
- Objectives:
  - Strengthen accountability and follow through
  - Reduce dropped actions and FYI communications that do not land
  - Build a culture of micro inspection, not micro management
- Behaviours:
  - Inspect what you expect
  - Follow up within 48 hours of commitments
  - Apply consequences, positive or corrective, with care

**Principle 5: Great leaders build better leaders**
- Short description: Nurture talent and coach for performance
- Intent: We care about our people, nurturing talent and coaching for performance. By embracing diverse perspectives and celebrating individual and collective strengths, we field the right people for every challenge, develop future leaders and create a culture that endures.
- Objectives:
  - Increase coaching frequency and quality
  - Identify and develop talent systematically
  - Build psychological safety and inclusion so different strengths show up
- Behaviours:
  - Coach skills and performance, not just tasks
  - Recognise and share best practices
  - Use structured talent thinking through NEAT

**Principle 6: Create excitement, inspire ambition**
- Short description: Challenge norms, question assumptions, aim higher
- Intent: We challenge norms, question assumptions and think beyond our role. Breaking barriers starts with the confidence to aim higher. Ambition, pride and curiosity fuel our growth.
- Objectives:
  - Increase ambition clarity and meaning
  - Create energy and motivation for change
  - Encourage curiosity, innovation and constructive challenge
- Behaviours:
  - Reinforce the ambition regularly as a communication responsibility
  - Use storytelling and emotion authentically to engage
  - Turn ambition into goals, plans and accountability

### Activities (one example per principle for the seed; add more later)

For each principle, seed at least one activity. Examples:

- Principle 2, type BIG_FIVE: "Big Five prioritisation", duration "10 to 20 mins", steps: "Identify the five actions that will make the biggest difference this week. Assign owners and deadlines."
- Principle 1, type FOUR_QS: "4Qs decision check", duration "10 mins per decision", steps: "Pick one live decision. Run the 4Qs. Challenge any answer that is not clearly yes."
- Principle 1, type MEDICAL_MODEL: "Medical model mini case", duration "30 to 45 mins", steps: "Pick one customer pain point. Define Symptoms, Diagnosis, Treatment and Follow up."
- Principle 4, type GENERIC: "48 hour follow up habit", duration "ongoing", steps: "For every commitment requested or received, follow up within 48 hours."

---

## 10. Things to keep in mind

- This is an internal HSBC tool. No external services other than Google Fonts. No analytics. No third party trackers.
- Coaching notes are sensitive. The MVP does not include the coaching log yet (Phase 2), so this is not an immediate concern, but design routes and data access so a user can only ever see their own records.
- Every form must validate on the client and on the server. Server validation uses Zod.
- Every page must be keyboard navigable and pass basic accessibility checks.
- Times and dates are stored in UTC. Display in the user's local time with date-fns.
- Keep the bundle small. Do not add any UI library beyond Tailwind. No Material UI, no Chakra, no Ant Design.
- Mobile first. Test every page at a 380px width before moving on.

---

## 11. What to do when stuck

If Claude Code hits a question it cannot answer from this brief, it should:

1. Pause and ask the owner directly
2. Not invent product behaviour. The playbook is the source of truth.
3. For visual decisions, default to "more restrained". HSBC's brand rewards quiet design.

If you, the owner, get stuck:

1. Save what Claude Code has built (git commit)
2. Take a screenshot of the issue
3. Go back to Claude on claude.ai and ask for help with the screenshot and a description

---

End of brief. Build well.
