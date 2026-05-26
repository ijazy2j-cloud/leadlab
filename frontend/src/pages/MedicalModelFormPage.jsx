import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { useCreateMedicalCase, useUpdateMedicalCase, useMedicalCase } from '../lib/queries';
import { defaultFollowUpDate, toISO, inputClass, textareaClass } from '../lib/formUtils';
import FormField from '../components/FormField';
import Toast from '../components/Toast';

const SECTIONS = [
  {
    key: 'symptoms',
    label: 'Symptoms',
    hint: 'What are you observing? What does the data show? Describe what you see, not what you think it means.',
    required: true,
    rows: 4,
    placeholder: 'Describe the observable facts and signals…',
  },
  {
    key: 'diagnosis',
    label: 'Diagnosis',
    hint: 'What is the root cause? What does the evidence point to? Avoid jumping to treatment before you have a diagnosis.',
    required: true,
    rows: 4,
    placeholder: 'State the underlying cause…',
  },
  {
    key: 'treatment',
    label: 'Treatment',
    hint: 'What specific actions will address the root cause? Be precise — who does what by when.',
    required: true,
    rows: 4,
    placeholder: 'List the concrete actions…',
  },
  {
    key: 'followUp',
    label: 'Follow up',
    hint: 'How will you know if the treatment is working? What are the success indicators and when will you check them?',
    required: false,
    rows: 3,
    placeholder: 'Describe how you will measure success…',
  },
];

const emptyForm = () => ({
  title: '',
  symptoms: '',
  diagnosis: '',
  treatment: '',
  followUp: '',
  followUpDate: defaultFollowUpDate(),
});

function toDatetimeLocalStr(isoStr) {
  if (!isoStr) return defaultFollowUpDate();
  const d = new Date(isoStr);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function MedicalModelFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const { data: existing, isLoading: loadingExisting } = useMedicalCase(id);
  const createMedicalCase = useCreateMedicalCase();
  const updateMedicalCase = useUpdateMedicalCase();

  const [form, setForm]     = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [toast, setToast]   = useState('');

  useEffect(() => {
    if (!existing) return;
    const { id: _id, userId: _uid, createdAt: _ca, updatedAt: _ua, ...rest } = existing;
    setForm({
      ...emptyForm(),
      ...rest,
      followUpDate: toDatetimeLocalStr(rest.followUpDate),
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
    if (!form.title.trim())          errs.title     = 'Enter a short title for this case.';
    else if (form.title.trim().length < 3) errs.title = 'Use at least 3 characters';
    if (!form.symptoms.trim())       errs.symptoms  = 'Describe what you are observing.';
    else if (form.symptoms.trim().length < 10) errs.symptoms = 'Use at least 10 characters to make this useful';
    if (!form.diagnosis.trim())      errs.diagnosis = 'State the root cause.';
    else if (form.diagnosis.trim().length < 10) errs.diagnosis = 'Use at least 10 characters to make this useful';
    if (!form.treatment.trim())      errs.treatment = 'Describe the actions you will take.';
    else if (form.treatment.trim().length < 10) errs.treatment = 'Use at least 10 characters to make this useful';
    if (form.followUp.trim() && form.followUp.trim().length < 10) errs.followUp = 'Use at least 10 characters to make this useful';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  const mutation = isEdit ? updateMedicalCase : createMedicalCase;
  const isSubmitting = mutation.isPending;

  const canSubmit =
    form.title.trim().length >= 3 &&
    form.symptoms.trim().length >= 10 &&
    form.diagnosis.trim().length >= 10 &&
    form.treatment.trim().length >= 10 &&
    (form.followUp.trim() === '' || form.followUp.trim().length >= 10);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    const payload = { ...form, followUpDate: toISO(form.followUpDate) };

    try {
      if (isEdit) {
        await updateMedicalCase.mutateAsync({ id, ...payload });
      } else {
        await createMedicalCase.mutateAsync(payload);
      }
      const dateLabel = form.followUpDate ? format(new Date(form.followUpDate), 'd MMM') : null;
      setToast(
        isEdit
          ? 'Case updated.'
          : `Case saved.${dateLabel ? ` Follow up set for ${dateLabel}.` : ''}`
      );
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch {
      // mutation.isError shows the error
    }
  }

  if (isEdit && loadingExisting) {
    return <div className="max-w-2xl animate-pulse space-y-4"><div className="h-8 w-64 bg-hsbc-border rounded" /></div>;
  }

  return (
    <>
      <Toast message={toast} onDismiss={() => setToast('')} />

      <form onSubmit={handleSubmit} noValidate className="max-w-2xl space-y-8">
        <div>
          <h1 className="text-2xl font-medium text-hsbc-black">Medical model mini case</h1>
          <p className="mt-1 text-sm text-hsbc-grey">
            Diagnose a team or customer challenge using a structured clinical approach.
          </p>
        </div>

        <FormField id="title" label="Case title" required error={errors.title}>
          <input
            type="text"
            id="title"
            value={form.title}
            onChange={(e) => set('title')(e.target.value)}
            placeholder="Short label, e.g. 'Q2 NPS drop, Singapore'"
            className={inputClass(errors.title)}
          />
        </FormField>

        {SECTIONS.map((s) => (
          <FormField key={s.key} id={s.key} label={s.label} hint={s.hint} required={s.required} error={errors[s.key]}>
            <textarea
              id={s.key}
              value={form[s.key]}
              onChange={(e) => set(s.key)(e.target.value)}
              rows={s.rows}
              placeholder={s.placeholder}
              className={textareaClass(errors[s.key])}
            />
          </FormField>
        ))}

        <FormField id="followUpDate" label="Follow up date" hint="When will you check whether the treatment is working?">
          <input
            type="datetime-local"
            id="followUpDate"
            value={form.followUpDate}
            onChange={(e) => set('followUpDate')(e.target.value)}
            className={inputClass(false)}
          />
        </FormField>

        {mutation.isError && (
          <p role="alert" className="text-sm text-hsbc-red">
            Something went wrong. Check your connection and try again.
          </p>
        )}

        <div className="flex items-center gap-4 pt-2">
          <button
            type="submit"
            disabled={isSubmitting || !canSubmit}
            className="bg-hsbc-red text-white px-6 py-2.5 rounded text-sm font-medium hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-hsbc-red"
          >
            {isSubmitting ? 'Saving…' : isEdit ? 'Update case' : 'Save case'}
          </button>
          <Link to="/dashboard" className="text-sm text-hsbc-grey hover:text-hsbc-black transition-colors">
            Cancel
          </Link>
        </div>
      </form>
    </>
  );
}
