from __future__ import annotations

import json
from functools import wraps

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

from .services import supabase_client


def json_endpoint(view_func):
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        origin = request.headers.get("Origin", "*")
        req_headers = request.headers.get("Access-Control-Request-Headers", "Content-Type, Authorization, X-Client-Source")
        
        if request.method == "OPTIONS":
            response = JsonResponse({"ok": True})
            response["Access-Control-Allow-Origin"] = origin
            response["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS, PUT, DELETE"
            response["Access-Control-Allow-Headers"] = req_headers
            response["Access-Control-Allow-Credentials"] = "true"
            return response
        
        try:
            if request.body:
                request.json = json.loads(request.body.decode("utf-8"))
            else:
                request.json = {}
        except json.JSONDecodeError:
            response = JsonResponse({"error": "Invalid JSON body"}, status=400)
            response["Access-Control-Allow-Origin"] = origin
            response["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS, PUT, DELETE"
            response["Access-Control-Allow-Headers"] = req_headers
            response["Access-Control-Allow-Credentials"] = "true"
            return response
        
        try:
            response = view_func(request, *args, **kwargs)
            response["Access-Control-Allow-Origin"] = origin
            response["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS, PUT, DELETE"
            response["Access-Control-Allow-Headers"] = req_headers
            response["Access-Control-Allow-Credentials"] = "true"
            return response
        except Exception as e:
            response = JsonResponse({"error": str(e)}, status=500)
            response["Access-Control-Allow-Origin"] = origin
            response["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS, PUT, DELETE"
            response["Access-Control-Allow-Headers"] = req_headers
            response["Access-Control-Allow-Credentials"] = "true"
            return response

    return wrapper


def health_check(request):
    return JsonResponse({"ok": True, "service": "resume-analyzer-backend"})


@csrf_exempt
@require_http_methods(["POST", "OPTIONS"])
@json_endpoint
def delete_resume(request):
    payload = request.json
    access_token = payload.get("accessToken", "")
    resume_id = payload.get("resumeId", "")
    try:
        user = supabase_client.verify_user(access_token)
    except ValueError:
        return JsonResponse({"error": "Unauthorized"}, status=401)
    user_id = user["id"]

    resume = supabase_client.get_single(
        "resumes",
        f"id=eq.{resume_id}&user_id=eq.{user_id}",
        access_token=access_token,
    )
    if not resume:
        return JsonResponse({"error": "Not found"}, status=404)

    try:
        supabase_client.delete_storage("resumes", resume["file_path"], access_token)
    except Exception:
        # If storage cleanup fails, still remove the database row so the UI can stay consistent.
        pass
    supabase_client.delete_rows("resumes", f"id=eq.{resume_id}&user_id=eq.{user_id}", access_token)
    return JsonResponse({"ok": True})


@csrf_exempt
@require_http_methods(["POST", "OPTIONS"])
@json_endpoint
def set_primary_resume(request):
    payload = request.json
    access_token = payload.get("accessToken", "")
    resume_id = payload.get("resumeId", "")
    try:
        user = supabase_client.verify_user(access_token)
    except ValueError:
        return JsonResponse({"error": "Unauthorized"}, status=401)
    user_id = user["id"]

    supabase_client.update_rows("resumes", f"user_id=eq.{user_id}", {"is_primary": False}, access_token)
    supabase_client.update_rows(
        "resumes",
        f"id=eq.{resume_id}&user_id=eq.{user_id}",
        {"is_primary": True},
        access_token,
    )
    return JsonResponse({"ok": True})



