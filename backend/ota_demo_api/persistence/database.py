import os

import databases
from sqlalchemy.ext.declarative import declarative_base

from ota_demo_api.consts import DATABASE_URL

DATABASE_URL = os.environ[DATABASE_URL]

Base = declarative_base()

database = databases.Database(DATABASE_URL)
