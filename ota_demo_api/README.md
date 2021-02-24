ota_demo_api
==================

How to run?
-----------
1. Create a virtual environment and install python dependencies
```
virtualenv venv -p=python3.9
source venv/bin/activate
pip install -r requirements.txt
```



3. Set the `DATABASE_URL` with the DB connection string
```
export DATABASE_URL='postgresql://postgres:pass@localhost:5432/postgres'
```

4. Run the alembic migration
```
alembic upgrade head
```


5. Run the server
```
uvicorn ota_demo_api.main:app --reload
```

6. For the documentation go to:
  * Swagger: 127.0.0.1:8000/docs
  * ReDoc: 127.0.0.1:8000/redoc


How to generate a new alembic migration?
----------------------------------------
Run the alembic revision
```
alembic revision --autogenerate -m "<migration title>"
```



How to run in docker?
-----------
 1. Build the image
```
 docker build -t ota_demo_api .
```

 2. Run the image
```
 docker run -p 8080:8080 ota_demo_api:latest
```

 3. For the documentation go to:
   * Swagger: 0.0.0.0:8080/docs
   * ReDoc: 0.0.0.0:8080/redoc


How to run tests?
-----------------

Runnig tests + linting + mypy checks
```
tox
```

For running them individually
```
tox -e test
tox -e lint
tox -e mypy
```
