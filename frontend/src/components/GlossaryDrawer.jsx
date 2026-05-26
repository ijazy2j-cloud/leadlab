import { useState, useEffect, useRef } from 'react';
import glossary from '../lib/glossary';

export default function GlossaryDrawer({ open, onClose }) {
  const [search, setSearch] = useState('');
  const searchRef = useRef(null);

  // Escape closes, body scroll locked while open
  useEffect(() => {
    if (!open) return;
    searchRef.current?.focus();
    document.body.style.overflow = 'hidden';

    function handleKey(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  // Reset search when closed
  useEffect(() => {
    if (!open) setSearch('');
  }, [open]);

  const terms = Object.entries(glossary).filter(
    ([term, def]) =>
      term.toLowerCase().includes(search.toLowerCase()) ||
      def.toLowerCase().includes(search.toLowerCase())
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Glossary">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/20"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-white border-l border-hsbc-border flex flex-col">

        {/* Header */}
        <div className="px-5 py-4 border-b border-hsbc-border flex items-center justify-between flex-shrink-0">
          <h2 className="text-base font-medium text-hsbc-black">Glossary</h2>
          <button
            onClick={onClose}
            className="text-hsbc-grey hover:text-hsbc-black p-1 -mr-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hsbc-black rounded"
            aria-label="Close glossary"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Search */}
        <div className="px-5 py-3 border-b border-hsbc-border flex-shrink-0">
          <label htmlFor="glossary-search" className="sr-only">Search glossary terms</label>
          <input
            ref={searchRef}
            id="glossary-search"
            type="search"
            placeholder="Search terms…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-sm border border-hsbc-border rounded px-3 py-2 bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hsbc-black"
          />
        </div>

        {/* Terms */}
        <div className="flex-1 overflow-y-auto px-5 py-4" role="list" aria-label="Glossary terms">
          {terms.length === 0 ? (
            <p className="text-sm text-hsbc-grey">No terms match your search.</p>
          ) : (
            <div className="space-y-5">
              {terms.map(([term, definition]) => (
                <div key={term} role="listitem">
                  <div className="text-sm font-medium text-hsbc-black">{term}</div>
                  <div className="text-sm text-hsbc-grey mt-0.5 leading-relaxed">{definition}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer count */}
        <div className="px-5 py-3 border-t border-hsbc-border flex-shrink-0">
          <p className="text-xs text-hsbc-grey">
            {terms.length} {terms.length === 1 ? 'term' : 'terms'}
            {search ? ' matching' : ' in the How We Lead framework'}
          </p>
        </div>
      </div>
    </div>
  );
}
