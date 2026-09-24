import { useState } from 'react';
import { useApp } from '../../context/AppContext';

export default function GoalForm({ onClose }) {
  const { addGoal } = useApp();
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [deadline, setDeadline] = useState('2027-01-01');

  function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim() || !target || Number(target) <= 0) return;
    addGoal({
      name: name.trim(),
      target: Number(target),
      saved: 0,
      deadline: new Date(`${deadline}T00:00:00`),
    });
    onClose();
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="goal-name">Мақсат атауы</label>
        <input
          id="goal-name"
          type="text"
          placeholder="Мысалы: жаңа телефон"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
          required
        />
      </div>
      <div className="field-row">
        <div className="field">
          <label htmlFor="goal-target">Мақсат сомасы (₸)</label>
          <input
            id="goal-target"
            type="number"
            min="1"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="goal-deadline">Мерзімі</label>
          <input
            id="goal-deadline"
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            required
          />
        </div>
      </div>
      <div className="modal__actions">
        <button type="button" className="btn btn--secondary" onClick={onClose}>
          Бас тарту
        </button>
        <button type="submit" className="btn btn--primary">
          Сақтау
        </button>
      </div>
    </form>
  );
}
