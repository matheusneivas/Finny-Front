import { useEffect, useState, type ReactNode } from 'react';
import './ConditionalField.css';

interface Props {
  show: boolean;
  children: ReactNode;
}

export function ConditionalField({ show, children }: Props) {
  const [shouldRender, setShouldRender] = useState(show);
  const [animClass, setAnimClass] = useState<'slide-in' | 'slide-out' | ''>('');

  useEffect(() => {
    if (show) {
      setShouldRender(true);
      requestAnimationFrame(() => setAnimClass('slide-in'));
    } else {
      setAnimClass('slide-out');
      const timer = setTimeout(() => {
        setShouldRender(false);
        setAnimClass('');
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [show]);

  if (!shouldRender) return null;

  return <div className={`conditional-field ${animClass}`}>{children}</div>;
}
