# Smart Life — Қаржылық көмекші және ақылды жоспарлаушы

Қазақ тіліндегі жеке қаржы/күнделікті жоспарлау қосымшасы. Фронтенд — React +
Vite (демо-деректер `localStorage`-те сақталады), бэкенд — FastAPI + Google
Gemini (`google-genai`) арқылы ИИ функциялары: фразамен операция қосу, чек
суретін тану, автокатегоризация, қаржылық чат-көмекші.

## Құрылым

```
├── src/            React фронтенд (экрандар, компоненттер, mock-деректер)
├── backend/         FastAPI бэкенд (Gemini ИИ-қызметтері)
│   ├── app/          FastAPI қосымшасы, роутерлер, конфиг
│   ├── services/     Gemini клиенті, промпттар, категоризация
│   └── scripts/      list_models.py — кілттегі қолжетімді модельдер
└── dist/            Прод билд (npm run build нәтижесі)
```

## Фронтенд іске қосу

```bash
npm install
npm run dev
```

`http://localhost:5173` мекенжайында ашылады.

## Бэкенд іске қосу

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # GEMINI_API_KEY және GEMINI_MODEL толтырыңыз
uvicorn app.main:app --reload --port 8000
```

Қолжетімді модельдерді тексеру: `python scripts/list_models.py`

## Деплой (Vercel + Railway)

Фронтенд пен бэкенд бөлек орналастырылады — фронтенд статикалық файл
ретінде Vercel-де, ал бэкенд нақты процесс ретінде Railway/Render сияқты
Python-ты қолдайтын платформада (Vercel-дің serverless функциялары мұнда
жарамайды: бэкендте фондық тред-пул мен локал файл-кэш бар).

**Бэкенд (Railway немесе Render):**
1. Жаңа қызмет жасап, осы репоны қосыңыз, root/каталог ретінде `backend/`
   көрсетіңіз (Railway: Root Directory, Render: Root Directory).
2. Start command автоматты `backend/Procfile`-ден оқылады:
   `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.
3. Environment variables: `GEMINI_API_KEY`, `GEMINI_MODEL` (мыс.
   `gemini-3.6-flash`), деплой соңында алынған фронтенд URL-ін білгенде —
   `FRONTEND_ORIGINS=https://<жоба-атауы>.vercel.app`.
4. Деплойдан кейін берілетін URL-ді сақтаңыз (мыс.
   `https://smart-life-backend.up.railway.app`) — келесі қадамда керек.

**Фронтенд (Vercel):**
1. "+ New" → "Project" → осы репоны импорттаңыз. Vercel Vite-ті өзі
   таниды: Framework Preset — Vite, Build Command — `npm run build`,
   Output Directory — `dist`. Бұл **статикалық сайт**, серверлік
   функциялар қажет емес.
2. Environment Variables-те қосыңыз: `VITE_API_BASE_URL` = жоғарыда алған
   бэкенд URL-і (мыс. `https://smart-life-backend.up.railway.app`, соңында
   `/` жоқ).
3. Deploy. Алынған Vercel URL-ді бэкендтегі `FRONTEND_ORIGINS`-ке қосып,
   бэкендті қайта деплой етіңіз (CORS үшін).

## Ескерту

Бұл — прототип сатысы. Транзакциялар/тапсырмалар/еске салғыштар әзірге
браузердің `localStorage`-інде сақталады (нақты дерекқор жоқ). ИИ функциялары
(фраза/чек арқылы операция қосу, автокатегоризация, чат-көмекші) нақты
бэкендке қосылған. Санат кэші (`backend/data/category_rules.json`) — жәй
файл, көп PaaS платформаларында (Railway/Render) файлдық жүйе әр деплойда
тазарады, яғни бұл кэш уақытша ғана.
