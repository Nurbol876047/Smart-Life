"""Backend конфигурациясы — мәндер .env файлынан оқылады (.env.example — үлгі)."""

from __future__ import annotations

import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parent.parent / ".env")

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "").strip()
GEMINI_MODEL = os.environ.get("GEMINI_MODEL", "").strip() or "gemini-3.6-flash"

# CORS: үтірмен бөлінген фронтенд URL-дерінің тізімі (Vercel продакшен + preview
# домендер). Әдепкі бойынша тек локал dev сервер рұқсат етіледі.
# Мыс: FRONTEND_ORIGINS=https://smart-life.vercel.app,https://smart-life-git-main.vercel.app
_default_origins = "http://localhost:5173"
FRONTEND_ORIGINS = [
    origin.strip()
    for origin in os.environ.get("FRONTEND_ORIGINS", _default_origins).split(",")
    if origin.strip()
]

# Қазақстанның бірыңғай сағат белдеуі (2024 реформасынан кейінгі канондық IANA атауы).
# Әр Gemini промптына осы белдеу бойынша ағымдағы күн/уақыт қосылады (services/ai/client.py).
APP_TIMEZONE = "Asia/Qyzylorda"
