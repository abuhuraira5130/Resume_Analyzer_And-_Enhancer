from __future__ import annotations
import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

from ..services import supabase_client, extract_text_from_file
from .service import AIService

def json_endpoint(view_func):
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

@csrf_exempt
@json_endpoint
@require_http_methods(["GET", "OPTIONS"])
def get_providers(request):
    if request.method == "OPTIONS":
        return JsonResponse({"ok": True})
    return JsonResponse({"providers": AIService.get_supported_providers()})

@csrf_exempt
@json_endpoint
@require_http_methods(["GET", "OPTIONS"])
def get_user_settings(request):
    if request.method == "OPTIONS":
        return JsonResponse({"ok": True})
    access_token = request.headers.get("Authorization", "").replace("Bearer ", "")
    if not access_token:
        return JsonResponse({"error": "Unauthorized"}, status=401)
    try:
        user = supabase_client.verify_user(access_token)
    except Exception as auth_err:
        # Return unauthorized instead of server error for authentication failures
        return JsonResponse({"error": str(auth_err) or "Unauthorized"}, status=401)
    try:
        user_id = user["id"]
        settings = supabase_client.get_single(
            "user_ai_settings",
            f"user_id=eq.{user_id}",
            access_token=access_token
        )
        if not settings:
            settings = {
                "user_id": user_id,
                "provider": "gemini",
                "model": "gemini-2.5-flash",
                "api_key": ""
            }
        return JsonResponse({"settings": settings})
    except Exception as e:
        # Catch any unexpected errors and return a 500 response with minimal info
        return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
@json_endpoint
@require_http_methods(["POST", "OPTIONS"])
def save_user_settings(request):
    if request.method == "OPTIONS":
        return JsonResponse({"ok": True})
    access_token = request.headers.get("Authorization", "").replace("Bearer ", "")
    if not access_token:
        return JsonResponse({"error": "Unauthorized"}, status=401)
    try:
        user = supabase_client.verify_user(access_token)
        user_id = user["id"]
        payload = request.json
        
        provider = payload.get("provider")
        model = payload.get("model")
        api_key = payload.get("api_key", "")
        
        existing = supabase_client.get_single(
            "user_ai_settings",
            f"user_id=eq.{user_id}",
            access_token=access_token
        )
        
        if existing:
            supabase_client.update_rows(
                "user_ai_settings",
                f"user_id=eq.{user_id}",
                {"provider": provider, "model": model, "api_key": api_key},
                access_token
            )
        else:
            supabase_client.insert_row(
                "user_ai_settings",
                {"user_id": user_id, "provider": provider, "model": model, "api_key": api_key},
                access_token
            )
        
        return JsonResponse({"ok": True})
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
@json_endpoint
@require_http_methods(["POST", "OPTIONS"])
def test_connection(request):
    if request.method == "OPTIONS":
        return JsonResponse({"ok": True})
    access_token = request.headers.get("Authorization", "").replace("Bearer ", "")
    if not access_token:
        return JsonResponse({"error": "Unauthorized"}, status=401)
    try:
        user = supabase_client.verify_user(access_token)
        user_id = user["id"]
        payload = request.json

        provider = payload.get("provider")
        api_key = payload.get("api_key")
        # Use provided model or fall back to provider's default
        model = payload.get("model")
        if not model:
            supported = AIService.get_supported_providers().get(provider, {})
            model = supported.get("default_model")

        ai_provider = AIService.get_provider(provider, api_key)
        success = ai_provider.test_connection(model)

        if not success:
            return JsonResponse({"success": False, "error": "Connection failed. Please check your API key and model selection."}, status=400)
        return JsonResponse({"success": True})
    except Exception as e:
        # Return a clear error payload for the frontend
        return JsonResponse({"success": False, "error": str(e)}, status=400)

