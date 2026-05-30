import { useState } from 'react';
import { QuestionCard } from '../ui/QuestionCard';
import type { Step1Data } from '../../types';
import './Step.css';

export interface Step1DataExtended extends Step1Data {
  name: string;
}

interface Props {
  initialData: Partial<Step1DataExtended>;
  onSubmit: (data: Step1DataExtended) => void;
  loading: boolean;
}

function isAtLeast18(dateStr: string): boolean {
  const birth = new Date(dateStr);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age >= 18;
}

function maxBirthDate(): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 18);
  return d.toISOString().split('T')[0];
}

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

export function Step1({ initialData, onSubmit, loading }: Props) {
  const [name, setName] = useState(initialData.name ?? '');
  const [cpf, setCpf] = useState(initialData.cpf ?? '');
  const [birthDate, setBirthDate] = useState(initialData.birthDate ?? '');
  const [occupation, setOccupation] = useState(initialData.occupation ?? '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const clearError = (key: string) => setErrors((p) => ({ ...p, [key]: '' }));

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Informe seu nome';
    if (!cpf) errs.cpf = 'Informe seu CPF';
    else if (!isValidCPF(cpf)) errs.cpf = 'CPF inválido';
    if (!birthDate) errs.birthDate = 'Informe sua data de nascimento';
    else if (!isAtLeast18(birthDate)) errs.birthDate = 'Você deve ter pelo menos 18 anos';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSubmit({ name: name.trim(), cpf, birthDate, occupation: occupation || undefined });
  };

  return (
    <div className="step-content">
      <div className="step-title-block">
        <h1 className="step-title">Vamos começar! 👋</h1>
        <p className="step-subtitle">Etapa 1 de 5 • Informações básicas</p>
      </div>

      <QuestionCard question="Qual é o seu nome?" icon="🙂" error={errors.name}>
        <input
          type="text"
          className={`text-input ${errors.name ? 'input-error' : ''}`}
          value={name}
          onChange={(e) => { setName(e.target.value); clearError('name'); }}
          placeholder="Seu nome completo"
          autoComplete="name"
          disabled={loading}
        />
      </QuestionCard>

      <QuestionCard question="Qual é o seu CPF?" icon="🪪" error={errors.cpf}>
        <input
          type="text"
          className={`text-input ${errors.cpf ? 'input-error' : ''}`}
          value={cpf}
          onChange={(e) => { setCpf(maskCPF(e.target.value)); clearError('cpf'); }}
          placeholder="000.000.000-00"
          inputMode="numeric"
          autoComplete="off"
          disabled={loading}
        />
      </QuestionCard>

      <QuestionCard
        question="Qual é a sua data de nascimento?"
        icon="📅"
        error={errors.birthDate}
        helper="Você precisa ter 18+ anos"
      >
        <input
          type="date"
          className={`text-input ${errors.birthDate ? 'input-error' : ''}`}
          value={birthDate}
          max={maxBirthDate()}
          onChange={(e) => { setBirthDate(e.target.value); clearError('birthDate'); }}
          disabled={loading}
        />
      </QuestionCard>

      <QuestionCard
        question="Qual é a sua profissão?"
        icon="💼"
        helper="Opcional — ajuda o Finny a personalizar dicas"
      >
        <input
          type="text"
          className="text-input"
          value={occupation}
          onChange={(e) => setOccupation(e.target.value)}
          placeholder="Ex: Desenvolvedor, Professor..."
          disabled={loading}
          maxLength={100}
        />
      </QuestionCard>

      <div className="step-footer">
        <button
          type="button"
          className={`continue-btn ${loading ? 'btn-loading' : ''}`}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading && <span className="btn-spinner" aria-hidden="true" />}
          Continuar
        </button>
      </div>
    </div>
  );
}
