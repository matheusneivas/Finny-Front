import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactConfetti from 'react-confetti';
import { useAuth } from '../contexts/AuthContext';
import './OnboardingSuccess.css';

export function OnboardingSuccess() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [confettiActive, setConfettiActive] = useState(true);

  useEffect(() => {
    const handleResize = () =>
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const stopConfetti = setTimeout(() => setConfettiActive(false), 4000);
    const redirect = setTimeout(() => navigate('/home', { replace: true }), 3000);
    return () => {
      clearTimeout(stopConfetti);
      clearTimeout(redirect);
    };
  }, []);

  const firstName = user?.name?.split(' ')[0] ?? 'você';

  return (
    <div className="success-page">
      {confettiActive && (
        <ReactConfetti
          width={windowSize.width}
          height={windowSize.height}
          numberOfPieces={150}
          colors={['#1E88E5', '#43A047', '#FFD700', '#FB8C00', '#FFFFFF']}
          recycle={false}
        />
      )}

      <div className="success-content">
        <div className="success-emoji">🎉</div>

        <div className="success-owl" aria-hidden="true">
          <svg width="80" height="80" viewBox="0 0 64 64" fill="none">
            <ellipse cx="32" cy="38" rx="18" ry="20" fill="rgba(255,255,255,0.2)" stroke="white" strokeWidth="2"/>
            <circle cx="32" cy="22" r="14" fill="rgba(255,255,255,0.2)" stroke="white" strokeWidth="2"/>
            <circle cx="26" cy="21" r="5" fill="white" fillOpacity="0.9"/>
            <circle cx="38" cy="21" r="5" fill="white" fillOpacity="0.9"/>
            <circle cx="26" cy="21" r="2.5" fill="#1565C0"/>
            <circle cx="38" cy="21" r="2.5" fill="#1565C0"/>
            <path d="M30 26L32 29L34 26Z" fill="#FB8C00"/>
            <path d="M20 12L24 18H16L20 12Z" fill="rgba(255,255,255,0.8)"/>
            <path d="M44 12L48 18H40L44 12Z" fill="rgba(255,255,255,0.8)"/>
            {/* Star */}
            <text x="46" y="12" fontSize="16" fill="#FFD700">⭐</text>
          </svg>
        </div>

        <h1 className="success-title">Tudo pronto, {firstName}!</h1>
        <p className="success-body">
          Seu perfil foi criado com sucesso.<br/>Vamos começar sua jornada financeira!
        </p>

        <div className="success-loader">
          <div className="success-spinner" />
          <span>Carregando...</span>
        </div>
      </div>
    </div>
  );
}