@csrf_exempt
@json_endpoint
@require_http_methods(["POST", "OPTIONS"])
def analyze_resume(request):
    if request.method == "OPTIONS":
        return JsonResponse({"ok": True})
    access_token = request.headers.get("Authorization", "").replace("Bearer ", "")
    if not access_token:
        return JsonResponse({"error": "Unauthorized"}, status=401)
    try:
        user = supabase_client.verify_user(access_token)
        user_id = user["id"]
        payload = request.json
        
        resume_id = payload.get("resume_id")
        
        resume = supabase_client.get_single(
            "resumes",
            f"id=eq.{resume_id}&user_id=eq.{user_id}",
            access_token=access_token
        )
        
        if not resume:
            return JsonResponse({"error": "Resume not found"}, status=404)
        
        # Get user AI settings
        settings = supabase_client.get_single(
            "user_ai_settings",
            f"user_id=eq.{user_id}",
            access_token=access_token
        )
        
        if not settings or not settings.get("api_key"):
            return JsonResponse({"error": "Please configure your AI settings first"}, status=400)
            
        provider_name = settings["provider"]
        model = settings["model"]
        api_key = settings["api_key"]
            
        # Extract text
        file_bytes = supabase_client.download_storage("resumes", resume["file_path"], access_token)
        text = extract_text_from_file(file_bytes, resume["file_path"])
        text = text.replace("\r\n", "\n").replace("\u0000", "").strip()
        
        # Analyze with AI
        ai_provider = AIService.get_provider(provider_name, api_key)
        analysis = ai_provider.analyze_resume(text, model)
        
        # Check if the document was rejected by the AI validator
        if analysis.get("isValidResume") is False:
            rejection_reason = analysis.get("rejectionReason", "This document does not appear to be a resume. Please upload a valid resume (PDF or DOCX) for AI analysis.")
            supabase_client.update_rows(
                "resumes",
                f"id=eq.{resume_id}",
                {
                    "parse_status": "failed",
                    "parse_error": rejection_reason,
                    "ai_analysis": None
                },
                access_token
            )
            return JsonResponse({"error": rejection_reason}, status=400)

        # Save metadata about analysis
        import datetime
        analysis["meta"] = {
            "provider": provider_name,
            "model": model,
            "timestamp": datetime.datetime.utcnow().isoformat() + "Z"
        }

        # Save original version if not exists
        versions = supabase_client.fetch_rows(
            "resume_versions",
            {"resume_id": f"eq.{resume_id}", "is_original": "eq.true"}
        )
        
        if not versions:
            supabase_client.insert_row(
                "resume_versions",
                {
                    "resume_id": resume_id,
                    "user_id": user_id,
                    "version_number": 1,
                    "is_original": True,
                    "plain_text": text,
                    "content": {}
                },
                access_token
            )
        
        # Update resume
        supabase_client.update_rows(
            "resumes",
            f"id=eq.{resume_id}",
            {
                "raw_text": text[:200000],
                "ai_analysis": analysis,
                "parse_status": "completed",
                "parse_error": None,
                "word_count": len([w for w in text.split() if w])
            },
            access_token
        )
        
        return JsonResponse({"analysis": analysis, "raw_text": text})
    except Exception as e:
        # Mark resume as failed when an exception occurs during AI analysis
        try:
            supabase_client.update_rows(
                "resumes",
                f"id=eq.{resume_id}",
                {
                    "parse_status": "failed",
                    "parse_error": str(e)
                },
                access_token
            )
        except Exception:
            pass
        return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
