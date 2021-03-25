"""create_meta_review_table

Revision ID: e3e187f5d0a3
Revises: 18948e2f7a2e
Create Date: 2021-03-25 12:33:21.924171

"""
from alembic import op
import sqlalchemy as sa

from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision = 'e3e187f5d0a3'
down_revision = '18948e2f7a2e'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'meta_review',
        sa.Column('cluster_id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('meta_review', postgresql.JSON(astext_type=sa.Text()), nullable=False),
    )

    op.create_table(
        'cluster',
        sa.Column('cluster_id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('name', sa.String(), nullable=False),
    )


def downgrade():
    op.drop_table('cluster')

    op.drop_table('meta_review')
