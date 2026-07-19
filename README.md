# Resume Analyzer Monorepo

A full-stack resume analysis web app.

- **Frontend:** React + Vite (TanStack/React Start-style server functions)
- **Backend:** Django + Django REST Framework
- **Data/Auth/Storage:** Supabase (Postgres + Auth + Storage)

The backend parses an uploaded resume (PDF/DOCX/text), extracts skills/experience/education, then generates:
- a **job-targeted resume analysis** (scores, gaps, quick wins, salary range, cover letter drafts)
- an **interview question set**
- an **interview evaluation** summary (based on similarity + answer length/structure heuristics)

---

## Project Structure

```text
Resume_Analyzer-main/
  backend/                  # Django REST API + scoring logic
    api/                     # request handlers and ML/heuristic services
      views.py               # API endpoints
      urls.py                # route mapping
      services.py           # resume parsing + scoring + interview logic
    config/                  # Django settings, wsgi/asgi
    manage.py
    requirements.txt
    scripts/
      test_api.py           # quick local integration test (delete resume)

  frontend/                 # Browser UI
    src/
      serverFns/            # TanStack server functions calling backend endpoints
      lib/
        backend.ts          # fetch wrapper for backendPost()

  docs/
  Resume_Analyzer_Proposal_short.md
```

---

## What is happening in this project (end-to-end flow)

### 1) User authenticates (Supabase Auth)
Frontend uses Supabase to get a user JWT. Every backend call includes:
- `accessToken`: the user JWT

The backend verifies the JWT by calling Supabase **`/auth/v1/user`** before allowing DB/storage operations.

### 2) User uploads a resume (Supabase Storage)
Upload handling is primarily managed by the Supabase-backed frontend flow; the backend assumes a row exists in the `resumes` table with a `file_path` pointing to a Storage object.

### 3) Backend parses the resume (PDF/DOCX/text → extracted signals)
When the frontend calls:
- `POST /api/resumes/parse/`

Backend:
- downloads the resume file from Supabase Storage
- extracts text:
  - **PDF:** `pypdf.PdfReader`
  - **DOCX:** `python-docx`
  - otherwise: UTF-8 decode fallback
- computes:
  - `extracted_skills` (regex match against a large COMMON_SKILLS list)
  - `total_experience_years` (regex for "X years" / graduation years)
  - `education_level` (regex for PhD/Master’s/Bachelor’s/etc.)
  - `word_count`
  - `is_ats_friendly` (heuristic: contains contact + section keywords + reasonable length)
- updates the `resumes` row with the parsing results and marks `parse_status` as `completed`

### 4) User creates an “analysis” for a target job
When the frontend calls:
- `POST /api/analyses/create/`

Backend:
- verifies the resume is already parsed (`parse_status == completed` and `raw_text` exists)
- inserts a new `analyses` row with `status=processing`
- runs the scoring pipeline in `api/services.py` to generate:
  - ATS/keyword match signals
  - skill match score, experience score, education score, culture fit score
  - interview probability + grade
  - salary estimate range
  - matched/missing keywords
  - skill gaps, learning roadmap, quick wins
  - cover letter drafts (professional/conversational/creative)
- updates the `analyses` row to `status=completed` with all computed fields

### 5) User starts an interview session
When the frontend calls:
- `POST /api/interview/start/`

Backend:
- verifies resume parse completion
- pulls `extracted_skills` from the resume
- generates N questions using `build_questions()`:
  - **technical / behavioral / system_design** categories
  - question text template substitution using extracted skills
- inserts an `interview_sessions` row with:
  - generated `questions`
  - `answers=[]`
  - `status=in_progress`

### 6) User answers questions → backend evaluates answers
When the frontend calls:
- `POST /api/interview/evaluate/`

Backend:
- evaluates the submitted answer using `evaluate_answer()`:
  - similarity via TF-IDF cosine similarity between question text and user answer
  - length/structure heuristics (presence of STAR-like tokens)
  - language prefix for messages (“English” vs “Urdu”)
- updates the `interview_sessions.answers` array

