import { useState } from 'react';
import { QuestionCard } from '../ui/QuestionCard';
import './Step.css';

export interface AccountData {
  email: string;
  password: string;
}

interface Props {
  userName: string;
  onSubmit: (data: AccountData) => void;
  loading: boolean;
}

export function StepAccount({ userName, onSubmit, loading }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!email) errs.email = 'Informe seu e-mail';
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'E-mail inválido';
    if (!password) errs.password = 'Informe uma senha';
    else if (password.length < 6) errs.password = 'A senha deve ter pelo menos 6 caracteres';
    if (password && confirm !== password) errs.confirm = 'As senhas não coincidem';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSubmit({ email, password });
  };

  const firstName = userName.split(' ')[0];

  return (
    <div className="step-content">
      <div className="step-title-block">
        <h1 className="step-title">Quase lá, {firstName}! 🎉</h1>
        <p className="step-subtitle">Crie seu acesso para salvar seu perfil</p>
      </div>

      <QuestionCard question="Qual é o seu e-mail?" icon="📧" error={errors.email}>
        <input
          type="email"
          className={`text-input ${errors.email ? 'input-error' : ''}`}
          value={email}
          onChange={(e) => { setEmail(e.target.value); if (errors.email) setErrors((p) => ({ ...p, email: '' })); }}
          placeholder="seu@email.com"
          autoComplete="email"
          inputMode="email"
          disabled={loading}
        />
      </QuestionCard>

      <QuestionCard question="Crie uma senha" icon="🔒" error={errors.password} helper="Mínimo de 6 caracteres">
        <input
          type="password"
          className={`text-input ${errors.password ? 'input-error' : ''}`}
          value={password}
          onChange={(e) => { setPassword(e.target.value); if (errors.password) setErrors((p) => ({ ...p, password: '' })); }}
          placeholder="••••••••"
          autoComplete="new-password"
          disabled={loading}
        />
      </QuestionCard>

      <QuestionCard question="Confirme a senha" icon="🔑" error={errors.confirm}>
        <input
          type="password"
          className={`text-input ${errors.confirm ? 'input-error' : ''}`}
          value={confirm}
          onChange={(e) => { setConfirm(e.target.value); if (errors.confirm) setErrors((p) => ({ ...p, confirm: '' })); }}
          placeholder="••••••••"
          autoComplete="new-password"
          disabled={loading}
        />
      </QuestionCard>

      <div className="step-footer step-footer-last">
        <button
          type="button"
          className={`continue-btn continue-btn-finish ${loading ? 'btn-loading' : ''}`}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <><span className="btn-spinner" aria-hidden="true" /> Criando sua conta...</>
          ) : (
            <>✨ Criar minha conta</>
          )}
        </button>
      </div>
    </div>
  );
}
