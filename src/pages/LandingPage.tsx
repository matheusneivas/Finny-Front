import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

export function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      <div className="landing-content">

        <div className="landing-owl" aria-hidden="true">
          <svg width="100" height="100" viewBox="0 0 64 64" fill="none">
            <ellipse cx="32" cy="40" rx="18" ry="18" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.6)" strokeWidth="2"/>
            <circle cx="32" cy="22" r="15" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.6)" strokeWidth="2"/>
            <circle cx="25" cy="21" r="6" fill="white" fillOpacity="0.9"/>
            <circle cx="39" cy="21" r="6" fill="white" fillOpacity="0.9"/>
            <circle cx="25" cy="21" r="3" fill="#1565C0"/>
            <circle cx="39" cy="21" r="3" fill="#1565C0"/>
            <circle cx="26" cy="20" r="1" fill="white"/>
            <circle cx="40" cy="20" r="1" fill="white"/>
            <path d="M29 27L32 31L35 27Z" fill="#FB8C00"/>
            <path d="M18 11L23 19H13L18 11Z" fill="rgba(255,255,255,0.7)"/>
            <path d="M46 11L51 19H41L46 11Z" fill="rgba(255,255,255,0.7)"/>
            <path d="M14 44C14 44 9 40 13 35" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeLinecap="round"/>
            <path d="M50 44C50 44 55 40 51 35" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeLinecap="round"/>
            <path d="M25 48C28 51 36 51 39 48" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>

        <h1 className="landing-brand">Finny</h1>
        <p className="landing-tagline">Seu assistente financeiro<br/>pessoal com IA</p>

        <div className="landing-features">
          <div className="landing-feature">📊 Controle seus gastos</div>
          <div className="landing-feature">💡 Dicas personalizadas</div>
          <div className="landing-feature">📈 Planeje seus investimentos</div>
        </div>

        <div className="landing-actions">
          <button className="landing-btn-primary" onClick={() => navigate('/onboarding')}>
            Criar conta grátis
          </button>
          <button className="landing-btn-secondary" onClick={() => navigate('/login')}>
            Já tenho uma conta
          </button>
        </div>
      </div>
    </div>
  );
}
