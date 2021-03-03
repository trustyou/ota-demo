""" initial_model

Revision ID: 18948e2f7a2e
Revises:
Create Date: 2021-03-02

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '18948e2f7a2e'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    conn = op.get_bind()

    conn.execute(sa.sql.text('''
    CREATE EXTENSION IF NOT EXISTS earthdistance CASCADE;
    CREATE EXTENSION IF NOT EXISTS btree_gist;

    CREATE TYPE trip_type_enum AS ENUM ('solo', 'couple', 'family', 'business', 'all');

    CREATE TABLE cluster_search (
        ty_id uuid NOT NULL,
        trip_type trip_type_enum,
        language character varying(3),
        city character varying(255),
        country character varying(255),
        latitude double precision,
        longitude double precision,
        datapoint character varying(4),
        score real,
        review_count int,
        PRIMARY KEY (ty_id, trip_type, language, datapoint)
    );

    CREATE INDEX idx_cluster_search_by_city ON cluster_search USING btree (lower(city), lower(country), trip_type, language, datapoint);
    CREATE INDEX idx_cluster_search_by_coordinates ON cluster_search USING gist (ll_to_earth(latitude, longitude), trip_type, language, datapoint);
    
    CREATE TABLE city_search (
        city character varying(255),
        country character varying(255),
        count smallint NOT NULL
    );
    
    CREATE INDEX city_search_city_prefix ON city_search USING btree (lower(city) text_pattern_ops, count);
    '''))


def downgrade():
    conn = op.get_bind()

    conn.execute(sa.sql.text('''
        DROP INDEX idx_cluster_search_by_city;
        DROP INDEX idx_cluster_search_by_coordinates;
        DROP TABLE cluster_search;
        
        DROP INDEX city_search_city_prefix;
        DROP TABLE city_search;
    '''))