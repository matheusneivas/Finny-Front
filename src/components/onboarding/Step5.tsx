import { useState } from 'react';
import { QuestionCard } from '../ui/QuestionCard';
import { RadioCard } from '../ui/RadioCard';
import type { Step5Data, ExpenseControlPreference, KnowledgeLevel, ReportFrequency, CommunicationStyle } from '../../types';
import './Step.css';

interface Props {
  initialData: Partial<Step5Data>;
  onSubmit: (data: Step5Data) => void;
  loading: boolean;
}

const EXPENSE_CONTROL_OPTIONS = [
  { value: 'MANUAL', label: 'Manualmente, eu registro tudo', icon: '📝' },
  { value: 'AUTOMATIC', label: 'Automaticamente, prefiro que o app faça isso', icon: '🤖' },
  { value: 'MIXED', label: 'Misto, registro alguns e o app cuida do resto', icon: '🔄' },
];

const KNOWLEDGE_OPTIONS = [
  { value: 'BEGINNER', label: 'Iniciante — estou começando agora', icon: '🌱' },
  { value: 'INTERMEDIATE', label: 'Intermediário — entendo o básico', icon: '📚' },
  { value: 'ADVANCED', label: 'Avançado — já invisto e planejo minha vida financeira', icon: '🎓' },
];

const REPORT_OPTIONS = [
  { value: 'DAILY', label: 'Diariamente', icon: '☀️' },
  { value: 'WEEKLY', label: 'Semanalmente', icon: '📅' },
  { value: 'MONTHLY', label: 'Mensalmente', icon: '📆' },
  { value: 'ON_DEMAND', label: 'Somente quando eu pedir', icon: '🔔' },
];

const COMMUNICATION_OPTIONS = [
  { value: 'FORMAL', label: 'Formal e profissional', icon: '👔' },
  { value: 'FRIENDLY', label: 'Amigável e descontraído', icon: '😊' },
  { value: 'DIRECT', label: 'Direto ao ponto', icon: '⚡' },
];

export function Step5({ initialData, onSubmit, loading }: Props) {
  const [expenseControl, setExpenseControl] = useState<ExpenseControlPreference | null>(
    initialData.expenseControlPreference ?? null
  );
  const [knowledge, setKnowledge] = useState<KnowledgeLevel | null>(
    initialData.knowledgeLevel ?? null
  );
  const [reportFreq, setReportFreq] = useState<ReportFrequency | null>(
    initialData.reportFrequency ?? null
  );
  const [commStyle, setCommStyle] = useState<CommunicationStyle | null>(
    initialData.communicationStyle ?? null
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!expenseControl) errs.expenseControl = 'Selecione como prefere controlar seus gastos';
    if (!knowledge) errs.knowledge = 'Selecione seu nível de conhecimento';
    if (!reportFreq) errs.reportFreq = 'Selecione com que frequência quer receber relatórios';
    if (!commStyle) errs.commStyle = 'Selecione como prefere que a IA converse com você';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSubmit({
      expenseControlPreference: expenseControl!,
      knowledgeLevel: knowledge!,
      reportFrequency: reportFreq!,
      communicationStyle: commStyle!,
      shortTermGoals: [],
      longTermGoals: [],
      primaryGoal: null,
      primaryGoalTimeframe: null,
      mainExpenseCategories: [],
      notificationPreferences: [],
    });
  };

  return (
    <div className="step-content">
      <div className="step-title-block">
        <h1 className="step-title">Objetivos e preferências 🎯</h1>
        <p className="step-subtitle">Etapa 5 de 5 • Quase lá!</p>
      </div>

      <QuestionCard
        question="Como prefere controlar seus gastos?"
        icon="✍️"
        error={errors.expenseControl}
      >
        <RadioCard
          options={EXPENSE_CONTROL_OPTIONS}
          value={expenseControl}
          onChange={(v) => {
            setExpenseControl(v as ExpenseControlPreference);
            if (errors.expenseControl) setErrors((e) => ({ ...e, expenseControl: '' }));
          }}
          columns={1}
          disabled={loading}
        />
      </QuestionCard>

      <QuestionCard
        question="Qual seu nível de conhecimento financeiro?"
        icon="🧠"
        error={errors.knowledge}
      >
        <RadioCard
          options={KNOWLEDGE_OPTIONS}
          value={knowledge}
          onChange={(v) => {
            setKnowledge(v as KnowledgeLevel);
            if (errors.knowledge) setErrors((e) => ({ ...e, knowledge: '' }));
          }}
          columns={1}
          disabled={loading}
        />
      </QuestionCard>

      <QuestionCard
        question="Com que frequência quer receber relatórios?"
        icon="📅"
        error={errors.reportFreq}
      >
        <RadioCard
          options={REPORT_OPTIONS}
          value={reportFreq}
          onChange={(v) => {
            setReportFreq(v as ReportFrequency);
            if (errors.reportFreq) setErrors((e) => ({ ...e, reportFreq: '' }));
          }}
          columns={2}
          disabled={loading}
        />
      </QuestionCard>

      <QuestionCard
        question="Como prefere que a IA converse com você?"
        icon="💬"
        error={errors.commStyle}
      >
        <RadioCard
          options={COMMUNICATION_OPTIONS}
          value={commStyle}
          onChange={(v) => {
            setCommStyle(v as CommunicationStyle);
            if (errors.commStyle) setErrors((e) => ({ ...e, commStyle: '' }));
          }}
          columns={1}
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
            <>
              <span className="btn-spinner" aria-hidden="true" />
              Finalizando...
            </>
          ) : (
            <>✨ Finalizar e Começar!</>
          )}
        </button>
      </div>
    </div>
  );
}
