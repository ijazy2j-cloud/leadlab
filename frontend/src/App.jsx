import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { isLoggedIn } from './lib/auth';
import AppShell from './components/AppShell';
import GlossaryDrawer from './components/GlossaryDrawer';

import LoginPage from './pages/LoginPage';
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

function RequireAuth({ children }) {
  if (!isLoggedIn()) return <Navigate to="/login" replace />;
  return children;
}

function AuthenticatedLayout() {
  const [glossaryOpen, setGlossaryOpen] = useState(false);
  return (
    <>
      <AppShell onOpenGlossary={() => setGlossaryOpen(true)} />
      <GlossaryDrawer open={glossaryOpen} onClose={() => setGlossaryOpen(false)} />
    </>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <RequireAuth>
                <AuthenticatedLayout />
              </RequireAuth>
            }
          >
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
      </BrowserRouter>
    </QueryClientProvider>
  );
}
