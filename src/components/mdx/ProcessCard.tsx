import React from 'react';
import styles from './Editorial.module.css';

interface ProcessCardProps {
  title: string;
  type: 'INSIGHT' | 'DECISION' | 'PROBLEM' | 'insight' | 'decision' | 'problem';
  children: React.ReactNode;
  /** Tłumaczenia etykiet typu (klucze małymi literami); dostarcza strona projektu. */
  typeLabels?: Partial<Record<'insight' | 'decision' | 'problem', string>>;
}

export function ProcessCard({ title, type, children, typeLabels }: ProcessCardProps) {
  const key = type.toLowerCase() as 'insight' | 'decision' | 'problem';
  const label = typeLabels?.[key] ?? type.toUpperCase();
  const variant = key === 'insight' ? 'jp-web-card--strong' : '';

  return (
    <div className={`jp-web-card ${variant} ${styles.processCard}`.trim()} data-type={key}>
      <span className="jp-web-card__label">[ {label} ]</span>
      <h3 className="jp-web-card__title">{title}</h3>
      <div className={`jp-web-card__text ${styles.cardText}`}>{children}</div>
    </div>
  );
}
