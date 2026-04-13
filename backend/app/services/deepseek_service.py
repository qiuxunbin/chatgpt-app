from typing import AsyncGenerator
import logging

from openai import AsyncOpenAI

from app.config import get_settings

logger = logging.getLogger(__name__)

settings = get_settings()

client = AsyncOpenAI(
    api_key=settings.DEEPSEEK_API_KEY,
    base_url=settings.DEEPSEEK_BASE_URL,
)


async def stream_chat(messages: list[dict]) -> AsyncGenerator[dict, None]:
    """对话模式: deepseek-chat, 直接返回 content"""
    try:
        response = await client.chat.completions.create(
            model="deepseek-chat",
            messages=messages,
            stream=True,
        )
        async for chunk in response:
            delta = chunk.choices[0].delta if chunk.choices else None
            if delta and delta.content:
                yield {"type": "content", "content": delta.content}
    except Exception as e:
        logger.error("DeepSeek chat error: %s", e)
        yield {"type": "error", "content": str(e)}


async def stream_reasoning(messages: list[dict]) -> AsyncGenerator[dict, None]:
    """推理模式: deepseek-reasoner, 先返回 reasoning_content 再返回 content"""
    try:
        response = await client.chat.completions.create(
            model="deepseek-reasoner",
            messages=messages,
            stream=True,
        )
        async for chunk in response:
            choice = chunk.choices[0] if chunk.choices else None
            if not choice:
                continue
            delta = choice.delta

            reasoning = getattr(delta, "reasoning_content", None)
            if reasoning:
                yield {"type": "reasoning", "content": reasoning}

            if delta.content:
                yield {"type": "content", "content": delta.content}
    except Exception as e:
        logger.error("DeepSeek reasoner error: %s", e)
        yield {"type": "error", "content": str(e)}


async def stream_completion(messages: list[dict], mode: str) -> AsyncGenerator[dict, None]:
    """统一入口: 根据 mode 分发到对话模式或推理模式"""
    gen = stream_reasoning(messages) if mode == "deepseek-reasoner" else stream_chat(messages)
    async for event in gen:
        yield event
