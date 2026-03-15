
import './RadioCard.css';

interface Option {
  value: string;
  label: string;
  icon?: string;
}

interface Props {
  options: Option[];
  value: string | null;
  onChange: (val: string) => void;
  columns?: 1 | 2 | 3;
  disabled?: boolean;
}

export function RadioCard({ options, value, onChange, columns = 2, disabled }: Props) {
  return (
    <div
      className={`radio-grid radio-grid-cols-${columns}`}
      role="radiogroup"
    >
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          role="radio"
          aria-checked={value === opt.value}
          className={`radio-card ${value === opt.value ? 'radio-card-selected' : ''}`}
          onClick={() => !disabled && onChange(opt.value)}
          disabled={disabled}
        >
          {opt.icon && <span className="radio-card-icon">{opt.icon}</span>}
          <span className="radio-card-label">{opt.label}</span>
        </button>
      ))}
    </div>
  );
}
