import { useMemo, useState } from 'react';
import { Pencil, Trash2, Search } from 'lucide-react';
import { useApp } from '../context/AppContext';
import EmptyState from '../components/EmptyState';
import {
  formatDate,
  formatSignedMoney,
  isSameDay,
  startOfWeek,
  addDays,
  TODAY,
} from '../utils/format';
import { CATEGORIES, categoryLabel } from '../data/mockData';
import { sortedByDateDesc } from '../data/selectors';
import useDelayedLoading from '../utils/useDelayedLoading';
import { SkeletonTable } from '../components/Skeleton';
import PhraseTransactionInput from '../components/PhraseTransactionInput';

const TABS = ['Барлығы', 'Кіріс', 'Шығыс'];
const PERIODS = ['Барлығы', 'Бүгін', 'Апта', 'Ай', 'Жыл'];

function matchesPeriod(date, period) {
  if (period === 'Барлығы') return true;
  if (period === 'Бүгін') return isSameDay(date, TODAY);
  if (period === 'Апта') {
    const start = startOfWeek(TODAY);
    const end = addDays(start, 7);
    return date >= start && date < end;
  }
  if (period === 'Ай') return date.getFullYear() === TODAY.getFullYear() && date.getMonth() === TODAY.getMonth();
  if (period === 'Жыл') return date.getFullYear() === TODAY.getFullYear();
  return true;
}

export default function Transactions({ onOpenModal, onOpenEdit }) {
  const { transactions, removeTransaction } = useApp();
  const loading = useDelayedLoading(500);
  const [tab, setTab] = useState('Барлығы');
  const [period, setPeriod] = useState('Барлығы');
  const [category, setCategory] = useState('all');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    return sortedByDateDesc(transactions).filter((t) => {
      if (tab === 'Кіріс' && t.type !== 'income') return false;
      if (tab === 'Шығыс' && t.type !== 'expense') return false;
      if (!matchesPeriod(t.date, period)) return false;
      if (category !== 'all' && t.category !== category) return false;
      if (query.trim()) {
        const q = query.trim().toLowerCase();
        const hay = `${t.description} ${categoryLabel(t.category)}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [transactions, tab, period, category, query]);

  const totalIncome = filtered.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = filtered.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  return (
    <div className="content content--fade">
      <PhraseTransactionInput />

      <div className="section-row" style={{ marginBottom: 20 }}>
        <div className="segmented">
          {TABS.map((t) => (
            <button key={t} className={tab === t ? 'active' : ''} onClick={() => setTab(t)}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="filters-row">
        <select value={period} onChange={(e) => setPeriod(e.target.value)} aria-label="Кезең">
          {PERIODS.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <select value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Санат">
          <option value="all">Барлық санаттар</option>
          {CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
        <div style={{ position: 'relative', flex: 1, minWidth: 180 }}>
          <Search
            size={16}
            style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
          />
          <input
            type="search"
            placeholder="Іздеу..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ width: '100%', paddingLeft: 32 }}
          />
        </div>
      </div>

      {loading ? (
        <SkeletonTable rows={6} cols={5} />
      ) : filtered.length === 0 ? (
        <EmptyState
          text="Әзірге операция жоқ"
          actionLabel="+ Кіріс қосу"
          onAction={() => onOpenModal('income')}
        />
      ) : (
        <>
          <div className="table-wrap panel" style={{ padding: 0 }}>
            <table className="table">
              <thead>
                <tr>
                  <th className="col-date">Күні</th>
                  <th className="col-category">Санат</th>
                  <th className="col-description">Сипаттама</th>
                  <th className="num col-amount">Сомасы</th>
                  <th className="num col-actions">Әрекет</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => (
                  <tr key={t.id}>
                    <td className="tabular col-date">{formatDate(t.date)}</td>
                    <td className="col-category">{categoryLabel(t.category)}</td>
                    <td className="col-description">{t.description}</td>
                    <td className={`num amount tabular col-amount amount--${t.type === 'income' ? 'income' : 'expense'}`}>
                      {t.type === 'income' ? formatSignedMoney(t.amount) : formatSignedMoney(-t.amount)}
                    </td>
                    <td className="num col-actions">
                      <div className="table-actions">
                        <button
                          className="icon-btn"
                          aria-label="Өңдеу"
                          onClick={() => onOpenEdit(t)}
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          className="icon-btn icon-btn--danger"
                          aria-label="Жою"
                          onClick={() => removeTransaction(t.id)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Кестенің tfoot-ы емес, бөлек блок — тар экранда өз бетінше
              қатарларға бөлінеді, сан тізбегі бір-біріне сыйыспай қалмайды. */}
          <div className="tx-summary">
            <span className="hint">Барлығы: {filtered.length} операция</span>
            <span className="amount amount--income tabular">{formatSignedMoney(totalIncome)}</span>
            <span className="amount amount--expense tabular">{formatSignedMoney(-totalExpense)}</span>
            <span className="tx-summary__net tabular">
              Айырма: {formatSignedMoney(totalIncome - totalExpense)}
            </span>
          </div>
        </>
      )}
    </div>
  );
}
