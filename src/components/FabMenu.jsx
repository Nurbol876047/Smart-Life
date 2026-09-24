import { useState } from 'react';
import { Plus, X, TrendingUp, TrendingDown, ListTodo, BellPlus } from 'lucide-react';

export default function FabMenu({ onAction }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {open && (
        <div className="fab-menu">
          <button
            onClick={() => {
              setOpen(false);
              onAction('income');
            }}
          >
            <TrendingUp size={18} />
            Кіріс қосу
          </button>
          <button
            onClick={() => {
              setOpen(false);
              onAction('expense');
            }}
          >
            <TrendingDown size={18} />
            Шығыс қосу
          </button>
          <button
            onClick={() => {
              setOpen(false);
              onAction('task');
            }}
          >
            <ListTodo size={18} />
            Тапсырма қосу
          </button>
          <button
            onClick={() => {
              setOpen(false);
              onAction('reminder');
            }}
          >
            <BellPlus size={18} />
            Еске салғыш қосу
          </button>
        </div>
      )}
      <button
        className="fab"
        onClick={() => setOpen((v) => !v)}
        aria-label="Қосу мәзірі"
        aria-expanded={open}
      >
        {open ? <X size={24} /> : <Plus size={24} />}
      </button>
    </>
  );
}
