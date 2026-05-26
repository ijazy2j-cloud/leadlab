export default function MetricCard({ label, value, red = false }) {
  return (
    <div className="bg-white border border-hsbc-border rounded-md p-5">
      <div className="text-xs text-hsbc-grey leading-none mb-2">{label}</div>
      <div
        className={`text-2xl font-medium leading-none tabular-nums ${
          red ? 'text-hsbc-red' : 'text-hsbc-black'
        }`}
      >
        {value ?? '—'}
      </div>
    </div>
  );
}
