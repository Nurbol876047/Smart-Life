import { useApp } from '../context/AppContext';
import EmptyState from '../components/EmptyState';
import Badge from '../components/Badge';
import { addDays, formatDate, isSameDay, startOfWeek, TODAY } from '../utils/format';

function groupFor(dt) {
  if (isSameDay(dt, TODAY)) return 'Бүгін';
  if (isSameDay(dt, addDays(TODAY, 1))) return 'Ертең';
  const endOfWeek = addDays(startOfWeek(TODAY), 7);
  if (dt < endOfWeek) return 'Осы аптада';
  return 'Кейінірек';
}

const GROUP_ORDER = ['Бүгін', 'Ертең', 'Осы аптада', 'Кейінірек'];

export default function Reminders({ onOpenModal }) {
  const { reminders, completeReminder, snoozeReminder } = useApp();

  const active = reminders.filter((r) => !r.done).sort((a, b) => a.datetime - b.datetime);
  const groups = GROUP_ORDER.map((name) => ({
    name,
    items: active.filter((r) => groupFor(r.datetime) === name),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="content content--fade">
      <div className="section-row">
        <h2 className="section-title" style={{ marginBottom: 0 }}>
          Еске салғыштар
        </h2>
        <button className="btn btn--primary" onClick={() => onOpenModal('reminder')}>
          + Еске салғыш қосу
        </button>
      </div>

      {groups.length === 0 ? (
        <EmptyState
          text="Еске салғыштар жоқ"
          actionLabel="+ Еске салғыш қосу"
          onAction={() => onOpenModal('reminder')}
        />
      ) : (
        groups.map((g) => (
          <div className="reminder-group" key={g.name}>
            <h3 className="reminder-group__title">
              {g.name}
              {g.name === 'Бүгін' && <Badge variant="warning">Жақын мерзім</Badge>}
            </h3>
            {g.items.map((r) => (
              <div className="reminder-item" key={r.id}>
                <button
                  className="reminder-item__body reminder-item__body--clickable"
                  onClick={() => onOpenModal('reminder', r)}
                  title="Еске салғышты өңдеу"
                >
                  <div className="reminder-item__text">{r.text}</div>
                  <div className="reminder-item__meta">
                    <span className="tabular">
                      {formatDate(r.datetime)}, {String(r.datetime.getHours()).padStart(2, '0')}:
                      {String(r.datetime.getMinutes()).padStart(2, '0')}
                    </span>
                    <Badge variant="neutral">{r.repeat}</Badge>
                  </div>
                </button>
                <div className="reminder-item__actions">
                  <button className="btn btn--sm btn--secondary" onClick={() => snoozeReminder(r.id, 1)}>
                    Кейінге қалдыру
                  </button>
                  <button className="btn btn--sm btn--primary" onClick={() => completeReminder(r.id)}>
                    Орындалды
                  </button>
                </div>
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  );
}
