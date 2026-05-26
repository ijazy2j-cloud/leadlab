import { Link } from 'react-router-dom';

export default function PrincipleCard({ principle, isActive = false }) {
  return (
    <Link
      to={`/principles/${principle.id}`}
      className={`block bg-white border border-hsbc-border rounded-md p-5 hover:border-hsbc-grey transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hsbc-black ${
        isActive ? 'border-l-2 border-l-hsbc-red' : ''
      }`}
    >
      {/* Number badge */}
      <div className="flex items-start gap-3 mb-3">
        <span className="flex-shrink-0 w-6 h-6 rounded-full border border-hsbc-border flex items-center justify-center text-xs text-hsbc-grey font-medium leading-none">
          {principle.number}
        </span>
        <h3 className="text-sm font-medium text-hsbc-black leading-snug">
          {principle.name}
        </h3>
      </div>

      {/* Description */}
      <p className="text-sm text-hsbc-grey leading-relaxed line-clamp-2 mb-4">
        {principle.shortDescription}
      </p>

      {/* Footer link */}
      <div className="text-xs text-hsbc-grey hover:text-hsbc-black flex items-center gap-1">
        Open
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <path d="M2.5 6h7M6.5 3l3 3-3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </Link>
  );
}