### 7) User finishes interview → backend summarizes
When the frontend calls:
- `POST /api/interview/finish/`

Backend:
- reads stored answers + questions
- summarizes into:
  - overall score + grade
  - performance breakdown (technical/communication/problem_solving/culture_fit)
  - strengths and improvements
- updates the interview session to `status=completed` and returns the summary

---

## Backend details (Django + REST API)

### API endpoints
Base path is mapped in `backend/api/urls.py`:

- `GET  /api/health/`
- `POST /api/resumes/parse/`
- `POST /api/resumes/delete/`
- `POST /api/resumes/set-primary/`
- `POST /api/analyses/create/`
- `POST /api/analyses/delete/`
- `POST /api/interview/start/`
- `POST /api/interview/evaluate/`
- `POST /api/interview/finish/`
- `POST /api/interview/delete/`

All endpoints use a custom JSON body wrapper (`json_endpoint`) that:
- parses JSON if present
- returns `400` if JSON is invalid
- returns `ok: true` on `OPTIONS`

Every endpoint expects JSON input.

---

## Core scoring logic (what `backend/api/services.py` actually does)

### Resume parsing & extraction
1. **Text extraction**
   - PDF → concatenates page text
   - DOCX → concatenates paragraphs
   - Other → UTF-8 decode with ignore errors

2. **Skill extraction** (`extract_skills`)
   - Uses a large `COMMON_SKILLS` list
   - Performs regex boundary checks to detect skill phrases in resume/job text

3. **Experience estimation** (`estimate_experience_years`)
   - Finds patterns like `\d+ years` / `yrs`
   - Otherwise looks for years like 19xx/20xx and derives a rough range

4. **Education detection** (`detect_education`)
   - Regex checks for PhD, Master’s, Bachelor’s, Associate, High School

5. **ATS-friendly signal** (`is_ats_friendly`)
   - Heuristics:
     - contains “@”
     - contains section keywords: experience/education/skills/projects/summary
     - length between 500 and 50,000 chars

### Similarity & scoring
- Similarity uses:
  - **TF-IDF vectorizer** (`TfidfVectorizer(stop_words='english', max_features=2000)`)
  - **cosine similarity**

### Analysis generation (`generate_analysis`)
Main steps:
- compute resume skills + job skills
- determine:
  - matched keywords (job skills present in resume)
  - missing keywords
  - keyword similarity and ATS issues
- derive scores:
  - `ats_score`
  - `skills_score`
  - `experience_score`
  - `education_score`
  - `culture_score`
- compute combined signals:
  - `interview_probability`
  - `negotiation_power_score`
  - `competitor_percentile`
  - letter `grade` via thresholds (`score_to_grade`)
- produce structured output:
  - `skill_gaps` with `critical/important` labeling
  - `skill_roadmap` (weeks/resources)
  - `quick_wins` and `blockers`
  - salary range based on experience years
  - cover letter drafts using tone templates

### Interview question generation
- `build_questions(resume_skills, difficulty, count)`
  - cycles categories: technical → behavioral → system_design
  - technical questions substitute `{skill}`
  - other categories use templates directly

### Interview answer evaluation
- `evaluate_answer(question_text, user_answer, language)`
  - relevance = similarity score × 100
  - completeness = weighted similarity + a tiny length component
  - communication = based on word count and penalties for very short answers
  - depth = weighted similarity + structure score
  - overall = weighted combination of relevance/completeness/communication/depth
  - grade = `score_to_grade(overall)`

### Interview summary
- `summarize_interview(...)`
  - averages metrics from stored answers
  - returns overall grade + strengths/improvements

---

## Supabase integration (how backend reads/writes data)

Backend uses `SupabaseRestClient` inside `services.py`, which:
- verifies user JWT:
  - `GET {SUPABASE_URL}/auth/v1/user` with `Authorization: Bearer <token>`
- reads/writes rows:
  - `GET/POST/PATCH/DELETE` against `{SUPABASE_URL}/rest/v1/<table>`
- downloads stored files:
  - `GET {SUPABASE_URL}/storage/v1/object/resumes/<file_path>`
- deletes stored files similarly

