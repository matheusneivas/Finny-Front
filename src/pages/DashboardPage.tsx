import { useState, useEffect } from 'react';
import {
  getSpendingByCategory,
  getTransactions,
  getCategories,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  FREQUENCY_LABELS,
  type CategorySpending,
  type Transaction,
  type TransactionPayload,
  type Category,
  type Frequency,
} from '../services/transactions';
import { resolveIcon } from '../utils/iconMap';
import './DashboardPage.css';

const FREQUENCIES: Frequency[] = ['ONCE', 'DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY'];

// Determines whether a (possibly recurring) transaction should appear in the given month.
// Works whether the backend stores one record per series or one per occurrence.
function shouldShowInMonth(tx: Transaction, startDate: string, endDate: string): boolean {
  const mStart = new Date(startDate + 'T00:00:00');
  const mEnd   = new Date(endDate   + 'T23:59:59');
  const txDate = new Date((tx.transactionDate || tx.createdAt).split('T')[0] + 'T00:00:00');
  const freq   = tx.frequency ?? 'ONCE';
  const rc     = (tx as unknown as { repeatCount?: number }).repeatCount;

  // Transaction hasn't started yet
  if (txDate > mEnd) return false;

  // Non-recurring: only show in its own month
  if (freq === 'ONCE') {
    return txDate >= mStart;
  }

  // Recurring transaction that already started on or before this month-end.
  // If txDate falls within this month, it's a direct occurrence — always show.
  if (txDate >= mStart) return true;

  // txDate is BEFORE this month — only show if recurrence extends into this month.
  if (rc && rc > 0) {
    const last = new Date(txDate);
    switch (freq) {
      case 'DAILY':     last.setDate(last.getDate()       + (rc - 1));     break;
      case 'WEEKLY':    last.setDate(last.getDate()       + (rc - 1) * 7); break;
      case 'MONTHLY':   last.setMonth(last.getMonth()     + (rc - 1));     break;
      case 'QUARTERLY': last.setMonth(last.getMonth()     + (rc - 1) * 3); break;
      case 'YEARLY':    last.setFullYear(last.getFullYear() + (rc - 1));   break;
    }
    return last >= mStart;
  }

  // No repeatCount → infinite recurrence
  return true;
}

