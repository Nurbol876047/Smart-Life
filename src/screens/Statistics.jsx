import { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import {
  averageDailyExpense,
  biggestCategory,
  categoryBreakdown,
  lastMonths,
  monthTotals,
  savingsRate,
} from '../data/selectors';
import { useApp } from '../context/AppContext';
import { formatMoney, MONTHS_SHORT, TODAY } from '../utils/format';
import { cssVar } from '../utils/theme';
import useDelayedLoading from '../utils/useDelayedLoading';
import { SkeletonBars, SkeletonChart } from '../components/Skeleton';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function Statistics() {
  const { transactions, resolvedTheme } = useApp();
  const loading = useDelayedLoading(600);

  const months = lastMonths(3, TODAY);
  const monthlyData = months.map((m) => ({
    ...m,
    ...monthTotals(transactions, m.year, m.month),
  }));

  // Chart.js canvas-қа боятын кезде CSS айнымалыларын оқиды, сол себепті
  // тема ауысқанда (resolvedTheme) қайта есептеу керек.
  const { chartData, chartOptions } = useMemo(() => {
    const income = cssVar('--income');
    const expense = cssVar('--expense');
    const textMuted = cssVar('--text-muted');
    const border = cssVar('--border');
    const surface = cssVar('--surface');
    const text = cssVar('--text');

    return {
      chartData: {
        labels: monthlyData.map((m) => MONTHS_SHORT[m.month]),
        datasets: [
          {
            label: 'Кіріс',
            data: monthlyData.map((m) => m.income),
            backgroundColor: income,
            borderRadius: 4,
            maxBarThickness: 48,
          },
          {
            label: 'Шығыс',
            data: monthlyData.map((m) => m.expense),
            backgroundColor: expense,
            borderRadius: 4,
            maxBarThickness: 48,
          },
        ],
      },
      chartOptions: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: text, font: { family: 'IBM Plex Sans', size: 12 } },
          },
          tooltip: {
            backgroundColor: surface,
            titleColor: text,
            bodyColor: text,
            borderColor: border,
            borderWidth: 1,
            callbacks: {
              label: (ctx) => `${ctx.dataset.label}: ${formatMoney(ctx.raw)}`,
            },
          },
        },
        scales: {
          x: { grid: { display: false }, ticks: { color: textMuted, font: { family: 'IBM Plex Sans' } } },
          y: {
            grid: { color: border },
            ticks: {
              color: textMuted,
              font: { family: 'IBM Plex Sans' },
              callback: (v) => `${v / 1000}k`,
            },
          },
        },
      },
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monthlyData, resolvedTheme]);

  const breakdown = categoryBreakdown(transactions, TODAY.getFullYear(), TODAY.getMonth(), 'expense');
  const avgDaily = averageDailyExpense(transactions, TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate());
  const biggest = biggestCategory(transactions, TODAY.getFullYear(), TODAY.getMonth());
  const rate = savingsRate(transactions, TODAY.getFullYear(), TODAY.getMonth());

  return (
    <div className="content content--fade">
      <div className="stat-grid">
        <div className="stat-box">
          <div className="stat-box__value tabular">{formatMoney(avgDaily)}</div>
          <div className="stat-box__label">Орташа шығыс (күніне)</div>
        </div>
        <div className="stat-box">
          <div className="stat-box__value">{biggest?.label ?? '—'}</div>
          <div className="stat-box__label">Ең үлкен санат</div>
        </div>
        <div className="stat-box">
          <div className="stat-box__value tabular">{rate}%</div>
          <div className="stat-box__label">Жинақ пайызы (осы ай)</div>
        </div>
      </div>

      <div className="panel">
        <h2 className="section-title">Кіріс пен шығыс (айлар бойынша)</h2>
        {loading ? (
          <SkeletonChart height={280} />
        ) : (
          <div style={{ height: 280 }}>
            <Bar data={chartData} options={chartOptions} />
          </div>
        )}
      </div>

      <div className="panel" style={{ marginTop: 20 }}>
        <h2 className="section-title">Шығыстардың санат бойынша бөлінуі (осы ай)</h2>
        {loading ? (
          <SkeletonBars rows={5} />
        ) : breakdown.length === 0 ? (
          <p className="hint">Осы айда шығыс жоқ</p>
        ) : (
          breakdown.map((b, i) => (
            <div className="bar-row" key={b.categoryId}>
              <div className="bar-row__label">
                <span className="bar-row__label-name">
                  <span className="bar-row__swatch" style={{ background: `var(--chart-${(i % 6) + 1})` }} />
                  {b.label}
                </span>
                <span className="tabular">
                  {formatMoney(b.amount)} · {b.percent}%
                </span>
              </div>
              <div className="bar-track">
                <div
                  className="bar-fill"
                  style={{ width: `${b.percent}%`, background: `var(--chart-${(i % 6) + 1})` }}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
