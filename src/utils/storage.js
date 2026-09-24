// Демо-деректерді браузердің localStorage-інде сақтау.
// TODO: бэкенд қосылғанда бұл модуль толығымен API-клиентке ауыстырылады —
// компоненттер AppContext арқылы жұмыс істейтіндіктен, олардың коды өзгермейді.

const STORAGE_KEY = 'smartlife.state.v1';

// JSON.stringify Date-ті "2026-09-24T00:00:00.000Z" пішінінде сақтайды,
// оқып алғанда осы reviver соны қайта Date нысанына айналдырады.
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/;

function reviveDates(_key, value) {
  if (typeof value === 'string' && ISO_DATE_RE.test(value)) {
    return new Date(value);
  }
  return value;
}

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw, reviveDates);
  } catch {
    return null;
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // мыс. жеке шолу режимінде localStorage жазбауы мүмкін — үнсіз елемейміз
  }
}

export function clearStoredState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
