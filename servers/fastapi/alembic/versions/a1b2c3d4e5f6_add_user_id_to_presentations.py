"""add user_id to presentations

Revision ID: a1b2c3d4e5f6
Revises: f42ad4074449
Create Date: 2026-04-29 00:00:00.000000
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, None] = 'f42ad4074449'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('presentations', sa.Column('user_id', sa.String(), nullable=True))
    op.create_index('ix_presentations_user_id', 'presentations', ['user_id'])


def downgrade() -> None:
    op.drop_index('ix_presentations_user_id', table_name='presentations')
    op.drop_column('presentations', 'user_id')
