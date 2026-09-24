// ---------------------------------------------------------------------------
// SMART LIFE — демо-деректер модулі.
// Барлық "дерекқор" осы бір файлда. Бэкенд (FastAPI/Flask) қосылғанда
// бұл модульдің орнына API-клиент келеді, ал компоненттер өзгермейді —
// сол себепті әр экранда TODO: GET/POST /api/... белгілері қалдырылған.
// ---------------------------------------------------------------------------

export const USER = {
  name: 'Асхат',
  currency: '₸',
  language: 'kk',
  // 'system' — құрылғы теңшеуін қадағалайды, 'light'/'dark' — қолмен таңдалған
  // Әдепкі — ашық (light) тема
  theme: 'light',
  notificationsEnabled: true,
};

// Ағымдағы балансты санау үшін бастапқы нүкте.
// TODO: GET /api/account/balance
export const INITIAL_BALANCE = 680420;

export const CATEGORIES = [
  { id: 'food', label: 'Азық-түлік', kind: 'expense', icon: 'ShoppingCart' },
  { id: 'transport', label: 'Көлік', kind: 'expense', icon: 'Car' },
  { id: 'utilities', label: 'Коммуналдық', kind: 'expense', icon: 'Home' },
  { id: 'health', label: 'Денсаулық', kind: 'expense', icon: 'HeartPulse' },
  { id: 'education', label: 'Білім', kind: 'expense', icon: 'GraduationCap' },
  { id: 'fun', label: 'Ойын-сауық', kind: 'expense', icon: 'Clapperboard' },
  { id: 'salary', label: 'Жалақы', kind: 'income', icon: 'Wallet' },
  { id: 'other', label: 'Басқа', kind: 'both', icon: 'MoreHorizontal' },
];

export function categoryLabel(id) {
  return CATEGORIES.find((c) => c.id === id)?.label ?? 'Басқа';
}

