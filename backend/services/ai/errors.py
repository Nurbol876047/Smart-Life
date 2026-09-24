"""AI қызметінің қателерін API жауабына ыңғайлы, қазақ тіліндегі пішінге түрлендіру."""

from __future__ import annotations

from typing import Optional


class AIUnavailableError(Exception):
    """Gemini-мен байланыс сәтсіз аяқталғанда көтеріледі (желі, таймаут, валидация қатесі)."""

    def __init__(self, message_kk: str, *, cause: Optional[Exception] = None):
        super().__init__(message_kk)
        self.message_kk = message_kk
        self.cause = cause


class RateLimitExceededError(Exception):
    """Пайдаланушы сағаттық ИИ-сұраныс лимитінен (30/сағат) асқанда көтеріледі."""

    def __init__(self, retry_after_seconds: int):
        super().__init__("AI hourly rate limit exceeded")
        self.retry_after_seconds = retry_after_seconds


class AmountNotFoundError(Exception):
    """Мәтіннен нақты сома табылмағанда көтеріледі — сома ойлап табылмайды."""


class InvalidReceiptFileError(Exception):
    """Жүктелген чек файлы форматқа/өлшемге сай келмегенде көтеріледі."""

    def __init__(self, message_kk: str):
        super().__init__(message_kk)
        self.message_kk = message_kk


def ai_error_response(message_kk: str) -> dict:
    """Техникалық тапсырмада көрсетілген дәл пішін."""
    return {"error": "ai_unavailable", "message": message_kk}


def rate_limit_response(retry_after_seconds: int) -> dict:
    return {
        "error": "rate_limited",
        "message": (
            "Сағаттық ИИ-сұраныс лимитіне жеттіңіз (30 сұраныс/сағат). "
            f"Шамамен {retry_after_seconds} секундтан кейін қайта көріңіз."
        ),
    }


def amount_not_found_response() -> dict:
    return {
        "error": "amount_not_found",
        "message": (
            "Сомасы табылмады. Мысалы: «такси 1500» немесе "
            "«дүкенде 4500 теңгеге нан, сүт алдым» деп жазып көріңіз."
        ),
    }


def invalid_receipt_file_response(message_kk: str) -> dict:
    return {"error": "invalid_file", "message": message_kk}
