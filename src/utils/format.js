// Барлық сан/күн форматтары осы жерде орталықтандырылған.
// TODO: бэкенд қосылғанда серверден келген валюта/локаль баптауларын осында пайдалану

export const WEEKDAY_SHORT = ['Дс', 'Сс', 'Ср', 'Бс', 'Жм', 'Сб', 'Жс'];
export const WEEKDAY_FULL = [
  'Дүйсенбі',
  'Сейсенбі',
  'Сәрсенбі',
  'Бейсенбі',
  'Жұма',
  'Сенбі',
  'Жексенбі',
];
export const MONTHS_FULL = [
  'қаңтар',
  'ақпан',
  'наурыз',
  'сәуір',
  'мамыр',
  'маусым',
  'шілде',
  'тамыз',
  'қыркүйек',
  'қазан',
  'қараша',
  'желтоқсан',
];
export const MONTHS_SHORT = [
  'Қаң',
  'Ақп',
  'Нау',
  'Сәу',
  'Мам',
  'Мау',
  'Шіл',
  'Там',
  'Қыр',
  'Қаз',
  'Қар',
  'Жел',
];

// Демо үшін "бүгін" тіркелген күн ретінде беріледі.
// TODO: production-да нақты ағымдағы күнмен ауыстыру (немесе серверден алу)
export const TODAY = new Date(2026, 8, 24);

function mondayIndex(jsDay) {
  return (jsDay + 6) % 7; // JS: 0=Жс -> 6, 1=Дс -> 0 ...
}

export function formatMoney(amount) {
  const sign = amount < 0 ? '-' : '';
  const abs = Math.round(Math.abs(amount));
  const withSpaces = abs.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return `${sign}${withSpaces} ₸`;
}

export function formatSignedMoney(amount) {
  const abs = Math.round(Math.abs(amount));
  const withSpaces = abs.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  const prefix = abs === 0 ? '' : amount < 0 ? '−' : '+';
  return `${prefix}${withSpaces} ₸`;
}

export function formatDate(date) {
  const d = date instanceof Date ? date : new Date(date);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}.${mm}.${yyyy}`;
}

export function formatDateLong(date) {
  const d = date instanceof Date ? date : new Date(date);
  return `${d.getDate()} ${MONTHS_FULL[d.getMonth()]}`;
}

export function formatWeekday(date, short = false) {
  const d = date instanceof Date ? date : new Date(date);
  const idx = mondayIndex(d.getDay());
  return short ? WEEKDAY_SHORT[idx] : WEEKDAY_FULL[idx];
}

export function formatToday(date = TODAY) {
  return `Бүгін, ${formatDateLong(date)}, ${formatWeekday(date)}`;
}

export function isSameDay(a, b) {
  const da = a instanceof Date ? a : new Date(a);
  const db = b instanceof Date ? b : new Date(b);
  return (
    da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
  );
}

export function daysBetween(a, b) {
  // Түпнұсқа Date нысанын бүлдірмеу үшін әрқашан көшірме жасаймыз
  const da = new Date(a);
  const db = new Date(b);
  const ms = db.setHours(0, 0, 0, 0) - da.setHours(0, 0, 0, 0);
  return Math.round(ms / 86400000);
}

export function startOfWeek(date) {
  const d = new Date(date);
  const idx = mondayIndex(d.getDay());
  d.setDate(d.getDate() - idx);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}
