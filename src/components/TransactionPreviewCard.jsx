import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { CATEGORIES } from '../data/mockData';

const LOW_CONFIDENCE = 0.7;

export default function TransactionPreviewCard({ transaction, onSave, onDiscard }) {
  const [type, setType] = useState(transaction.type);
  const [amount, setAmount] = useState(String(transaction.amount));
  const [category, setCategory] = useState(transaction.category);
  const [date, setDate] = useState(transaction.date);
  const [note, setNote] = useState(transaction.note ?? '');

  const lowConfidence = (transaction.confidence ?? 1) < LOW_CONFIDENCE;
  const options = CATEGORIES.filter((c) => c.kind === type || c.kind === 'both');

  function handleTypeChange(nextType) {
    setType(nextType);
    const stillValid = CATEGORIES.some(
      (c) => c.id === category && (c.kind === nextType || c.kind === 'both')
    );
    if (!stillValid) {
      setCategory(CATEGORIES.find((c) => c.kind === nextType || c.kind === 'both')?.id ?? 'other');
    }
  }

  function handleSave() {
    if (!amount || Number(amount) <= 0) return;
    onSave({
      type,
      amount: Number(amount),
      category,
      date: new Date(`${date}T00:00:00`),
      description: note.trim() || (type === 'income' ? 'Кіріс' : 'Шығыс'),
    });
  }

  return (
    <div className={`preview-card${lowConfidence ? ' preview-card--warn' : ''}`}>
      {lowConfidence && (
        <div className="preview-card__flag">
          <AlertTriangle size={14} />
          Тексеріңіз
        </div>
      )}

      <div className="field-row">
        <div className="field">
          <label>Түрі</label>
          <div className="segmented" style={{ width: '100%' }}>
            <button
              type="button"
              style={{ flex: 1 }}
              className={type === 'income' ? 'active' : ''}
              onClick={() => handleTypeChange('income')}
            >
              Кіріс
            </button>
            <button
              type="button"
              style={{ flex: 1 }}
              className={type === 'expense' ? 'active' : ''}
              onClick={() => handleTypeChange('expense')}
            >
              Шығыс
            </button>
          </div>
        </div>
        <div className="field">
          <label htmlFor={`prev-amount-${transaction._uid}`}>Сомасы (₸)</label>
          <input
            id={`prev-amount-${transaction._uid}`}
            type="number"
            min="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
      </div>

      <div className="field-row">
        <div className="field">
          <label htmlFor={`prev-category-${transaction._uid}`}>Санаты</label>
          <select
            id={`prev-category-${transaction._uid}`}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {options.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor={`prev-date-${transaction._uid}`}>Күні</label>
          <input
            id={`prev-date-${transaction._uid}`}
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
      </div>

      <div className="field" style={{ marginBottom: 12 }}>
        <label htmlFor={`prev-note-${transaction._uid}`}>Сипаттама</label>
        <input
          id={`prev-note-${transaction._uid}`}
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>

      <div style={{ display: 'flex', gap: 12 }}>
        <button type="button" className="btn btn--secondary" style={{ flex: 1 }} onClick={onDiscard}>
          Бас тарту
        </button>
        <button type="button" className="btn btn--primary" style={{ flex: 1 }} onClick={handleSave}>
          Сақтау
        </button>
      </div>
    </div>
  );
}
