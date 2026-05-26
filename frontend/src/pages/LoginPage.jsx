import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUsers } from '../lib/queries';
import { setCurrentUserId } from '../lib/auth';
import Hexagon from '../components/Hexagon';

export default function LoginPage() {
  const navigate = useNavigate();
  const { data: users, isLoading, isError } = useUsers();
  const [selectedId, setSelectedId] = useState('');

  function handleSignIn(e) {
    e.preventDefault();
    if (!selectedId) return;
    setCurrentUserId(selectedId);
    navigate('/dashboard', { replace: true });
  }

  return (
    <div className="min-h-screen bg-hsbc-bg flex flex-col">

      {/* Brand bar */}
      <div className="h-1 bg-hsbc-red flex-shrink-0" aria-hidden="true" />

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="bg-white border border-hsbc-border rounded-lg w-full max-w-sm">

          {/* Card header */}
          <div className="flex flex-col items-center pt-10 pb-6 px-8 border-b border-hsbc-border">
            <Hexagon size={40} color="#DB0011" />
            <h1 className="mt-8 text-xl font-medium text-hsbc-black">
              Sign in to LeadLab
            </h1>
            <p className="mt-1.5 text-sm text-hsbc-grey text-center leading-relaxed">
              Choose your name to continue. HSBC SSO will replace this later.
            </p>
          </div>

          {/* Card body */}
          <div className="px-8 py-6">
            {isError && (
              <p className="mb-4 text-sm text-hsbc-red border border-hsbc-red/30 bg-hsbc-red/5 rounded px-3 py-2">
                Could not load users. Is the backend running?
              </p>
            )}

            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label
                  htmlFor="user-select"
                  className="block text-xs font-medium text-hsbc-grey mb-1.5"
                >
                  Your name
                </label>
                <select
                  id="user-select"
                  value={selectedId}
                  onChange={(e) => setSelectedId(e.target.value)}
                  className="w-full border border-hsbc-border rounded-md px-3 min-h-[40px] text-sm bg-white text-hsbc-black transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hsbc-red hover:border-hsbc-grey disabled:opacity-40 disabled:cursor-not-allowed"
                  disabled={isLoading || isError}
                  aria-busy={isLoading}
                >
                  {isLoading ? (
                    <option>Loading users…</option>
                  ) : (
                    <>
                      <option value="">— choose a name —</option>
                      {users?.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name} · {u.role}
                        </option>
                      ))}
                    </>
                  )}
                </select>
              </div>

              <button
                type="submit"
                disabled={!selectedId}
                className="w-full bg-hsbc-red text-white min-h-[40px] rounded-md text-sm font-medium hover:bg-[#c4000f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-hsbc-red disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-150 active:scale-[0.97] select-none"
              >
                Sign in
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
