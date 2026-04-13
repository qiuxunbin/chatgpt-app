from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


class ConversationCreate(BaseModel):
    title: str = "新对话"
    mode: Literal["deepseek-chat", "deepseek-reasoner"] = "deepseek-chat"


class ConversationUpdate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)


class MessageResponse(BaseModel):
    id: int
    role: str
    content: str
    reasoning_content: str | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


class ConversationResponse(BaseModel):
    id: int
    title: str
    mode: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ConversationDetailResponse(ConversationResponse):
    messages: list[MessageResponse] = []
