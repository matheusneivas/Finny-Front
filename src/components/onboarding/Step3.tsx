import { useState } from 'react';
import { QuestionCard } from '../ui/QuestionCard';
import { ToggleYesNo } from '../ui/ToggleYesNo';
import { MoneyInput } from '../ui/MoneyInput';
import { CheckboxList } from '../ui/CheckboxList';
import { ConditionalField } from '../ui/ConditionalField';
import type { Step3Data } from '../../types';
import './Step.css';

interface Props {
  initialData: Partial<Step3Data>;
  onSubmit: (data: Step3Data) => void;
  loading: boolean;
}

const DEBT_TYPES = ['Cartão de crédito', 'Empréstimo pessoal', 'Financiamento', 'Cheque especial', 'Outros'];

export function Step3({ initialData, onSubmit, loading }: Props) {
  const [hasDebts, setHasDebts] = useState<boolean | null>(initialData.hasDebts ?? null);
  const [totalDebt, setTotalDebt] = useState<number | null>(initialData.totalDebt ?? null);
  const [debtTypes, setDebtTypes] = useState<string[]>(initialData.debtTypes ?? []);
  const [hasEmergencyFund, setHasEmergencyFund] = useState<boolean | null>(initialData.hasEmergencyFund ?? null);
  const [emergencyFundMonths, setEmergencyFundMonths] = useState<string>(
    initialData.emergencyFundMonths?.toString() ?? ''
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (hasDebts === null) errs.hasDebts = 'Responda se você possui dívidas';
    if (hasEmergencyFund === null) errs.hasEmergencyFund = 'Responda se você tem reserva de emergência';
    if (hasEmergencyFund === true) {
      const months = parseInt(emergencyFundMonths, 10);
      if (!emergencyFundMonths || isNaN(months) || months < 1) {
        errs.emergencyFundMonths = 'Informe a quantidade de meses';
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSubmit({
      hasDebts: hasDebts!,
      totalDebt: hasDebts ? totalDebt : null,
      debtTypes: hasDebts ? debtTypes : [],
      hasEmergencyFund: hasEmergencyFund!,
      emergencyFundMonths: hasEmergencyFund ? (parseInt(emergencyFundMonths, 10) || null) : null,
    });
  };

  return (
    <div className="step-content">
      <div className="step-title-block">
        <h1 className="step-title">Situação financeira 📊</h1>
        <p className="step-subtitle">Etapa 3 de 5 • Dívidas e reserva</p>
      </div>

      <QuestionCard question="Você possui dívidas?" icon="💳" error={errors.hasDebts}>
        <ToggleYesNo
          value={hasDebts}
          onChange={(v) => {
            setHasDebts(v);
            if (!v) { setTotalDebt(null); setDebtTypes([]); }
            if (errors.hasDebts) setErrors((e) => ({ ...e, hasDebts: '' }));
          }}
          disabled={loading}
        />

        <ConditionalField show={hasDebts === true}>
          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <p className="conditional-label">💰 Qual o valor total das suas dívidas?</p>
              <MoneyInput value={totalDebt} onChange={setTotalDebt} disabled={loading} />
            </div>
            <div>
              <p className="conditional-label">📝 Que tipo de dívidas? (opcional)</p>
              <CheckboxList
                options={DEBT_TYPES}
                value={debtTypes}
                onChange={setDebtTypes}
                disabled={loading}
              />
            </div>
          </div>
        </ConditionalField>
      </QuestionCard>

      <QuestionCard question="Você tem reserva de emergência?" icon="🛡️" error={errors.hasEmergencyFund}>
        <ToggleYesNo
          value={hasEmergencyFund}
          onChange={(v) => {
            setHasEmergencyFund(v);
            if (!v) setEmergencyFundMonths('');
            if (errors.hasEmergencyFund) setErrors((e) => ({ ...e, hasEmergencyFund: '' }));
          }}
          disabled={loading}
        />

        <ConditionalField show={hasEmergencyFund === true}>
          <div style={{ marginTop: 16 }}>
            <p className="conditional-label">📅 Para quantos meses?</p>
            <input
              type="number"
              className={`text-input ${errors.emergencyFundMonths ? 'input-error' : ''}`}
              value={emergencyFundMonths}
              onChange={(e) => {
                setEmergencyFundMonths(e.target.value);
                if (errors.emergencyFundMonths) setErrors((e2) => ({ ...e2, emergencyFundMonths: '' }));
              }}
              placeholder="Ex: 3"
              min={1}
              max={120}
              inputMode="numeric"
              disabled={loading}
            />
            {errors.emergencyFundMonths && (
              <p className="field-error-text">⚠️ {errors.emergencyFundMonths}</p>
            )}
            <p className="field-helper">ℹ️ Recomendado: 3 a 6 meses</p>
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
