from pydantic import BaseModel
from typing import Literal


class ChatRequest(BaseModel):
    content: str
    mode: Literal["deepseek-chat", "deepseek-reasoner"] = "deepseek-chat"


class ChatEvent(BaseModel):
    type: Literal["reasoning", "content", "error", "done"]
    content: str = ""
    conversation_id: int | None = None
