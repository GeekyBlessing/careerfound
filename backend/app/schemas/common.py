from typing import Generic, TypeVar

from pydantic import BaseModel

T = TypeVar("T")


class ErrorDetail(BaseModel):
    message: str
    code: str = "error"


class Envelope(BaseModel, Generic[T]):
    data: T | None = None
    error: ErrorDetail | None = None
