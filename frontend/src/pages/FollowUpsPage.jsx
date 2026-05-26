import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format, isPast, isToday, isTomorrow } from 'date-fns';
import {
  useFollowUps,
  useUpdateFollowUp,
  useDeleteFollowUp,
  useCreateFollowUp,
} from '../lib/queries';
import { defaultFollowUpDate, toISO, inputClass, textareaClass } from '../lib/formUtils';
import EmptyState from '../components/EmptyState';

// ── Helpers ──────────────────────────────────────────────────────────────────

const SOURCE_LABELS = {
  DECISION: 'decision log',
  MEDICAL:  'medical case',
  BIG_FIVE: 'big five',
  COACHING: 'coaching',
  MANUAL:   'manual',
};

function getEditRoute(fu) {
  if (!fu.sourceId) return null;
  switch (fu.sourceType) {
    case 'DECISION': return `/practice/4qs/${fu.sourceId}`;
    case 'MEDICAL':  return `/practice/medical/${fu.sourceId}`;
    case 'BIG_FIVE': return `/practice/big-five/${fu.sourceId}`;
    default:         return null;
  }
}

function formatDue(dateStr) {
  const d = new Date(dateStr);
  if (isPast(d) && !isToday(d)) return { label: 'Overdue', overdue: true };
  if (isToday(d))    return { label: 'Today',    overdue: false };
  if (isTomorrow(d)) return { label: 'Tomorrow', overdue: false };
  return { label: format(d, 'd MMM'), overdue: false };
}

const TABS = [
  { value: 'OPEN',    label: 'Open'    },
  { value: 'OVERDUE', label: 'Overdue' },
  { value: 'DONE',    label: 'Done'    },
];

// ── FollowUpCard ─────────────────────────────────────────────────────────────
// Manages its own outcome-input state so the parent only tracks which id is expanded.

