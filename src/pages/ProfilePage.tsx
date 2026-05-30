import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getProfile, updateProfile, type UserProfile } from '../services/profile';
import './ProfilePage.css';

const INCOME_OPTIONS = [
  { value: 'UNDER_2K', label: 'Até R$ 2.000' },
  { value: 'RANGE_2K_5K', label: 'R$ 2.000 a R$ 5.000' },
  { value: 'RANGE_5K_10K', label: 'R$ 5.000 a R$ 10.000' },
  { value: 'RANGE_10K_20K', label: 'R$ 10.000 a R$ 20.000' },
  { value: 'OVER_20K', label: 'Acima de R$ 20.000' },
];

const KNOWLEDGE_OPTIONS = [
  { value: 'BEGINNER', label: '🌱 Iniciante' },
  { value: 'INTERMEDIATE', label: '📚 Intermediário' },
  { value: 'ADVANCED', label: '🎓 Avançado' },
];

const REPORT_OPTIONS = [
  { value: 'DAILY', label: 'Diariamente' },
  { value: 'WEEKLY', label: 'Semanalmente' },
  { value: 'MONTHLY', label: 'Mensalmente' },
  { value: 'ON_DEMAND', label: 'Só quando eu pedir' },
];

const COMM_OPTIONS = [
  { value: 'FORMAL', label: '👔 Formal' },
  { value: 'FRIENDLY', label: '😊 Amigável' },
  { value: 'DIRECT', label: '⚡ Direto' },
];

const EXPENSE_OPTIONS = [
  { value: 'MANUAL', label: '📝 Manual' },
  { value: 'AUTOMATIC', label: '🤖 Automático' },
  { value: 'MIXED', label: '🔄 Misto' },
];

const DEBT_TYPES = ['Cartão de crédito', 'Empréstimo pessoal', 'Financiamento', 'Cheque especial', 'Outros'];
const INVEST_TYPES = ['Tesouro Direto', 'CDB', 'Ações', 'Fundos', 'Criptomoedas', 'Poupança', 'Outros'];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="profile-section">
      <h2 className="profile-section-title">{title}</h2>
      {children}
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="profile-field">
      <label className="profile-label">{label}</label>
      {children}
    </div>
  );
}

