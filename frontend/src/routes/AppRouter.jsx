import { Suspense, lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import { AppLayout } from '../layouts/AppLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { PublicOnlyRoute } from './PublicOnlyRoute';
import { Spinner } from '../components/Spinner';

const DashboardPage = lazy(() => import('../pages/DashboardPage'));
const AnalyticsPage = lazy(() => import('../pages/AnalyticsPage'));
const PlansPage = lazy(() => import('../pages/PlansPage'));
const TasksPage = lazy(() => import('../pages/TasksPage'));
const CheckInsPage = lazy(() => import('../pages/CheckInsPage'));
const RoadmapsPage = lazy(() => import('../pages/RoadmapsPage'));
const PlacementsPage = lazy(() => import('../pages/PlacementsPage'));
const CompaniesPage = lazy(() => import('../pages/CompaniesPage'));
const ResumesPage = lazy(() => import('../pages/ResumesPage'));
const SettingsPage = lazy(() => import('../pages/SettingsPage'));
const NotesPage = lazy(() => import('../pages/NotesPage'));
const LandingPage = lazy(() => import('../pages/LandingPage'));
const LoginPage = lazy(() => import('../pages/LoginPage'));
const RegisterPage = lazy(() => import('../pages/RegisterPage'));
const NotFoundPage = lazy(() => import('../pages/NotFoundPage'));

function PageFallback() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-slate-100">
      <Spinner label="Loading page" />
    </main>
  );
}

export function AppRouter() {
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        <Route element={<PublicOnlyRoute />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/learning" element={<RoadmapsPage />} />
            <Route path="/practice" element={<TasksPage />} />
            <Route path="/projects" element={<PlansPage />} />
            <Route path="/notes" element={<NotesPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/plans" element={<PlansPage />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/check-ins" element={<CheckInsPage />} />
            <Route path="/roadmaps" element={<RoadmapsPage />} />
            <Route path="/placements" element={<PlacementsPage />} />
            <Route path="/companies" element={<CompaniesPage />} />
            <Route path="/resumes" element={<ResumesPage />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}
