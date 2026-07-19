from __future__ import annotations

import io
import json
from typing import Any

import requests
from docx import Document
from pypdf import PdfReader

from django.conf import settings


def extract_text_from_file(file_bytes: bytes, file_name: str) -> str:
    lower = file_name.lower()
    if lower.endswith(".pdf"):
        reader = PdfReader(io.BytesIO(file_bytes))
        return "\n".join(page.extract_text() or "" for page in reader.pages)
    if lower.endswith(".docx"):
        document = Document(io.BytesIO(file_bytes))
        return "\n".join(paragraph.text for paragraph in document.paragraphs)
    return file_bytes.decode("utf-8", errors="ignore")


class SupabaseRestClient:
    def __init__(self) -> None:
        self.url = settings.SUPABASE_URL.rstrip("/")
        self.service_role_key = settings.SUPABASE_SERVICE_ROLE_KEY or settings.SUPABASE_ANON_KEY
        self.anon_key = settings.SUPABASE_ANON_KEY or self.service_role_key

    def _headers(self, access_token: str | None = None) -> dict[str, str]:
        if access_token:
            return {
                "apikey": self.anon_key,
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json",
            }
        return {
            "apikey": self.service_role_key,
            "Authorization": f"Bearer {self.service_role_key}",
            "Content-Type": "application/json",
        }

    def verify_user(self, access_token: str) -> dict[str, Any]:
        response = requests.get(
            f"{self.url}/auth/v1/user",
            headers={"apikey": self.anon_key, "Authorization": f"Bearer {access_token}"},
            timeout=30,
        )
        if not response.ok:
            raise ValueError("Unauthorized")
        return response.json()

    def fetch_rows(self, table: str, params: dict[str, Any]) -> list[dict[str, Any]]:
        response = requests.get(
            f"{self.url}/rest/v1/{table}",
            headers=self._headers(None),
            params=params,
            timeout=30,
        )
        response.raise_for_status()
        return response.json()

    def insert_row(self, table: str, payload: dict[str, Any], access_token: str | None = None) -> dict[str, Any]:
        response = requests.post(
            f"{self.url}/rest/v1/{table}",
            headers={**self._headers(access_token), "Prefer": "return=representation"},
            data=json.dumps(payload),
            timeout=30,
        )
        response.raise_for_status()
        data = response.json()
        return data[0] if isinstance(data, list) and data else data

    def update_rows(self, table: str, filters: str, payload: dict[str, Any], access_token: str | None = None) -> list[dict[str, Any]]:
        response = requests.patch(
            f"{self.url}/rest/v1/{table}?{filters}",
            headers={**self._headers(access_token), "Prefer": "return=representation"},
            data=json.dumps(payload),
            timeout=30,
        )
        response.raise_for_status()
        return response.json() if response.content else []

    def delete_rows(self, table: str, filters: str, access_token: str | None = None) -> None:
        response = requests.delete(
            f"{self.url}/rest/v1/{table}?{filters}",
            headers=self._headers(access_token),
            timeout=30,
        )
        response.raise_for_status()

    def download_storage(self, bucket: str, object_path: str, access_token: str | None = None) -> bytes:
        response = requests.get(
            f"{self.url}/storage/v1/object/{bucket}/{object_path}",
            headers=self._headers(access_token),
            timeout=60,
        )
        response.raise_for_status()
        return response.content

    def delete_storage(self, bucket: str, object_path: str, access_token: str | None = None) -> None:
        response = requests.delete(
            f"{self.url}/storage/v1/object/{bucket}/{object_path}",
            headers=self._headers(access_token),
            timeout=30,
        )
        response.raise_for_status()

    def get_single(self, table: str, filters: str, columns: str = "*", access_token: str | None = None) -> dict[str, Any] | None:
        response = requests.get(
            f"{self.url}/rest/v1/{table}?{filters}&select={columns}",
            headers=self._headers(access_token),
            timeout=30,
        )
        response.raise_for_status()
        rows = response.json()
        return rows[0] if rows else None

    def upload_storage(self, bucket: str, object_path: str, file_bytes: bytes, mime_type: str, access_token: str | None = None) -> dict[str, Any]:
        headers = self._headers(access_token)
        headers["Content-Type"] = mime_type
        headers["x-upsert"] = "true"
        response = requests.post(
            f"{self.url}/storage/v1/object/{bucket}/{object_path}",
            headers=headers,
            data=file_bytes,
            timeout=60,
        )
        response.raise_for_status()
        return response.json()


supabase_client = SupabaseRestClient()
