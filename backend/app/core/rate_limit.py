"""
Lightweight in-process rate limiter.

Production deployments should back this with Redis (see infra/README.md for
the swap-in notes); the in-memory implementation here is intentionally simple
so the whole stack runs with zero extra infrastructure in dev/eval, while
still providing real protection against runaway AI-endpoint costs and auth
brute-forcing in a single-process deployment.
"""
import time
from collections import defaultdict, deque

from fastapi import HTTPException, status


class SlidingWindowLimiter:
    def __init__(self) -> None:
        self._hits: dict[str, deque] = defaultdict(deque)

    def check(self, key: str, limit_per_minute: int) -> None:
        now = time.time()
        window = self._hits[key]
        while window and now - window[0] > 60:
            window.popleft()
        if len(window) >= limit_per_minute:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Rate limit exceeded. Please slow down and try again shortly.",
            )
        window.append(now)


limiter = SlidingWindowLimiter()
