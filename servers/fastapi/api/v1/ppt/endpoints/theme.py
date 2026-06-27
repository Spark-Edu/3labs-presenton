import uuid
from typing import Any, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Header
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from models.sql.image_asset import ImageAsset
from models.sql.key_value import KeyValueSqlModel
from services.database import get_async_session

THEMES_ROUTER = APIRouter(prefix="/themes", tags=["Themes"])


def _themes_key(user_id: str) -> str:
    return f"themes:{user_id}"


class ThemeRequest(BaseModel):
    name: str
    description: str
    company_name: Optional[str] = None
    company_website: Optional[str] = None
    logo: Optional[str] = None
    logo_url: Optional[str] = None
    data: dict[str, Any] = Field(default_factory=dict)


class ThemeUpdateRequest(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    company_name: Optional[str] = None
    company_website: Optional[str] = None
    logo: Optional[str] = None
    logo_url: Optional[str] = None
    data: Optional[dict[str, Any]] = None


class ThemeResponse(BaseModel):
    id: str
    name: str
    description: str
    user: str
    org_id: Optional[str] = None
    created_by: Optional[str] = None
    logo: Optional[str] = None
    logo_url: Optional[str] = None
    company_name: Optional[str] = None
    company_website: Optional[str] = None
    data: dict[str, Any]


def _normalize_theme(theme: dict[str, Any]) -> ThemeResponse:
    return ThemeResponse(
        id=str(theme["id"]),
        name=theme["name"],
        description=theme["description"],
        user=theme.get("user", "local"),
        org_id=theme.get("org_id"),
        created_by=theme.get("created_by"),
        logo=theme.get("logo"),
        logo_url=theme.get("logo_url"),
        company_name=theme.get("company_name"),
        company_website=theme.get("company_website"),
        data=theme.get("data", {}),
    )


async def _get_themes_row(sql_session: AsyncSession, user_id: str) -> Optional[KeyValueSqlModel]:
    key = _themes_key(user_id)
    return await sql_session.scalar(
        select(KeyValueSqlModel).where(KeyValueSqlModel.key == key)
    )


def _read_themes_from_row(row: Optional[KeyValueSqlModel]) -> list[dict[str, Any]]:
    if not row:
        return []
    value = row.value if isinstance(row.value, dict) else {}
    themes = value.get("themes", [])
    return themes if isinstance(themes, list) else []


async def _resolve_logo_url(
    sql_session: AsyncSession, logo: Optional[str]
) -> Optional[str]:
    if not logo:
        return None
    try:
        logo_uuid = uuid.UUID(str(logo))
    except ValueError as exc:
        raise HTTPException(status_code=400, detail="Invalid logo id") from exc

    image_asset = await sql_session.get(ImageAsset, logo_uuid)
    if not image_asset:
        raise HTTPException(status_code=404, detail="Logo not found")
    return image_asset.path


@THEMES_ROUTER.get("/default", response_model=List[dict[str, Any]])
async def get_default_themes():
    return []


@THEMES_ROUTER.get("/all", response_model=List[ThemeResponse])
async def get_themes(
    sql_session: AsyncSession = Depends(get_async_session),
    x_user_id: str = Header(default="local"),
    x_org_id: Optional[str] = Header(default=None),
):
    owner_id = x_org_id or x_user_id
    row = await _get_themes_row(sql_session, owner_id)
    themes = _read_themes_from_row(row)

    if x_org_id:
        legacy_row = await _get_themes_row(sql_session, x_user_id)
        legacy_themes = _read_themes_from_row(legacy_row)
        seen_ids = {theme.get("id") for theme in themes}
        themes.extend(theme for theme in legacy_themes if theme.get("id") not in seen_ids)

    return [_normalize_theme(theme) for theme in themes]


@THEMES_ROUTER.post("/create", response_model=ThemeResponse)
async def create_theme(
    payload: ThemeRequest,
    sql_session: AsyncSession = Depends(get_async_session),
    x_user_id: str = Header(default="local"),
    x_org_id: Optional[str] = Header(default=None),
):
    owner_id = x_org_id or x_user_id
    row = await _get_themes_row(sql_session, owner_id)
    themes = _read_themes_from_row(row)
    logo_url = payload.logo_url or await _resolve_logo_url(sql_session, payload.logo)

    theme = {
        "id": str(uuid.uuid4()),
        "name": payload.name,
        "description": payload.description,
        "user": x_user_id,
        "org_id": x_org_id,
        "created_by": x_user_id,
        "logo": payload.logo,
        "logo_url": logo_url,
        "company_name": payload.company_name,
        "company_website": payload.company_website,
        "data": payload.data,
    }
    themes.append(theme)

    key = _themes_key(owner_id)
    if row:
        row.value = {"themes": themes}
        sql_session.add(row)
    else:
        sql_session.add(KeyValueSqlModel(key=key, value={"themes": themes}))

    await sql_session.commit()
    return _normalize_theme(theme)


@THEMES_ROUTER.patch("/update/{theme_id}", response_model=ThemeResponse)
async def update_theme(
    theme_id: str,
    payload: ThemeUpdateRequest,
    sql_session: AsyncSession = Depends(get_async_session),
    x_user_id: str = Header(default="local"),
    x_org_id: Optional[str] = Header(default=None),
):
    owner_id = x_org_id or x_user_id
    rows = [await _get_themes_row(sql_session, owner_id)]
    if x_org_id:
        rows.append(await _get_themes_row(sql_session, x_user_id))

    row = None
    themes: list[dict[str, Any]] = []
    theme = None
    for candidate_row in rows:
        candidate_themes = _read_themes_from_row(candidate_row)
        candidate_theme = next((item for item in candidate_themes if item.get("id") == theme_id), None)
        if candidate_row and candidate_theme:
            row = candidate_row
            themes = candidate_themes
            theme = candidate_theme
            break

    if not row or not theme:
        raise HTTPException(status_code=404, detail="Theme not found")

    if payload.name is not None:
        theme["name"] = payload.name
    if payload.description is not None:
        theme["description"] = payload.description
    if payload.company_name is not None:
        theme["company_name"] = payload.company_name
    if payload.company_website is not None:
        theme["company_website"] = payload.company_website
    if payload.data is not None:
        theme["data"] = payload.data
    if payload.logo is not None:
        theme["logo"] = payload.logo
        theme["logo_url"] = await _resolve_logo_url(sql_session, payload.logo)
    elif payload.logo_url is not None:
        theme["logo_url"] = payload.logo_url

    row.value = {"themes": themes}
    sql_session.add(row)
    await sql_session.commit()
    return _normalize_theme(theme)


@THEMES_ROUTER.delete("/delete/{theme_id}", status_code=204)
async def delete_theme(
    theme_id: str,
    sql_session: AsyncSession = Depends(get_async_session),
    x_user_id: str = Header(default="local"),
    x_org_id: Optional[str] = Header(default=None),
):
    owner_id = x_org_id or x_user_id
    rows = [await _get_themes_row(sql_session, owner_id)]
    if x_org_id:
        rows.append(await _get_themes_row(sql_session, x_user_id))

    for row in rows:
        themes = _read_themes_from_row(row)
        if not row or not any(theme.get("id") == theme_id for theme in themes):
            continue

        row.value = {"themes": [theme for theme in themes if theme.get("id") != theme_id]}
        sql_session.add(row)
        await sql_session.commit()
        return
