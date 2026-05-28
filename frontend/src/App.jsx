import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { useCurrentUser } from './lib/queries';
import AppShell from './components/AppShell';
import GlossaryDrawer from './components/GlossaryDrawer';

import DashboardPage from './pages/DashboardPage';
import PrincipleHubPage from './pages/PrincipleHubPage';
import PrincipleDetailPage from './pages/PrincipleDetailPage';
import FourQsFormPage from './pages/FourQsFormPage';
import MedicalModelFormPage from './pages/MedicalModelFormPage';
import BigFiveFormPage from './pages/BigFiveFormPage';
import FollowUpsPage from './pages/FollowUpsPage';
import MyPracticePage from './pages/MyPracticePage';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

function AuthenticatedLayout() {
  const [glossaryOpen, setGlossaryOpen] = useState(false);
  return (
    <>
      <AppShell onOpenGlossary={() => setGlossaryOpen(true)} />
      <GlossaryDrawer open={glossaryOpen} onClose={() => setGlossaryOpen(false)} />
    </>
  );
}

function AppLoader() {
  const { isLoading } = useCurrentUser();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-hsbc-bg flex items-center justify-center">
        <span className="text-sm text-hsbc-grey">Loading…</span>
      </div>
    );
  }

  // 401 is handled by the axios interceptor in api.js — redirects to SSO logout.
  return (
    <Routes>
      <Route path="/" element={<AuthenticatedLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="principles" element={<PrincipleHubPage />} />
        <Route path="principles/:id" element={<PrincipleDetailPage />} />
        <Route path="practice/4qs" element={<FourQsFormPage />} />
        <Route path="practice/4qs/:id" element={<FourQsFormPage />} />
        <Route path="practice/medical" element={<MedicalModelFormPage />} />
        <Route path="practice/medical/:id" element={<MedicalModelFormPage />} />
        <Route path="practice/big-five" element={<BigFiveFormPage />} />
        <Route path="practice/big-five/:id" element={<BigFiveFormPage />} />
        <Route path="follow-ups" element={<FollowUpsPage />} />
        <Route path="my-practice" element={<MyPracticePage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppLoader />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
