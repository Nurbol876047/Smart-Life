import { useApp } from '../context/AppContext';
import {
  biggestCategory,
  isInMonth,
  lastMonths,
  savingsRate,
} from '../data/selectors';
import { daysBetween, TODAY } from '../utils/format';

function categoryAmount(transactions, year, month, categoryId) {
  return transactions
    .filter((t) => t.type === 'expense' && t.category === categoryId && isInMonth(t.date, year, month))
    .reduce((s, t) => s + t.amount, 0);
}

export default function Insights({ onNavigate }) {
  const { transactions, tasks, reminders } = useApp();

  const [prev, cur] = lastMonths(2, TODAY);

  const funThis = categoryAmount(transactions, cur.year, cur.month, 'fun');
  const funPrev = categoryAmount(transactions, prev.year, prev.month, 'fun');
  const funChange = funPrev ? Math.round(((funThis - funPrev) / funPrev) * 100) : null;

  const todayTasks = tasks.filter((t) => {
    const d = t.date;
    return d.getFullYear() === TODAY.getFullYear() && d.getMonth() === TODAY.getMonth() && d.getDate() === TODAY.getDate();
  });
  const doneCount = todayTasks.filter((t) => t.done).length;

  const rate = savingsRate(transactions, cur.year, cur.month);
  const biggest = biggestCategory(transactions, cur.year, cur.month);

  const nearestReminder = [...reminders]
    .filter((r) => !r.done)
    .sort((a, b) => a.datetime - b.datetime)[0];

  const insights = [
    funChange !== null && {
      text: `Осы айда ойын-сауыққа өткен айдан ${Math.abs(funChange)}% ${
        funChange >= 0 ? 'көп' : 'аз'
      } жұмсадыңыз.`,
      linkLabel: 'Статистика',
      target: 'statistics',
    },
    todayTasks.length > 0 && {
      text: `Бүгін ${todayTasks.length} тапсырманың ${doneCount}-еуі орындалды.`,
      linkLabel: 'Күн жоспары',
      target: 'dayplan',
    },
    {
      text:
        rate >= 0
          ? `Осы ай кірісіңіздің ${rate}% пайызын жинақтадыңыз.`
          : `Осы ай шығысыңыз кірістен ${Math.abs(rate)}% артық болды.`,
      linkLabel: 'Жинақ жоспары',
      target: 'goals',
    },
    biggest && {
      text: `Осы айда ең көп шығын санаты — «${biggest.label}» (${biggest.percent}%).`,
      linkLabel: 'Статистика',
      target: 'statistics',
    },
    nearestReminder && {
      text: `Жақын еске салғыш: «${nearestReminder.text}» — ${Math.max(
        0,
        daysBetween(TODAY, nearestReminder.datetime)
      )} күннен кейін.`,
      linkLabel: 'Еске салғыштар',
      target: 'reminders',
    },
  ].filter(Boolean);

  return (
    <div className="content content--fade">
      <h2 className="section-title">Осы аптадағы негізгі байқаулар</h2>
      <div className="panel">
        {insights.map((ins, i) => (
          <div className="insight-row" key={i}>
            <p>{ins.text}</p>
            <button className="insight-row__link" onClick={() => onNavigate(ins.target)}>
              {ins.linkLabel}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
