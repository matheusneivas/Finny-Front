import { useState } from 'react';
import { QuestionCard } from '../ui/QuestionCard';
import { RadioCard } from '../ui/RadioCard';
import { ToggleYesNo } from '../ui/ToggleYesNo';
import { MoneyInput } from '../ui/MoneyInput';
import { ConditionalField } from '../ui/ConditionalField';
import type { Step2Data, IncomeRange } from '../../types';
import './Step.css';

interface Props {
  initialData: Partial<Step2Data>;
  onSubmit: (data: Step2Data) => void;
  loading: boolean;
}

const INCOME_OPTIONS = [
  { value: 'UNDER_2K', label: 'Até R$ 2.000' },
  { value: 'RANGE_2K_5K', label: 'R$ 2.000 a R$ 5.000' },
  { value: 'RANGE_5K_10K', label: 'R$ 5.000 a R$ 10.000' },
  { value: 'RANGE_10K_20K', label: 'R$ 10.000 a R$ 20.000' },
  { value: 'OVER_20K', label: 'Acima de R$ 20.000' },
];

export function Step2({ initialData, onSubmit, loading }: Props) {
  const [incomeRange, setIncomeRange] = useState<IncomeRange | null>(
    (initialData.incomeRange as IncomeRange) ?? null
  );
  const [paysRent, setPaysRent] = useState<boolean | null>(initialData.paysRent ?? null);
  const [monthlyRent, setMonthlyRent] = useState<number | null>(initialData.monthlyRent ?? null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!incomeRange) errs.incomeRange = 'Selecione sua faixa de renda';
    if (paysRent === null) errs.paysRent = 'Responda se você paga aluguel';
    if (paysRent === true && !monthlyRent) errs.monthlyRent = 'Informe o valor do aluguel';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSubmit({
      incomeRange: incomeRange!,
      paysRent: paysRent!,
      monthlyRent: paysRent ? monthlyRent : null,
    });
  };

  return (
    <div className="step-content">
      <div className="step-title-block">
        <h1 className="step-title">Renda e moradia 💰</h1>
        <p className="step-subtitle">Etapa 2 de 5 • Situação financeira básica</p>
      </div>

      <QuestionCard
        question="Qual é a sua faixa de renda mensal?"
        icon="💵"
        error={errors.incomeRange}
      >
        <RadioCard
          options={INCOME_OPTIONS}
          value={incomeRange}
          onChange={(v) => {
            setIncomeRange(v as IncomeRange);
            if (errors.incomeRange) setErrors((e) => ({ ...e, incomeRange: '' }));
          }}
          columns={2}
          disabled={loading}
        />
      </QuestionCard>

      <QuestionCard
        question="Você paga aluguel?"
        icon="🏠"
        error={errors.paysRent}
      >
        <ToggleYesNo
          value={paysRent}
          onChange={(v) => {
            setPaysRent(v);
            if (!v) setMonthlyRent(null);
            if (errors.paysRent) setErrors((e) => ({ ...e, paysRent: '' }));
          }}
          disabled={loading}
        />

        <ConditionalField show={paysRent === true}>
          <div style={{ marginTop: 16 }}>
            <p className="conditional-label">💸 Quanto você paga de aluguel por mês?</p>
            <MoneyInput
              value={monthlyRent}
              onChange={(v) => {
                setMonthlyRent(v);
                if (errors.monthlyRent) setErrors((e) => ({ ...e, monthlyRent: '' }));
              }}
              error={errors.monthlyRent}
              disabled={loading}
            />
            {errors.monthlyRent && (
              <p className="field-error-text">⚠️ {errors.monthlyRent}</p>
            )}
          </div>
        </ConditionalField>
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
