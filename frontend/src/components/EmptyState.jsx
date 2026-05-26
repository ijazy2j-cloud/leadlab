import Hexagon from './Hexagon';

export default function EmptyState({ message, action }) {
  return (
    <div className="relative flex flex-col items-center justify-center py-16 text-center overflow-hidden">
      {/* Faint watermark hexagon */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none" aria-hidden="true">
        <Hexagon size={120} color="#E5E5E2" />
      </div>
      <div className="relative z-10">
        <p className="text-sm text-hsbc-grey">{message}</p>
        {action && <div className="mt-4">{action}</div>}
      </div>
    </div>
  );
}
