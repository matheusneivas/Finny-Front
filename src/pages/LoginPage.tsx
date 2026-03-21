import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { getOnboardingStatus } from '../services/onboarding';
import './AuthPage.css';

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError('Preencha todos os campos'); return; }
    setLoading(true);
    setError('');
    try {
      // 1. Login — API returns only tokens (no user object)
      const res = await api.post('/api/v1/auth/login', { email, password });
      const { accessToken, refreshToken } = res.data;
      const rawUser = res.data.user ?? {};
      const user = {
        id: rawUser.id ?? '',
        name: rawUser.name ?? rawUser.fullName ?? email.split('@')[0],
        email: rawUser.email ?? email,
        onboardingCompleted: false,
      };

      // 2. Save tokens so the next request can use them
      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('refresh_token', refreshToken);

      // 3. Check onboarding status
      const status = await getOnboardingStatus();
      const completed = status.completed;

      // 4. Finalise login with correct onboardingCompleted flag
      login(accessToken, refreshToken, { ...user, onboardingCompleted: completed });
      navigate(completed ? '/home' : '/onboarding', { replace: true });
    } catch (err: unknown) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      const e = err as { response?: { data?: { message?: string } } };
      setError(e?.response?.data?.message ?? 'E-mail ou senha inválidos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <span className="auth-logo-icon">🦉</span>
          <h1 className="auth-brand">Finny</h1>
          <p className="auth-tagline">Bem-vindo de volta!</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="auth-error">{error}</div>}

          <div className="auth-field">
            <label htmlFor="email">E-mail</label>
            <input
              id="email" type="email" value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com" autoComplete="email" disabled={loading}
            />
          </div>

          <div className="auth-field">
            <label htmlFor="password">Senha</label>
            <input
              id="password" type="password" value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" autoComplete="current-password" disabled={loading}
            />
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading && <span className="btn-spinner" />}
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="auth-footer">
          Não tem uma conta?{' '}
          <Link to="/register" className="auth-link">Criar conta grátis</Link>
        </p>
      </div>
    </div>
  );
}