function formatBRL(value: number) {
  return (value ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function getMonthRange(date: Date) {
  const y = date.getFullYear();
  const m = date.getMonth();
  const fmt = (d: Date) => d.toISOString().split('T')[0];
  return {
    startDate: fmt(new Date(y, m, 1)),
    endDate: fmt(new Date(y, m + 1, 0)),
    label: date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
  };
}

// ─── Summary card ─────────────────────────────────────────────────────────────
function SummaryCard({ label, value, color, icon }: { label: string; value: number; color: string; icon: string }) {
  return (
    <div className="summary-card" style={{ borderTopColor: color }}>
      <span className="summary-icon">{icon}</span>
      <p className="summary-label">{label}</p>
      <p className="summary-value" style={{ color }}>{formatBRL(value)}</p>
    </div>
  );
}

// ─── Category bar ─────────────────────────────────────────────────────────────
function CategoryBar({ cat }: { cat: CategorySpending }) {
  return (
    <div className="category-bar-row">
      <div className="category-bar-header">
        <span className="category-bar-name">
          <span>{resolveIcon(cat.categoryIcon)}</span>{cat.categoryName}
        </span>
        <span className="category-bar-stats">
          <span className="category-bar-count">{cat.transactionCount}x</span>
          <span className="category-bar-total">{formatBRL(cat.total)}</span>
          <span className="category-bar-pct">{(cat.percentage ?? 0).toFixed(1)}%</span>
        </span>
      </div>
      <div className="category-bar-track">
        <div className="category-bar-fill" style={{ width: `${Math.min(cat.percentage ?? 0, 100)}%`, background: cat.categoryColor || '#1E88E5' }} />
      </div>
    </div>
  );
}

// ─── Spreadsheet table ────────────────────────────────────────────────────────
function SpreadsheetTable({ transactions, onEdit, onDelete }: {
  transactions: Transaction[];
  onEdit: (t: Transaction) => void;
  onDelete: (id: string) => void;
}) {
  if (transactions.length === 0) {
    return <p className="empty-msg">Nenhuma transação neste período.<br />Clique em <strong>+ Adicionar</strong> para começar.</p>;
  }

  return (
    <div className="sheet-wrapper">
      <table className="sheet-table">
        <thead>
          <tr>
            <th>Data</th>
            <th>Descrição</th>
            <th>Categoria</th>
            <th>Frequência</th>
            <th>Repete</th>
            <th>Vence dia</th>
            <th>Tipo</th>
            <th className="col-amount">Valor</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx) => {
            const isExpense = tx.type === 'EXPENSE';
            const date = new Date(tx.transactionDate || tx.createdAt)
              .toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' });
            return (
              <tr key={tx.id} className={`sheet-row sheet-row--${isExpense ? 'expense' : 'income'}`}>
                <td className="col-date">{date}</td>
                <td className="col-desc">
                  <span className="sheet-desc">{tx.description || '—'}</span>
                  {tx.notes && <span className="sheet-notes" title={tx.notes}>📝</span>}
                </td>
                <td className="col-cat">
                  {tx.category ? (
                    <span className="sheet-cat-badge" style={{ background: `${tx.category.color}22`, color: tx.category.color }}>
                      {resolveIcon(tx.category.icon)} {tx.category.name}
                    </span>
                  ) : <span className="sheet-empty">—</span>}
                </td>
                <td className="col-freq">
                  {tx.frequency && tx.frequency !== 'ONCE'
                    ? <span className="tag tag--blue">{FREQUENCY_LABELS[tx.frequency]}</span>
                    : <span className="sheet-empty">Única vez</span>}
                </td>
                <td className="col-repeat">
                  {(tx as unknown as { repeatCount?: number }).repeatCount
                    ? <span className="tag tag--purple">{(tx as unknown as { repeatCount?: number }).repeatCount}x</span>
                    : <span className="sheet-empty">—</span>}
                </td>
                <td className="col-due">
                  {tx.dueDayOfMonth
                    ? <span className="tag tag--orange">dia {tx.dueDayOfMonth}</span>
                    : <span className="sheet-empty">—</span>}
                </td>
                <td className="col-type">
                  <span className={`tag ${isExpense ? 'tag--red' : 'tag--green'}`}>
                    {isExpense ? 'Despesa' : 'Receita'}
                  </span>
                </td>
                <td className={`col-amount ${isExpense ? 'amount--expense' : 'amount--income'}`}>
                  {isExpense ? '-' : '+'}{formatBRL(Math.abs(tx.amount))}
                </td>
                <td className="col-actions">
                  <button className="sheet-action-btn" onClick={() => onEdit(tx)} title="Editar">✏️</button>
                  <button className="sheet-action-btn sheet-action-btn--danger" onClick={() => onDelete(tx.id)} title="Excluir">🗑️</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── Form Modal ───────────────────────────────────────────────────────────────
interface FormState {
  description: string;
  amount: string;
  type: 'EXPENSE' | 'INCOME';
  categoryId: string;
  transactionDate: string;
  frequency: Frequency;
  repeatCount: string;
  dueDayOfMonth: string;
  notes: string;
}

const today = new Date();
const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;

const EMPTY_FORM: FormState = {
  description: '',
  amount: '',
  type: 'EXPENSE',
  categoryId: '',
  transactionDate: todayStr,
  frequency: 'ONCE',
  repeatCount: '',
  dueDayOfMonth: '',
  notes: '',
};

function txToForm(tx: Transaction): FormState {
  const rc = (tx as unknown as { repeatCount?: number }).repeatCount;
  return {
    description: tx.description ?? '',
    amount: String(tx.amount),
    type: tx.type,
    categoryId: tx.category?.id ?? '',
    transactionDate: (tx.transactionDate ?? tx.createdAt ?? '').split('T')[0],
    frequency: tx.frequency ?? 'ONCE',
    repeatCount: rc ? String(rc) : '',
    dueDayOfMonth: tx.dueDayOfMonth ? String(tx.dueDayOfMonth) : '',
    notes: tx.notes ?? '',
  };
}

function TransactionModal({
  editing, categories, onSave, onClose, saving, error,
}: {
  editing: Transaction | null;
  categories: Category[];
  onSave: (payload: TransactionPayload) => void;
  onClose: () => void;
  saving: boolean;
  error: string;
}) {
  const [form, setForm] = useState<FormState>(editing ? txToForm(editing) : EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  const set = (key: keyof FormState) => (val: string) => {
    setForm(p => ({ ...p, [key]: val }));
    if (errors[key]) setErrors(p => ({ ...p, [key]: '' }));
  };

  const validate = () => {
    const e: Partial<Record<keyof FormState, string>> = {};
    if (!form.description.trim()) e.description = 'Informe uma descrição';
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0) e.amount = 'Informe um valor válido';
    if (!form.transactionDate) e.transactionDate = 'Informe a data';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    const parsed = form.repeatCount ? parseInt(form.repeatCount) : null;
    const payload: TransactionPayload = {
      description: form.description.trim(),
      amount: parseFloat(form.amount),
      type: form.type,
      categoryId: form.categoryId || null,
      transactionDate: form.transactionDate,
      frequency: form.frequency,
      repeatCount: parsed,
      dueDayOfMonth: form.dueDayOfMonth ? parseInt(form.dueDayOfMonth) : null,
      notes: form.notes.trim() || undefined,
    };
    onSave(payload);
  };

  const isRecurring = form.frequency !== 'ONCE';

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-sheet">
        <div className="modal-handle" />
        <div className="modal-header">
          <h2 className="modal-title">{editing ? 'Editar transação' : 'Nova transação'}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {error && <div className="modal-error">{error}</div>}

        <div className="modal-body">
          {/* Tipo */}
          <div className="form-field">
            <label className="form-label">Tipo</label>
            <div className="type-toggle">
              <button type="button" className={`type-btn type-btn--expense ${form.type === 'EXPENSE' ? 'active' : ''}`} onClick={() => set('type')('EXPENSE')}>📉 Despesa</button>
              <button type="button" className={`type-btn type-btn--income ${form.type === 'INCOME' ? 'active' : ''}`} onClick={() => set('type')('INCOME')}>📈 Receita</button>
            </div>
          </div>

          {/* Descrição */}
          <div className="form-field">
            <label className="form-label">Descrição *</label>
            <input className={`form-input ${errors.description ? 'form-input--error' : ''}`} value={form.description} onChange={e => set('description')(e.target.value)} placeholder="Ex: Aluguel, Supermercado..." />
            {errors.description && <span className="form-error">{errors.description}</span>}
          </div>

          {/* Valor + Data em linha */}
          <div className="form-row">
            <div className="form-field">
              <label className="form-label">Valor (R$) *</label>
              <input className={`form-input ${errors.amount ? 'form-input--error' : ''}`} type="number" min="0.01" step="0.01" value={form.amount} onChange={e => set('amount')(e.target.value)} placeholder="0,00" />
              {errors.amount && <span className="form-error">{errors.amount}</span>}
            </div>
            <div className="form-field">
              <label className="form-label">Data *</label>
              <input className={`form-input ${errors.transactionDate ? 'form-input--error' : ''}`} type="date" value={form.transactionDate} onChange={e => set('transactionDate')(e.target.value)} />
              {errors.transactionDate && <span className="form-error">{errors.transactionDate}</span>}
            </div>
          </div>

          {/* Categoria */}
          <div className="form-field">
            <label className="form-label">Categoria</label>
            <select className="form-input form-select" value={form.categoryId} onChange={e => set('categoryId')(e.target.value)}>
              <option value="">Sem categoria</option>
              {categories.map(c => <option key={c.id} value={c.id}>{resolveIcon(c.icon)} {c.name}</option>)}
            </select>
          </div>

          {/* Frequência */}
          <div className="form-field">
            <label className="form-label">Frequência</label>
            <select className="form-input form-select" value={form.frequency} onChange={e => set('frequency')(e.target.value)}>
              {FREQUENCIES.map(f => <option key={f} value={f}>{FREQUENCY_LABELS[f]}</option>)}
            </select>
          </div>

          {/* Repetições + Dia de vencimento (só para recorrentes) */}
          {isRecurring && (
            <div className="form-row">
              <div className="form-field">
                <label className="form-label">Repetições</label>
                <input
                  className="form-input"
                  type="number" min="1" max="999"
                  value={form.repeatCount}
                  onChange={e => set('repeatCount')(e.target.value)}
                  placeholder="Ex: 12 (para 1 ano)"
                />
                <span className="form-hint">Quantas vezes deve repetir</span>
              </div>
              {['MONTHLY', 'QUARTERLY', 'YEARLY'].includes(form.frequency) && (
                <div className="form-field">
                  <label className="form-label">Dia de vencimento</label>
                  <input className="form-input" type="number" min="1" max="31" value={form.dueDayOfMonth} onChange={e => set('dueDayOfMonth')(e.target.value)} placeholder="Ex: 5" />
                  <span className="form-hint">Dia do mês que vence</span>
                </div>
              )}
            </div>
          )}

          {/* Observação */}
          <div className="form-field">
            <label className="form-label">Observação</label>
            <textarea className="form-input form-textarea" value={form.notes} onChange={e => set('notes')(e.target.value)} placeholder="Opcional..." maxLength={200} rows={2} />
          </div>
        </div>

        <div className="modal-footer">
          <button className="modal-btn modal-btn--cancel" onClick={onClose} disabled={saving}>Cancelar</button>
          <button className="modal-btn modal-btn--save" onClick={handleSave} disabled={saving}>
            {saving && <span className="btn-spinner" />}
            {saving ? 'Salvando...' : editing ? 'Salvar' : 'Adicionar'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export function DashboardPage() {
  const [month, setMonth] = useState(new Date());
  const [minMonth, setMinMonth] = useState<Date | null>(null);
  const [spending, setSpending] = useState<CategorySpending[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const { startDate, endDate, label } = getMonthRange(month);

  // On mount: fetch all transactions to find the earliest date
  useEffect(() => {
    getTransactions(0, 200)
      .then(res => {
        const all: Transaction[] = res.content ?? (Array.isArray(res) ? res as unknown as Transaction[] : []);
        if (all.length === 0) return;
        const dates = all.map(t => new Date(t.transactionDate || t.createdAt)).filter(d => !isNaN(d.getTime()));
        if (dates.length === 0) return;
        const earliest = new Date(Math.min(...dates.map(d => d.getTime())));
        setMinMonth(new Date(earliest.getFullYear(), earliest.getMonth(), 1));
      })
      .catch(() => {});
    getCategories().then(setCategories).catch(() => {});
  }, []);

  const loadData = () => {
    setLoading(true);
    setPageError('');
    Promise.allSettled([
      getSpendingByCategory(startDate, endDate),
      getTransactions(0, 500),
    ])
      .then(([catResult, txResult]) => {
        if (catResult.status === 'fulfilled') {
          setSpending(catResult.value.categories ?? []);
        }
        if (txResult.status === 'fulfilled') {
          const d = txResult.value;
          const all: Transaction[] = d.content ?? (Array.isArray(d) ? d as unknown as Transaction[] : []);
          setTransactions(all.filter(tx => shouldShowInMonth(tx, startDate, endDate)));
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, [startDate, endDate]);

  const atMinMonth = minMonth !== null &&
    month.getFullYear() === minMonth.getFullYear() &&
    month.getMonth() === minMonth.getMonth();

  const prevMonth = () => { if (!atMinMonth) setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1)); };
  const nextMonth = () => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1));

  const openCreate = () => { setEditing(null); setFormError(''); setModalOpen(true); };
  const openEdit = (tx: Transaction) => { setEditing(tx); setFormError(''); setModalOpen(true); };
  const closeModal = () => { if (!saving) setModalOpen(false); };

  const handleSave = async (payload: TransactionPayload) => {
    setSaving(true);
    setFormError('');
    try {
      await (editing ? updateTransaction(editing.id, payload) : createTransaction(payload));
      // Update minMonth if this transaction is earlier
      const txDate = new Date(payload.transactionDate);
      const txMonth = new Date(txDate.getFullYear(), txDate.getMonth(), 1);
      if (!minMonth || txMonth < minMonth) setMinMonth(txMonth);
      setModalOpen(false);
      loadData();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setFormError(e?.response?.data?.message ?? 'Erro ao salvar. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir esta transação?')) return;
    try { await deleteTransaction(id); loadData(); }
    catch { setPageError('Erro ao excluir transação.'); }
  };

  const totalIncome  = transactions.filter(t => t.type === 'INCOME').reduce((s, t) => s + (t.amount ?? 0), 0);
  const totalExpense = transactions.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + (t.amount ?? 0), 0);
  const balance = totalIncome - totalExpense;

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div className="dashboard-header-title"><span>📊</span> Planilha</div>
        <button className="dashboard-add-btn" onClick={openCreate} title="Nova transação">+</button>
      </header>

      <div className="month-selector">
        <button className="month-btn" onClick={prevMonth} disabled={atMinMonth}>‹</button>
        <span className="month-label">{label}</span>
        <button className="month-btn" onClick={nextMonth}>›</button>
      </div>

      {loading ? (
        <div className="dashboard-loading"><div className="dashboard-spinner" /></div>
      ) : (
        <div className="dashboard-body">
          {pageError && <div className="dashboard-error">{pageError}</div>}

          <div className="summary-grid">
            <SummaryCard label="Receitas" value={totalIncome}  color="#43A047" icon="📈" />
            <SummaryCard label="Despesas" value={totalExpense} color="#E53935" icon="📉" />
            <SummaryCard label="Saldo"    value={balance}      color={balance >= 0 ? '#1E88E5' : '#E53935'} icon="💰" />
          </div>

          {spending.length > 0 && (
            <section className="dashboard-section">
              <div className="section-header">
                <h2 className="section-title">Gastos por categoria</h2>
                {totalExpense > 0 && <span className="section-total">Total: {formatBRL(totalExpense)}</span>}
              </div>
              <div className="category-list">
                {spending.map(c => <CategoryBar key={c.categoryId} cat={c} />)}
              </div>
            </section>
          )}

          <section className="dashboard-section dashboard-section--table">
            <div className="section-header">
              <h2 className="section-title">Lançamentos — {label}</h2>
              <button className="section-add-btn" onClick={openCreate}>+ Adicionar</button>
            </div>
            <SpreadsheetTable transactions={transactions} onEdit={openEdit} onDelete={handleDelete} />
          </section>
        </div>
      )}

      {modalOpen && (
        <TransactionModal
          editing={editing}
          categories={categories}
          onSave={handleSave}
          onClose={closeModal}
          saving={saving}
          error={formError}
        />
      )}
    </div>
  );
}
