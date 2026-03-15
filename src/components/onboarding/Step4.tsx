import { useState } from 'react';
import { QuestionCard } from '../ui/QuestionCard';
import { ToggleYesNo } from '../ui/ToggleYesNo';
import { CheckboxList } from '../ui/CheckboxList';
import { MoneyInput } from '../ui/MoneyInput';
import { ConditionalField } from '../ui/ConditionalField';
import type { Step4Data } from '../../types';
import './Step.css';

interface Props {
  initialData: Partial<Step4Data>;
  onSubmit: (data: Step4Data) => void;
  loading: boolean;
}

const INVESTMENT_TYPES = ['Tesouro Direto', 'CDB', 'Ações', 'Fundos', 'Criptomoedas', 'Poupança', 'Outros'];

export function Step4({ initialData, onSubmit, loading }: Props) {
  const [hasInvestments, setHasInvestments] = useState<boolean | null>(initialData.hasInvestments ?? null);
  const [investmentTypes, setInvestmentTypes] = useState<string[]>(initialData.investmentTypes ?? []);
  const [monthlyGoal, setMonthlyGoal] = useState<number | null>(initialData.monthlyInvestmentGoal ?? null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (hasInvestments === null) errs.hasInvestments = 'Responda se você já investe';
    if (!monthlyGoal || monthlyGoal <= 0) errs.monthlyGoal = 'Informe quanto quer investir por mês';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSubmit({
      hasInvestments: hasInvestments!,
      investmentTypes: hasInvestments ? investmentTypes : [],
      monthlyInvestmentGoal: monthlyGoal!,
    });
  };

  return (
    <div className="step-content">
      <div className="step-title-block">
        <h1 className="step-title">Investimentos 📈</h1>
        <p className="step-subtitle">Etapa 4 de 5 • Sua carteira e metas</p>
      </div>

      <QuestionCard question="Você já investe?" icon="💼" error={errors.hasInvestments}>
        <ToggleYesNo
          value={hasInvestments}
          onChange={(v) => {
            setHasInvestments(v);
            if (!v) setInvestmentTypes([]);
            if (errors.hasInvestments) setErrors((e) => ({ ...e, hasInvestments: '' }));
          }}
          disabled={loading}
        />

        <ConditionalField show={hasInvestments === true}>
          <div style={{ marginTop: 16 }}>
            <p className="conditional-label">📊 Em quê? (opcional)</p>
            <CheckboxList
              options={INVESTMENT_TYPES}
              value={investmentTypes}
              onChange={setInvestmentTypes}
              disabled={loading}
            />
          </div>
        </ConditionalField>
      </QuestionCard>

      <QuestionCard
        question="Quanto você quer investir por mês?"
        icon="🎯"
        error={errors.monthlyGoal}
        helper="Mesmo que não invista ainda, quanto gostaria de começar?"
      >
        <MoneyInput
          value={monthlyGoal}
          onChange={(v) => {
            setMonthlyGoal(v);
            if (errors.monthlyGoal) setErrors((e) => ({ ...e, monthlyGoal: '' }));
          }}
          error={errors.monthlyGoal}
          disabled={loading}
        />
        {errors.monthlyGoal && (
          <p className="field-error-text">⚠️ {errors.monthlyGoal}</p>
        )}
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
