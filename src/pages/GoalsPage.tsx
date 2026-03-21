import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getGoals, createGoal, updateGoal, contributeGoal, deleteGoal,
  type Goal, type CreateGoalPayload,
} from '../services/goals';
import './GoalsPage.css';

const SUGGESTIONS = [
  { name: 'Reserva de emergência', icon: '🛡️', amount: 10000 },
  { name: 'Viagem dos sonhos', icon: '✈️', amount: 5000 },
  { name: 'Quitar dívidas', icon: '💳', amount: 3000 },
  { name: 'Comprar um carro', icon: '🚗', amount: 30000 },
  { name: 'Investir na educação', icon: '🎓', amount: 8000 },
  { name: 'Dar entrada em imóvel', icon: '🏠', amount: 50000 },
];

function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
}

function ProgressBar({ percent }: { percent: number }) {
  const clamped = Math.min(percent, 100);
  return (
    <div className="goal-progress-track">
      <div
        className="goal-progress-fill"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}

interface GoalCardProps {
  goal: Goal;
  onEdit: (g: Goal) => void;
  onDelete: (id: string) => void;
  onUpdateProgress: (id: string, currentAmount: number) => Promise<void>;
}

function GoalCard({ goal, onEdit, onDelete, onUpdateProgress }: GoalCardProps) {
  const saved = goal.savedAmount ?? (goal as unknown as Record<string, number>).currentAmount ?? 0;
  const target = goal.targetAmount ?? 0;
  const percent = goal.progressPercentage ?? (target > 0 ? (saved / target) * 100 : 0);
  const completed = goal.status === 'COMPLETED' || percent >= 100;
  const [showProgress, setShowProgress] = useState(false);
  const [contributeValue, setContributeValue] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSaveProgress = async () => {
    const val = Number(contributeValue);
    if (isNaN(val) || val <= 0) return;
    setSaving(true);
    await onUpdateProgress(goal.id, val);
    setSaving(false);
    setShowProgress(false);
    setContributeValue('');
  };

  return (
    <div className={`goal-card ${completed ? 'goal-card--done' : ''}`}>
      <div className="goal-card-header">
        <div>
          <h3 className="goal-card-title">{goal.icon} {goal.name}</h3>
        </div>
        <div className="goal-card-actions">
          <button className="goal-action-btn" onClick={() => onEdit(goal)} title="Editar">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
          <button className="goal-action-btn goal-action-btn--danger" onClick={() => onDelete(goal.id)} title="Excluir">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" />
              <path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" />
            </svg>
          </button>
        </div>
      </div>

      <div className="goal-amounts">
        <span className="goal-current">{formatBRL(saved)}</span>
        <span className="goal-separator">de</span>
        <span className="goal-target">{formatBRL(target)}</span>
      </div>

      <ProgressBar percent={percent} />

      <div className="goal-card-footer">
        <span className={`goal-badge ${completed ? 'goal-badge--done' : 'goal-badge--progress'}`}>
          {completed ? '✅ Concluída' : `${Math.round(percent)}%`}
        </span>
        {goal.deadline && (
          <span className="goal-deadline">📅 {formatDate(goal.deadline)}</span>
        )}
      </div>

      {!completed && (
        showProgress ? (
          <div className="goal-progress-update">
            <span className="goal-progress-update-label">R$</span>
            <input
              type="number"
              min={0.01}
              step={0.01}
              className="goal-progress-input"
              value={contributeValue}
              onChange={e => setContributeValue(e.target.value)}
              placeholder="Quanto você guardou?"
              autoFocus
              disabled={saving}
            />
            <button className="goal-progress-save" onClick={handleSaveProgress} disabled={saving}>
              {saving ? '...' : '✓'}
            </button>
            <button className="goal-progress-cancel" onClick={() => setShowProgress(false)} disabled={saving}>✕</button>
          </div>
        ) : (
          <button className="goal-update-btn" onClick={() => setShowProgress(true)}>
            + Atualizar progresso
          </button>
        )
      )}
    </div>
  );
}

interface FormState {
  name: string;
  targetAmount: string;
  deadline: string;
  icon: string;
}

const EMPTY_FORM: FormState = {
  name: '', targetAmount: '', deadline: '', icon: '',
};

interface GoalFormProps {
  initial?: FormState;
  editingId?: string;
  onSave: (data: CreateGoalPayload, id?: string) => Promise<void>;
  onCancel: () => void;
  saving: boolean;
}

function GoalForm({ initial = EMPTY_FORM, editingId, onSave, onCancel, saving }: GoalFormProps) {
  const [form, setForm] = useState<FormState>(initial);
  const [errors, setErrors] = useState<Partial<FormState>>({});

  const set = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(p => ({ ...p, [key]: e.target.value }));
    setErrors(p => ({ ...p, [key]: '' }));
  };

  const handleSuggestion = (s: typeof SUGGESTIONS[0]) => {
    setForm({ name: s.name, targetAmount: String(s.amount), deadline: '', icon: s.icon });
    setErrors({});
  };

  const validate = () => {
    const errs: Partial<FormState> = {};
    if (!form.name.trim()) errs.name = 'Informe o nome da meta';
    if (!form.targetAmount || isNaN(Number(form.targetAmount)) || Number(form.targetAmount) <= 0)
      errs.targetAmount = 'Informe um valor válido';
    if (!form.deadline) errs.deadline = 'Informe o prazo da meta';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    await onSave({
      name: form.name.trim(),
      targetAmount: Number(form.targetAmount),
      deadline: form.deadline,
      icon: form.icon || undefined,
      relatedCategoryId: null,
    }, editingId);
  };

  return (
    <div className="goal-form-overlay" onClick={onCancel}>
      <div className="goal-form-modal" onClick={e => e.stopPropagation()}>
        <div className="goal-form-header">
          <h2>{editingId ? 'Editar meta' : 'Nova meta'}</h2>
          <button className="goal-form-close" onClick={onCancel}>✕</button>
        </div>

        {!editingId && (
          <div className="goal-suggestions-section">
            <p className="goal-suggestions-label">Sugestões de metas</p>
            <div className="goal-suggestions-grid">
              {SUGGESTIONS.map(s => (
                <button key={s.name} className="goal-suggestion-chip" onClick={() => handleSuggestion(s)}>
                  <span>{s.icon}</span>
                  <span>{s.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="goal-form-fields">
          <div className="goal-form-field">
            <label>Nome da meta *</label>
            <input
              type="text"
              value={form.name}
              onChange={set('name')}
              placeholder="Ex: Reserva de emergência"
              className={errors.name ? 'input-error' : ''}
              maxLength={50}
              disabled={saving}
            />
            {errors.name && <span className="field-error">{errors.name}</span>}
          </div>

          <div className="goal-form-row">
            <div className="goal-form-field">
              <label>Valor alvo (R$) *</label>
              <input
                type="number"
                min={0}
                value={form.targetAmount}
                onChange={set('targetAmount')}
                placeholder="0,00"
                className={errors.targetAmount ? 'input-error' : ''}
                disabled={saving}
              />
              {errors.targetAmount && <span className="field-error">{errors.targetAmount}</span>}
            </div>
            <div className="goal-form-field">
              <label>Prazo *</label>
              <input
                type="date"
                value={form.deadline}
                onChange={set('deadline')}
                min={new Date().toISOString().split('T')[0]}
                className={errors.deadline ? 'input-error' : ''}
                disabled={saving}
              />
              {errors.deadline && <span className="field-error">{errors.deadline}</span>}
            </div>
          </div>
        </div>

        <div className="goal-form-footer">
          <button className="goal-btn-cancel" onClick={onCancel} disabled={saving}>Cancelar</button>
          <button className="goal-btn-save" onClick={handleSubmit} disabled={saving}>
            {saving && <span className="btn-spinner" />}
            {saving ? 'Salvando...' : editingId ? 'Salvar alterações' : 'Criar meta'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function GoalsPage() {
  const navigate = useNavigate();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getGoals()
      .then(setGoals)
      .catch(() => setError('Não foi possível carregar as metas.'))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (data: CreateGoalPayload, id?: string) => {
    setSaving(true);
    setError('');
    try {
      if (id) {
        const updated = await updateGoal(id, data);
        setGoals(prev => prev.map(g => g.id === id ? updated : g));
      } else {
        const created = await createGoal(data);
        setGoals(prev => [created, ...prev]);
      }
      setShowForm(false);
      setEditingGoal(null);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e?.response?.data?.message ?? 'Erro ao salvar meta. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir esta meta?')) return;
    try {
      await deleteGoal(id);
      setGoals(prev => prev.filter(g => g.id !== id));
    } catch {
      setError('Erro ao excluir meta.');
    }
  };

  const handleEdit = (goal: Goal) => {
    setEditingGoal(goal);
    setShowForm(true);
  };

  const handleUpdateProgress = async (id: string, amount: number) => {
    try {
      const updated = await contributeGoal(id, amount);
      setGoals(prev => prev.map(g => {
        if (g.id !== id) return g;
        // Merge response over existing goal to avoid missing fields crashing the card
        return { ...g, ...updated };
      }));
    } catch {
      setError('Erro ao atualizar progresso.');
    }
  };

  const totalTarget = goals.reduce((s, g) => s + g.targetAmount, 0);
  const totalCurrent = goals.reduce((s, g) => s + (g.savedAmount ?? 0), 0);
  const completed = goals.filter(g => g.status === 'COMPLETED' || (g.savedAmount ?? 0) >= g.targetAmount).length;

  const editingInitial: FormState | undefined = editingGoal ? {
    name: editingGoal.name,
    targetAmount: String(editingGoal.targetAmount),
    deadline: editingGoal.deadline?.split('T')[0] ?? '',
    icon: editingGoal.icon ?? '',
  } : undefined;

  return (
    <div className="goals-page">
      <header className="goals-header">
        <button className="goals-back-btn" onClick={() => navigate('/home')} aria-label="Voltar">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <div className="goals-header-title">
          <span>🎯</span>
          <span>Minhas Metas</span>
        </div>
        <button className="goals-add-btn" onClick={() => { setEditingGoal(null); setShowForm(true); }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      </header>

      <div className="goals-body">
        {error && <div className="goals-error">{error}</div>}

        {/* Summary cards */}
        {goals.length > 0 && (
          <div className="goals-summary">
            <div className="summary-card">
              <span className="summary-label">Total guardado</span>
              <span className="summary-value summary-value--blue">{formatBRL(totalCurrent)}</span>
            </div>
            <div className="summary-card">
              <span className="summary-label">Meta total</span>
              <span className="summary-value">{formatBRL(totalTarget)}</span>
            </div>
            <div className="summary-card">
              <span className="summary-label">Concluídas</span>
              <span className="summary-value summary-value--green">{completed}/{goals.length}</span>
            </div>
          </div>
        )}

        {loading ? (
          <div className="goals-loading"><div className="goals-spinner" /></div>
        ) : goals.length === 0 ? (
          <div className="goals-empty">
            <span className="goals-empty-icon">🎯</span>
            <h2>Nenhuma meta ainda</h2>
            <p>Crie sua primeira meta financeira e acompanhe seu progresso.</p>
            <button className="goals-empty-btn" onClick={() => setShowForm(true)}>
              Criar primeira meta
            </button>
          </div>
        ) : (
          <div className="goals-list">
            {goals.map(g => (
              <GoalCard key={g.id} goal={g} onEdit={handleEdit} onDelete={handleDelete} onUpdateProgress={handleUpdateProgress} />
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <GoalForm
          initial={editingInitial}
          editingId={editingGoal?.id}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditingGoal(null); }}
          saving={saving}
        />
      )}
    </div>
  );
}
