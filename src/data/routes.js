export const ROUTES = [
  { id: 'dashboard', label: 'Басты бет', icon: 'LayoutDashboard' },
  { id: 'transactions', label: 'Кіріс пен шығыс', icon: 'ArrowLeftRight' },
  { id: 'statistics', label: 'Статистика', icon: 'BarChart3' },
  { id: 'goals', label: 'Жинақ жоспары', icon: 'Target' },
  { id: 'dayplan', label: 'Күн жоспары', icon: 'CalendarCheck2' },
  { id: 'reminders', label: 'Еске салғыштар', icon: 'Bell' },
  { id: 'insights', label: 'Тиімділік', icon: 'Lightbulb' },
  { id: 'assistant', label: 'AI көмекші', icon: 'Bot' },
];

export const SETTINGS_ROUTE = { id: 'settings', label: 'Баптаулар', icon: 'Settings' };

// Мобильдегі төменгі панельдің 5 негізгі бөлімі + «Тағы»
export const MOBILE_MAIN_ROUTES = ['dashboard', 'transactions', 'statistics', 'dayplan'];
