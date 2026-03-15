
import './ToggleYesNo.css';

interface Props {
  value: boolean | null;
  onChange: (val: boolean) => void;
  disabled?: boolean;
}

export function ToggleYesNo({ value, onChange, disabled }: Props) {
  return (
    <div className="toggle-container" role="group">
      <button
        type="button"
        className={`toggle-btn ${value === false ? 'toggle-active' : ''}`}
        onClick={() => !disabled && onChange(false)}
        aria-pressed={value === false}
        disabled={disabled}
      >
        Não
      </button>
      <button
        type="button"
        className={`toggle-btn ${value === true ? 'toggle-active' : ''}`}
        onClick={() => !disabled && onChange(true)}
        aria-pressed={value === true}
        disabled={disabled}
      >
        Sim
      </button>
    </div>
  );
}
