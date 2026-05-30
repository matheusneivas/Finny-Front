import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AppLayout } from './components/AppLayout';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { OnboardingSuccess } from './pages/OnboardingSuccess';
import { HomePage } from './pages/HomePage';
import { ProfilePage } from './pages/ProfilePage';
import { GoalsPage } from './pages/GoalsPage';
import { DashboardPage } from './pages/DashboardPage';

// / /login: se já autenticado e onboarding completo → /home
//           se autenticado mas onboarding incompleto → /onboarding
function GuestRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, onboardingCompleted } = useAuth();
  if (isAuthenticated) {
    return <Navigate to={onboardingCompleted ? '/home' : '/onboarding'} replace />;
  }
  return <>{children}</>;
}

// /home e demais rotas protegidas: exige token + onboarding completo
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, onboardingCompleted } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!onboardingCompleted) return <Navigate to="/onboarding" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Públicas — redireciona autenticados */}
      <Route path="/" element={<GuestRoute><LandingPage /></GuestRoute>} />
      <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />

      {/* Onboarding — público (criação de conta acontece dentro dele) */}
      <Route path="/onboarding" element={<OnboardingPage />} />
      <Route path="/onboarding/success" element={<OnboardingSuccess />} />

      {/* Protegidas — exige token + onboarding completo */}
      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route path="/home" element={<HomePage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/goals" element={<GoalsPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
