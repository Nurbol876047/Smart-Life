"""
Санатты автоматты анықтау: алдымен пайдаланушының бұрын сақталған
ережелерінен (кэш) іздейді, таппаса — Gemini-ден сұрайды.

Сақтау орны — жәй JSON файл (бір процесс/демо үшін жеткілікті, "Magnum",
"Яндекс Go" сияқты сипаттамалар үшін бірден кэштен қайтарады).
TODO: production-да нақты дерекқорға (мыс. Postgres "user_category_rules"
кестесі) көшіру керек — интерфейс (get/remember) сол кезде өзгермейді.
"""

from __future__ import annotations

import json
import re
import threading
from pathlib import Path
from typing import Optional, Tuple

from services.ai.categories import categories_prompt_block
from services.ai.client import generate_json
from services.ai.schemas import SuggestCategoryResult

DATA_FILE = Path(__file__).resolve().parent.parent / "data" / "category_rules.json"
_lock = threading.Lock()


def _normalize(description: str) -> str:
    return re.sub(r"\s+", " ", description.strip().lower())


def _load_all() -> dict:
    if not DATA_FILE.exists():
        return {}
    try:
        return json.loads(DATA_FILE.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError):
        return {}


def _save_all(data: dict) -> None:
    DATA_FILE.parent.mkdir(parents=True, exist_ok=True)
    DATA_FILE.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")


def get_cached_category(user_id: str, description: str) -> Optional[str]:
    key = _normalize(description)
    if not key:
        return None
    with _lock:
        data = _load_all()
    return data.get(user_id, {}).get(key)


def remember_category(user_id: str, description: str, category: str) -> None:
    """Пайдаланушы санатты растаса/түзетсе — осы сипаттама үшін ережені сақтайды."""
    key = _normalize(description)
    if not key:
        return
    with _lock:
        data = _load_all()
        data.setdefault(user_id, {})[key] = category
        _save_all(data)


def suggest_category(user_id: str, description: str, tx_type: str) -> Tuple[str, float, str]:
    """(category, confidence, source) қайтарады. source: 'cache' немесе 'ai'."""
    cached = get_cached_category(user_id, description)
    if cached:
        return cached, 1.0, "cache"

    prompt = (
        "Сен — қаржылық операцияға санат таңдайтын көмекшісің.\n"
        f"Санаттар:\n{categories_prompt_block()}\n\n"
        f"Операция түрі: {'кіріс' if tx_type == 'income' else 'шығыс'}\n"
        f'Сипаттама: "{description}"\n\n'
        "Осы сипаттамаға ең сәйкес келетін санат id-ін таңда."
    )
    result: SuggestCategoryResult = generate_json(prompt, SuggestCategoryResult)
    return result.category, result.confidence, "ai"
