import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { TODAY } from '../../utils/format';

function toInputDate(date) {
  const d = date instanceof Date ? date : new Date(date);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function toInputTime(date) {
  const d = date instanceof Date ? date : new Date(date);
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

export default function ReminderForm({ editing, onClose }) {
  const { addReminder, updateReminder } = useApp();
  const [text, setText] = useState(editing?.text ?? '');
  const [date, setDate] = useState(toInputDate(editing?.datetime ?? TODAY));
  const [time, setTime] = useState(editing ? toInputTime(editing.datetime) : '09:00');
  const [repeat, setRepeat] = useState(editing?.repeat ?? 'Бір рет');

  function handleSubmit(e) {
    e.preventDefault();
    if (!text.trim()) return;
    const payload = {
      text: text.trim(),
      datetime: new Date(`${date}T${time}:00`),
      repeat,
    };
    if (editing) {
      updateReminder(editing.id, payload);
    } else {
      addReminder(payload);
    }
    onClose();
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="rem-text">Еске салғыш мәтіні</label>
        <input
          id="rem-text"
          type="text"
          placeholder="Мысалы: коммуналдықты төлеу"
          value={text}
          onChange={(e) => setText(e.target.value)}
          autoFocus
          required
        />
      </div>
      <div className="field-row">
        <div className="field">
          <label htmlFor="rem-date">Күні</label>
          <input
            id="rem-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="rem-time">Уақыты</label>
          <input
            id="rem-time"
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            required
          />
        </div>
      </div>
      <div className="field">
        <label htmlFor="rem-repeat">Қайталану</label>
        <select id="rem-repeat" value={repeat} onChange={(e) => setRepeat(e.target.value)}>
          <option>Бір рет</option>
          <option>Күн сайын</option>
          <option>Апта сайын</option>
          <option>Ай сайын</option>
        </select>
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
