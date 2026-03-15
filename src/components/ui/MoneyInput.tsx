import React, { useState } from 'react';
import './MoneyInput.css';

interface Props {
  value: number | null | undefined;
  onChange: (val: number | null) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  id?: string;
}

function formatMoney(val: string): string {
  const digits = val.replace(/\D/g, '');
  if (!digits) return '';
  const num = parseInt(digits, 10) / 100;
  return num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function MoneyInput({ value, onChange, placeholder, error, disabled, id }: Props) {
  const [display, setDisplay] = useState<string>(() => {
    if (value == null) return '';
    return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const formatted = formatMoney(raw);
    setDisplay(formatted);
    if (!formatted) {
      onChange(null);
    } else {
      const numeric = parseFloat(formatted.replace(/\./g, '').replace(',', '.'));
      onChange(isNaN(numeric) ? null : numeric);
    }
  };

  return (
    <div className={`money-input-wrapper ${error ? 'money-input-error' : ''}`}>
      <span className="money-prefix">R$</span>
      <input
        id={id}
        type="text"
        inputMode="numeric"
        className="money-input"
        value={display}
        onChange={handleChange}
        placeholder={placeholder ?? '0,00'}
        disabled={disabled}
        autoComplete="off"
      />
    </div>
  );
}
