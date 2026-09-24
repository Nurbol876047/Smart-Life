"""FastAPI роутерлер арасында ортақ қолданылатын Depends-тер."""

from __future__ import annotations

from typing import Optional

from fastapi import Depends, Header

from services.ai.errors import RateLimitExceededError
from services.ai.rate_limiter import rate_limiter


def current_user_id(x_user_id: Optional[str] = Header(default=None)) -> str:
    # TODO: нақты аутентификация қосылғанда осы жерден JWT/session арқылы алу керек
    return x_user_id or "demo-user"


def enforce_rate_limit(user_id: str = Depends(current_user_id)) -> str:
    allowed, retry_after = rate_limiter.check(user_id)
    if not allowed:
        raise RateLimitExceededError(retry_after)
    return user_id
