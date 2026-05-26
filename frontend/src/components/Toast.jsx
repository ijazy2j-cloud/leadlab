import { useEffect } from 'react';

// Auto-dismisses after `duration` ms. Parent controls visibility via `message`.
export default function Toast({ message, onDismiss, duration = 2500 }) {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(onDismiss, duration);
    return () => clearTimeout(t);
  }, [message, onDismiss, duration]);

  if (!message) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-hsbc-black text-white text-sm px-5 py-3 rounded-md whitespace-nowrap toast-enter"
    >
      {message}
    </div>
  );
}
