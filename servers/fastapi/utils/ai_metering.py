import hashlib
import os
from contextvars import ContextVar
from typing import Any, Dict, Optional

import httpx


_metering_context: ContextVar[Dict[str, Any]] = ContextVar("ai_metering_context", default={})


def set_metering_context(context: Dict[str, Any]):
    return _metering_context.set({k: v for k, v in context.items() if v is not None})


def reset_metering_context(token) -> None:
    _metering_context.reset(token)


def get_metering_context() -> Dict[str, Any]:
    return _metering_context.get()


def stable_key(service: str, feature: str, parts: list[Any]) -> str:
    digest = hashlib.sha256(":".join(str(part or "") for part in parts).encode()).hexdigest()
    return f"{service}:{feature}:{digest}"


async def reserve_credits(feature: str, credits: int, idempotency_key: str) -> bool:
    context = get_metering_context()
    mongo_org_id = context.get("mongoOrgId")
    if not mongo_org_id:
        return False

    api_url = (os.getenv("API_SERVICE_URL") or os.getenv("MAIN_API_URL") or "https://api.3labs.ca").rstrip("/")
    secret = os.getenv("SERVICE_SECRET", "")
    async with httpx.AsyncClient(timeout=15) as client:
        response = await client.post(
            f"{api_url}/api/internal/ai-meter/reserve",
            headers={"x-service-secret": secret},
            json={
                "mongoOrgId": mongo_org_id,
                "idempotencyKey": idempotency_key,
                "service": "3labs-presenton",
                "feature": feature,
                "credits": max(1, int(credits)),
                "userId": context.get("userId"),
                "actorRole": context.get("actorRole"),
                "resourceType": context.get("resourceType"),
                "resourceId": context.get("resourceId"),
                "jobId": context.get("jobId"),
            },
        )
    response.raise_for_status()
    return True


async def commit_usage(idempotency_key: str, credits_final: int, usage: Optional[Dict[str, Any]] = None) -> None:
    api_url = (os.getenv("API_SERVICE_URL") or os.getenv("MAIN_API_URL") or "https://api.3labs.ca").rstrip("/")
    secret = os.getenv("SERVICE_SECRET", "")
    payload = {
        "idempotencyKey": idempotency_key,
        "creditsFinal": max(0, int(credits_final)),
        **(usage or {}),
    }
    async with httpx.AsyncClient(timeout=15) as client:
        response = await client.post(
            f"{api_url}/api/internal/ai-meter/commit",
            headers={"x-service-secret": secret},
            json=payload,
        )
    response.raise_for_status()


async def refund_reservation(idempotency_key: str) -> None:
    api_url = (os.getenv("API_SERVICE_URL") or os.getenv("MAIN_API_URL") or "https://api.3labs.ca").rstrip("/")
    secret = os.getenv("SERVICE_SECRET", "")
    async with httpx.AsyncClient(timeout=15) as client:
        await client.post(
            f"{api_url}/api/internal/ai-meter/refund",
            headers={"x-service-secret": secret},
            json={"idempotencyKey": idempotency_key},
        )
