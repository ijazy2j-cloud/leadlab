import { format, isPast, isToday, isTomorrow, differenceInHours } from 'date-fns';

const SOURCE_LABELS = {
  DECISION: 'decision log',
  MEDICAL: 'medical case',
  BIG_FIVE: 'big five',
  COACHING: 'coaching',
  MANUAL: 'manual follow up',
};

function formatDueDate(dateStr) {
  const d = new Date(dateStr);
  if (isPast(d) && !isToday(d)) return { label: 'Overdue', overdue: true };
  if (isToday(d)) return { label: 'Today', overdue: false };
  if (isTomorrow(d)) return { label: 'Tomorrow', overdue: false };
  return { label: format(d, 'd MMM'), overdue: false };
}

// Shown on dashboard — compact single-line item
export function FollowUpRow({ followUp }) {
  const { label, overdue } = formatDueDate(followUp.dueDate);
  const sourceLabel = SOURCE_LABELS[followUp.sourceType] ?? followUp.sourceType.toLowerCase();

  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-hsbc-border last:border-0">
      <div className="min-w-0 flex-1">
        <p className="text-sm text-hsbc-black truncate">{followUp.commitment}</p>
        <span className="inline-block mt-1 text-[11px] text-hsbc-grey border border-hsbc-border rounded-full px-2 py-0.5 leading-none capitalize">{sourceLabel}</span>
      </div>
      <span
        className={`flex-shrink-0 text-xs font-medium tabular-nums ${
          overdue ? 'text-hsbc-red' : 'text-hsbc-grey'
        }`}
      >
        {label}
      </span>
    </div>
  );
}

// Shown on the follow-ups page — full card with action buttons
export default function FollowUpItem({ followUp, onMarkDone, onDelete }) {
  const { label, overdue } = formatDueDate(followUp.dueDate);
  const sourceLabel = SOURCE_LABELS[followUp.sourceType] ?? followUp.sourceType.toLowerCase();

  return (
    <div className="bg-white border border-hsbc-border rounded-md p-5 transition-colors duration-150">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-hsbc-black">{followUp.commitment}</p>
          <p className="text-xs text-hsbc-grey mt-1">{followUp.outcome || ''}</p>
          <span className="inline-block mt-1.5 text-[11px] text-hsbc-grey border border-hsbc-border rounded-full px-2 py-0.5 leading-none capitalize">{sourceLabel}</span>
        </div>
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <span
            className={`text-xs font-medium ${overdue ? 'text-hsbc-red' : 'text-hsbc-grey'}`}
          >
            {label}
          </span>
          <span
            className={`text-xs px-2 py-0.5 rounded-full border ${
              followUp.status === 'DONE'
                ? 'border-hsbc-border text-hsbc-grey'
                : overdue
                ? 'border-hsbc-red/40 text-hsbc-red'
                : 'border-hsbc-border text-hsbc-grey'
            }`}
          >
            {followUp.status === 'DONE'
              ? 'Done'
              : overdue
              ? 'Overdue'
              : 'Open'}
          </span>
        </div>
      </div>

      {followUp.status !== 'DONE' && (onMarkDone || onDelete) && (
        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-hsbc-border">
          {onMarkDone && (
            <button
              onClick={() => onMarkDone(followUp)}
              className="text-xs text-hsbc-grey hover:text-hsbc-black transition-colors duration-150"
            >
              Mark as done
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(followUp.id)}
              className="text-xs text-hsbc-grey hover:text-hsbc-black transition-colors duration-150 ml-auto"
            >
              Remove
            </button>
          )}
        </div>
      )}
    </div>
  );
}
