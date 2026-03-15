import './WelcomeScreen.css';

interface Props {
  onStart: () => void;
}

export function WelcomeScreen({ onStart }: Props) {
  return (
    <div className="welcome-page">
      <div className="welcome-content">

        <div className="welcome-owl" aria-hidden="true">
          <svg width="96" height="96" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="32" cy="40" rx="18" ry="18" fill="#E3F2FD" stroke="#1E88E5" strokeWidth="2"/>
            <circle cx="32" cy="22" r="15" fill="#E3F2FD" stroke="#1E88E5" strokeWidth="2"/>
            <circle cx="25" cy="21" r="6" fill="white" stroke="#1E88E5" strokeWidth="1.5"/>
            <circle cx="39" cy="21" r="6" fill="white" stroke="#1E88E5" strokeWidth="1.5"/>
            <circle cx="25" cy="21" r="3" fill="#1E88E5"/>
            <circle cx="39" cy="21" r="3" fill="#1E88E5"/>
            <circle cx="26" cy="20" r="1" fill="white"/>
            <circle cx="40" cy="20" r="1" fill="white"/>
            <path d="M29 27L32 31L35 27Z" fill="#FB8C00"/>
            <path d="M18 11L23 19H13L18 11Z" fill="#1E88E5"/>
            <path d="M46 11L51 19H41L46 11Z" fill="#1E88E5"/>
            <path d="M14 44C14 44 9 40 13 35" stroke="#1E88E5" strokeWidth="2" strokeLinecap="round"/>
            <path d="M50 44C50 44 55 40 51 35" stroke="#1E88E5" strokeWidth="2" strokeLinecap="round"/>
            <path d="M25 48C25 48 28.5 51 32 51C35.5 51 39 48 39 48" stroke="#1E88E5" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>

        <div className="welcome-badge">Assistente Financeiro com IA</div>

        <h1 className="welcome-title">
          Bem-vindo ao <span className="welcome-brand">Finny</span>! 🎉
        </h1>

        <p className="welcome-description">
          Vamos montar o seu perfil financeiro personalizado.<br/>
          São apenas <strong>5 etapas rápidas</strong> para começar.
        </p>

        <div className="welcome-steps">
          <div className="welcome-step-item">
            <span className="welcome-step-icon">👤</span>
            <span>Informações básicas</span>
          </div>
          <div className="welcome-step-item">
            <span className="welcome-step-icon">💰</span>
            <span>Renda e moradia</span>
          </div>
          <div className="welcome-step-item">
            <span className="welcome-step-icon">📊</span>
            <span>Situação financeira</span>
          </div>
          <div className="welcome-step-item">
            <span className="welcome-step-icon">📈</span>
            <span>Investimentos</span>
          </div>
          <div className="welcome-step-item">
            <span className="welcome-step-icon">🎯</span>
            <span>Objetivos e preferências</span>
          </div>
        </div>

        <button className="welcome-btn" onClick={onStart}>
          Vamos começar! →
        </button>

        <p className="welcome-privacy">
          🔒 Suas informações são privadas e seguras
        </p>
      </div>
    </div>
  );
}
