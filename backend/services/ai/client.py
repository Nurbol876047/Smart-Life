"""
Gemini ИИ-клиенті — бүкіл қосымшаға бір дана (singleton).

Талаптар (осы модуль қамтамасыз етеді):
- google-genai кітапханасы (ескірген google-generativeai ЕМЕС).
- generate_json(prompt, schema, files=None) — structured output, нәтиже Pydantic
  моделі бойынша валидацияланады, қатесінде 1 қайталау, 30 секунд қатаң таймаут.
- Кез-келген ИИ қатесі AIUnavailableError-ге түрленеді (API қабаты оны
  {"error": "ai_unavailable", "message": "..."} пішініне ауыстырады).
- Кілт және толық сұраныс/жауап мәтіні логқа ЖАЗЫЛМАЙДЫ — тек уақыт пен қате түрі.
- Әр промптқа ағымдағы күн/уақыт және сағат белдеуі (Asia/Qyzylorda) автоматты қосылады.
"""

from __future__ import annotations

import logging
import time
from concurrent.futures import ThreadPoolExecutor
from concurrent.futures import TimeoutError as FutureTimeoutError
from datetime import datetime
from pathlib import Path
from typing import List, Optional, Tuple, Type, TypeVar
from zoneinfo import ZoneInfo

from google import genai
from google.genai import types as genai_types
from pydantic import BaseModel, ValidationError

from app.config import APP_TIMEZONE, GEMINI_API_KEY, GEMINI_MODEL

from .errors import AIUnavailableError

logger = logging.getLogger("smart_life.ai")

SchemaT = TypeVar("SchemaT", bound=BaseModel)

REQUEST_TIMEOUT_SECONDS = 30
MAX_ATTEMPTS = 2  # алғашқы әрекет + 1 қайталау
RETRY_DELAY_SECONDS = 1.0

# Gemini шақыруларын таймаутпен орындау үшін бөлек тред-пулы (SDK синхронды).
_executor = ThreadPoolExecutor(max_workers=4, thread_name_prefix="gemini")


class GeminiClient:
    """genai.Client-ті бір рет жасап, бүкіл қосымша бойы қайта пайдаланамыз."""

    _instance: Optional["GeminiClient"] = None

    def __init__(self):
        if not GEMINI_API_KEY:
            raise RuntimeError(
                "GEMINI_API_KEY орнатылмаған. backend/.env файлын толтырыңыз "
                "(backend/.env.example — үлгі)."
            )
        # Ескерту: api_key мәні логқа немесе қате хабарына ешқашан шығарылмайды.
        self._client = genai.Client(api_key=GEMINI_API_KEY)

    @classmethod
    def instance(cls) -> "GeminiClient":
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    @property
    def raw(self) -> genai.Client:
        return self._client


def _current_context_line() -> str:
    now = datetime.now(ZoneInfo(APP_TIMEZONE))
    weekday = now.strftime("%A")
    return f"Ағымдағы күн мен уақыт: {now.strftime('%Y-%m-%d %H:%M')} ({APP_TIMEZONE}, {weekday})."


def _upload_files(client: genai.Client, files: Optional[List[str]]) -> list:
    """Локал файл жолдарын Google-дың Files API-іне жүктейді (сол жақта уақытша
    сақталады). Диск/файл қажет емес жағдайда (мыс. чек суреті) _inline_images
    қолданылады — ол ешқандай серверде сақталмайды."""
    uploaded = []
    if not files:
        return uploaded
    for path in files:
        p = Path(path)
        if not p.exists():
            logger.warning("ai_file_missing name=%s", p.name)
            continue
        uploaded.append(client.files.upload(file=str(p)))
    return uploaded


def _inline_images(images: Optional[List[Tuple[bytes, str]]]) -> list:
    """Сурет байттарын сұраныстың өзіне тікелей қосады — файл ретінде ешқайда
    (біздің серверге де, Google Files API-іне де) жүктелмейді/сақталмайды."""
    if not images:
        return []
    return [genai_types.Part.from_bytes(data=data, mime_type=mime) for data, mime in images]


