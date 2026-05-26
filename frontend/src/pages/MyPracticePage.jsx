import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { format, isThisWeek } from 'date-fns';
import {
  useDecisions,
  useMedicalCases,
  useBigFives,
  useFollowUps,
} from '../lib/queries';
import EmptyState from '../components/EmptyState';

// ── Normalise records to a shared shape ──────────────────────────────────────

function normDecision(d) {
  return {
    id: d.id,
    type: 'DECISION',
    title: d.decision.length > 70 ? d.decision.slice(0, 70) + '…' : d.decision,
    preview: `${d.outcome} · Q1: ${d.q1Answer}, Q2: ${d.q2Answer}`,
    date: d.createdAt,
    followUpDate: d.followUpDate,
    editRoute: `/practice/4qs/${d.id}`,
    raw: d,
  };
}

function normMedical(m) {
  return {
    id: m.id,
    type: 'MEDICAL',
    title: m.title,
    preview: m.symptoms.length > 80 ? m.symptoms.slice(0, 80) + '…' : m.symptoms,
    date: m.createdAt,
    followUpDate: m.followUpDate,
    editRoute: `/practice/medical/${m.id}`,
    raw: m,
  };
}

function normBigFive(b) {
  let items = [];
  try { items = JSON.parse(b.priorities); } catch {}
  return {
    id: b.id,
    type: 'BIG_FIVE',
    title: b.topic,
    preview: items.slice(0, 3).map((p) => p.text).join(' · '),
    date: b.createdAt,
    followUpDate: b.followUpDate,
    editRoute: `/practice/big-five/${b.id}`,
    raw: b,
  };
}

function normDoneFU(f) {
  return {
    id: f.id,
    type: 'FOLLOW_UP',
    title: f.commitment,
    preview: f.outcome || 'Marked done',
    date: f.updatedAt || f.createdAt,
    followUpDate: null,
    editRoute: null,
    raw: f,
  };
}

// ── Icons & labels ───────────────────────────────────────────────────────────

const TYPE_META = {
  DECISION:  { label: 'Decision',  icon: IconDecision  },
  MEDICAL:   { label: 'Medical',   icon: IconMedical   },
  BIG_FIVE:  { label: 'Big Five',  icon: IconBigFive   },
  FOLLOW_UP: { label: 'Follow up', icon: IconFollowUp  },
};

function IconDecision() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="2" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2" />
      <rect x="9" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2" />
      <rect x="2" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2" />
      <rect x="9" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

function IconMedical() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.2" />
      <path d="M8 5v6M5 8h6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function IconBigFive() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M5 4h8M5 8h8M5 12h8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="2.5" cy="4" r="0.8" fill="currentColor" />
      <circle cx="2.5" cy="8" r="0.8" fill="currentColor" />
      <circle cx="2.5" cy="12" r="0.8" fill="currentColor" />
    </svg>
  );
}

function IconFollowUp() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 8l3.5 3.5L13 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── Filter chips ─────────────────────────────────────────────────────────────

const FILTERS = [
  { value: 'ALL',       label: 'All'        },
  { value: 'DECISION',  label: 'Decisions'  },
  { value: 'MEDICAL',   label: 'Medical'    },
  { value: 'BIG_FIVE',  label: 'Big Five'   },
  { value: 'FOLLOW_UP', label: 'Follow ups' },
];

// ── List row ─────────────────────────────────────────────────────────────────

function TimelineRow({ item }) {
  const meta = TYPE_META[item.type] ?? TYPE_META.FOLLOW_UP;
  const Icon = meta.icon;

  const inner = (
    <div className="bg-white border border-hsbc-border rounded-md px-4 py-3 flex items-start gap-3 hover:border-hsbc-grey transition-colors duration-150">
      <div className="flex-shrink-0 mt-0.5 text-hsbc-grey">
        <Icon />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-hsbc-grey border border-hsbc-border rounded-full px-2 py-0.5 leading-none">
            {meta.label}
          </span>
          <span className="text-sm font-medium text-hsbc-black truncate">{item.title}</span>
        </div>
        {item.preview && (
          <p className="text-xs text-hsbc-grey mt-1 truncate">{item.preview}</p>
        )}
      </div>
      <span className="flex-shrink-0 text-xs text-hsbc-grey tabular-nums">
        {format(new Date(item.date), 'd MMM')}
      </span>
    </div>
  );

  return item.editRoute ? (
    <Link to={item.editRoute} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hsbc-black rounded-md">
      {inner}
    </Link>
  ) : (
    <div>{inner}</div>
  );
}

// ── Board card ───────────────────────────────────────────────────────────────

function BoardCard({ item }) {
  const meta = TYPE_META[item.type] ?? TYPE_META.FOLLOW_UP;

  const inner = (
    <div className="bg-white border border-hsbc-border rounded-md p-4 hover:border-hsbc-grey transition-colors duration-150">
      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-xs text-hsbc-grey border border-hsbc-border rounded-full px-2 py-0.5 leading-none">
          {meta.label}
        </span>
      </div>
      <p className="text-sm font-medium text-hsbc-black line-clamp-2 leading-snug">{item.title}</p>
      <p className="text-xs text-hsbc-grey mt-1.5 tabular-nums">
        {format(new Date(item.date), 'd MMM')}
      </p>
      {item.followUpDate && (
        <p className="text-xs text-hsbc-grey mt-0.5">
          Follow up {format(new Date(item.followUpDate), 'd MMM')}
        </p>
      )}
    </div>
  );

  return item.editRoute ? (
    <Link to={item.editRoute} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hsbc-black rounded-md">
      {inner}
    </Link>
  ) : (
    <div>{inner}</div>
  );
}

