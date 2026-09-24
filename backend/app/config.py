"""Backend конфигурациясы — мәндер .env файлынан оқылады (.env.example — үлгі)."""

from __future__ import annotations

import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parent.parent / ".env")

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "").strip()
GEMINI_MODEL = os.environ.get("GEMINI_MODEL", "").strip() or "gemini-3.6-flash"

# Қазақстанның бірыңғай сағат белдеуі (2024 реформасынан кейінгі канондық IANA атауы).
# Әр Gemini промптына осы белдеу бойынша ағымдағы күн/уақыт қосылады (services/ai/client.py).
APP_TIMEZONE = "Asia/Qyzylorda"
