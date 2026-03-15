
import './CheckboxList.css';

interface Props {
  options: string[];
  value: string[];
  onChange: (val: string[]) => void;
  disabled?: boolean;
}

export function CheckboxList({ options, value, onChange, disabled }: Props) {
  const toggle = (opt: string) => {
    if (disabled) return;
    if (value.includes(opt)) {
      onChange(value.filter((v) => v !== opt));
    } else {
      onChange([...value, opt]);
    }
  };

  return (
    <div className="checkbox-list" role="group">
      {options.map((opt) => {
        const checked = value.includes(opt);
        return (
          <button
            key={opt}
            type="button"
            role="checkbox"
            aria-checked={checked}
            className={`checkbox-item ${checked ? 'checkbox-checked' : ''}`}
            onClick={() => toggle(opt)}
            disabled={disabled}
          >
            <span className="checkbox-box" aria-hidden="true">
              {checked && (
                <svg width="14" height="10" viewBox="0 0 14 10" fill="none">
                  <path d="M1 5L5 9L13 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </span>
            <span className="checkbox-label">{opt}</span>
          </button>
        );
      })}
    </div>
  );
}