function FollowUpCard({ fu, isExpanded, onExpand, onConfirm, onCancel, onDelete }) {
  const { label, overdue } = formatDue(fu.dueDate);
  const editRoute = getEditRoute(fu);
  const sourceLabel = SOURCE_LABELS[fu.sourceType] ?? fu.sourceType.toLowerCase();

  // Own outcome state — resets when collapsed
  const [outcome, setOutcome] = useState('');
  useEffect(() => {
    if (!isExpanded) setOutcome('');
  }, [isExpanded]);

  return (
    <div className="bg-white border border-hsbc-border rounded-md p-4">
      {/* Main row */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-hsbc-black">{fu.commitment}</p>
          <p className="text-xs text-hsbc-grey mt-0.5">From {sourceLabel}</p>
          {fu.status === 'DONE' && fu.outcome && (
            <p className="text-xs text-hsbc-grey mt-1 italic">{fu.outcome}</p>
          )}
        </div>
        <div className="flex-shrink-0 flex flex-col items-end gap-1.5">
          <span className={`text-xs font-medium tabular-nums ${overdue ? 'text-hsbc-red' : 'text-hsbc-grey'}`}>
            {label}
          </span>
          <span className={`text-xs px-2 py-0.5 rounded-full border ${
            overdue && fu.status !== 'DONE'
              ? 'border-hsbc-red/40 text-hsbc-red'
              : 'border-hsbc-border text-hsbc-grey'
          }`}>
            {fu.status === 'DONE' ? 'Done' : overdue ? 'Overdue' : 'Open'}
          </span>
        </div>
      </div>

      {/* Action bar — open/overdue items only */}
      {fu.status !== 'DONE' && !isExpanded && (
        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-hsbc-border">
          <button
            onClick={() => onExpand(fu.id)}
            className="text-xs text-hsbc-grey hover:text-hsbc-black transition-colors"
          >
            Mark done
          </button>
          {editRoute && (
            <Link to={editRoute} className="text-xs text-hsbc-grey hover:text-hsbc-black transition-colors">
              Edit source
            </Link>
          )}
          <button
            onClick={() => onDelete(fu.id)}
            className="text-xs text-hsbc-grey hover:text-hsbc-black transition-colors ml-auto"
          >
            Delete
          </button>
        </div>
      )}

      {/* Inline Mark Done form — shown when expanded */}
      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-hsbc-border space-y-3">
          <div>
            <label htmlFor={`outcome-${fu.id}`} className="block text-xs text-hsbc-grey mb-1">
              Outcome <span className="opacity-60">(optional)</span>
            </label>
            <textarea
              id={`outcome-${fu.id}`}
              value={outcome}
              onChange={(e) => setOutcome(e.target.value)}
              rows={2}
              placeholder="What happened? What was the result?"
              className={textareaClass(false)}
              autoFocus
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => onConfirm(fu.id, outcome)}
              className="bg-hsbc-black text-white text-xs font-medium px-4 py-2 rounded hover:opacity-80 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hsbc-black"
            >
              Confirm done
            </button>
            <button
              onClick={() => onCancel()}
              className="text-xs text-hsbc-grey hover:text-hsbc-black transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Add Manual Follow Up form ─────────────────────────────────────────────────

function AddManualForm({ onClose }) {
  const createFU = useCreateFollowUp();
  const [form, setForm] = useState({
    commitment: '',
    dueDate: defaultFollowUpDate(),
    owner: 'me',
  });
  const [errors, setErrors] = useState({});

  function validate() {
    const errs = {};
    if (!form.commitment.trim())              errs.commitment = 'Enter a commitment.';
    else if (form.commitment.trim().length < 3) errs.commitment = 'Use at least 3 characters';
    if (!form.dueDate)                        errs.dueDate    = 'Pick a due date.';
    setErrors(errs);
    return !Object.keys(errs).length;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    await createFU.mutateAsync({
      commitment: form.commitment,
      dueDate: toISO(form.dueDate),
      owner: form.owner || 'me',
      sourceType: 'MANUAL',
    });
    onClose();
  }

  return (
    <div className="bg-white border border-hsbc-border rounded-md p-5 mb-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-hsbc-black">Add follow up</h3>
        <button onClick={onClose} className="text-hsbc-grey hover:text-hsbc-black" aria-label="Close">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-3">
        <div>
          <label htmlFor="manual-commitment" className="block text-xs text-hsbc-grey mb-1">
            Commitment<span className="text-hsbc-red ml-0.5">*</span>
          </label>
          <input
            id="manual-commitment"
            type="text"
            value={form.commitment}
            onChange={(e) => { setForm(f => ({ ...f, commitment: e.target.value })); setErrors(er => ({ ...er, commitment: undefined })); }}
            placeholder="What do you commit to doing?"
            className={inputClass(errors.commitment)}
            autoFocus
          />
          {errors.commitment && <p role="alert" className="text-xs text-hsbc-red mt-1">{errors.commitment}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="manual-due-date" className="block text-xs text-hsbc-grey mb-1">
              Due date<span className="text-hsbc-red ml-0.5">*</span>
            </label>
            <input
              id="manual-due-date"
              type="datetime-local"
              value={form.dueDate}
              onChange={(e) => setForm(f => ({ ...f, dueDate: e.target.value }))}
              className={inputClass(errors.dueDate)}
            />
            {errors.dueDate && <p role="alert" className="text-xs text-hsbc-red mt-1">{errors.dueDate}</p>}
          </div>
          <div>
            <label htmlFor="manual-owner" className="block text-xs text-hsbc-grey mb-1">Owner</label>
            <input
              id="manual-owner"
              type="text"
              value={form.owner}
              onChange={(e) => setForm(f => ({ ...f, owner: e.target.value }))}
              placeholder="me"
              className={inputClass(false)}
            />
          </div>
        </div>

        <div className="flex items-center gap-3 pt-1">
          <button
            type="submit"
            disabled={createFU.isPending}
            className="bg-hsbc-red text-white text-sm px-4 py-2 rounded font-medium hover:opacity-90 disabled:opacity-40 transition-opacity"
          >
            {createFU.isPending ? 'Saving…' : 'Save'}
          </button>
          <button type="button" onClick={onClose} className="text-sm text-hsbc-grey hover:text-hsbc-black transition-colors">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function FollowUpsPage() {
  const [activeTab,    setActiveTab]    = useState('OPEN');
  const [expandedId,   setExpandedId]   = useState(null); // which card's mark-done form is open
  const [addingManual, setAddingManual] = useState(false);

  const { data: followUps = [], isLoading } = useFollowUps(activeTab);
  const updateFU = useUpdateFollowUp();
  const deleteFU = useDeleteFollowUp();

  async function handleConfirm(id, outcome) {
    await updateFU.mutateAsync({ id, status: 'DONE', outcome });
    setExpandedId(null);
  }

  async function handleDelete(id) {
    await deleteFU.mutateAsync(id);
  }

  const TAB_EMPTY = {
    OPEN:    'No open follow ups.',
    OVERDUE: 'Nothing overdue. Well done.',
    DONE:    'No completed follow ups yet.',
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium text-hsbc-black">Follow ups</h1>
          <p className="mt-1 text-sm text-hsbc-grey">Track commitments and close the loop.</p>
        </div>
        <button
          onClick={() => setAddingManual(true)}
          className="flex-shrink-0 text-sm text-hsbc-grey border border-hsbc-border bg-white hover:border-hsbc-grey hover:text-hsbc-black rounded px-3 py-2 transition-colors"
        >
          + Add follow up
        </button>
      </div>

      {/* Add manual form */}
      {addingManual && (
        <AddManualForm onClose={() => setAddingManual(false)} />
      )}

      {/* Tabs */}
      <div className="flex border-b border-hsbc-border">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => { setActiveTab(tab.value); setExpandedId(null); }}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors focus-visible:outline-none ${
              activeTab === tab.value
                ? 'border-hsbc-black text-hsbc-black'
                : 'border-transparent text-hsbc-grey hover:text-hsbc-black'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-20 bg-hsbc-border rounded-md animate-pulse" />)}
        </div>
      ) : followUps.length === 0 ? (
        <EmptyState
          message={TAB_EMPTY[activeTab]}
          action={
            activeTab !== 'DONE' ? (
              <Link to="/practice/4qs" className="text-xs text-hsbc-grey underline underline-offset-2 hover:text-hsbc-black">
                Start with a 4Qs decision log
              </Link>
            ) : null
          }
        />
      ) : (
        <div className="space-y-3">
          {followUps.map((fu) => (
            <FollowUpCard
              key={fu.id}
              fu={fu}
              isExpanded={expandedId === fu.id}
              onExpand={(id)              => setExpandedId(id)}
              onConfirm={(id, outcome)    => handleConfirm(id, outcome)}
              onCancel={()                => setExpandedId(null)}
              onDelete={(id)              => handleDelete(id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
