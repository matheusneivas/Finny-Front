import { useEffect, useState } from 'react';
import './ErrorToast.css';

interface Props {
  message: string | null;
  onDismiss: () => void;
}

export function ErrorToast({ message, onDismiss }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(onDismiss, 200);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  if (!message) return null;

  return (
    <div className={`error-toast ${visible ? 'toast-in' : 'toast-out'}`}>
      <span>⚠️ {message}</span>
      <button
        className="toast-close"
        onClick={() => {
          setVisible(false);
          setTimeout(onDismiss, 200);
        }}
        aria-label="Fechar"
      >
        ✕
      </button>
    </div>
  );
}
