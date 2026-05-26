import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { useCreateBigFive, useUpdateBigFive, useBigFive } from '../lib/queries';
import { defaultFollowUpDate, toISO, inputClass } from '../lib/formUtils';
import FormField from '../components/FormField';
import Toast from '../components/Toast';

const EMPTY_PRIORITY = () => ({ text: '', owner: 'me', deadline: '' });

const emptyForm = () => ({
  topic: '',
  priorities: Array.from({ length: 5 }, EMPTY_PRIORITY),
  followUpDate: defaultFollowUpDate(),
});

function toDatetimeLocalStr(isoStr) {
  if (!isoStr) return defaultFollowUpDate();
  const d = new Date(isoStr);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// Single responsive row — no duplicate DOM for mobile/desktop.
// Mobile: inputs stack vertically. Desktop: flex row.
function PriorityRow({ index, priority, onChange }) {
  const num = index + 1;
  const base = 'border border-hsbc-border rounded px-3 py-2 text-sm bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hsbc-black';

  return (
    <div className="bg-white border border-hsbc-border rounded-md p-3 flex flex-col sm:flex-row sm:items-center gap-2">
      {/* Number badge */}
      <span className="hidden sm:flex flex-shrink-0 w-5 h-5 rounded-full border border-hsbc-border items-center justify-center text-xs text-hsbc-grey">
        {num}
      </span>

      {/* Text input — first on mobile with inline number */}
      <div className="flex items-center gap-2 sm:flex-[2_1_0%]">
        <span className="sm:hidden flex-shrink-0 w-5 h-5 rounded-full border border-hsbc-border flex items-center justify-center text-xs text-hsbc-grey">
          {num}
        </span>
        <input
          type="text"
          id={`priority-text-${index}`}
          value={priority.text}
          onChange={(e) => onChange('text', e.target.value)}
          placeholder={`Priority ${num}…`}
          className={`flex-1 ${base}`}
          aria-label={`Priority ${num} description`}
        />
      </div>

      {/* Owner */}
      <input
        type="text"
        value={priority.owner}
        onChange={(e) => onChange('owner', e.target.value)}
        placeholder="Owner"
        className={`w-full sm:w-28 ${base}`}
        aria-label={`Priority ${num} owner`}
      />

      {/* Deadline */}
      <input
        type="date"
        value={priority.deadline}
        onChange={(e) => onChange('deadline', e.target.value)}
        className={`w-full sm:w-36 ${base}`}
        aria-label={`Priority ${num} deadline`}
      />
    </div>
  );
}

export default function BigFiveFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const { data: existing, isLoading: loadingExisting } = useBigFive(id);
  const createBigFive = useCreateBigFive();
  const updateBigFive = useUpdateBigFive();

  const [form, setForm]     = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [toast, setToast]   = useState('');

  useEffect(() => {
    if (!existing) return;
    let parsedPriorities = [];
    try { parsedPriorities = JSON.parse(existing.priorities); } catch {}
    // Pad to 5 rows
    const rows = Array.from({ length: 5 }, (_, i) => parsedPriorities[i] || EMPTY_PRIORITY());
    setForm({
      topic: existing.topic,
      priorities: rows,
      followUpDate: toDatetimeLocalStr(existing.followUpDate),
    });
  }, [existing]);

  function setField(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  }

  function setPriority(index, key, value) {
    setForm((f) => ({
      ...f,
      priorities: f.priorities.map((p, i) => (i === index ? { ...p, [key]: value } : p)),
    }));
    if (key === 'text') setErrors((e) => ({ ...e, priorities: undefined }));
  }

  function validate() {
    const errs = {};
    if (!form.topic.trim())              errs.topic = 'Enter a topic or focus area for this week.';
    else if (form.topic.trim().length < 3) errs.topic = 'Use at least 3 characters';
    const filledPrios = form.priorities.filter((p) => p.text.trim());
    if (!filledPrios.length)             errs.priorities = 'Add at least one priority.';
    else if (filledPrios.some((p) => p.text.trim().length < 10))
      errs.priorities = 'Use at least 10 characters to make this useful';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    const filledPriorities = form.priorities
      .filter((p) => p.text.trim())
      .map((p) => ({
        text: p.text.trim(),
        owner: p.owner.trim() || 'me',
        deadline: p.deadline || null,
      }));

    const payload = {
      topic: form.topic,
      priorities: JSON.stringify(filledPriorities),
      followUpDate: toISO(form.followUpDate),
    };

    try {
      if (isEdit) {
        await updateBigFive.mutateAsync({ id, ...payload });
      } else {
        await createBigFive.mutateAsync(payload);
      }
      const dateLabel = form.followUpDate ? format(new Date(form.followUpDate), 'd MMM') : null;
      setToast(
        isEdit
          ? 'Priorities updated.'
          : `Priorities saved.${dateLabel ? ` Review set for ${dateLabel}.` : ''}`
      );
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch {
      // mutation.isError shows the error
    }
  }

  const mutation = isEdit ? updateBigFive : createBigFive;
  const isSubmitting = mutation.isPending;

  const canSubmit =
    form.topic.trim().length >= 3 &&
    form.priorities.some((p) => p.text.trim().length >= 10);

  if (isEdit && loadingExisting) {
    return <div className="max-w-2xl animate-pulse space-y-4"><div className="h-8 w-64 bg-hsbc-border rounded" /></div>;
  }
  const filledCount  = form.priorities.filter((p) => p.text.trim()).length;

  return (
    <>
      <Toast message={toast} onDismiss={() => setToast('')} />

      <form onSubmit={handleSubmit} noValidate className="max-w-2xl space-y-8">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-medium text-hsbc-black">Big Five priorities</h1>
          <p className="mt-1 text-sm text-hsbc-grey">
            Identify the five actions that will make the biggest difference this week.
          </p>
        </div>

        {/* Topic */}
        <FormField
          id="topic"
          label="Topic or focus"
          hint="e.g. 'Week of 26 May' or 'Q2 close sprint'"
          required
          error={errors.topic}
        >
          <input
            type="text"
            id="topic"
            value={form.topic}
            onChange={(e) => setField('topic', e.target.value)}
            placeholder="Label this set of priorities"
            className={inputClass(errors.topic)}
            aria-describedby={errors.topic ? 'topic-error' : undefined}
          />
        </FormField>

        {/* Priority rows */}
        <div>
          <div className="flex items-baseline justify-between mb-2">
            <label className="text-sm font-medium text-hsbc-black">
              Priorities
              <span className="text-hsbc-red ml-0.5" aria-hidden="true">*</span>
            </label>
            <span className="text-xs text-hsbc-grey">{filledCount} / 5 filled</span>
          </div>

          {/* Column headers — desktop only */}
          <div className="hidden sm:flex gap-2 mb-1 px-3 items-center">
            <span className="w-5 flex-shrink-0" />
            <span className="flex-[2_1_0%] text-xs text-hsbc-grey">Priority</span>
            <span className="w-28 text-xs text-hsbc-grey">Owner</span>
            <span className="w-36 text-xs text-hsbc-grey">Deadline</span>
          </div>

          <div className="space-y-2">
            {form.priorities.map((p, i) => (
              <PriorityRow
                key={i}
                index={i}
                priority={p}
                onChange={(key, val) => setPriority(i, key, val)}
              />
            ))}
          </div>

          {errors.priorities && (
            <p role="alert" className="text-xs text-hsbc-red mt-1">{errors.priorities}</p>
          )}
        </div>

        {/* Follow-up / review date */}
        <FormField
          id="followUpDate"
          label="Review date"
          hint="When will you review progress on these priorities?"
        >
          <input
            type="datetime-local"
            id="followUpDate"
            value={form.followUpDate}
            onChange={(e) => setField('followUpDate', e.target.value)}
            className={inputClass(false)}
          />
        </FormField>

        {/* API error */}
        {mutation.isError && (
          <p role="alert" className="text-sm text-hsbc-red">
            Something went wrong. Check your connection and try again.
          </p>
        )}

        {/* Actions */}
        <div className="flex items-center gap-4 pt-2">
          <button
            type="submit"
            disabled={isSubmitting || !canSubmit}
            className="bg-hsbc-red text-white px-6 py-2.5 rounded text-sm font-medium hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-hsbc-red"
          >
            {isSubmitting ? 'Saving…' : isEdit ? 'Update priorities' : 'Save priorities'}
          </button>
          <Link
            to="/dashboard"
            className="text-sm text-hsbc-grey hover:text-hsbc-black transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </>
  );
}
