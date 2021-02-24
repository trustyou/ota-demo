from fastapi.testclient import TestClient
from fastapi import status

from ota_demo_api.main import app

client = TestClient(app)


def test_heath_check():
    response = client.get("/health-check")
    assert response.status_code == status.HTTP_200_OK