// Соңғы 3 ай ішіндегі операциялар (шілде–қыркүйек 2026).
// TODO: GET /api/transactions?from=...&to=...
export const TRANSACTIONS = [
  // Шілде
  { id: 't01', date: new Date(2026, 6, 3), type: 'income', category: 'salary', description: 'Жалақыны алу', amount: 450000 },
  { id: 't02', date: new Date(2026, 6, 4), type: 'expense', category: 'other', description: 'Пәтер жалдау ақысы', amount: 150000 },
  { id: 't03', date: new Date(2026, 6, 5), type: 'expense', category: 'utilities', description: 'Коммуналдық қызметтер', amount: 28500 },
  { id: 't04', date: new Date(2026, 6, 8), type: 'expense', category: 'food', description: 'Апталық азық-түлік', amount: 32400 },
  { id: 't05', date: new Date(2026, 6, 10), type: 'expense', category: 'transport', description: 'Жанармай', amount: 15000 },
  { id: 't06', date: new Date(2026, 6, 14), type: 'expense', category: 'fun', description: 'Кинотеатр', amount: 14000 },
  { id: 't07', date: new Date(2026, 6, 17), type: 'expense', category: 'health', description: 'Дәрі-дәрмек', amount: 9500 },
  { id: 't08', date: new Date(2026, 6, 21), type: 'expense', category: 'education', description: 'Онлайн курс', amount: 25000 },
  { id: 't09', date: new Date(2026, 6, 27), type: 'expense', category: 'food', description: 'Дүкен', amount: 21300 },

  // Тамыз
  { id: 't10', date: new Date(2026, 7, 3), type: 'income', category: 'salary', description: 'Жалақыны алу', amount: 450000 },
  { id: 't11', date: new Date(2026, 7, 4), type: 'expense', category: 'other', description: 'Пәтер жалдау ақысы', amount: 150000 },
  { id: 't12', date: new Date(2026, 7, 5), type: 'expense', category: 'utilities', description: 'Коммуналдық қызметтер', amount: 31200 },
  { id: 't13', date: new Date(2026, 7, 8), type: 'expense', category: 'food', description: 'Апталық азық-түлік', amount: 27600 },
  { id: 't14', date: new Date(2026, 7, 9), type: 'expense', category: 'transport', description: 'Жанармай', amount: 15000 },
  { id: 't15', date: new Date(2026, 7, 12), type: 'income', category: 'other', description: 'Фриланс жоба', amount: 45000 },
  { id: 't16', date: new Date(2026, 7, 13), type: 'expense', category: 'fun', description: 'Мейрамханада кешкі ас', amount: 19000 },
  { id: 't17', date: new Date(2026, 7, 16), type: 'expense', category: 'health', description: 'Тіс дәрігері', amount: 14000 },
  { id: 't18', date: new Date(2026, 7, 19), type: 'expense', category: 'food', description: 'Дүкен', amount: 23100 },
  { id: 't19', date: new Date(2026, 7, 24), type: 'expense', category: 'transport', description: 'Такси', amount: 9000 },

  // Қыркүйек (24-іне дейін)
  { id: 't20', date: new Date(2026, 8, 3), type: 'income', category: 'salary', description: 'Жалақыны алу', amount: 450000 },
  { id: 't21', date: new Date(2026, 8, 4), type: 'expense', category: 'other', description: 'Пәтер жалдау ақысы', amount: 150000 },
  { id: 't22', date: new Date(2026, 8, 5), type: 'expense', category: 'utilities', description: 'Коммуналдық қызметтер', amount: 29800 },
  { id: 't23', date: new Date(2026, 8, 8), type: 'expense', category: 'food', description: 'Апталық азық-түлік', amount: 26400 },
  { id: 't24', date: new Date(2026, 8, 10), type: 'expense', category: 'fun', description: 'Концерт билеті', amount: 22420 },
  { id: 't25', date: new Date(2026, 8, 12), type: 'expense', category: 'transport', description: 'Жанармай', amount: 15000 },
  { id: 't26', date: new Date(2026, 8, 15), type: 'expense', category: 'health', description: 'Дәрі-дәрмек', amount: 6500 },
  { id: 't27', date: new Date(2026, 8, 18), type: 'income', category: 'other', description: 'Фриланс жоба', amount: 50000 },
  { id: 't28', date: new Date(2026, 8, 20), type: 'expense', category: 'food', description: 'Дүкен', amount: 24700 },
  { id: 't29', date: new Date(2026, 8, 23), type: 'expense', category: 'other', description: 'Сыйлық', amount: 8000 },
  { id: 't30', date: new Date(2026, 8, 24), type: 'expense', category: 'transport', description: 'Такси', amount: 8000 },
];

