import requests
from fastapi import HTTPException, status
from app.schemas.address import AddressOut

USER_SERVICE_BASE = "http://127.0.0.1:8000"   # gerekirse .env’den oku

def fetch_address(address_id: int, bearer_token: str) -> AddressOut:
    """
    User Service /users/me/addresses/{id} endpoint'ini çağırır
    ve AddressOut döner; hata durumunda HTTPException fırlatır.
    """
    url = f"{USER_SERVICE_BASE}/users/me/addresses/{address_id}"
    headers = {"Authorization": f"Bearer {bearer_token}"}
    resp = requests.get(url, headers=headers, timeout=5)
    if resp.status_code == 404:
        raise HTTPException(404, "Address not found")
    if resp.status_code == 401:
        raise HTTPException(401, "User token invalid for address")
    if resp.status_code >= 400:
        raise HTTPException(
            status.HTTP_502_BAD_GATEWAY,
            "Failed to retrieve address from user service",
        )
    return AddressOut.model_validate(resp.json())
