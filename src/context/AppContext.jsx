import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  INITIAL_BALANCE,
  REMINDERS,
  SAVINGS_GOALS,
  TASKS,
  TRANSACTIONS,
  USER,
} from '../data/mockData';
import { clearStoredState, loadState, saveState } from '../utils/storage';

const AppContext = createContext(null);

let idCounter = 1000;
function nextId(prefix) {
  idCounter += 1;
  return `${prefix}${idCounter}`;
}

// Бірінші рет ашылғанда демо-деректер қолданылады және localStorage-ке дереу
// сақталады; келесі ашылуларда сол сақталған (пайдаланушы өзгерткен) нұсқа оқылады.
const persisted = loadState();

export function AppProvider({ children }) {
  // Демо-күйдегі "дерекқор". Бэкенд қосылғанда бұл useState-тер
  // React Query/SWR сияқты API-деректерге ауыстырылады.
  const [transactions, setTransactions] = useState(persisted?.transactions ?? TRANSACTIONS);
  const [tasks, setTasks] = useState(persisted?.tasks ?? TASKS);
  const [reminders, setReminders] = useState(persisted?.reminders ?? REMINDERS);
  const [goals, setGoals] = useState(persisted?.goals ?? SAVINGS_GOALS);
  const [settings, setSettings] = useState(persisted?.settings ?? USER);
  // Баланстың бастапқы нүктесі — "Ағымдағы баланс" редакторы арқылы өзгертіледі
  // (нақты санды көрсету үшін транзакциялар қосындысына қарай есептен шығарылады).
  const [initialBalance, setInitialBalance] = useState(persisted?.initialBalance ?? INITIAL_BALANCE);
  const [toasts, setToasts] = useState([]);

  // Кез-келген өзгеріс болғанда бүкіл күйді localStorage-ке сақтаймыз —
  // бетті қайта жүктегенде (F5) деректер жоғалмайды.
  useEffect(() => {
    saveState({ transactions, tasks, reminders, goals, settings, initialBalance });
  }, [transactions, tasks, reminders, goals, settings, initialBalance]);
  const [systemPrefersDark, setSystemPrefersDark] = useState(
    () => window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false
  );

  // "system" таңдалғанда, ОС теңшеуінің өзгерісін тыңдаймыз
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (e) => setSystemPrefersDark(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const resolvedTheme =
    settings.theme === 'system' ? (systemPrefersDark ? 'dark' : 'light') : settings.theme;

  // html[data-theme] арқылы қолмен таңдалған теманы мәжбүрлейміз;
  // "system" болса атрибутты алып тастап, CSS media-сұранысына қалдырамыз
  useEffect(() => {
    if (settings.theme === 'system') {
      delete document.documentElement.dataset.theme;
    } else {
      document.documentElement.dataset.theme = settings.theme;
    }
  }, [settings.theme]);

  const showToast = useCallback((text) => {
    const id = nextId('toast');
    setToasts((prev) => [...prev, { id, text }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2800);
  }, []);

  // TODO: POST /api/transactions
  const addTransaction = useCallback(
    (tx) => {
      setTransactions((prev) => [
        { ...tx, id: nextId('t') },
        ...prev,
      ]);
      showToast(tx.type === 'income' ? 'Кіріс қосылды' : 'Шығыс қосылды');
    },
    [showToast]
  );

  // TODO: DELETE /api/transactions/{id}
  const removeTransaction = useCallback(
    (id) => {
      setTransactions((prev) => prev.filter((t) => t.id !== id));
      showToast('Операция жойылды');
    },
    [showToast]
  );

  // TODO: PATCH /api/transactions/{id}
  const updateTransaction = useCallback(
    (id, patch) => {
      setTransactions((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
      showToast('Операция сақталды');
    },
    [showToast]
  );

  // TODO: POST /api/tasks
  const addTask = useCallback(
    (task) => {
      setTasks((prev) => [...prev, { ...task, id: nextId('k'), done: false }]);
      showToast('Тапсырма сақталды');
    },
    [showToast]
  );

  // TODO: PATCH /api/tasks/{id}
  const toggleTask = useCallback((id) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  }, []);

  // TODO: POST /api/reminders
  const addReminder = useCallback(
    (reminder) => {
      setReminders((prev) => [...prev, { ...reminder, id: nextId('r'), done: false }]);
      showToast('Еске салғыш қосылды');
    },
    [showToast]
  );

  // TODO: PATCH /api/reminders/{id}
  const updateReminder = useCallback(
    (id, patch) => {
      setReminders((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
      showToast('Еске салғыш сақталды');
    },
    [showToast]
  );

  // TODO: PATCH /api/reminders/{id}
  const completeReminder = useCallback(
    (id) => {
      setReminders((prev) => prev.map((r) => (r.id === id ? { ...r, done: true } : r)));
      showToast('Еске салғыш орындалды деп белгіленді');
    },
    [showToast]
  );

  // TODO: PATCH /api/reminders/{id} (snooze)
  const snoozeReminder = useCallback(
    (id, days = 1) => {
      setReminders((prev) =>
        prev.map((r) => {
          if (r.id !== id) return r;
          const d = new Date(r.datetime);
          d.setDate(d.getDate() + days);
          return { ...r, datetime: d };
        })
      );
      showToast('Еске салғыш кейінге қалдырылды');
    },
    [showToast]
  );

  // TODO: POST /api/savings-goals
  const addGoal = useCallback(
    (goal) => {
      setGoals((prev) => [...prev, { ...goal, id: nextId('g'), saved: goal.saved ?? 0 }]);
      showToast('Мақсат қосылды');
    },
    [showToast]
  );

  // Пайдаланушы "Ағымдағы баланс" санын тікелей өзгертеді (мыс. өз нақты
  // сомасын енгізу үшін). Транзакциялар тарихы өзгермейді — тек соған сәйкес
  // баланстың бастапқы нүктесі (initialBalance) қайта есептеледі, сол сан
  // дәл көрсетілген мәнге шығатындай.
  // TODO: PATCH /api/account/balance
  const setDisplayedBalance = useCallback(
    (desiredBalance) => {
      const net = transactions.reduce(
        (sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount),
        0
      );
      setInitialBalance(desiredBalance - net);
      showToast('Баланс жаңартылды');
    },
    [transactions, showToast]
  );

  // TODO: PATCH /api/settings
  const updateSettings = useCallback((patch) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  }, []);

  // Демо-деректерді толығымен тазалап, нақты пайдалануға дайын бос күйден бастау.
  // Профиль/тема сияқты баптаулар (settings) сақталып қалады — тазаланатын тек
  // қаржы/тапсырма/еске салғыш/мақсат деректері.
  const clearAllData = useCallback(() => {
    setTransactions([]);
    setTasks([]);
    setReminders([]);
    setGoals([]);
    setInitialBalance(0);
    clearStoredState();
    showToast('Деректер тазаланды');
  }, [showToast]);

  const value = useMemo(
    () => ({
      transactions,
      tasks,
      reminders,
      goals,
      settings,
      initialBalance,
      resolvedTheme,
      toasts,
      showToast,
      addTransaction,
      removeTransaction,
      updateTransaction,
      addTask,
      toggleTask,
      addReminder,
      updateReminder,
      completeReminder,
      snoozeReminder,
      addGoal,
      updateSettings,
      setDisplayedBalance,
      clearAllData,
    }),
    [
      transactions,
      tasks,
      reminders,
      goals,
      settings,
      initialBalance,
      resolvedTheme,
      toasts,
      showToast,
      clearAllData,
      addTransaction,
      removeTransaction,
      updateTransaction,
      addTask,
      toggleTask,
      addReminder,
      updateReminder,
      completeReminder,
      snoozeReminder,
      addGoal,
      updateSettings,
      setDisplayedBalance,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp тек AppProvider ішінде қолданылады');
  return ctx;
}
