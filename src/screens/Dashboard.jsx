import { TrendingUp, TrendingDown, ListTodo, BellPlus, ArrowRight, Plus, Pencil } from 'lucide-react';
import { useApp } from '../context/AppContext';
import ProgressBar from '../components/ProgressBar';
import EmptyState from '../components/EmptyState';
import {
  formatToday,
  formatMoney,
  formatSignedMoney,
  formatDate,
  isSameDay,
  TODAY,
} from '../utils/format';
import { currentBalance, monthTotals, sortedByDateDesc } from '../data/selectors';
import { categoryLabel } from '../data/mockData';
import Badge, { priorityVariant } from '../components/Badge';
import useDelayedLoading from '../utils/useDelayedLoading';
import { SkeletonTable } from '../components/Skeleton';
import PhraseTransactionInput from '../components/PhraseTransactionInput';

export default function Dashboard({ onOpenModal, onNavigate }) {
  const { transactions, tasks, toggleTask, reminders, goals, settings, initialBalance } = useApp();
  const loadingTx = useDelayedLoading(500);

  const balance = currentBalance(transactions, initialBalance);
  const { income, expense } = monthTotals(transactions, TODAY.getFullYear(), TODAY.getMonth());

  const todayTasks = tasks
    .filter((t) => isSameDay(t.date, TODAY))
    .sort((a, b) => a.time.localeCompare(b.time));

  const recentTx = sortedByDateDesc(transactions).slice(0, 5);

  const mainGoal = goals[0];
  const goalPercent = mainGoal ? Math.round((mainGoal.saved / mainGoal.target) * 100) : 0;

  const upcomingReminders = [...reminders]
    .filter((r) => !r.done)
    .sort((a, b) => a.datetime - b.datetime)
    .slice(0, 3);

  return (
    <div className="content content--fade">
      <p className="hint" style={{ marginBottom: 4 }}>
        {formatToday()}
      </p>
      <h1 style={{ fontSize: 'var(--fs-20)', fontWeight: 600, marginBottom: 24 }}>
        Қайырлы күн, {settings.name}!
      </h1>

      <PhraseTransactionInput />

      <div className="balance-block">
        <div className="balance-label">Ағымдағы баланс</div>
        <div className="balance-row">
          <div className="balance-amount tabular">{formatMoney(balance)}</div>
          <button
            className="icon-btn"
            aria-label="Балансты өзгерту"
            title="Балансты өзгерту"
            onClick={() => onOpenModal('balance', balance)}
          >
            <Pencil size={18} />
          </button>
        </div>
        <div className="balance-sub">
          <span className="balance-sub__item">
            Осы айдағы кіріс:{' '}
            <span className="amount amount--income tabular">{formatSignedMoney(income)}</span>
          </span>
          <span className="balance-sub__item">
            Осы айдағы шығыс:{' '}
            <span className="amount amount--expense tabular">{formatSignedMoney(-expense)}</span>
          </span>
        </div>
      </div>

      <div className="quick-actions">
        <button className="quick-action" onClick={() => onOpenModal('income')}>
          <TrendingUp size={20} />
          + Кіріс қосу
        </button>
        <button className="quick-action" onClick={() => onOpenModal('expense')}>
          <TrendingDown size={20} />
          + Шығыс қосу
        </button>
        <button className="quick-action" onClick={() => onOpenModal('task')}>
          <ListTodo size={20} />
          + Тапсырма қосу
        </button>
        <button className="quick-action" onClick={() => onOpenModal('reminder')}>
          <BellPlus size={20} />
          + Еске салғыш қосу
        </button>
      </div>

      <div className="two-col">
        <div className="panel">
          <div className="section-row">
            <h2 className="section-title" style={{ marginBottom: 0 }}>
              Бүгінгі істер
            </h2>
            <button className="btn--sm btn btn--ghost" onClick={() => onNavigate('dayplan')}>
              Барлығы
            </button>
          </div>
          {todayTasks.length === 0 ? (
            <EmptyState
              text="Бүгінге тапсырма жоқ"
              actionLabel="+ Тапсырма қосу"
              onAction={() => onOpenModal('task')}
            />
          ) : (
            <ul className="task-list">
              {todayTasks.map((t) => (
                <li key={t.id} className={`task-item${t.done ? ' done' : ''}`}>
                  <button
                    className={`checkbox${t.done ? ' checked' : ''}`}
                    onClick={() => toggleTask(t.id)}
                    aria-label={t.done ? 'Орындалмаған деп белгілеу' : 'Орындалды деп белгілеу'}
                  >
                    {t.done && '✓'}
                  </button>
                  <span className="task-item__time tabular">{t.time}</span>
                  <span className="task-item__title">{t.title}</span>
                  {!t.done && <Badge variant={priorityVariant(t.priority)}>{t.priority}</Badge>}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="panel">
          <div className="section-row">
            <h2 className="section-title" style={{ marginBottom: 0 }}>
              Соңғы операциялар
            </h2>
            <button
              className="btn--sm btn btn--ghost"
              onClick={() => onNavigate('transactions')}
            >
              Барлығы
            </button>
          </div>
          {loadingTx ? (
            <SkeletonTable rows={5} cols={3} />
          ) : recentTx.length === 0 ? (
            <EmptyState
              text="Әзірге операция жоқ"
              actionLabel="+ Кіріс қосу"
              onAction={() => onOpenModal('income')}
            />
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Күні</th>
                    <th>Санат</th>
                    <th className="num">Сомасы</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTx.map((t) => (
                    <tr key={t.id}>
                      <td className="tabular">{formatDate(t.date)}</td>
                      <td>{categoryLabel(t.category)}</td>
                      <td className={`num amount tabular amount--${t.type === 'income' ? 'income' : 'expense'}`}>
                        {t.type === 'income' ? formatSignedMoney(t.amount) : formatSignedMoney(-t.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div className="panel" style={{ marginTop: 24 }}>
        <div className="section-row">
          <h2 className="section-title" style={{ marginBottom: 0 }}>
            Жинақ мақсаты
          </h2>
          <button className="btn--sm btn btn--ghost" onClick={() => onNavigate('goals')}>
            Барлығы
          </button>
        </div>
        {mainGoal ? (
          <>
            <div className="goal-row">
              <span>{mainGoal.name}</span>
              <span className="tabular">
                {formatMoney(mainGoal.saved)} / {formatMoney(mainGoal.target)} ({goalPercent}%)
              </span>
            </div>
            <ProgressBar percent={goalPercent} />
          </>
        ) : (
          <EmptyState text="Жинақ мақсаты жоқ" actionLabel="+ Жаңа мақсат" onAction={() => onNavigate('goals')} />
        )}
      </div>

      <div className="panel" style={{ marginTop: 24 }}>
        <div className="section-row">
          <h2 className="section-title" style={{ marginBottom: 0 }}>
            Жақын еске салғыштар
          </h2>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              className="icon-btn"
              aria-label="Еске салғыш қосу"
              title="Еске салғыш қосу"
              onClick={() => onOpenModal('reminder')}
            >
              <Plus size={16} />
            </button>
            <button className="btn--sm btn btn--ghost" onClick={() => onNavigate('reminders')}>
              Барлығы
            </button>
          </div>
        </div>
        {upcomingReminders.length === 0 ? (
          <EmptyState text="Еске салғыштар жоқ" actionLabel="+ Еске салғыш қосу" onAction={() => onOpenModal('reminder')} />
        ) : (
          upcomingReminders.map((r) => (
            <button
              key={r.id}
              className="reminder-item reminder-item--clickable"
              onClick={() => onOpenModal('reminder', r)}
            >
              <div className="reminder-item__body">
                <div className="reminder-item__text">{r.text}</div>
                <div className="reminder-item__meta">
                  <span className="tabular">
                    {formatDate(r.datetime)}, {String(r.datetime.getHours()).padStart(2, '0')}:
                    {String(r.datetime.getMinutes()).padStart(2, '0')}
                  </span>
                  <Badge variant="neutral">{r.repeat}</Badge>
                </div>
              </div>
              <ArrowRight size={16} className="hint" />
            </button>
          ))
        )}
      </div>
    </div>
  );
}
