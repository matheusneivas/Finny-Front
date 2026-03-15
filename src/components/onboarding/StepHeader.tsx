
import './StepHeader.css';

interface Props {
  currentStep: number;
  totalSteps: number;
  onBack?: () => void;
  showBack: boolean;
}

export function StepHeader({ currentStep, totalSteps, onBack, showBack }: Props) {
  return (
    <header className="step-header">
      <div className="step-header-back">
        {showBack && (
          <button
            type="button"
            className="back-btn"
            onClick={onBack}
            aria-label="Voltar"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="#757575" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}
      </div>

      <div className="step-header-mascot" aria-hidden="true">
        <svg width="32" height="32" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Owl body */}
          <ellipse cx="32" cy="38" rx="18" ry="20" fill="#1E88E5" fillOpacity="0.12" stroke="#1E88E5" strokeWidth="2"/>
          {/* Owl head */}
          <circle cx="32" cy="22" r="14" fill="#1E88E5" fillOpacity="0.12" stroke="#1E88E5" strokeWidth="2"/>
          {/* Eyes */}
          <circle cx="26" cy="21" r="5" fill="white" stroke="#1E88E5" strokeWidth="1.5"/>
          <circle cx="38" cy="21" r="5" fill="white" stroke="#1E88E5" strokeWidth="1.5"/>
          <circle cx="26" cy="21" r="2.5" fill="#1E88E5"/>
          <circle cx="38" cy="21" r="2.5" fill="#1E88E5"/>
          {/* Beak */}
          <path d="M30 26L32 29L34 26Z" fill="#FB8C00"/>
          {/* Ears */}
          <path d="M20 12L24 18H16L20 12Z" fill="#1E88E5"/>
          <path d="M44 12L48 18H40L44 12Z" fill="#1E88E5"/>
          {/* Wings hint */}
          <path d="M14 42C14 42 10 38 14 34" stroke="#1E88E5" strokeWidth="2" strokeLinecap="round"/>
          <path d="M50 42C50 42 54 38 50 34" stroke="#1E88E5" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </div>

      <div className="step-header-counter">
        {currentStep} de {totalSteps}
      </div>
    </header>
  );
}
