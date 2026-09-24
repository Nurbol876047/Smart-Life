"""Gemini-ден structured output алу үшін қолданылатын Pydantic модельдері."""

from __future__ import annotations

from typing import List, Literal, Optional

from pydantic import BaseModel, Field

from .categories import CategoryId


class ParsedTransaction(BaseModel):
    type: Literal["income", "expense"] = Field(description="Операция түрі")
    # Ескерту: Gemini-дің response_schema конвертері exclusiveMinimum-ды
    # қолдамайды (тек minimum/maximum), сол себепті gt емес, ge қолданылады.
    amount: int = Field(ge=1, description="Сома, теңгемен, бүтін сан")
    category: CategoryId = Field(description="Санат id, тек тізімнен")
    date: str = Field(
        pattern=r"^\d{4}-\d{2}-\d{2}$",
        description="Операция күні YYYY-MM-DD пішінінде",
    )
    note: str = Field(description="Қысқа сипаттама, пайдаланушы тілінде")
    confidence: float = Field(ge=0, le=1, description="Модельдің сенімділік дәрежесі")


class ParseTransactionResult(BaseModel):
    transactions: List[ParsedTransaction] = Field(default_factory=list)


class SuggestCategoryResult(BaseModel):
    category: CategoryId
    confidence: float = Field(ge=0, le=1)


class ReceiptItem(BaseModel):
    name: str = Field(description="Тауар/қызмет атауы, чекте жазылғандай")
    price: int = Field(ge=1, description="Осы позицияның бағасы, теңгемен")


class GeminiReceiptResult(BaseModel):
    """Тек Gemini-ге арналған схема — needs_review осында жоқ, ол Python-да
    (позициялар қосындысын total-мен салыстырып) есептеледі, модельден сұралмайды."""

    store: Optional[str] = Field(default=None, description="Дүкен/мекеме атауы, оқылса")
    date: Optional[str] = Field(
        default=None,
        pattern=r"^\d{4}-\d{2}-\d{2}$",
        description="Чектегі күн YYYY-MM-DD пішінінде, оқылса",
    )
    total: int = Field(ge=0, description="Жалпы сома, теңгемен; оқылмаса 0")
    items: List[ReceiptItem] = Field(default_factory=list, description="Оқылатын позициялар тізімі")
    category: CategoryId = Field(description="Ұсынылған санат id, тек тізімнен")
    confidence: float = Field(ge=0, le=1, description="Модельдің жалпы сенімділік дәрежесі")


class ParseReceiptResult(GeminiReceiptResult):
    """API жауабы: жоғарыдағы өрістер + Python есептеген needs_review."""

    needs_review: bool = Field(default=False, description="Тексеру қажет пе (позициялар/total сәйкессіздігі)")


class ChatReply(BaseModel):
    reply: str = Field(description="Көмекшінің жауабы, қазақ тілінде")
    on_topic: bool = Field(
        description="Сұрақ жеке қаржы тақырыбына қатысты ма (жалған болса, reply — сыпайы бас тарту)"
    )
