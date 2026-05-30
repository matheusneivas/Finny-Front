import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import './AuthPage.css';

function maskCPF(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

function isValidCPF(cpf: string): boolean {
  const digits = cpf.replace(/\D/g, '');
  if (digits.length !== 11) return false;
  if (/^(\d)\1+$/.test(digits)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(digits[i]) * (10 - i);
  let v1 = 11 - (sum % 11);
  if (v1 >= 10) v1 = 0;
  if (v1 !== parseInt(digits[9])) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(digits[i]) * (11 - i);
  let v2 = 11 - (sum % 11);
  if (v2 >= 10) v2 = 0;
  return v2 === parseInt(digits[10]);
}

export function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [name, setName] = useState('');
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCpf(maskCPF(e.target.value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !cpf || !email || !password) { setError('Preencha todos os campos'); return; }
    if (!isValidCPF(cpf)) { setError('CPF inválido'); return; }
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/.test(password)) {
      setError('A senha deve ter pelo menos 6 caracteres, com maiúsculas, minúsculas e números');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/api/v1/auth/register', { fullName: name, cpf, email, password });
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
            <label htmlFor="cpf">CPF</label>
            <input
              id="cpf" type="text" value={cpf}
              onChange={handleCpfChange}
              placeholder="000.000.000-00" autoComplete="off"
              inputMode="numeric" disabled={loading}
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