### Important note about RLS
The backend chooses headers based on whether an `access_token` is provided:
- **with access token:** uses anon key + user bearer token
- **without access token:** uses service role key

In the API endpoints, it always verifies the user and passes `access_token` to Supabase REST calls.

---

## Frontend details (how UI calls backend)

### Backend request wrapper
`frontend/src/lib/backend.ts` implements:
- `backendPost(path, body)`
  - `fetch(<VITE_BACKEND_URL> + path)`
  - JSON body + `X-Client-Source`
  - throws an error containing `payload.error` when `response.ok` is false

### Server functions
`frontend/src/serverFns/*` wraps backend calls using `createServerFn` and `zod` validation.
Examples:
- `parseResume` → `POST /api/resumes/parse/`
- `createAnalysis` → `POST /api/analyses/create/`
- `startInterview`, `evaluateAnswer`, `finishInterview` (similar pattern)

---

## Setup (local development)

### Prerequisites
- **Node.js** (18+) or Bun
- **Python** (3.10+ recommended)
- Access to a **Supabase project** (Auth + Postgres + Storage)

---

### 1) Run Frontend
```bash
cd frontend
npm install
npm run dev
```

Frontend dev server will run on Vite.

### 2) CareerForge AI - Enterprise Resume Analyzer & Job Tracker

![Project Banner](frontend/public/images/ai_resume_analysis.png)

CareerForge AI is an enterprise-grade, full-stack application designed to process, evaluate, and structurally enhance professional resumes using deterministic algorithms and Large Language Models (LLMs).

## 🚀 Core Capabilities

*   **Precision Document Parsing:** Extracts structured data from raw unstructured PDF and DOCX files with high fidelity, mapping raw text to deterministic data models.
*   **Deterministic ATS Scoring:** Evaluates resumes using a strict, math-based rubric to calculate compatibility, keyword density, and gap analysis without AI hallucinations.
*   **AI-Powered Optimization:** Leverages multiple LLM providers (Gemini, Groq, Grok) to rewrite bullet points, strengthen action verbs, and ensure high ATS keyword density.
*   **Multi-Format Export:** Programmatically compiles optimized data models back into production-ready, beautifully formatted PDF and DOCX binaries.
*   **Kanban Job Tracker:** An integrated CRM for managing the entire job application lifecycle (Wishlist, Applied, Interviewing, Offered).
*   **Mock AI Interviewer:** Practice interviews against an AI agent tailored specifically to the contents of your newly optimized resume.

## 🛠️ Technology Stack

**Frontend Architecture:**
*   **Framework:** React 18 / Vite
*   **Routing:** TanStack Router
*   **Styling:** Tailwind CSS + Framer Motion (for smooth, corporate micro-interactions)
*   **Icons:** Lucide React

**Backend Architecture:**
*   **Framework:** Django (Python)
*   **Database & Auth:** Supabase (PostgreSQL, Row Level Security)
*   **AI Integration:** Multi-provider architecture (Google Gemini 1.5/2.5, Groq, Grok)

## ⚙️ Local Development Setup

### 1. Backend (Django)

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
.\venv\Scripts\activate  # Windows
source venv/bin/activate # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Run the local server
python manage.py runserver 8000
```

### 2. Frontend (React/Vite)

```bash
cd frontend

# Install dependencies
npm install

# Run the development server
npm run dev
```

The frontend will be available at `http://localhost:8080/`.

## 🧠 AI Provider Configuration
The system is built to be modular. Users can securely configure their own AI API Keys directly from the Frontend Profile Settings UI. Supported providers include:
*   **Google Gemini** (gemini-1.5-flash, gemini-2.5-flash, etc.)
*   **Groq** (llama3-70b-8192, mixtral-8x7b-32768, etc.)
*   **xAI Grok**

*Note: Default fallbacks are coded for immediate onboarding, but per-user API keys are highly recommended for production scale.*

## 🛡️ License & Deployment
This system is architected for secure, private document processing. Ensure proper environment variables and Supabase policies are configured before deploying to production (e.g., via Vercel for frontend and Render/Railway for backend).

