"""add authentication fields to student and teacher

Revision ID: b706da27d0ee
Revises: 5995726b6bf4
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "b706da27d0ee"
down_revision: Union[str, Sequence[str], None] = "5995726b6bf4"
branch_labels = None
depends_on = None


def upgrade() -> None:

    # -------------------------
    # STUDENTS
    # -------------------------

    op.add_column(
        "students",
        sa.Column("username", sa.String(length=80), nullable=True)
    )

    op.add_column(
        "students",
        sa.Column("hashed_password", sa.String(length=255), nullable=True)
    )

    op.add_column(
        "students",
        sa.Column(
            "role",
            sa.String(length=20),
            nullable=False,
            server_default="student"
        )
    )

    op.add_column(
        "students",
        sa.Column(
            "is_active",
            sa.Boolean(),
            nullable=False,
            server_default=sa.true()
        )
    )

    op.create_index(
        "ix_students_username",
        "students",
        ["username"],
        unique=True
    )


    # -------------------------
    # TEACHERS
    # -------------------------

    op.add_column(
        "teachers",
        sa.Column("username", sa.String(length=80), nullable=True)
    )

    op.add_column(
        "teachers",
        sa.Column("hashed_password", sa.String(length=255), nullable=True)
    )

    op.add_column(
        "teachers",
        sa.Column(
            "role",
            sa.String(length=20),
            nullable=False,
            server_default="teacher"
        )
    )

    op.add_column(
        "teachers",
        sa.Column(
            "is_active",
            sa.Boolean(),
            nullable=False,
            server_default=sa.true()
        )
    )

    op.add_column(
        "teachers",
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now()
        )
    )

    op.add_column(
        "teachers",
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now()
        )
    )

    op.create_index(
        "ix_teachers_username",
        "teachers",
        ["username"],
        unique=True
    )


def downgrade() -> None:

    # Teachers
    op.drop_index(
        "ix_teachers_username",
        table_name="teachers"
    )

    op.drop_column("teachers", "updated_at")
    op.drop_column("teachers", "created_at")
    op.drop_column("teachers", "is_active")
    op.drop_column("teachers", "role")
    op.drop_column("teachers", "hashed_password")
    op.drop_column("teachers", "username")

    # Students
    op.drop_index(
        "ix_students_username",
        table_name="students"
    )

    op.drop_column("students", "is_active")
    op.drop_column("students", "role")
    op.drop_column("students", "hashed_password")
    op.drop_column("students", "username")