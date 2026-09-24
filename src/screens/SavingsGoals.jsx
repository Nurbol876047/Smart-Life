import { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import ProgressBar from '../components/ProgressBar';
import EmptyState from '../components/EmptyState';
import Badge from '../components/Badge';
import { daysBetween, formatDate, formatMoney, TODAY } from '../utils/format';

function goalStatus(percent, daysLeft) {
  if (percent >= 100) return { variant: 'income', label: 'Мақсатқа жетті' };
  if (daysLeft <= 0) return { variant: 'expense', label: 'Мерзімі өтті' };
  if (daysLeft <= 14) return { variant: 'warning', label: 'Мерзімі жақын' };
  return null;
}

export default function SavingsGoals({ onOpenModal }) {
  const { goals } = useApp();

  const [calcAmount, setCalcAmount] = useState('1000000');
  const [calcDeadline, setCalcDeadline] = useState('2027-06-01');

  const calcResult = useMemo(() => {
    const amount = Number(calcAmount) || 0;
    const deadline = new Date(`${calcDeadline}T00:00:00`);
    const days = daysBetween(TODAY, deadline);
    if (days <= 0 || amount <= 0) return null;
    const weeks = days / 7;
    const months = days / 30.44;
    return {
      perMonth: Math.ceil(amount / Math.max(1, months)),
      perWeek: Math.ceil(amount / Math.max(1, weeks)),
      days,
    };
  }, [calcAmount, calcDeadline]);

  return (
    <div className="content content--fade">
      <div className="section-row">
        <h2 className="section-title" style={{ marginBottom: 0 }}>
          Мақсаттар тізімі
        </h2>
        <button className="btn btn--primary" onClick={() => onOpenModal('goal')}>
          + Жаңа мақсат
        </button>
      </div>

      {goals.length === 0 ? (
        <EmptyState
          text="Әзірге жинақ мақсаты жоқ"
          actionLabel="+ Жаңа мақсат"
          onAction={() => onOpenModal('goal')}
        />
      ) : (
        goals.map((g) => {
          const percent = Math.round((g.saved / g.target) * 100);
          const daysLeft = daysBetween(TODAY, g.deadline);
          const status = goalStatus(percent, daysLeft);
          return (
            <div className="panel" key={g.id}>
              <div className="goal-row">
                <span style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                  {g.name}
                  {status && <Badge variant={status.variant}>{status.label}</Badge>}
                </span>
                <span className="tabular">
                  {formatMoney(g.saved)} / {formatMoney(g.target)}
                </span>
              </div>
              <ProgressBar percent={percent} />
              <div className="balance-sub" style={{ marginTop: 12 }}>
                <span>{percent}% жиналды</span>
                <span>
                  Мерзімі: <span className="tabular">{formatDate(g.deadline)}</span>
                  {daysLeft > 0 ? ` (${daysLeft} күн қалды)` : ' (мерзімі өтті)'}
                </span>
              </div>
            </div>
          );
        })
      )}

      <div className="panel" style={{ marginTop: 24 }}>
        <h2 className="section-title">Жинақ калькуляторы</h2>
        <div className="field-row">
          <div className="field">
            <label htmlFor="calc-amount">Мақсат сомасы (₸)</label>
            <input
              id="calc-amount"
              type="number"
              min="0"
              value={calcAmount}
              onChange={(e) => setCalcAmount(e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="calc-deadline">Мерзімі</label>
            <input
              id="calc-deadline"
              type="date"
              value={calcDeadline}
              onChange={(e) => setCalcDeadline(e.target.value)}
            />
          </div>
        </div>
        {calcResult ? (
          <div className="stat-grid" style={{ gridTemplateColumns: '1fr 1fr', marginBottom: 0 }}>
            <div className="stat-box">
              <div className="stat-box__value tabular">{formatMoney(calcResult.perMonth)}</div>
              <div className="stat-box__label">Айына жинау керек</div>
            </div>
            <div className="stat-box">
              <div className="stat-box__value tabular">{formatMoney(calcResult.perWeek)}</div>
              <div className="stat-box__label">Аптасына жинау керек</div>
            </div>
          </div>
        ) : (
          <p className="hint">Мерзімді болашақ күнге орнатыңыз</p>
        )}
      </div>
    </div>
  );
}
