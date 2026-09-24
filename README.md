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

## Ескерту

Бұл — прототип сатысы. Транзакциялар/тапсырмалар/еске салғыштар әзірге
браузердің `localStorage`-інде сақталады (нақты дерекқор жоқ). ИИ функциялары
(фраза/чек арқылы операция қосу, автокатегоризация, чат-көмекші) нақты
бэкендке қосылған.
