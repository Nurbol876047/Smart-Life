import { useState } from 'react';
import { useApp } from '../context/AppContext';
import EmptyState from '../components/EmptyState';
import Badge, { priorityVariant } from '../components/Badge';
import { addDays, formatWeekday, isSameDay, startOfWeek, TODAY } from '../utils/format';

const START_HOUR = 7;
const END_HOUR = 23;
const HOUR_PX = 64;

function toMinutes(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

export default function DayPlan({ onOpenModal }) {
  const { tasks, toggleTask } = useApp();
  const [view, setView] = useState('Күн');

  const dayTasks = tasks.filter((t) => isSameDay(t.date, TODAY));
  const hours = [];
  for (let h = START_HOUR; h < END_HOUR; h++) hours.push(h);

  const weekStart = startOfWeek(TODAY);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  return (
    <div className="content content--fade">
      <div className="section-row">
        <div className="segmented">
          {['Күн', 'Апта'].map((v) => (
            <button key={v} className={view === v ? 'active' : ''} onClick={() => setView(v)}>
              {v}
            </button>
          ))}
        </div>
        <button className="btn btn--primary" onClick={() => onOpenModal('task')}>
          + Тапсырма қосу
        </button>
      </div>

      {view === 'Күн' ? (
        dayTasks.length === 0 ? (
          <EmptyState
            text="Бүгінге тапсырма жоқ"
            actionLabel="+ Тапсырма қосу"
            onAction={() => onOpenModal('task')}
          />
        ) : (
          <div className="panel">
            <div className="timeline" style={{ height: (END_HOUR - START_HOUR) * HOUR_PX }}>
              {hours.map((h) => (
                <div className="timeline__hour" key={h}>
                  <span className="timeline__hour-label">{String(h).padStart(2, '0')}:00</span>
                </div>
              ))}
              {dayTasks.map((t) => {
                const startMin = toMinutes(t.time) - START_HOUR * 60;
                const endMin = toMinutes(t.endTime) - START_HOUR * 60;
                const top = (Math.max(0, startMin) / 60) * HOUR_PX;
                const height = Math.max(28, ((endMin - startMin) / 60) * HOUR_PX - 2);
                return (
                  <button
                    key={t.id}
                    className={`timeline__task${t.done ? ' done' : ''}`}
                    style={{ top, height }}
                    onClick={() => toggleTask(t.id)}
                  >
                    <span className="tabular">{t.time}</span>
                    <span className="timeline__task-title">{t.title}</span>
                    {t.done ? (
                      <Badge variant="income">Орындалды</Badge>
                    ) : (
                      <Badge variant={priorityVariant(t.priority)}>{t.priority}</Badge>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )
      ) : (
        <div className="week-grid">
          {weekDays.map((d) => {
            const items = tasks
              .filter((t) => isSameDay(t.date, d))
              .sort((a, b) => a.time.localeCompare(b.time));
            const today = isSameDay(d, TODAY);
            return (
              <div className="week-grid__day" key={d.toISOString()}>
                <div className={`week-grid__day-title${today ? ' today' : ''}`}>
                  {formatWeekday(d, true)} · {d.getDate()}
                </div>
                {items.map((t) => (
                  <button
                    key={t.id}
                    className={`week-grid__task${t.done ? ' done' : ''}`}
                    style={{ width: '100%', textAlign: 'left', cursor: 'pointer' }}
                    onClick={() => toggleTask(t.id)}
                  >
                    <span className="tabular">{t.time}</span> {t.title}
                  </button>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
