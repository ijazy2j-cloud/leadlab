import { useParams, Link } from 'react-router-dom';
import { usePrinciple } from '../lib/queries';
import Button from '../components/Button';
import EmptyState from '../components/EmptyState';
import reflections from '../lib/reflections';

// Map activity type → practice route (undefined = no dedicated form yet)
const ACTIVITY_ROUTES = {
  FOUR_QS:        '/practice/4qs',
  MEDICAL_MODEL:  '/practice/medical',
  BIG_FIVE:       '/practice/big-five',
};

const TYPE_LABELS = {
  FOUR_QS:          '4Qs',
  MEDICAL_MODEL:    'Medical model',
  BIG_FIVE:         'Big Five',
  SIMPLE_FEEDBACK:  'Feedback',
  OBJECTIONS_CLINIC:'Objections clinic',
  GENERIC:          'Practice',
};

function ActivityRow({ activity, principleId }) {
  const route = ACTIVITY_ROUTES[activity.type];
  const typeLabel = TYPE_LABELS[activity.type] ?? activity.type;

  return (
    <div className="bg-white border border-hsbc-border rounded-md p-4 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <span className="text-sm font-medium text-hsbc-black">{activity.name}</span>
          <span className="text-xs text-hsbc-grey border border-hsbc-border rounded-full px-2 py-0.5">
            {typeLabel}
          </span>
        </div>
        <div className="text-xs text-hsbc-grey mb-2">{activity.duration}</div>
        <ol className="space-y-1">
          {activity.steps.split('\n').map((step, i) => (
            <li key={i} className="text-xs text-hsbc-grey flex gap-2">
              <span className="flex-shrink-0 w-4 text-right opacity-50">{i + 1}.</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className="flex-shrink-0">
        {route ? (
          <Link
            to={`${route}?principleId=${principleId}`}
            className="inline-flex items-center justify-center px-4 py-2 rounded text-sm font-medium bg-hsbc-red text-white hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-hsbc-red whitespace-nowrap"
          >
            Start practice
          </Link>
        ) : (
          <span className="text-xs text-hsbc-grey italic">Form coming soon</span>
        )}
      </div>
    </div>
  );
}

export default function PrincipleDetailPage() {
  const { id } = useParams();
  const { data: principle, isLoading, isError } = usePrinciple(id);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-4 w-32 bg-hsbc-border rounded" />
        <div className="space-y-2">
          <div className="h-8 w-80 bg-hsbc-border rounded" />
          <div className="h-4 w-full bg-hsbc-border rounded" />
          <div className="h-4 w-3/4 bg-hsbc-border rounded" />
        </div>
      </div>
    );
  }

  if (isError || !principle) {
    return (
      <div>
        <Link to="/principles" className="text-sm text-hsbc-grey hover:text-hsbc-black flex items-center gap-1 mb-6">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          All principles
        </Link>
        <p className="text-sm text-hsbc-red">Could not load this principle.</p>
      </div>
    );
  }

  const objectives  = principle.objectives.split('\n').filter(Boolean);
  const behaviours  = principle.behaviours.split('\n').filter(Boolean);
  const prompts     = reflections[principle.number] ?? [];

  return (
    <div className="space-y-10">

      {/* ── Back link ────────────────────────────────────────────── */}
      <Link
        to="/principles"
        className="inline-flex items-center gap-1 text-sm text-hsbc-grey hover:text-hsbc-black transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hsbc-black rounded-sm"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        All principles
      </Link>

      {/* ── Header ───────────────────────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <span className="w-7 h-7 rounded-full border border-hsbc-border flex items-center justify-center text-xs text-hsbc-grey font-medium flex-shrink-0">
            {principle.number}
          </span>
          <h1 className="text-2xl font-medium text-hsbc-black">{principle.name}</h1>
        </div>
        <p className="text-sm text-hsbc-grey leading-relaxed max-w-2xl">{principle.intent}</p>
      </div>

      {/* ── Objectives + Key behaviours ─────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section aria-label="Objectives">
          <h2 className="text-sm font-medium text-hsbc-black mb-3">Objectives</h2>
          <ul className="space-y-2">
            {objectives.map((obj, i) => (
              <li key={i} className="flex gap-2.5 text-sm text-hsbc-grey">
                <span className="flex-shrink-0 mt-1.5 w-1 h-1 rounded-full bg-hsbc-grey opacity-60" aria-hidden="true" />
                {obj}
              </li>
            ))}
          </ul>
        </section>

        <section aria-label="Key behaviours">
          <h2 className="text-sm font-medium text-hsbc-black mb-3">Key behaviours to practise</h2>
          <ul className="space-y-2">
            {behaviours.map((beh, i) => (
              <li key={i} className="flex gap-2.5 text-sm text-hsbc-grey">
                <span className="flex-shrink-0 mt-1.5 w-1 h-1 rounded-full bg-hsbc-black" aria-hidden="true" />
                {beh}
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* ── Activities ───────────────────────────────────────────── */}
      <section aria-label="Activities">
        <h2 className="text-sm font-medium text-hsbc-black mb-3">Activities</h2>
        {principle.activities?.length > 0 ? (
          <div className="space-y-3">
            {principle.activities.map((act) => (
              <ActivityRow key={act.id} activity={act} principleId={principle.id} />
            ))}
          </div>
        ) : (
          <EmptyState
            message="No activities for this principle yet."
            action={
              <Link to="/practice/4qs" className="text-xs text-hsbc-grey underline underline-offset-2 hover:text-hsbc-black">
                Start with a 4Qs decision log
              </Link>
            }
          />
        )}
      </section>

      {/* ── Reflection prompts ───────────────────────────────────── */}
      {prompts.length > 0 && (
        <section aria-label="Reflection prompts">
          <h2 className="text-sm font-medium text-hsbc-black mb-3">Reflection prompts</h2>
          <div className="bg-white border border-hsbc-border rounded-md divide-y divide-hsbc-border">
            {prompts.map((prompt, i) => (
              <div key={i} className="px-4 py-3 flex gap-3">
                <span className="flex-shrink-0 text-xs text-hsbc-grey font-medium w-4 text-right mt-0.5 opacity-60">
                  {i + 1}
                </span>
                <p className="text-sm text-hsbc-grey leading-relaxed">{prompt}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