@json_endpoint
@require_http_methods(["POST", "OPTIONS"])
def get_optimization_questions(request):
    if request.method == "OPTIONS":
        return JsonResponse({"ok": True})
    access_token = request.headers.get("Authorization", "").replace("Bearer ", "")
    if not access_token:
        return JsonResponse({"error": "Unauthorized"}, status=401)
    try:
        user = supabase_client.verify_user(access_token)
        user_id = user["id"]
        payload = request.json
        resume_id = payload.get("resume_id")
        # fetch resume
        resume = supabase_client.get_single(
            "resumes",
            f"id=eq.{resume_id}&user_id=eq.{user_id}",
            access_token=access_token
        )
        if not resume:
            return JsonResponse({"error": "Resume not found"}, status=404)
        analysis = resume.get("ai_analysis", {})
        if not analysis:
            return JsonResponse({"error": "Please analyze the resume first"}, status=400)
        # Check cache via supabase_client
        cache = supabase_client.get_single(
            "resume_optimization_cache",
            f"resume_id=eq.{resume_id}",
            access_token=access_token
        )
        if cache:
            # Return cached questions
            return JsonResponse({"questions": cache.get("questions", [])})
        # Get user AI settings
        settings = supabase_client.get_single(
            "user_ai_settings",
            f"user_id=eq.{user_id}",
            access_token=access_token
        )
        if not settings or not settings.get("api_key"):
            return JsonResponse({"error": "Please configure your AI settings first"}, status=400)
            
        provider_name = settings["provider"]
        model = settings["model"]
        api_key = settings["api_key"]
            
        ai_provider = AIService.get_provider(provider_name, api_key)
        text = resume.get("raw_text", "")
        questions = ai_provider.generate_optimization_questions(text, analysis, model)
        # Save to cache via supabase_client
        supabase_client.insert_row(
            "resume_optimization_cache",
            {
                "resume_id": resume_id,
                "questions": questions
            },
            access_token=access_token
        )
        return JsonResponse({"questions": questions})
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

import re

def validate_resume_integrity(original_text: str, original_analysis: dict, optimized_content: dict) -> list[str]:
    issues = []
    orig_text_lower = original_text.lower()
    
    # 1. Personal Information Validation
    personal = optimized_content.get("personalInformation", {})
    email = personal.get("email", "").strip()
    phone = personal.get("phone", "").strip()
    name = personal.get("name", "").strip()
    
    # Check if email is in original text
    if email and email.lower() not in orig_text_lower:
        issues.append(f"Email '{email}' does not match original resume content.")
        
    # Check if phone is in original text (clean non-digits for a soft match)
    if phone:
        digits_phone = re.sub(r"\D", "", phone)
        digits_orig = re.sub(r"\D", "", original_text)
        if digits_phone and digits_phone not in digits_orig:
            issues.append(f"Phone number '{phone}' does not match original resume content.")
            
    # Check if name is in original text
    if name and name.lower() not in orig_text_lower:
        parts = name.split()
        if not any(part.lower() in orig_text_lower for part in parts if len(part) > 2):
            issues.append(f"Name '{name}' does not appear in the original resume.")

    # 2. Experience Validation
    experience = optimized_content.get("experience", [])
    for exp in experience:
        company = exp.get("company", "").strip()
        if company and company.lower() not in orig_text_lower:
            issues.append(f"Company '{company}' in work experience does not exist in the original resume.")
            
    # 3. Education Validation
    education = optimized_content.get("education", [])
    for edu in education:
        school = edu.get("school", "").strip()
        if school and school.lower() not in orig_text_lower:
            issues.append(f"School '{school}' in education section does not exist in the original resume.")

    # 4. Projects Validation
    projects = optimized_content.get("projects", [])
    for proj in projects:
        proj_name = proj.get("name", "").strip()
        if proj_name and proj_name.lower() not in orig_text_lower:
            words = [w for w in proj_name.split() if len(w) > 3]
            if words and not any(w.lower() in orig_text_lower for w in words):
                issues.append(f"Project '{proj_name}' does not match any project in the original resume.")
                
    return issues


