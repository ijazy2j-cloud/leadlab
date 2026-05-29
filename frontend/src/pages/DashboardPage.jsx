import { Link } from 'react-router-dom';
import { useDashboard } from '../lib/queries';
import { useCurrentUser } from '../lib/queries';
import MetricCard from '../components/MetricCard';
import EmptyState from '../components/EmptyState';
import { FollowUpRow } from '../components/FollowUpItem';
import Hexagon from '../components/Hexagon';

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

// SVG icons for the practice cards
function IconFourQs() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="3" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="13" y="3" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="3" y="13" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="13" y="13" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function IconMedical() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 8v8M8 12h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function IconBigFive() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M8 6h10M8 10h10M8 14h10M8 18h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="4.5" cy="6" r="1" fill="currentColor" />
      <circle cx="4.5" cy="10" r="1" fill="currentColor" />
      <circle cx="4.5" cy="14" r="1" fill="currentColor" />
      <circle cx="4.5" cy="18" r="1" fill="currentColor" />
    </svg>
  );
}

const PRACTICE_CARDS = [
  {
    key: 'DECISION',
    icon: <IconFourQs />,
    title: '4Qs decision log',
    description: 'Test a live decision against four customer, simplicity, time, and values guardrails.',
    to: '/practice/4qs',
  },
  {
    key: 'MEDICAL',
    icon: <IconMedical />,
    title: 'Medical model',
    description: 'Diagnose a team or customer challenge using symptoms, diagnosis, treatment, and follow up.',
    to: '/practice/medical',
  },
  {
    key: 'BIG_FIVE',
    icon: <IconBigFive />,
    title: 'Big Five priorities',
    description: 'Clarify the five actions that will make the biggest difference this week.',
    to: '/practice/big-five',
  },
];

const METRICS = [
  { key: 'activitiesThisWeek', label: 'Activities this week', redWhen: false },
  { key: 'openFollowUps',      label: 'Open follow ups',      redWhen: false },
  { key: 'overdueFollowUps',   label: 'Overdue',              redWhen: true  },
  { key: 'principlesPractised',label: 'Practice types used',  redWhen: false },
];

export default function DashboardPage() {
  const { data: user } = useCurrentUser();
  const { data: dash, isLoading, isError } = useDashboard();

  const firstName = user?.name?.split(' ')[0] ?? '';

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-8 w-64 bg-hsbc-border rounded" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-hsbc-border rounded-md" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <p className="text-sm text-hsbc-red mt-8">
        Could not load dashboard. Check the backend is running.
      </p>
    );
  }

  return (
    <div className="space-y-10">

      {/* ── Greeting ─────────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-medium text-hsbc-black">
          {greeting()}{firstName ? `, ${firstName}` : ''}.
        </h1>

        {/* Current focus */}
        {dash?.currentPrincipleFocus ? (
          <p className="mt-1 text-sm text-hsbc-grey">
            This week you are practising{' '}
            <Link
              to={`/principles/${dash.currentPrincipleFocus.id}`}
              className="text-hsbc-red font-medium hover:opacity-80 transition-opacity"
            >
              {dash.currentPrincipleFocus.name}
            </Link>
            .
          </p>
        ) : (
          <p className="mt-1 text-sm text-hsbc-grey">
            <Link
              to="/principles"
              className="underline underline-offset-2 hover:text-hsbc-black transition-colors"
            >
              Pick a principle to focus on this week.
            </Link>
          </p>
        )}
      </div>

      {/* ── Metric cards ─────────────────────────────────────────── */}
      <section aria-label="Activity summary">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {METRICS.map(({ key, label, redWhen }) => {
            const value = dash?.[key] ?? 0;
            return (
              <MetricCard
                key={key}
                label={label}
                value={value}
                red={redWhen && value > 0}
              />
            );
          })}
        </div>
      </section>

      {/* ── Start a practice ─────────────────────────────────────── */}
      <section aria-label="Start a practice">
        {(() => {
          // Determine featured practice from most recent follow-up sourceType; default to 4Qs
          const recentSourceType = dash?.upcomingFollowUps?.[0]?.sourceType ?? 'DECISION';
          const featuredKey = ['DECISION', 'MEDICAL', 'BIG_FIVE'].includes(recentSourceType)
            ? recentSourceType
            : 'DECISION';
          const featured = PRACTICE_CARDS.find((c) => c.key === featuredKey);
          const rest = PRACTICE_CARDS.filter((c) => c.key !== featuredKey);

          return (
            <>
              <h2 className="text-base font-medium text-hsbc-black mb-3 flex items-center gap-2">
                <Hexagon size={14} color="#DB0011" />
                Start a practice
              </h2>

              {/* Featured card — full width */}
              <Link
                to={featured.to}
                className="block bg-white border border-hsbc-border rounded-md p-6 hover:border-hsbc-grey transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hsbc-red group mb-3"
              >
                <div className="flex items-start gap-4">
                  <div className="text-hsbc-grey group-hover:text-hsbc-black transition-colors flex-shrink-0 mt-0.5">
                    {featured.icon}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-hsbc-black mb-1">{featured.title}</div>
                    <div className="text-sm text-hsbc-grey leading-relaxed">{featured.description}</div>
                  </div>
                </div>
              </Link>

              {/* Remaining two cards — equal columns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {rest.map((card) => (
                  <Link
                    key={card.to}
                    to={card.to}
                    className="bg-white border border-hsbc-border rounded-md p-5 hover:border-hsbc-grey transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hsbc-red group"
                  >
                    <div className="text-hsbc-grey group-hover:text-hsbc-black transition-colors mb-3">
                      {card.icon}
                    </div>
                    <div className="text-sm font-medium text-hsbc-black mb-1">{card.title}</div>
                    <div className="text-xs text-hsbc-grey leading-relaxed">{card.description}</div>
                  </Link>
                ))}
              </div>
            </>
          );
        })()}
      </section>

      {/* ── Prompts hint ─────────────────────────────────────────── */}
      <p className="text-xs text-hsbc-grey -mt-6">
        <Link to="/prompts" className="underline underline-offset-2 hover:text-hsbc-black transition-colors">
          Try a prompt for this week's focus
        </Link>
      </p>

      {/* ── Due in the next 48 hours ─────────────────────────────── */}
      <section aria-label="Upcoming follow ups">
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="text-base font-medium text-hsbc-black">Due in the next 48 hours</h2>
          {(dash?.upcomingFollowUps?.length ?? 0) > 0 && (
            <Link to="/follow-ups" className="text-xs text-hsbc-grey hover:text-hsbc-black transition-colors">
              View all
            </Link>
          )}
        </div>

        {(dash?.upcomingFollowUps?.length ?? 0) === 0 ? (
          <div className="bg-white border border-hsbc-border rounded-md">
            <EmptyState
              message="Nothing due in the next 48 hours. Log a decision or run a practice to create one."
              action={
                <Link to="/practice/4qs" className="text-xs text-hsbc-grey underline underline-offset-2 hover:text-hsbc-black">
                  Start with a 4Qs decision log
                </Link>
              }
            />
          </div>
        ) : (
          <div className="bg-white border border-hsbc-border rounded-md px-4 divide-y divide-hsbc-border">
            {dash.upcomingFollowUps.map((fu) => (
              <FollowUpRow key={fu.id} followUp={fu} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
