import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { useCreateDecision, useUpdateDecision, useDecision } from '../lib/queries';
import { defaultFollowUpDate, toISO, inputClass, textareaClass } from '../lib/formUtils';
import FormField from '../components/FormField';
import Toast from '../components/Toast';

const QUESTIONS = [
  { key: 'q1', text: 'Does it benefit our customers?' },
  { key: 'q2', text: 'Does it contribute to being simple and agile?' },
  { key: 'q3', text: 'Will it stand the test of time?' },
  { key: 'q4', text: 'Does it align with our values and risk appetite?' },
];

const OUTCOMES = [
  { value: 'PROCEED', label: 'Proceed' },
  { value: 'PAUSE',   label: 'Pause'   },
  { value: 'AMEND',   label: 'Amend'   },
  { value: 'STOP',    label: 'Stop'    },
];

function ToggleGroup({ options, value, onChange, error, name }) {
  return (
    <div>
      <div className="flex flex-wrap gap-2" role="group" aria-label={name}>
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            aria-pressed={value === opt.value}
            onClick={() => onChange(opt.value)}
            className={`px-4 min-h-[36px] rounded-md text-sm border transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hsbc-red select-none ${
              value === opt.value
                ? 'bg-hsbc-black text-white border-hsbc-black'
                : 'bg-white text-hsbc-grey border-hsbc-border hover:border-hsbc-grey hover:text-hsbc-black'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
      {error && <p role="alert" className="text-xs text-hsbc-red mt-1">{error}</p>}
    </div>
  );
}

const emptyForm = () => ({
  decision: '',
  q1Answer: '', q1Why: '',
  q2Answer: '', q2Why: '',
  q3Answer: '', q3Why: '',
  q4Answer: '', q4Why: '',
  outcome: '',
  followUpDate: defaultFollowUpDate(),
  followUpNote: '',
});

export default function FourQsFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const { data: existing, isLoading: loadingExisting } = useDecision(id);
  const createDecision = useCreateDecision();
  const updateDecision = useUpdateDecision();

  const [form, setForm]     = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [toast, setToast]   = useState('');

  // Pre-fill form in edit mode
  useEffect(() => {
    if (!existing) return;
    const { id: _id, userId: _uid, createdAt: _ca, updatedAt: _ua, ...rest } = existing;
    setForm({
      ...emptyForm(),
      ...rest,
      followUpDate: rest.followUpDate
        ? (() => {
            const d = new Date(rest.followUpDate);
            const pad = (n) => String(n).padStart(2, '0');
            return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
          })()
        : defaultFollowUpDate(),
    });
  }, [existing]);

  function set(field) {
    return (value) => {
      setForm((f) => ({ ...f, [field]: value }));
      setErrors((e) => ({ ...e, [field]: undefined }));
    };
  }

  function validate() {
    const errs = {};
    if (!form.decision.trim()) errs.decision = 'Enter the decision you are testing.';
    else if (form.decision.trim().length < 10) errs.decision = 'Use at least 10 characters to make this useful';
    if (!form.q1Answer) errs.q1Answer = 'Select an answer.';
    if (!form.q2Answer) errs.q2Answer = 'Select an answer.';
    if (!form.q3Answer) errs.q3Answer = 'Select an answer.';
    if (!form.q4Answer) errs.q4Answer = 'Select an answer.';
    if (!form.outcome)  errs.outcome  = 'Select an outcome.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  const mutation = isEdit ? updateDecision : createDecision;
  const isSubmitting = mutation.isPending;

  const canSubmit =
    form.decision.trim().length >= 10 &&
    form.q1Answer && form.q2Answer && form.q3Answer && form.q4Answer &&
    form.outcome;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      ...form,
      followUpDate: toISO(form.followUpDate),
    };

    try {
      if (isEdit) {
        await updateDecision.mutateAsync({ id, ...payload });
      } else {
        await createDecision.mutateAsync(payload);
      }
      const dateLabel = form.followUpDate
        ? format(new Date(form.followUpDate), 'd MMM')
        : null;
      setToast(
        isEdit
          ? 'Decision updated.'
          : `Decision logged.${dateLabel ? ` Follow up set for ${dateLabel}.` : ''}`
      );
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch {
      // mutation.isError shows the error near the save button
    }
  }

  if (isEdit && loadingExisting) {
    return <div className="max-w-2xl animate-pulse space-y-4"><div className="h-8 w-64 bg-hsbc-border rounded" /></div>;
  }

  return (
    <>
      <Toast message={toast} onDismiss={() => setToast('')} />

      <form onSubmit={handleSubmit} noValidate className="max-w-2xl space-y-8">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-medium text-hsbc-black">4Qs decision log</h1>
          <p className="mt-1 text-sm text-hsbc-grey">
            Test a live decision against the four guardrails.
          </p>
        </div>

        {/* Decision */}
        <FormField
          id="decision"
          label="What are you deciding?"
          required
          error={errors.decision}
        >
          <textarea
            id="decision"
            value={form.decision}
            onChange={(e) => set('decision')(e.target.value)}
            rows={3}
            placeholder="Describe the decision clearly and specifically."
            className={textareaClass(errors.decision)}
            aria-describedby={errors.decision ? 'decision-error' : undefined}
          />
        </FormField>

        {/* Four questions */}
        <div className="space-y-6">
          {QUESTIONS.map((q, i) => (
            <div
              key={q.key}
              className="bg-white border border-hsbc-border rounded-md p-6 space-y-4"
            >
              <p className="text-sm font-medium text-hsbc-black">
                Q{i + 1}. {q.text}
              </p>

              <ToggleGroup
                name={`Q${i + 1} answer`}
                options={[
                  { value: 'YES',    label: 'Yes'    },
                  { value: 'NO',     label: 'No'     },
                  { value: 'UNSURE', label: 'Unsure' },
                ]}
                value={form[`${q.key}Answer`]}
                onChange={set(`${q.key}Answer`)}
                error={errors[`${q.key}Answer`]}
              />

              <FormField
                id={`${q.key}Why`}
                label="Why"
                hint="Optional but encouraged."
              >
                <textarea
                  id={`${q.key}Why`}
                  value={form[`${q.key}Why`]}
                  onChange={(e) => set(`${q.key}Why`)(e.target.value)}
                  rows={2}
                  placeholder="Add your reasoning…"
                  className={textareaClass(false)}
                />
              </FormField>
            </div>
          ))}
        </div>

        {/* Outcome */}
        <FormField id="outcome" label="Outcome" required error={errors.outcome}>
          <ToggleGroup
            name="Outcome"
            options={OUTCOMES}
            value={form.outcome}
            onChange={set('outcome')}
            error={undefined}
          />
        </FormField>

        {/* Follow-up date */}
        <FormField
          id="followUpDate"
          label="Follow up date"
          hint="Defaults to 48 hours from now. Clear to skip the follow up."
        >
          <input
            type="datetime-local"
            id="followUpDate"
            value={form.followUpDate}
            onChange={(e) => set('followUpDate')(e.target.value)}
            className={inputClass(false)}
          />
        </FormField>

        {/* Follow-up note */}
        <FormField id="followUpNote" label="Follow up note">
          <textarea
            id="followUpNote"
            value={form.followUpNote}
            onChange={(e) => set('followUpNote')(e.target.value)}
            rows={2}
            placeholder="What do you want to check or confirm when you follow up?"
            className={textareaClass(false)}
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
            className="bg-hsbc-red text-white px-6 min-h-[40px] rounded-md text-sm font-medium hover:bg-[#c4000f] disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-150 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-hsbc-red select-none"
          >
            {isSubmitting ? 'Saving…' : isEdit ? 'Update decision' : 'Save decision'}
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
