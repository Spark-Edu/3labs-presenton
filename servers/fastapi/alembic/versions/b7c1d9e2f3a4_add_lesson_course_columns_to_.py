"""add lesson/course linkage columns to presentations

Lets the standalone dashboard (slides.3labs.ca/dashboard) distinguish decks
created through the 3Labs course/lesson pipeline from ones a trainer created
directly on the dashboard. 3labs-api stamps these onto the presentation via
PATCH /api/v1/ppt/presentation/update at "Hoàn tất"/save-to-library time
(see PresentonService.saveToLibrary) — nothing else here writes them, so
NULL simply means "not lesson-linked, as far as we know."

Revision ID: b7c1d9e2f3a4
Revises: a1b2c3d4e5f6
Create Date: 2026-08-14 00:00:00.000000
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b7c1d9e2f3a4'
down_revision: Union[str, None] = 'a1b2c3d4e5f6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

NEW_COLUMNS = ["lesson_id", "course_id", "lesson_title", "course_title"]


def upgrade() -> None:
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    columns = [col['name'] for col in inspector.get_columns('presentations')]
    for column_name in NEW_COLUMNS:
        if column_name not in columns:
            op.add_column('presentations', sa.Column(column_name, sa.String(), nullable=True))

    existing_indexes = [idx['name'] for idx in inspector.get_indexes('presentations')]
    if 'ix_presentations_lesson_id' not in existing_indexes:
        op.create_index('ix_presentations_lesson_id', 'presentations', ['lesson_id'])


def downgrade() -> None:
    op.drop_index('ix_presentations_lesson_id', table_name='presentations')
    for column_name in reversed(NEW_COLUMNS):
        op.drop_column('presentations', column_name)
