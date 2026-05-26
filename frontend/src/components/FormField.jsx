// Wraps a label, optional hint, the input slot, and an inline error message.
// Pass `id` to connect the label to the input via htmlFor.
export default function FormField({ id, label, hint, error, required = false, children }) {
  return (
    <div>
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-hsbc-black mb-1"
        >
          {label}
          {required && (
            <span className="text-hsbc-red ml-0.5" aria-hidden="true">*</span>
          )}
        </label>
      )}
      {hint && (
        <p className="text-xs text-hsbc-grey mb-1.5 leading-relaxed">{hint}</p>
      )}
      {children}
      {error && (
        <p id={id ? `${id}-error` : undefined} role="alert" className="text-xs text-hsbc-red mt-1">
          {error}
        </p>
      )}
    </div>
  );
}
