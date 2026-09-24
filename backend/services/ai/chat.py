"""Қаржылық ИИ-көмекші чаты — тақырыбы тек жеке қаржымен шектелген."""

from __future__ import annotations

from typing import List, Tuple

from .client import generate_json
from .schemas import ChatReply

MAX_HISTORY_MESSAGES = 10  # промпт өлшемін шектеу үшін соңғы N хабарлама ғана алынады

SYSTEM_PROMPT = (
    "Сен — Smart Life қосымшасының қаржылық ИИ-көмекшісісің.\n\n"
    "ҚАТАҢ ШЕКТЕУ: тек жеке қаржы тақырыбындағы сұрақтарға ғана жауап бер — "
    "бюджет жоспарлау, үнемдеу, шығыс/кіріс талдау, қарыз/несиені басқару, "
    "жинақ мақсаттары, салық негіздері, қаржылық әдеттер. \n"
    "- Нақты акция/криптовалюта/белгілі бір қаржы құралын сатып алу туралы "
    "кеңес БЕРМЕ — тек жалпы қаржылық сауаттылық түсіндір.\n"
    "- Сұрақ қаржыға қатысы жоқ болса (бағдарламалау, медицина, саясат, "
    "жалпы білім, ойын-сауық және т.б.) — on_topic=false қой және reply "
    "өрісінде сыпайы түрде бас тартып, пайдаланушыны қаржылық сұрақ қоюға шақыр.\n"
    "- Жауап қысқа, нақты және түсінікті болсын. Тек қазақ тілінде жауап бер.\n"
)


def _build_prompt(message: str, history: List[Tuple[str, str]]) -> str:
    parts = [SYSTEM_PROMPT]

    trimmed_history = history[-MAX_HISTORY_MESSAGES:]
    if trimmed_history:
        parts.append("Диалог тарихы:")
        for role, text in trimmed_history:
            speaker = "Пайдаланушы" if role == "user" else "Көмекші"
            parts.append(f"{speaker}: {text}")
        parts.append("")

    parts.append(f"Жаңа сұрақ: {message}")
    return "\n".join(parts)


def ask_finance_assistant(message: str, history: List[Tuple[str, str]]) -> ChatReply:
    return generate_json(_build_prompt(message, history), ChatReply)
