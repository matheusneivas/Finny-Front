import React from 'react';
import './QuestionCard.css';

interface Props {
  question: string;
  helper?: string;
  error?: string;
  children: React.ReactNode;
  icon?: string;
}

export function QuestionCard({ question, helper, error, children, icon }: Props) {
  return (
    <div className={`question-card ${error ? 'question-card-error' : ''}`}>
      <p className="question-label">
        {icon && <span className="question-icon">{icon}</span>}
        {question}
      </p>
      {children}
      {error && (
        <p className="question-error-text">
          <span>⚠️</span> {error}
        </p>
      )}
      {!error && helper && (
        <p className="question-helper">
          <span>ℹ️</span> {helper}
        </p>
      )}
    </div>
  );
}
