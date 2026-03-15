import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import './AuthPage.css';

export function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) { setError('Preencha todos os campos'); return; }
    if (password.length < 6) { setError('A senha deve ter pelo menos 6 caracteres'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/api/v1/auth/register', { name, email, password });
      const { accessToken, refreshToken, user } = res.data;
      login(accessToken, refreshToken, user);
      navigate('/onboarding', { replace: true });
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e?.response?.data?.message ?? 'Erro ao criar conta. Tente novamente.');
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
          <p className="auth-tagline">Crie sua conta grátis</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="auth-error">{error}</div>}

          <div className="auth-field">
            <label htmlFor="name">Nome completo</label>
            <input
              id="name" type="text" value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome" autoComplete="name" disabled={loading}
            />
          </div>

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
              placeholder="Mínimo 6 caracteres" autoComplete="new-password" disabled={loading}
            />
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading && <span className="btn-spinner" />}
            {loading ? 'Criando conta...' : 'Criar conta'}
          </button>
        </form>

        <p className="auth-footer">
          Já tem uma conta?{' '}
          <Link to="/login" className="auth-link">Entrar</Link>
        </p>
      </div>
    </div>
  );
}
