from __future__ import annotations

import logging
import time


logger = logging.getLogger("api.requests")


class RequestLoggingMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        start = time.perf_counter()
        response = self.get_response(request)
        elapsed_ms = (time.perf_counter() - start) * 1000

        path = request.path
        if path.startswith("/api/") or path == "/":
            logger.info(
                "%s %s [%s] -> %s (%.1f ms)",
                request.method,
                path,
                request.headers.get("X-Client-Source", "unknown"),
                getattr(response, "status_code", "unknown"),
                elapsed_ms,
            )

        return response