def _call_gemini_once(
    prompt: str,
    schema: Type[SchemaT],
    files: Optional[List[str]],
    images: Optional[List[Tuple[bytes, str]]],
    model: str,
) -> SchemaT:
    client = GeminiClient.instance().raw

    contents: list = [f"{_current_context_line()}\n\n{prompt}"]
    contents.extend(_upload_files(client, files))
    contents.extend(_inline_images(images))

    config = genai_types.GenerateContentConfig(
        response_mime_type="application/json",
        response_schema=schema,
    )

    response = client.models.generate_content(
        model=model,
        contents=contents,
        config=config,
    )

    # Жаңа SDK көбіне дайын pydantic нысанын response.parsed ішінде қайтарады.
    parsed = getattr(response, "parsed", None)
    if isinstance(parsed, schema):
        return parsed

    text = getattr(response, "text", None)
    if not text:
        raise ValueError("Gemini бос жауап қайтарды")

    # Сақтық үшін қолмен де валидациялаймыз (SDK нұсқасы .parsed бермесе де жұмыс істеу үшін).
    return schema.model_validate_json(text)


def generate_json(
    prompt: str,
    schema: Type[SchemaT],
    files: Optional[List[str]] = None,
    *,
    images: Optional[List[Tuple[bytes, str]]] = None,
    model: Optional[str] = None,
) -> SchemaT:
    """
    Gemini-ге сұраныс жіберіп, нәтижені `schema` бойынша тексеріп қайтарады.

    - files: локал файл жолдарының тізімі (сурет/PDF және т.б.), міндетті емес.
    - images: (байттар, mime_type) жұптарының тізімі — дискіге/серверге
      жазылмай, тікелей сұранысқа енгізіледі (мыс. чек суреті).
    - Қате болса (желі, 30 секунд таймаут, JSON/схема валидациясы) — 1 рет
      қайта байқайды, содан кейін де сәтсіз болса AIUnavailableError көтереді.
    """
    used_model = model or GEMINI_MODEL
    last_error: Optional[Exception] = None

    for attempt in range(1, MAX_ATTEMPTS + 1):
        started = time.monotonic()
        try:
            future = _executor.submit(_call_gemini_once, prompt, schema, files, images, used_model)
            result = future.result(timeout=REQUEST_TIMEOUT_SECONDS)

            elapsed_ms = int((time.monotonic() - started) * 1000)
            logger.info(
                "ai_request_ok model=%s attempt=%d elapsed_ms=%d prompt_chars=%d",
                used_model, attempt, elapsed_ms, len(prompt),
            )
            return result

        except FutureTimeoutError as exc:
            elapsed_ms = int((time.monotonic() - started) * 1000)
            logger.error(
                "ai_request_timeout model=%s attempt=%d elapsed_ms=%d",
                used_model, attempt, elapsed_ms,
            )
            last_error = exc

        except ValidationError as exc:
            elapsed_ms = int((time.monotonic() - started) * 1000)
            logger.error(
                "ai_request_invalid_schema model=%s attempt=%d elapsed_ms=%d error_count=%d",
                used_model, attempt, elapsed_ms, len(exc.errors()),
            )
            last_error = exc

        except Exception as exc:  # noqa: BLE001 — сыртқы қызметтің кез-келген қатесін ұстаймыз
            elapsed_ms = int((time.monotonic() - started) * 1000)
            logger.error(
                "ai_request_failed model=%s attempt=%d elapsed_ms=%d error_type=%s",
                used_model, attempt, elapsed_ms, type(exc).__name__,
            )
            last_error = exc

        if attempt < MAX_ATTEMPTS:
            time.sleep(RETRY_DELAY_SECONDS)

    raise AIUnavailableError(
        "ИИ қызметі уақытша қолжетімсіз. Сәл кейінірек қайталап көріңіз.",
        cause=last_error,
    )
