import copy
import uuid
from typing import Any, List, Optional

from fastapi import APIRouter, Depends, Header, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from models.sql.image_asset import ImageAsset
from models.sql.key_value import KeyValueSqlModel
from models.sql.presentation import PresentationModel
from services.database import get_async_session

THEMES_ROUTER = APIRouter(prefix="/themes", tags=["Themes"])
THEMES_STORAGE_KEY = "presentation_custom_themes"


class ThemeRequest(BaseModel):
    name: str
    description: str
    company_name: Optional[str] = None
    logo: Optional[str] = None
    logo_url: Optional[str] = None
    data: dict[str, Any] = Field(default_factory=dict)


class ThemeUpdateRequest(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    company_name: Optional[str] = None
    logo: Optional[str] = None
    logo_url: Optional[str] = None
    data: Optional[dict[str, Any]] = None


class ThemeResponse(BaseModel):
    id: str
    name: str
    description: str
    user: str
    logo: Optional[str] = None
    logo_url: Optional[str] = None
    company_name: Optional[str] = None
    data: dict[str, Any]


def _themes_storage_key(user_id: Optional[str]) -> str:
    if not user_id:
        return THEMES_STORAGE_KEY
    return f"{THEMES_STORAGE_KEY}:user:{user_id}"


def _theme_owner(user_id: Optional[str]) -> str:
    return user_id or "local"


def _normalize_theme(theme: dict[str, Any]) -> ThemeResponse:
    return ThemeResponse(
        id=str(theme["id"]),
        name=theme["name"],
        description=theme["description"],
        user=theme.get("user", "local"),
        logo=theme.get("logo"),
        logo_url=theme.get("logo_url"),
        company_name=theme.get("company_name"),
        data=theme.get("data", {}),
    )


async def _get_themes_row(
    sql_session: AsyncSession, storage_key: str
) -> Optional[KeyValueSqlModel]:
    return await sql_session.scalar(
        select(KeyValueSqlModel).where(KeyValueSqlModel.key == storage_key)
    )


def _read_themes_from_row(row: Optional[KeyValueSqlModel]) -> list[dict[str, Any]]:
    if not row:
        return []
    value = row.value if isinstance(row.value, dict) else {}
    themes = value.get("themes", [])
    if not isinstance(themes, list):
        return []
    return copy.deepcopy(themes)


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


async def _find_theme(
    sql_session: AsyncSession, storage_key: str, theme_id: str
) -> tuple[KeyValueSqlModel, list[dict[str, Any]], dict[str, Any]]:
    row = await _get_themes_row(sql_session, storage_key)
    if not row:
        raise HTTPException(status_code=404, detail="Theme not found")

    themes = _read_themes_from_row(row)
    theme = next((item for item in themes if item.get("id") == theme_id), None)
    if not theme:
        raise HTTPException(status_code=404, detail="Theme not found")
    return row, themes, theme


@THEMES_ROUTER.get("/default", response_model=List[dict[str, Any]])
async def get_default_themes():
    # Built-in themes are provided by Next.js constants in this project.
    return []


@THEMES_ROUTER.get("/all", response_model=List[ThemeResponse])
async def get_themes(
    sql_session: AsyncSession = Depends(get_async_session),
    x_user_id: Optional[str] = Header(default=None, alias="X-User-Id"),
):
    row = await _get_themes_row(sql_session, _themes_storage_key(x_user_id))
    themes = _read_themes_from_row(row)
    return [_normalize_theme(theme) for theme in themes]


@THEMES_ROUTER.post("/create", response_model=ThemeResponse)
async def create_theme(
    payload: ThemeRequest,
    sql_session: AsyncSession = Depends(get_async_session),
    x_user_id: Optional[str] = Header(default=None, alias="X-User-Id"),
):
    storage_key = _themes_storage_key(x_user_id)
    row = await _get_themes_row(sql_session, storage_key)
    themes = _read_themes_from_row(row)
    logo_url = payload.logo_url or await _resolve_logo_url(sql_session, payload.logo)

    theme = {
        "id": str(uuid.uuid4()),
        "name": payload.name,
        "description": payload.description,
        "user": _theme_owner(x_user_id),
        "logo": payload.logo,
        "logo_url": logo_url,
        "company_name": payload.company_name,
        "data": payload.data,
    }
    themes.append(theme)

    if row:
        row.value = {"themes": themes}
        sql_session.add(row)
    else:
        sql_session.add(KeyValueSqlModel(key=storage_key, value={"themes": themes}))

    await sql_session.commit()
    return _normalize_theme(theme)


@THEMES_ROUTER.patch("/update/{theme_id}", response_model=ThemeResponse)
async def update_theme(
    theme_id: str,
    payload: ThemeUpdateRequest,
    sql_session: AsyncSession = Depends(get_async_session),
    x_user_id: Optional[str] = Header(default=None, alias="X-User-Id"),
):
    row, themes, theme = await _find_theme(
        sql_session, _themes_storage_key(x_user_id), theme_id
    )

    if payload.name is not None:
        theme["name"] = payload.name
    if payload.description is not None:
        theme["description"] = payload.description
    if payload.company_name is not None:
        theme["company_name"] = payload.company_name
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
    x_user_id: Optional[str] = Header(default=None, alias="X-User-Id"),
):
    row = await _get_themes_row(sql_session, _themes_storage_key(x_user_id))
    if not row:
        return

    themes = _read_themes_from_row(row)
    row.value = {"themes": [theme for theme in themes if theme.get("id") != theme_id]}
    sql_session.add(row)
    await sql_session.commit()


@THEMES_ROUTER.post(
    "/apply/{theme_id}/presentation/{presentation_id}",
    response_model=PresentationModel,
)
async def apply_theme_to_presentation(
    theme_id: str,
    presentation_id: uuid.UUID,
    sql_session: AsyncSession = Depends(get_async_session),
    x_user_id: Optional[str] = Header(default=None, alias="X-User-Id"),
):
    _, _, theme = await _find_theme(
        sql_session, _themes_storage_key(x_user_id), theme_id
    )
    presentation = await sql_session.get(PresentationModel, presentation_id)
    if not presentation:
        raise HTTPException(status_code=404, detail="Presentation not found")

    presentation.theme = copy.deepcopy(theme)
    sql_session.add(presentation)
    await sql_session.commit()
    await sql_session.refresh(presentation)
    return presentation
