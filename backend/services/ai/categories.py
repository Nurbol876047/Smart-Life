"""
Пайдаланушы санаттарының тізімі.

Фронттағы src/data/mockData.js ішіндегі CATEGORIES массивімен қолмен
сәйкестендірілген — id-лер дәл сол болуы керек (food, transport, ...).
TODO: санаттар ортақ бэкенд көзіне (DB/конфиг) көшкенде осы дубляж жойылады.
"""

from __future__ import annotations

from typing import Literal

CATEGORIES = [
    {"id": "food", "label": "Азық-түлік", "kind": "expense"},
    {"id": "transport", "label": "Көлік", "kind": "expense"},
    {"id": "utilities", "label": "Коммуналдық", "kind": "expense"},
    {"id": "health", "label": "Денсаулық", "kind": "expense"},
    {"id": "education", "label": "Білім", "kind": "expense"},
    {"id": "fun", "label": "Ойын-сауық", "kind": "expense"},
    {"id": "salary", "label": "Жалақы", "kind": "income"},
    {"id": "other", "label": "Басқа", "kind": "both"},
]

CATEGORY_IDS = tuple(c["id"] for c in CATEGORIES)

# schemas.py-дегі CategoryId Literal-мен қолмен сәйкестендірілген (жоғарыдағы
# CATEGORY_IDS тізімі өзгерсе, сол жерді де өзгерту керек).
CategoryId = Literal["food", "transport", "utilities", "health", "education", "fun", "salary", "other"]


def categories_prompt_block() -> str:
    lines = []
    for c in CATEGORIES:
        suffix = " (тек кіріс)" if c["kind"] == "income" else ""
        lines.append(f"- {c['id']}: {c['label']}{suffix}")
    return "\n".join(lines)
