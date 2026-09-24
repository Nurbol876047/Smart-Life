"""
Gemini кілтінде қолжетімді модельдерді тізіп шығарады.

Іске қосу (backend/ ішінен):
    python scripts/list_models.py

GEMINI_MODEL таңдау/тексеру үшін пайдаланыңыз — модель атаулары жиі жаңарып
тұрады, сол себепті .env ішіндегі мәнді осы скрипттің нәтижесіне қарап растаңыз.
"""

from __future__ import annotations

import os
import sys
from pathlib import Path

BACKEND_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BACKEND_ROOT))

from dotenv import load_dotenv  # noqa: E402

load_dotenv(BACKEND_ROOT / ".env")

from google import genai  # noqa: E402


def main() -> int:
    api_key = os.environ.get("GEMINI_API_KEY", "").strip()
    if not api_key:
        print("Қате: GEMINI_API_KEY табылмады. backend/.env файлын толтырыңыз "
              "(backend/.env.example — үлгі).")
        return 1

    client = genai.Client(api_key=api_key)

    try:
        models = list(client.models.list())
    except Exception as exc:  # noqa: BLE001
        print(f"Қате: модельдер тізімін алу мүмкін болмады — {type(exc).__name__}: {exc}")
        return 1

    if not models:
        print("Бұл кілтте қолжетімді модель табылмады.")
        return 0

    print(f"Қолжетімді модельдер ({len(models)}):\n")
    for m in models:
        name = getattr(m, "name", "?")
        methods = (
            getattr(m, "supported_actions", None)
            or getattr(m, "supported_generation_methods", None)
            or []
        )
        print(f"- {name}")
        if methods:
            print(f"    қолдайды: {', '.join(methods)}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