---

## Environment variables

### Frontend
Create `frontend/.env`:
- `VITE_BACKEND_URL=http://localhost:8000` (if backend is not on the default)
- Supabase client values (required by frontend):
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`

### Backend (`backend/.env`)
Backend requires at least:
- `DATABASE_URL` (Supabase Postgres connection string)

The backend also reads:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `CORS_ALLOWED_ORIGINS` (comma-separated; defaults include localhost ports)

---

## Expected Supabase tables/fields (inferred from code)

The backend directly queries these tables via Supabase REST:
- `resumes`
  - used fields include:
    - `id`, `user_id`
    - `file_path`, `parse_status`, `parse_error`
    - `raw_text`, `extracted_skills`
    - `total_experience_years`, `education_level`, `word_count`, `is_ats_friendly`
    - `title` (referenced by interview start response: `resume.get("title")`)
    - `is_primary`

- `analyses`
  - used fields include:
    - `id`, `user_id`, `resume_id`
    - `status`, `error_message`
    - job inputs: `job_title`, `company_name`, `location`, `job_description`, `company_description`
    - scoring output fields (all returned from `generate_analysis`)

- `interview_sessions`
  - used fields include:
    - `id`, `user_id`, `resume_id`
    - `difficulty`, `mode`, `language`, `status`
    - `total_questions`, `questions`, `answers`
    - summary fields: `overall_score`, `grade`, `performance_breakdown`, `scores`, `strengths`, `improvements`

If your schema differs, you’ll need to align table names/columns with this code.

---

## Troubleshooting

### 1) Backend fails with DATABASE_URL error
`backend/config/settings.py` hard-fails when `DATABASE_URL` is missing.
Use Supabase Postgres connection string and ensure it includes `sslmode=require` (or set `sslmode` via query parameters in the URL).

### 2) CORS issues
Update `CORS_ALLOWED_ORIGINS` in `backend/.env` to include your frontend origin (Vite default is typically `http://localhost:5173`).

### 3) “Resume isn’t parsed yet”
Call order matters:
- parse resume first (`/api/resumes/parse/`)
- then create analysis (`/api/analyses/create/`)
- then start interview (`/api/interview/start/`)

### 4) Storage permission failures
Ensure:
- Supabase Storage bucket permissions allow authenticated users to access their own resume objects (or backend has proper permissions)
- `resumes` table rows contain correct `file_path` values.

---

## Deployment notes
The short proposal file in the repo (`Resume_Analyzer_Proposal_short.md`) describes a deployment approach with:
- frontend deployed as a Vite build (e.g., Vercel/Netlify)
- backend hosted anywhere that can run Django (Render/Heroku/container)
- Supabase used for DB/Auth/Storage

---

## Quick reference: request bodies

All request bodies are JSON.

### Parse resume
`POST /api/resumes/parse/`
```json
{
  "accessToken": "<user_jwt>",
  "resumeId": "<uuid>"
}
```

### Create analysis
`POST /api/analyses/create/`
```json
{
  "accessToken": "<user_jwt>",
  "resumeId": "<uuid>",
  "jobTitle": "...",
  "companyName": "...",
  "location": "...",
  "companyDescription": "...",
  "jobDescription": "..."
}
```

### Start interview
`POST /api/interview/start/`
```json
{
  "accessToken": "<user_jwt>",
  "resumeId": "<uuid>",
  "difficulty": "medium",
  "mode": "text",
  "totalQuestions": 10
}
```

### Evaluate answer
`POST /api/interview/evaluate/`
```json
{
  "accessToken": "<user_jwt>",
  "sessionId": "<uuid>",
  "questionId": 1,
  "questionText": "...",
  "questionCategory": "technical",
  "questionDifficulty": "medium",
  "userAnswer": "...",
  "language": "en"
}
```

### Finish interview
`POST /api/interview/finish/`
```json
{
  "accessToken": "<user_jwt>",
  "sessionId": "<uuid>"
}
```

---

## License
Not specified in the repo. Add a license file if needed for distribution.

#   R e s u m e _ A n a l y z e r - m a i n 
 