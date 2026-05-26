import { usePrinciples, useDashboard } from '../lib/queries';
import PrincipleCard from '../components/PrincipleCard';

export default function PrincipleHubPage() {
  const { data: principles, isLoading, isError } = usePrinciples();
  const { data: dash } = useDashboard();

  const focusId = dash?.currentPrincipleFocus?.id ?? null;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-7 w-72 bg-hsbc-border rounded animate-pulse" />
          <div className="h-4 w-56 bg-hsbc-border rounded animate-pulse mt-2" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-40 bg-hsbc-border rounded-md animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <p className="text-sm text-hsbc-red mt-8">
        Could not load principles. Check the backend is running.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-medium text-hsbc-black">The six leadership principles</h1>
        <p className="mt-1 text-sm text-hsbc-grey">
          Pick one to focus on for one to two weeks.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {principles?.map((p) => (
          <PrincipleCard
            key={p.id}
            principle={p}
            isActive={p.id === focusId}
          />
        ))}
      </div>
    </div>
  );
}