// ── Board column ─────────────────────────────────────────────────────────────

function BoardColumn({ title, items }) {
  return (
    <div className="flex flex-col min-w-[240px] md:min-w-0 flex-shrink-0 md:flex-shrink">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-hsbc-black">{title}</h3>
        <span className="text-xs text-hsbc-grey">{items.length}</span>
      </div>
      {items.length === 0 ? (
        <div className="bg-hsbc-bg border border-dashed border-hsbc-border rounded-md py-8 flex items-center justify-center">
          <span className="text-xs text-hsbc-grey">None yet</span>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <BoardCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

const VIEW_KEY = 'leadlab:myPractice:view';

export default function MyPracticePage() {
  const [filter, setFilter]   = useState('ALL');
  const [view, setView]       = useState(() => localStorage.getItem(VIEW_KEY) || 'list');

  const { data: decisions  = [], isLoading: l1 } = useDecisions();
  const { data: medicals   = [], isLoading: l2 } = useMedicalCases();
  const { data: bigFives   = [], isLoading: l3 } = useBigFives();
  const { data: doneFUs    = [], isLoading: l4 } = useFollowUps('DONE');
  const { data: allFUs     = []                } = useFollowUps();

  const isLoading = l1 || l2 || l3 || l4;

  function switchView(v) {
    setView(v);
    localStorage.setItem(VIEW_KEY, v);
  }

  // Unified timeline, newest first
  const allRecords = useMemo(() => [
    ...decisions.map(normDecision),
    ...medicals.map(normMedical),
    ...bigFives.map(normBigFive),
    ...doneFUs.filter((f) => f.sourceType !== 'MANUAL').map(normDoneFU),
  ].sort((a, b) => new Date(b.date) - new Date(a.date)), [decisions, medicals, bigFives, doneFUs]);

  const filtered = useMemo(
    () => (filter === 'ALL' ? allRecords : allRecords.filter((r) => r.type === filter)),
    [allRecords, filter]
  );

  // Board column assignment (decisions, medical, big five only — not done-FU rows)
  const boardRecords = useMemo(() => [
    ...decisions.map(normDecision),
    ...medicals.map(normMedical),
    ...bigFives.map(normBigFive),
  ], [decisions, medicals, bigFives]);

  const { thisWeek, followUpDue, closed } = useMemo(() => {
    const tw = [], fd = [], cl = [];
    boardRecords.forEach((item) => {
      const linkedFU = allFUs.find((f) => f.sourceId === item.id);
      if (linkedFU?.status === 'DONE') {
        cl.push(item);
      } else if (linkedFU?.status === 'OPEN') {
        fd.push(item);
      } else if (isThisWeek(new Date(item.date), { weekStartsOn: 1 })) {
        tw.push(item);
      }
      // Records with no FU and not this week are not shown on the board (no column)
    });
    return { thisWeek: tw, followUpDue: fd, closed: cl };
  }, [boardRecords, allFUs]);

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 w-56 bg-hsbc-border rounded" />
        {[1, 2, 3].map((i) => <div key={i} className="h-16 bg-hsbc-border rounded-md" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Header with view toggle */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium text-hsbc-black">My practice</h1>
          <p className="mt-1 text-sm text-hsbc-grey">
            All your logged decisions, cases, and priorities.
          </p>
        </div>
        <div className="flex-shrink-0 flex items-center gap-1 border border-hsbc-border rounded-md p-0.5 bg-white">
          {['list', 'board'].map((v) => (
            <button
              key={v}
              onClick={() => switchView(v)}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors capitalize ${
                view === v
                  ? 'bg-hsbc-black text-white'
                  : 'text-hsbc-grey hover:text-hsbc-black'
              }`}
            >
              {v === 'list' ? 'List' : 'Board'}
            </button>
          ))}
        </div>
      </div>

      {/* ── LIST VIEW ────────────────────────────────────────────────── */}
      {view === 'list' && (
        <>
          {/* Filter chips */}
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by type">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
                  filter === f.value
                    ? 'bg-hsbc-black text-white border-hsbc-black'
                    : 'bg-white text-hsbc-grey border-hsbc-border hover:border-hsbc-grey hover:text-hsbc-black'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              message="Nothing logged yet. Start a practice to see your work here."
              action={
                <Link to="/practice/4qs" className="text-xs text-hsbc-grey underline underline-offset-2 hover:text-hsbc-black">
                  Start with a 4Qs decision log
                </Link>
              }
            />
          ) : (
            <div className="space-y-2">
              {filtered.map((item) => (
                <TimelineRow key={`${item.type}-${item.id}`} item={item} />
              ))}
            </div>
          )}
        </>
      )}

      {/* ── BOARD VIEW ───────────────────────────────────────────────── */}
      {view === 'board' && (
        <>
          {boardRecords.length === 0 ? (
            <EmptyState
              message="Nothing here yet. Log a decision, case, or priorities to see them on the board."
              action={
                <Link to="/practice/4qs" className="text-xs text-hsbc-grey underline underline-offset-2 hover:text-hsbc-black">
                  Start with a 4Qs decision log
                </Link>
              }
            />
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-2 md:grid md:grid-cols-3 md:overflow-visible">
              <BoardColumn title="This week" items={thisWeek} />
              <BoardColumn title="Follow up due" items={followUpDue} />
              <BoardColumn title="Closed" items={closed} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
