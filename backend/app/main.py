import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.v1 import api_router
from app.core.config import settings
from app.middleware.security_headers import SecurityHeadersMiddleware

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("careerfound")

@asynccontextmanager
async def lifespan(_: FastAPI):
    # Makes a mis-set production deploy impossible to miss in the logs,
    # instead of surfacing weeks later as users who never got an email.
    for problem in settings.readiness_problems():
        logger.error("CONFIGURATION PROBLEM: %s", problem)
    yield


app = FastAPI(
    lifespan=lifespan,
    title=settings.APP_NAME,
    version="0.1.0",
    description="API for CareerFound, the tech career launchpad.",
)

app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.frontend_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    # `detail` is normally a string. Endpoints that need the client to react
    # to a specific situation (a resend cooldown, an expired link) pass a dict
    # with `message`, `code` and any extra fields instead; the extras are
    # carried through so the UI never has to parse prose.
    if isinstance(exc.detail, dict):
        error = {"code": f"http_{exc.status_code}", **exc.detail}
        error.setdefault("message", "Request failed")
    else:
        error = {"message": exc.detail, "code": f"http_{exc.status_code}"}
    return JSONResponse(
        status_code=exc.status_code,
        content={"data": None, "error": error},
        headers=getattr(exc, "headers", None),
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"data": None, "error": {"message": "Validation error", "code": "validation_error", "details": exc.errors()}},
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    logger.exception("Unhandled error on %s %s", request.method, request.url.path)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"data": None, "error": {"message": "Internal server error", "code": "internal_error"}},
    )


@app.get("/health", tags=["meta"])
async def health():
    return {"status": "ok", "environment": settings.ENVIRONMENT}


app.include_router(api_router, prefix=settings.API_V1_PREFIX)