@csrf_exempt
@json_endpoint
@require_http_methods(["POST", "OPTIONS"])
def optimize_resume(request):
    if request.method == "OPTIONS":
        return JsonResponse({"ok": True})
    access_token = request.headers.get("Authorization", "").replace("Bearer ", "")
    if not access_token:
        return JsonResponse({"error": "Unauthorized"}, status=401)
    try:
        user = supabase_client.verify_user(access_token)
        user_id = user["id"]
        payload = request.json
        
        resume_id = payload.get("resume_id")
        user_answers = payload.get("answers", {})
        
        resume = supabase_client.get_single(
            "resumes",
            f"id=eq.{resume_id}&user_id=eq.{user_id}",
            access_token=access_token
        )
        
        if not resume:
            return JsonResponse({"error": "Resume not found"}, status=404)
        
        analysis = resume.get("ai_analysis", {})
        if not analysis:
            return JsonResponse({"error": "Please analyze the resume first"}, status=400)
        
        # Get user AI settings
        settings = supabase_client.get_single(
            "user_ai_settings",
            f"user_id=eq.{user_id}",
            access_token=access_token
        )
        
        if not settings or not settings.get("api_key"):
            return JsonResponse({"error": "Please configure your AI settings first"}, status=400)
            
        provider_name = settings["provider"]
        model = settings["model"]
        api_key = settings["api_key"]
            
        ai_provider = AIService.get_provider(provider_name, api_key)
        
        text = resume.get("raw_text", "")
        
        optimized = ai_provider.optimize_resume(text, analysis, user_answers, model)
        
        # Get original score for comparison
        ats_before = analysis.get("ats", {}).get("score", 70)
        
        return JsonResponse({
            "ats_before": ats_before,
            "optimized": optimized
        })
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@csrf_exempt
@json_endpoint
@require_http_methods(["POST", "OPTIONS"])
def validate_resume_integrity_view(request):
    if request.method == "OPTIONS":
        return JsonResponse({"ok": True})
    access_token = request.headers.get("Authorization", "").replace("Bearer ", "")
    if not access_token:
        return JsonResponse({"error": "Unauthorized"}, status=401)
    try:
        user = supabase_client.verify_user(access_token)
        user_id = user["id"]
        payload = request.json
        
        resume_id = payload.get("resume_id")
        optimized_content = payload.get("optimized_content", {})
        
        resume = supabase_client.get_single(
            "resumes",
            f"id=eq.{resume_id}&user_id=eq.{user_id}",
            access_token=access_token
        )
        if not resume:
            return JsonResponse({"error": "Resume not found"}, status=404)
            
        issues = validate_resume_integrity(resume.get("raw_text", ""), resume.get("ai_analysis", {}), optimized_content)
        return JsonResponse({"valid": len(issues) == 0, "issues": issues})
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@csrf_exempt
@json_endpoint
@require_http_methods(["POST", "OPTIONS"])
def save_optimized_version(request):
    if request.method == "OPTIONS":
        return JsonResponse({"ok": True})
    access_token = request.headers.get("Authorization", "").replace("Bearer ", "")
    if not access_token:
        return JsonResponse({"error": "Unauthorized"}, status=401)
    try:
        user = supabase_client.verify_user(access_token)
        user_id = user["id"]
        payload = request.json
        
        resume_id = payload.get("resume_id")
        optimized_content = payload.get("optimized_content", {})
        markdown = payload.get("markdown", "")
        plain_text = payload.get("plain_text", "")
        user_answers = payload.get("user_answers", {})
        ats_before = payload.get("ats_before", 70)
        ats_after = payload.get("ats_after", 90)
        changes_summary = payload.get("changes_summary", [])
        
        resume = supabase_client.get_single(
            "resumes",
            f"id=eq.{resume_id}&user_id=eq.{user_id}",
            access_token=access_token
        )
        if not resume:
            return JsonResponse({"error": "Resume not found"}, status=404)
            
        # 1. Validation (Changed to soft warning to prevent false positives from blocking saves)
        issues = validate_resume_integrity(resume.get("raw_text", ""), resume.get("ai_analysis", {}), optimized_content)
        if issues:
            print(f"Validation warnings (non-blocking): {issues}")
            
        # Get next version number
        versions = supabase_client.fetch_rows(
            "resume_versions",
            {"resume_id": f"eq.{resume_id}"}
        )
        next_version = len(versions) + 1
        
        # Build storage paths
        pdf_path = f"{user_id}/{resume_id}_v{next_version}.pdf"
        docx_path = f"{user_id}/{resume_id}_v{next_version}.docx"
        
        # 2. Generate PDF and DOCX
        from .generator import generate_resume_pdf, generate_resume_docx
        pdf_buffer = generate_resume_pdf(optimized_content)
        docx_buffer = generate_resume_docx(optimized_content)
        
        # 3. Upload to Supabase Storage
        supabase_client.upload_storage(
            "resumes",
            pdf_path,
            pdf_buffer.getvalue(),
            "application/pdf",
            access_token=access_token
        )
        
        supabase_client.upload_storage(
            "resumes",
            docx_path,
            docx_buffer.getvalue(),
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            access_token=access_token
        )
        
        # Get AI Settings for metadata
        settings = supabase_client.get_single(
            "user_ai_settings",
            f"user_id=eq.{user_id}",
            access_token=access_token
        )
        provider_name = settings.get("provider", "gemini") if settings else "gemini"
        model_name = settings.get("model", "") if settings else ""
        
        # Save version
        version = supabase_client.insert_row(
            "resume_versions",
            {
                "resume_id": resume_id,
                "user_id": user_id,
                "version_number": next_version,
                "is_original": False,
                "content": optimized_content,
                "markdown": markdown,
                "plain_text": plain_text,
                "user_answers": user_answers,
                "ai_provider": provider_name,
                "ai_model": model_name,
                "ats_before": ats_before,
                "ats_after": ats_after,
                "changes_summary": json.dumps(changes_summary) if isinstance(changes_summary, list) else changes_summary,
                "pdf_path": pdf_path,
                "docx_path": docx_path
            },
            access_token
        )
        
        return JsonResponse({
            "success": True,
            "version": version
        })
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
@json_endpoint
@require_http_methods(["GET", "OPTIONS"])
def get_resume_versions(request):
    if request.method == "OPTIONS":
        return JsonResponse({"ok": True})
    access_token = request.headers.get("Authorization", "").replace("Bearer ", "")
    if not access_token:
        return JsonResponse({"error": "Unauthorized"}, status=401)
    try:
        user = supabase_client.verify_user(access_token)
        user_id = user["id"]
        resume_id = request.GET.get("resume_id")
        
        if not resume_id:
            return JsonResponse({"error": "resume_id is required"}, status=400)
        
        versions = supabase_client.fetch_rows(
            "resume_versions",
            {"resume_id": f"eq.{resume_id}", "user_id": f"eq.{user_id}", "order": "version_number.asc"}
        )
        
        return JsonResponse({"versions": versions})
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@csrf_exempt
@json_endpoint
@require_http_methods(["POST", "OPTIONS"])
def delete_version(request):
    if request.method == "OPTIONS":
        return JsonResponse({"ok": True})
    access_token = request.headers.get("Authorization", "").replace("Bearer ", "")
    if not access_token:
        return JsonResponse({"error": "Unauthorized"}, status=401)
    try:
        user = supabase_client.verify_user(access_token)
        user_id = user["id"]
        body = request.json or {}
        version_id = body.get("version_id")

        if not version_id:
            return JsonResponse({"error": "version_id is required"}, status=400)

        # Verify ownership – fetch the version row first
        version_rows = supabase_client.fetch_rows(
            "resume_versions",
            {"id": f"eq.{version_id}", "user_id": f"eq.{user_id}"}
        )
        if not version_rows:
            return JsonResponse({"error": "Version not found or access denied"}, status=404)

        version = version_rows[0]
        if version.get("is_original"):
            return JsonResponse({"error": "Cannot delete original version"}, status=400)

        supabase_client.delete_rows("resume_versions", f"id=eq.{version_id}&user_id=eq.{user_id}")

        return JsonResponse({"success": True})
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
