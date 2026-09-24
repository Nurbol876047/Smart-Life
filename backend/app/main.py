"""
Smart Life backend — минималды FastAPI қосымшасы.

Маршруттар app/routers/ ішінде ұйымдастырылған. Басқа CRUD маршруттар
(транзакциялар, тапсырмалар, еске салғыштар) кейінірек осында қосылады —
фронттағы src/data/mockData.js сол кезде осы API-ге ауыстырылады.

Іске қосу (backend/ ішінен):
    uvicorn app.main:app --reload --port 8000
"""

from __future__ import annotations

import logging

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import FRONTEND_ORIGINS
from app.routers.ai import router as ai_router
from services.ai.errors import (
    AIUnavailableError,
    AmountNotFoundError,
    InvalidReceiptFileError,
    RateLimitExceededError,
    ai_error_response,
    amount_not_found_response,
    invalid_receipt_file_response,
    rate_limit_response,
)

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
# google-genai кітапханасының ақпараттық (қатеге қатысы жоқ) ескертулерін басу
logging.getLogger("google_genai").setLevel(logging.ERROR)

app = FastAPI(title="Smart Life API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=FRONTEND_ORIGINS,
    # Vercel preview деплойлары әр branch/PR үшін жаңа URL жасайды —
    # FRONTEND_ORIGINS тізімін әр жолы жаңартпау үшін *.vercel.app рұқсат етілген.
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ai_router)


@app.exception_handler(AIUnavailableError)
async def ai_unavailable_handler(request: Request, exc: AIUnavailableError):
    return JSONResponse(status_code=503, content=ai_error_response(exc.message_kk))


@app.exception_handler(RateLimitExceededError)
async def rate_limit_handler(request: Request, exc: RateLimitExceededError):
    return JSONResponse(status_code=429, content=rate_limit_response(exc.retry_after_seconds))


@app.exception_handler(AmountNotFoundError)
async def amount_not_found_handler(request: Request, exc: AmountNotFoundError):
    return JSONResponse(status_code=422, content=amount_not_found_response())


@app.exception_handler(InvalidReceiptFileError)
async def invalid_receipt_file_handler(request: Request, exc: InvalidReceiptFileError):
    return JSONResponse(status_code=422, content=invalid_receipt_file_response(exc.message_kk))


@app.get("/api/health")
def health():
    return {"status": "ok"}
