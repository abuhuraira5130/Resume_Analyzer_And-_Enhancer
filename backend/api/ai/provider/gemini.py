import json
import time
import requests
from typing import Any
from .base import BaseAIProvider
from .utils import clean_json_response, clean_resume_text


class GeminiProvider(BaseAIProvider):
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://generativelanguage.googleapis.com/v1beta/models"

    def _call_gemini(self, prompt: str, model: str, max_tokens: int = 3000, temperature: float = 0.2, max_retries: int = 2) -> str:
        url = f"{self.base_url}/{model}:generateContent?key={self.api_key}"
        payload = {
            "contents": [
                {
                    "parts": [{"text": prompt}]
                }
            ],
            "generationConfig": {
                "temperature": temperature,
                "topP": 0.95,
                "topK": 40,
                "maxOutputTokens": max_tokens,
                "responseMimeType": "application/json"
            }
        }

        last_exception = None
        for attempt in range(max_retries + 1):
            current_model = model
            url = f"{self.base_url}/{current_model}:generateContent?key={self.api_key}"
            try:
                print(f"Calling Gemini with model {current_model}, attempt {attempt+1}/{max_retries+1}...")
                response = requests.post(url, json=payload, timeout=180)

                if response.status_code == 429:
                    # Self-healing fallback for pro/heavy models to high-limit flash models
                    if "pro" in current_model.lower():
                        fallback_model = "gemini-2.5-flash" if "2.5" in current_model else "gemini-1.5-flash"
                        print(f"Gemini Rate Limit (429) hit for {current_model}. Automatically falling back to {fallback_model}...")
                        current_model = fallback_model
                        fallback_url = f"{self.base_url}/{fallback_model}:generateContent?key={self.api_key}"
                        response = requests.post(fallback_url, json=payload, timeout=180)
                        if response.ok:
                            result = response.json()
                            print("Gemini fallback successful!")
                            return result["candidates"][0]["content"]["parts"][0]["text"]

                    retry_after = response.headers.get("Retry-After") or response.headers.get("retry-after")
                    if retry_after:
                        try:
                            wait_time = float(retry_after)
                        except (ValueError, TypeError):
                            wait_time = min(2 ** attempt, 10)
                    else:
                        wait_time = min(2 ** attempt, 10)

                    if attempt < max_retries:
                        print(f"Waiting {wait_time} seconds before retry...")
                        time.sleep(wait_time)
                        continue
                    else:
                        raise Exception(
                            f"Rate limit exceeded after {max_retries + 1} attempts. "
                            f"Gemini API is temporarily throttling requests. "
                            f"Please wait a minute and try again, or switch to a different model/provider."
                        )

                if response.status_code == 503:
                    if attempt < max_retries:
                        time.sleep(min(2 ** attempt, 15))
                        continue

                response.raise_for_status()
                result = response.json()
                print("Gemini call completed successfully!")
                return result["candidates"][0]["content"]["parts"][0]["text"]

            except requests.exceptions.HTTPError as e:
                try:
                    err_data = response.json()
                    err_msg = err_data.get("error", {}).get("message", str(e))
                except Exception:
                    err_msg = str(e)
                last_exception = Exception(f"Gemini API Error: {err_msg}")
                if attempt < max_retries and response.status_code >= 500:
                    time.sleep(min(2 ** attempt, 15))
                    continue
                raise last_exception
            except requests.exceptions.ConnectionError:
                last_exception = Exception("Could not connect to Gemini API. Please check your internet connection.")
                if attempt < max_retries:
                    time.sleep(min(2 ** attempt, 10))
                    continue
                raise last_exception
            except requests.exceptions.Timeout:
                last_exception = Exception("Gemini API request timed out. Please try again.")
                if attempt < max_retries:
                    time.sleep(min(2 ** attempt, 10))
                    continue
                raise last_exception
            except Exception as e:
                if "Rate limit" in str(e) or "429" in str(e):
                    raise  # Already formatted from 429 block above
                raise Exception(f"Gemini Connection Error: {str(e)}")

        raise last_exception or Exception("Gemini API call failed after retries.")

    def analyze_resume(self, resume_text: str, model: str) -> dict[str, Any]:
        cleaned_text = clean_resume_text(resume_text)
        prompt = f"""You are a professional resume analyzer, ATS expert, and Document Classifier.
First, perform document validation. Check if the provided text looks like a resume/CV. If the text does not contain typical resume sections (e.g. professional experience, education, skills, personal contact information) or represents a completely different document type (like an invoice, booking confirmation, assignment instructions, notes, random paragraphs, or blank content), you MUST classify it as NOT a resume.

Return a STRICT JSON object matching one of the following schemas:

If document is NOT a valid resume:
{{
  "isValidResume": false,
  "rejectionReason": "Detailed explanation of why this document was rejected (e.g. 'This document appears to be an invoice or financial statement rather than a CV.')"
}}

If document IS a valid resume:
{{
  "isValidResume": true,
  "personalInformation": {{
    "name": "string",
    "email": "string",
    "phone": "string",
    "location": "string",
    "linkedin": "string",
    "github": "string",
    "portfolio": "string"
  }},
  "professionalSummary": "string",
  "skills": {{
    "technical": ["string"],
    "soft": ["string"],
    "all": ["string"]
  }},
  "missingSkills": ["string"],
  "experience": [
    {{
      "title": "string",
      "company": "string",
      "location": "string",
      "startDate": "string",
      "endDate": "string",
      "description": "string",
      "bulletPoints": ["string"]
    }}
  ],
  "education": [
    {{
      "degree": "string",
      "school": "string",
      "location": "string",
      "graduationDate": "string",
      "gpa": "string"
    }}
  ],
  "projects": [
    {{
      "name": "string",
      "description": "string",
      "technologies": ["string"],
      "url": "string"
    }}
  ],
  "certifications": [
    {{
      "name": "string",
      "issuer": "string",
      "date": "string"
    }}
  ],
  "languages": ["string"],
  "ats": {{
    "score": 0-100 (Calculate strictly: Start at 100. Deduct 15 if missing experience, 10 if missing education, 10 if missing skills, 5 per missing contact info, 5 for bad grammar. Must be mathematically exact),
    "explanation": "string",
    "issues": ["string"],
    "categoryBreakdown": {{
      "content": 0-100,
      "formatting": 0-100,
      "grammar": 0-100,
      "readability": 0-100,
      "keywords": 0-100,
      "skillsMatch": 0-100,
      "experience": 0-100
    }}
  }},
  "strengths": ["string"],
  "weaknesses": ["string"],
  "grammarIssues": ["string"],
  "formattingIssues": ["string"],
  "missingKeywords": ["string"],
  "improvementSuggestions": ["string"],
  "overallFeedback": "string",
  "aiConfidence": 0-100 (percentage of confidence in this analysis)
}}

Here is the document text to analyze:

{cleaned_text}

Return ONLY the raw JSON object, no explanation, no markdown blocks."""

        result_text = self._call_gemini(prompt, model, max_tokens=4000, temperature=0.0)
        return json.loads(clean_json_response(result_text))

    def generate_optimization_questions(self, resume_text: str, analysis: dict[str, Any], model: str) -> list[dict[str, Any]]:
        cleaned_text = clean_resume_text(resume_text)
        prompt = f"""You are a professional resume optimizer. Given the following resume and its analysis, generate a list of 5-8 relevant follow-up questions to help optimize the resume. Each question should have an id, question text, and optional suggested answers. Return ONLY a JSON array in this format:

[
  {{
    "id": "string",
    "question": "string",
    "type": "text" | "select" | "multiselect" | "number",
    "options": ["string"] (only for select/multiselect),
    "placeholder": "string"
  }}
]

Resume text:
{cleaned_text}

Resume analysis:
{json.dumps(analysis, indent=2)}

Return ONLY the JSON array, NO extra text."""

        result_text = self._call_gemini(prompt, model, max_tokens=3000, temperature=0.2)
        return json.loads(clean_json_response(result_text))

    def optimize_resume(
        self,
        resume_text: str,
        analysis: dict[str, Any],
        user_answers: dict[str, Any],
        model: str
    ) -> dict[str, Any]:
        cleaned_text = clean_resume_text(resume_text)
        prompt = f"""You are an elite professional resume writer and ATS optimization expert. Given the original resume, its analysis, and the user's answers to optimization questions, rewrite and optimize the resume with clear, noticeable improvements.

CRITICAL RULES FOR DATA INTEGRITY:
- You must NEVER invent fake experience, education, companies, certifications, projects, dates, achievements, or skills.
- You are ONLY allowed to rewrite existing content professionally, improve grammar/wording/ATS compatibility/formatting, strengthen bullet points (use action verbs, quantify achievements where possible from original data), reorganize sections, and improve keyword usage.
- All original factual data (names, dates, email, phone, companies, titles) must be preserved exactly.

Return a STRICT JSON object with:
{{
  "optimizedContent": {{
    "personalInformation": {{
      "name": "string",
      "email": "string",
      "phone": "string",
      "location": "string",
      "linkedin": "string",
      "github": "string",
      "portfolio": "string"
    }},
    "professionalSummary": "string",
    "experience": [
      {{
        "jobTitle": "string",
        "company": "string",
        "location": "string",
        "startDate": "string",
        "endDate": "string",
        "highlights": ["string"]
      }}
    ],
    "education": [
      {{
        "degree": "string",
        "school": "string",
        "location": "string",
        "graduationDate": "string",
        "gpa": "string"
      }}
    ],
    "projects": [
      {{
        "name": "string",
        "description": "string",
        "technologies": ["string"],
        "url": "string"
      }}
    ],
    "skills": {{
      "technical": ["string"],
      "soft": ["string"],
      "all": ["string"]
    }},
    "certifications": [
      {{
        "name": "string",
        "issuer": "string",
        "date": "string"
      }}
    ],
    "languages": ["string"]
  }},
  "markdown": "string",
  "plainText": "string",
  "ats": {{
    "score": 0-100 (a realistic, dynamic ATS score for the optimized resume, higher than original),
    "improvedAreas": ["string"],
    "explanation": "string"
  }},
  "changesSummary": ["string"]
}}

Original resume text:
{cleaned_text}

Analysis:
{json.dumps(analysis, indent=2)}

User answers:
{json.dumps(user_answers, indent=2)}

Return ONLY the JSON object, NO extra text."""

        result_text = self._call_gemini(prompt, model, max_tokens=7000, temperature=0.4)
        return json.loads(clean_json_response(result_text))

    def test_connection(self, model: str) -> bool:
        try:
            # Use minimal tokens to reduce rate limit pressure
            self._call_gemini("Say OK", model, max_tokens=5, max_retries=2)
            return True
        except Exception as e:
            raise Exception(f"Connection test failed: {str(e)}")
