
import './ProgressBar.css';

interface Props {
  current: number;
  total: number;
  percentage: number;
}

export function ProgressBar({ current, total, percentage }: Props) {
  return (
    <div className="progress-wrapper">
      <div className="progress-track">
        <div
          className="progress-fill"
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
      <span className="progress-label">{current} de {total}</span>
    </div>
  );
}
