FROM python:3.9.2-slim-buster

RUN apt-get -y update && apt-get -y upgrade && apt-get -y install gcc libpq-dev

COPY . /app

WORKDIR /app
ENV PIP_INDEX_URL https://devpi.trustyou.com:3001/trustyou/repo/+simple/
RUN pip3 install --upgrade pip
RUN pip3 install --no-cache-dir -r requirements.txt

ENV PORT 8080

CMD uvicorn  --host 0.0.0.0 --port $PORT ota_demo_api.main:app --reload --lifespan=on