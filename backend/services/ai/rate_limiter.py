"""Пайдаланушыға сағатына 30 ИИ-сұраныстан аспайтын шектеу (sliding window).

Қазір тек процесс жадында сақталады — бір uvicorn воркеріне ғана қолданылады.
TODO: бірнеше воркер/сервер болғанда Redis-те INCR + EXPIRE арқылы ортақ санақ жүргізу керек.
"""

from __future__ import annotations

import threading
import time
from collections import defaultdict, deque
from typing import Deque, Dict, Tuple

MAX_REQUESTS_PER_HOUR = 30
WINDOW_SECONDS = 60 * 60


class RateLimiter:
    def __init__(self, max_requests: int = MAX_REQUESTS_PER_HOUR, window_seconds: int = WINDOW_SECONDS):
        self._max_requests = max_requests
        self._window_seconds = window_seconds
        self._requests: Dict[str, Deque[float]] = defaultdict(deque)
        self._lock = threading.Lock()

    def check(self, user_id: str) -> Tuple[bool, int]:
        """(рұқсат па, келесі рұқсатқа дейінгі шамамен секунд) қайтарады."""
        now = time.monotonic()
        with self._lock:
            bucket = self._requests[user_id]
            cutoff = now - self._window_seconds
            while bucket and bucket[0] < cutoff:
                bucket.popleft()

            if len(bucket) >= self._max_requests:
                retry_after = int(bucket[0] + self._window_seconds - now) + 1
                return False, max(retry_after, 1)

            bucket.append(now)
            return True, 0


# Бүкіл қосымшаға бір дана — АІ endpoint-тері осыны Depends арқылы пайдаланады.
rate_limiter = RateLimiter()
