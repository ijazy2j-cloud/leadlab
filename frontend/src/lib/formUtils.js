// Returns "YYYY-MM-DDTHH:MM" in local time, used for datetime-local inputs.
export function toDatetimeLocal(date) {
  const d = new Date(date);
  const pad = (n) => String(n).padStart(2, '0');
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
    `T${pad(d.getHours())}:${pad(d.getMinutes())}`
  );
}

// Default follow-up date: 48 hours from now, in datetime-local format.
export function defaultFollowUpDate() {
  return toDatetimeLocal(Date.now() + 48 * 60 * 60 * 1000);
}

// Converts a datetime-local string to a UTC ISO string for the API.
// Returns null if value is falsy.
export function toISO(datetimeLocal) {
  if (!datetimeLocal) return null;
  return new Date(datetimeLocal).toISOString();
}

// Tailwind class strings for consistent form inputs.
export const inputClass = (error) =>
  `w-full border rounded-md px-3 min-h-[40px] text-sm bg-white transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0 ${
    error
      ? 'border-hsbc-red focus-visible:ring-hsbc-red'
      : 'border-hsbc-border focus-visible:ring-hsbc-red hover:border-hsbc-grey'
  }`;

export const textareaClass = (error) =>
  `w-full border rounded-md px-3 py-2.5 text-sm bg-white resize-none transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0 ${
    error
      ? 'border-hsbc-red focus-visible:ring-hsbc-red'
      : 'border-hsbc-border focus-visible:ring-hsbc-red hover:border-hsbc-grey'
  }`;
