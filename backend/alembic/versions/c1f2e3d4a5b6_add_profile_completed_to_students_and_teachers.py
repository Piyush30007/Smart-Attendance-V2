"""add profile_completed to students and teachers

Revision ID: c1f2e3d4a5b6
Revises: b706da27d0ee
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "c1f2e3d4a5b6"
down_revision: Union[str, Sequence[str], None] = "b706da27d0ee"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # -------------------------
    # STUDENTS
    # -------------------------
    op.add_column(
        "students",
        sa.Column(
            "profile_completed",
            sa.Boolean(),
            nullable=False,
            server_default=sa.false(),
        ),
    )

    # -------------------------
    # TEACHERS
    # -------------------------
    op.add_column(
        "teachers",
        sa.Column(
            "profile_completed",
            sa.Boolean(),
            nullable=False,
            server_default=sa.false(),
        ),
    )


def downgrade() -> None:
    op.drop_column("teachers", "profile_completed")
    op.drop_column("students", "profile_completed")