function SelectPill({
  options, value, onChange,
}: { options: { value: string; label: string }[]; value?: string; onChange: (v: string) => void }) {
  return (
    <div className="profile-pills">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          className={`profile-pill ${value === o.value ? 'profile-pill--active' : ''}`}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function MultiPill({
  options, values, onChange,
}: { options: string[]; values: string[]; onChange: (v: string[]) => void }) {
  const toggle = (item: string) =>
    onChange(values.includes(item) ? values.filter((v) => v !== item) : [...values, item]);
  return (
    <div className="profile-pills">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          className={`profile-pill ${values.includes(o) ? 'profile-pill--active' : ''}`}
          onClick={() => toggle(o)}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

function ToggleField({ value, onChange }: { value?: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="profile-toggle">
      <button
        type="button"
        className={`profile-toggle-btn ${value === false ? 'profile-toggle-btn--active' : ''}`}
        onClick={() => onChange(false)}
      >
        Não
      </button>
      <button
        type="button"
        className={`profile-toggle-btn ${value === true ? 'profile-toggle-btn--active' : ''}`}
        onClick={() => onChange(true)}
      >
        Sim
      </button>
    </div>
  );
}

export function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const firstName = user?.name?.split(' ')[0] ?? 'Usuário';

  useEffect(() => {
    getProfile()
      .then(setProfile)
      .catch(() => setError('Não foi possível carregar o perfil.'))
      .finally(() => setLoading(false));
  }, []);

  const set = (key: keyof UserProfile) => (value: unknown) =>
    setProfile((p) => ({ ...p, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess(false);
    try {
      const updated = await updateProfile(profile);
      setProfile(updated);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e?.response?.data?.message ?? 'Erro ao salvar. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="profile-page">
      {/* Header */}
      <header className="profile-header">
        <div className="profile-header-title">
          <span className="profile-header-owl">🦉</span>
          <span>Meu Perfil</span>
        </div>
      </header>

      {loading ? (
        <div className="profile-loading"><div className="profile-spinner" /></div>
      ) : (
        <div className="profile-body">
          {/* Avatar block */}
          <div className="profile-avatar-block">
            <div className="profile-avatar">{firstName[0].toUpperCase()}</div>
            <div>
              <p className="profile-name">{profile.fullName ?? user?.name ?? 'Usuário'}</p>
              <p className="profile-email">{profile.email ?? user?.email ?? ''}</p>
            </div>
          </div>

          {error && <div className="profile-error">{error}</div>}
          {success && <div className="profile-success">✅ Perfil salvo com sucesso!</div>}

          {/* ─── Dados Pessoais ─── */}
          <Section title="👤 Dados Pessoais">
            <Field label="Nome completo">
              <input
                className="profile-input"
                value={profile.fullName ?? ''}
                onChange={(e) => set('fullName')(e.target.value)}
                placeholder="Seu nome completo"
              />
            </Field>
            <Field label="CPF">
              <input
                className="profile-input"
                value={profile.cpf ?? ''}
                onChange={(e) => set('cpf')(e.target.value)}
                placeholder="000.000.000-00"
                inputMode="numeric"
                readOnly
              />
            </Field>
            <Field label="Profissão">
              <input
                className="profile-input"
                value={profile.occupation ?? ''}
                onChange={(e) => set('occupation')(e.target.value)}
                placeholder="Ex: Desenvolvedor, Professor..."
              />
            </Field>
            <Field label="Data de nascimento">
              <input
                className="profile-input"
                type="date"
                value={profile.birthDate ?? ''}
                onChange={(e) => set('birthDate')(e.target.value)}
              />
            </Field>
          </Section>

          {/* ─── Renda e Moradia ─── */}
          <Section title="💰 Renda e Moradia">
            <Field label="Faixa de renda mensal">
              <SelectPill options={INCOME_OPTIONS} value={profile.incomeRange} onChange={set('incomeRange')} />
            </Field>
            <Field label="Paga aluguel?">
              <ToggleField value={profile.paysRent} onChange={set('paysRent')} />
            </Field>
            {profile.paysRent && (
              <Field label="Valor do aluguel (R$)">
                <input
                  className="profile-input"
                  type="number"
                  min={0}
                  value={profile.monthlyRent ?? ''}
                  onChange={(e) => set('monthlyRent')(parseFloat(e.target.value) || 0)}
                  placeholder="0,00"
                />
              </Field>
            )}
          </Section>

          {/* ─── Situação Financeira ─── */}
          <Section title="📊 Situação Financeira">
            <Field label="Possui dívidas?">
              <ToggleField value={profile.hasDebts} onChange={set('hasDebts')} />
            </Field>
            {profile.hasDebts && (
              <>
                <Field label="Valor total das dívidas (R$)">
                  <input
                    className="profile-input"
                    type="number"
                    min={0}
                    value={profile.totalDebt ?? ''}
                    onChange={(e) => set('totalDebt')(parseFloat(e.target.value) || 0)}
                    placeholder="0,00"
                  />
                </Field>
                <Field label="Tipos de dívidas">
                  <MultiPill options={DEBT_TYPES} values={profile.debtTypes ?? []} onChange={set('debtTypes')} />
                </Field>
              </>
            )}
            <Field label="Tem reserva de emergência?">
              <ToggleField value={profile.hasEmergencyFund} onChange={set('hasEmergencyFund')} />
            </Field>
            {profile.hasEmergencyFund && (
              <Field label="Para quantos meses?">
                <input
                  className="profile-input"
                  type="number"
                  min={1}
                  value={profile.emergencyFundMonths ?? ''}
                  onChange={(e) => set('emergencyFundMonths')(parseInt(e.target.value) || 0)}
                  placeholder="Ex: 3"
                />
              </Field>
            )}
          </Section>

          {/* ─── Investimentos ─── */}
          <Section title="📈 Investimentos">
            <Field label="Já investe?">
              <ToggleField value={profile.hasInvestments} onChange={set('hasInvestments')} />
            </Field>
            {profile.hasInvestments && (
              <Field label="Em quê?">
                <MultiPill options={INVEST_TYPES} values={profile.investmentTypes ?? []} onChange={set('investmentTypes')} />
              </Field>
            )}
            <Field label="Meta de investimento mensal (R$)">
              <input
                className="profile-input"
                type="number"
                min={0}
                value={profile.monthlyInvestmentGoal ?? ''}
                onChange={(e) => set('monthlyInvestmentGoal')(parseFloat(e.target.value) || 0)}
                placeholder="0,00"
              />
            </Field>
          </Section>

          {/* ─── Preferências ─── */}
          <Section title="⚙️ Preferências">
            <Field label="Como prefere controlar gastos?">
              <SelectPill options={EXPENSE_OPTIONS} value={profile.expenseControlPreference} onChange={set('expenseControlPreference')} />
            </Field>
            <Field label="Nível de conhecimento financeiro">
              <SelectPill options={KNOWLEDGE_OPTIONS} value={profile.knowledgeLevel} onChange={set('knowledgeLevel')} />
            </Field>
            <Field label="Frequência de relatórios">
              <SelectPill options={REPORT_OPTIONS} value={profile.reportFrequency} onChange={set('reportFrequency')} />
            </Field>
            <Field label="Estilo de conversa com a IA">
              <SelectPill options={COMM_OPTIONS} value={profile.communicationStyle} onChange={set('communicationStyle')} />
            </Field>
          </Section>

          {/* Save button */}
          <div className="profile-save-area">
            <button
              type="button"
              className={`profile-save-btn ${saving ? 'profile-save-btn--loading' : ''}`}
              onClick={handleSave}
              disabled={saving}
            >
              {saving && <span className="btn-spinner" />}
              {saving ? 'Salvando...' : 'Salvar alterações'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
