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

export default function TaskForm({ onClose }) {
  const { addTask } = useApp();
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(toInputDate(TODAY));
  const [time, setTime] = useState('09:00');
  const [priority, setPriority] = useState('Орташа');

  function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) return;
    const [h, m] = time.split(':').map(Number);
    const endH = Math.min(23, h + 1);
    addTask({
      title: title.trim(),
      date: new Date(`${date}T00:00:00`),
      time,
      endTime: `${String(endH).padStart(2, '0')}:${String(m).padStart(2, '0')}`,
      priority,
    });
    onClose();
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="task-title">Тапсырма атауы</label>
        <input
          id="task-title"
          type="text"
          placeholder="Мысалы: есеп дайындау"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoFocus
          required
        />
      </div>
      <div className="field-row">
        <div className="field">
          <label htmlFor="task-date">Күні</label>
          <input
            id="task-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="task-time">Уақыты</label>
          <input
            id="task-time"
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            required
          />
        </div>
      </div>
      <div className="field">
        <label htmlFor="task-priority">Басымдылығы</label>
        <select id="task-priority" value={priority} onChange={(e) => setPriority(e.target.value)}>
          <option>Жоғары</option>
          <option>Орташа</option>
          <option>Төмен</option>
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
