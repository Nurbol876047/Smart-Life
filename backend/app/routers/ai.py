"""Smart Life-тің ИИ (Gemini) арқылы жұмыс істейтін маршруттары."""

from __future__ import annotations

from typing import List, Literal

from fastapi import APIRouter, Depends, File, UploadFile
from pydantic import BaseModel, Field

from app.deps import current_user_id, enforce_rate_limit
from services.ai.chat import ask_finance_assistant
from services.ai.client import generate_json
from services.ai.errors import AmountNotFoundError, InvalidReceiptFileError
from services.ai.receipt_parser import parse_receipt_image
from services.ai.schemas import ParseReceiptResult, ParseTransactionResult
from services.ai.transaction_parser import parse_transaction_text
from services.categorization import remember_category, suggest_category

router = APIRouter(prefix="/api/ai", tags=["ai"])

ALLOWED_RECEIPT_MIME_TYPES = {
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/heic",
    "image/heif",
}
MAX_RECEIPT_SIZE_BYTES = 10 * 1024 * 1024  # 10 МБ

# Позициялар қосындысы total-дан осы пайыздан көп ауытқыса — "тексеріңіз" белгісі қойылады
RECEIPT_MISMATCH_THRESHOLD = 0.10


# --- Еркін мәтіннен операция(лар) тану ---------------------------------------

class ParseTransactionRequest(BaseModel):
    text: str = Field(min_length=1, max_length=500)


@router.post("/parse-transaction", response_model=ParseTransactionResult)
def parse_transaction(
    payload: ParseTransactionRequest,
    user_id: str = Depends(enforce_rate_limit),
) -> ParseTransactionResult:
    result = parse_transaction_text(payload.text)
    if not result.transactions:
        raise AmountNotFoundError()
    return result


# --- Чек суретін тану ---------------------------------------------------------

@router.post("/parse-receipt", response_model=ParseReceiptResult)
async def parse_receipt(
    file: UploadFile = File(...),
    user_id: str = Depends(enforce_rate_limit),
) -> ParseReceiptResult:
    content_type = (file.content_type or "").lower()
    if content_type not in ALLOWED_RECEIPT_MIME_TYPES:
        raise InvalidReceiptFileError(
            "Сурет форматы қолдау көрсетілмейді. Тек JPG, PNG, WEBP немесе HEIC жүктеңіз."
        )

    declared_size = getattr(file, "size", None)
    if declared_size is not None and declared_size > MAX_RECEIPT_SIZE_BYTES:
        raise InvalidReceiptFileError("Файл тым үлкен. Ең көбі 10 МБ дейінгі суретті жүктеңіз.")

    image_bytes = await file.read()
    if not image_bytes:
        raise InvalidReceiptFileError("Файл бос немесе оқылмады. Қайта жүктеп көріңіз.")
    if len(image_bytes) > MAX_RECEIPT_SIZE_BYTES:
        raise InvalidReceiptFileError("Файл тым үлкен. Ең көбі 10 МБ дейінгі суретті жүктеңіз.")

    # Ескерту: image_bytes тек осы функция аясында жадта өмір сүреді — дискіге
    # де, тұрақты сақтауға да ешқашан жазылмайды (талап бойынша — пайдаланушы
    # "Сақтау" баспаса, чек фотосы сақталмауы керек; біз оны мүлдем сақтамаймыз).
    result = parse_receipt_image(image_bytes, content_type)

    items_sum = sum(item.price for item in result.items)
    needs_review = result.confidence < 0.7
    if result.total <= 0:
        needs_review = True
    elif result.items:
        mismatch = abs(items_sum - result.total) / result.total
        if mismatch > RECEIPT_MISMATCH_THRESHOLD:
            needs_review = True

    return ParseReceiptResult(**result.model_dump(), needs_review=needs_review)


# --- Автокатегоризация --------------------------------------------------------

class CategorizeRequest(BaseModel):
    description: str = Field(min_length=1, max_length=200)
    type: Literal["income", "expense"] = "expense"


class CategorizeResponse(BaseModel):
    category: str
    confidence: float
    source: Literal["cache", "ai"]


@router.post("/categorize", response_model=CategorizeResponse)
def categorize(
    payload: CategorizeRequest,
    user_id: str = Depends(enforce_rate_limit),
) -> CategorizeResponse:
    category, confidence, source = suggest_category(user_id, payload.description, payload.type)
    return CategorizeResponse(category=category, confidence=confidence, source=source)


class RememberCategoryRequest(BaseModel):
    description: str = Field(min_length=1, max_length=200)
    category: str


@router.post("/categorize/remember")
def remember(
    payload: RememberCategoryRequest,
    user_id: str = Depends(current_user_id),
) -> dict:
    # ИИ шақырмайды — тек пайдаланушының соңғы (растаған/түзеткен) таңдауын
    # жазады, сол себепті рейт-лимитке жатпайды.
    remember_category(user_id, payload.description, payload.category)
    return {"status": "ok"}


# --- Қаржылық кеңес (демо мысал) ----------------------------------------------

class FinanceTip(BaseModel):
    summary: str = Field(description="Бір сөйлемдік қорытынды, қазақ тілінде")
    tip: str = Field(description="Нақты, іске асыруға болатын кеңес, қазақ тілінде")


class TipRequest(BaseModel):
    context: str = Field(description="Жеке қаржы жағдайының қысқаша сипаттамасы (санат/сома т.б.)")


@router.post("/finance-tip", response_model=FinanceTip)
def finance_tip(payload: TipRequest, user_id: str = Depends(enforce_rate_limit)) -> FinanceTip:
    prompt = (
        "Сен — Smart Life қосымшасының қаржылық көмекшісісің. Төмендегі жағдайға "
        "қысқа әрі нақты кеңес бер. Тек қазақ тілінде жауап бер.\n\n"
        f"Жағдай: {payload.context}"
    )
    return generate_json(prompt, FinanceTip)


# --- AI көмекші чаты (тек қаржы тақырыбында) -----------------------------------

class ChatHistoryItem(BaseModel):
    role: Literal["user", "assistant"]
    text: str = Field(min_length=1, max_length=2000)


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=1000)
    history: List[ChatHistoryItem] = Field(default_factory=list)


class ChatResponse(BaseModel):
    reply: str
    on_topic: bool


@router.post("/chat", response_model=ChatResponse)
def chat(payload: ChatRequest, user_id: str = Depends(enforce_rate_limit)) -> ChatResponse:
    history_pairs = [(item.role, item.text) for item in payload.history]
    result = ask_finance_assistant(payload.message, history_pairs)
    return ChatResponse(reply=result.reply, on_topic=result.on_topic)
