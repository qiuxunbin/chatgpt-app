import json
from typing import AsyncGenerator

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sse_starlette.sse import EventSourceResponse

from app.database import get_db
from app.models.user import User
from app.models.conversation import Conversation
from app.models.message import Message
from app.schemas.chat import ChatRequest
from app.services.deepseek_service import stream_completion
from app.middleware.auth import get_current_user

router = APIRouter()


async def _build_context(conversation_id: int, db: AsyncSession, mode: str) -> list[dict]:
    result = await db.execute(
        select(Message)
        .where(Message.conversation_id == conversation_id)
        .order_by(Message.created_at)
    )
    history = result.scalars().all()

    messages: list[dict] = []
    for msg in history:
        messages.append({"role": msg.role, "content": msg.content})
    return messages


async def _event_generator(
    request: ChatRequest,
    conversation_id: str,
    db: AsyncSession,
    user: User,
) -> AsyncGenerator[dict, None]:
    is_new = conversation_id == "new"
    if is_new:
        title = request.content[:30].strip() or "新对话"
        conv = Conversation(title=title, mode=request.mode, user_id=user.id)
        db.add(conv)
        await db.flush()
        cid = conv.id
    else:
        cid = int(conversation_id)
        result = await db.execute(
            select(Message).where(Message.conversation_id == cid).limit(1)
        )
        is_first_message = result.scalar_one_or_none() is None

    yield {"event": "meta", "data": json.dumps({"conversation_id": cid})}

    user_msg = Message(conversation_id=cid, role="user", content=request.content)
    db.add(user_msg)
    await db.flush()

    if not is_new and is_first_message:
        conv_result = await db.execute(
            select(Conversation).where(Conversation.id == cid)
        )
        conv_obj = conv_result.scalar_one_or_none()
        if conv_obj and conv_obj.title == "新对话":
            conv_obj.title = request.content[:30].strip() or "新对话"
            await db.flush()

    context = await _build_context(cid, db, request.mode)

    full_content = ""
    full_reasoning = ""

    async for event in stream_completion(context, request.mode):
        if event["type"] == "reasoning":
            full_reasoning += event["content"]
            yield {
                "event": "reasoning",
                "data": json.dumps({"type": "reasoning", "content": event["content"]}),
            }
        elif event["type"] == "content":
            full_content += event["content"]
            yield {
                "event": "content",
                "data": json.dumps({"type": "content", "content": event["content"]}),
            }
        elif event["type"] == "error":
            yield {
                "event": "error",
                "data": json.dumps({"type": "error", "content": event["content"]}),
            }

    assistant_msg = Message(
        conversation_id=cid,
        role="assistant",
        content=full_content,
        reasoning_content=full_reasoning or None,
    )
    db.add(assistant_msg)
    await db.commit()

    yield {"event": "done", "data": json.dumps({"type": "done"})}


@router.post("/api/chat/{conversation_id}")
async def chat(
    conversation_id: str,
    request: ChatRequest,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    return EventSourceResponse(_event_generator(request, conversation_id, db, user))