// Күн жоспары / Басты беттегі "Бүгінгі істер" тізімі.
// Мектеп өміріне сай мысалдар. Барлығы done:false — пайдаланушы белгіні
// өзі қоюы керек, алдын ала "орындалды" деп көрсетілмейді.
// TODO: GET /api/tasks?from=...&to=...
export const TASKS = [
  // Дс 21.09
  { id: 'k01', date: new Date(2026, 8, 21), time: '08:30', endTime: '09:00', title: 'Мектепке дайындалу', priority: 'Орташа', done: false },
  { id: 'k02', date: new Date(2026, 8, 21), time: '15:00', endTime: '16:00', title: 'Үй жұмысын орындау', priority: 'Жоғары', done: false },
  // Сс 22.09
  { id: 'k03', date: new Date(2026, 8, 22), time: '09:00', endTime: '11:00', title: 'Тарихтан реферат жазу', priority: 'Жоғары', done: false },
  { id: 'k04', date: new Date(2026, 8, 22), time: '17:00', endTime: '18:00', title: 'Спорт секциясы', priority: 'Орташа', done: false },
  // Ср 23.09
  { id: 'k05', date: new Date(2026, 8, 23), time: '08:00', endTime: '08:30', title: 'Таңғы жаттығу', priority: 'Төмен', done: false },
  { id: 'k06', date: new Date(2026, 8, 23), time: '14:00', endTime: '15:00', title: 'Топтық жобаны талқылау', priority: 'Жоғары', done: false },
  // Бс 24.09 — бүгін
  { id: 'k07', date: new Date(2026, 8, 24), time: '07:30', endTime: '08:00', title: 'Таңғы жаттығу', priority: 'Төмен', done: false },
  { id: 'k08', date: new Date(2026, 8, 24), time: '08:30', endTime: '09:00', title: 'Мектепке дайындалу', priority: 'Орташа', done: false },
  { id: 'k09', date: new Date(2026, 8, 24), time: '10:00', endTime: '12:00', title: 'Физикадан тест', priority: 'Жоғары', done: false },
  { id: 'k10', date: new Date(2026, 8, 24), time: '13:00', endTime: '14:00', title: 'Түскі ас', priority: 'Орташа', done: false },
  { id: 'k11', date: new Date(2026, 8, 24), time: '15:00', endTime: '16:00', title: 'Ағылшын тілі үй жұмысы', priority: 'Жоғары', done: false },
  { id: 'k12', date: new Date(2026, 8, 24), time: '18:00', endTime: '19:00', title: 'Спорт секциясы', priority: 'Орташа', done: false },
  { id: 'k13', date: new Date(2026, 8, 24), time: '20:30', endTime: '21:00', title: 'Кітап оқу', priority: 'Төмен', done: false },
  // Жм 25.09
  { id: 'k14', date: new Date(2026, 8, 25), time: '11:00', endTime: '12:00', title: 'Жобаны тапсыру', priority: 'Жоғары', done: false },
  { id: 'k15', date: new Date(2026, 8, 25), time: '19:00', endTime: '21:00', title: 'Достармен кездесу', priority: 'Орташа', done: false },
  // Сб 26.09
  { id: 'k16', date: new Date(2026, 8, 26), time: '10:00', endTime: '11:00', title: 'Кітапханаға бару', priority: 'Орташа', done: false },
  // Жс 27.09
  { id: 'k17', date: new Date(2026, 8, 27), time: '12:00', endTime: '13:00', title: 'Отбасымен түскі ас', priority: 'Төмен', done: false },
];

// Мектеп өміріне сай еске салғыштар.
// TODO: GET /api/reminders
export const REMINDERS = [
  { id: 'r01', text: 'Ағылшын тілінен үй жұмысын тапсыру', datetime: new Date(2026, 8, 24, 18, 0), repeat: 'Бір рет', done: false },
  { id: 'r02', text: 'Ата-аналар жиналысы', datetime: new Date(2026, 8, 25, 12, 0), repeat: 'Бір рет', done: false },
  { id: 'r03', text: 'Кітапханаға кітап қайтару', datetime: new Date(2026, 8, 26, 10, 0), repeat: 'Бір рет', done: false },
  { id: 'r04', text: 'Спорт секциясы абонементін төлеу', datetime: new Date(2026, 8, 27, 9, 0), repeat: 'Ай сайын', done: false },
  { id: 'r05', text: 'Топтық жобаны тапсыру мерзімі', datetime: new Date(2026, 8, 30, 9, 0), repeat: 'Бір рет', done: false },
  { id: 'r06', text: 'Математикадан бақылау жұмысы', datetime: new Date(2026, 9, 5, 9, 0), repeat: 'Бір рет', done: false },
  { id: 'r07', text: 'Оқу құралдарын сатып алу', datetime: new Date(2026, 9, 2, 17, 0), repeat: 'Бір рет', done: false },
  { id: 'r08', text: 'Дене шынықтырудан норматив тапсыру', datetime: new Date(2026, 9, 12, 9, 0), repeat: 'Бір рет', done: false },
];

// Мысал ретінде дайын мақсат жоқ — пайдаланушы "+ Жаңа мақсат" арқылы
// атауы мен сомасын өзі енгізеді, қалғанын қолданба өзі есептейді.
// TODO: GET /api/savings-goals
export const SAVINGS_GOALS = [];

export const PRIORITY_ORDER = { 'Жоғары': 3, 'Орташа': 2, 'Төмен': 1 };
