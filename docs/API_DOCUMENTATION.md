# CareerSense API Documentation

> **⚠️ PARTIALLY STALE.** The per-endpoint request/response details below were
> written for an earlier, stateless version of the API and have **not** been kept
> current (they predate auth, the database, discovery, and career-paths). Use the
> **current-endpoints quick reference** immediately below as the source of truth;
> treat the older sections as historical detail. The authoritative architecture
> doc is [`../CLAUDE.md`](../CLAUDE.md).

## Current endpoints (quick reference)

Base URL: `http://localhost:5001` (set via `VITE_API_URL` on the frontend).

Most routes are **protected** — they require a Clerk session token
(`Authorization: Bearer <token>`) when `AUTH_ENABLED=true`. With `AUTH_ENABLED=false`
(local testing) they're open and scope data to a `local-dev-user`.

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET  | `/health` | public | Liveness check. |
| POST | `/analyze` | protected | Upload a CV (multipart `file`) → full analysis JSON (also persisted). |
| GET  | `/analyses/latest` | protected | The signed-in user's most recent saved analysis. |
| POST | `/api/archetype` | protected | Career-archetype classification for résumé text. |
| POST | `/api/interview/questions` | protected | `{ role, level }` → role-specific interview questions. |
| POST | `/api/discovery/sessions` | protected | Start a discovery session (returns opening message). |
| GET  | `/api/discovery/sessions/latest` | protected | Resume the active discovery session, or null. |
| GET  | `/api/discovery/sessions/:id` | protected | Fetch one discovery session (user-scoped). |
| POST | `/api/discovery/sessions/:id/messages` | protected | `{ content }` → agent reply; on completion attaches the enriched profile. |
| GET  | `/api/career-paths` | protected | Role-shift options + shared/gap skills (O*NET-grounded or AI-derived). |

Errors are returned as `{ error, details, timestamp, path }` with the appropriate
HTTP status (see `backend/middleware/errorHandler.js`).

---

<details>
<summary>Legacy detail (pre-auth/pre-DB — kept for reference, may be inaccurate)</summary>

## Base URL

```
http://localhost:5001
```

## Authentication

Currently, the API does not require authentication.

## Endpoints

### Health Check

Check if the API server is running.

```
GET /health
```

#### Response

```json
{
  "status": "ok",
  "message": "Server is running",
  "timestamp": "2023-04-21T12:00:00.000Z"
}
```

### CV Analysis

Upload and analyze a CV/resume to get career insights.

```
POST /analyze
```

#### Request

Content-Type: `multipart/form-data`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| file      | File | Yes      | The CV/resume file to analyze (PDF, DOC, DOCX) |

#### Response

```json
{
  "user_profile": {
    "name": "John Doe",
    "current_role": "Software Engineer",
    "sector": "Technology",
    "location": "San Francisco, CA",
    "years_experience": 5,
    "education": ["B.S. Computer Science, Stanford University"],
    "email": "john.doe@example.com",
    "linkedin": "linkedin.com/in/johndoe",
    "portfolio_url": "johndoe.dev"
  },
  "profile_strengths": {
    "skills": ["JavaScript", "React", "Node.js", "TypeScript", "AWS"],
    "core_competencies": ["Full-stack Development", "Agile Methodologies", "System Design"],
    "achievements": [
      "Led development of a customer-facing application that increased user engagement by 40%",
      "Optimized database queries resulting in 30% faster load times"
    ]
  },
  "improvement_areas": {
    "skills_gaps": ["Cloud Architecture", "Mobile Development"],
    "experience_gaps": ["Team leadership", "Project management"],
    "presentation_structure": "Consider reorganizing experience section to highlight achievements more prominently"
  },
  "role_matching": [
    {
      "role": "Senior Frontend Developer",
      "match_percentage": 92,
      "transition_difficulty": "Easy",
      "required_skills": ["React", "TypeScript", "Redux", "CSS"],
      "role_description": "Responsible for building and maintaining user interfaces for web applications"
    },
    {
      "role": "Full Stack Engineer",
      "match_percentage": 87,
      "transition_difficulty": "Easy",
      "required_skills": ["JavaScript", "Node.js", "React", "SQL"]
    },
    {
      "role": "DevOps Engineer",
      "match_percentage": 65,
      "transition_difficulty": "Medium",
      "required_skills": ["AWS", "Docker", "Kubernetes", "CI/CD"]
    }
  ],
  "resume_optimization": {
    "bullet_rewrites": [
      {
        "original": "Developed features for web application",
        "optimized": "Engineered and implemented key features for customer-facing web application, increasing user engagement by 40%"
      }
    ],
    "ats_keywords_missing": ["CI/CD", "Agile", "Scrum"],
    "formatting_feedback": "Consider using a cleaner format with more white space to improve readability"
  },
  "future_growth_potential": {
    "career_growth_trajectory": "Strong potential for senior or lead developer roles within 1-2 years",
    "skills_forecast": ["Cloud Architecture", "Team Leadership", "System Design"],
    "industry_insights": ["Growing demand for full-stack developers with React expertise"]
  }
}
```

### Career Archetype Analysis

Analyze CV text to determine career archetype.

```
POST /api/archetype
```

#### Request

Content-Type: `application/json`

```json
{
  "cvText": "Full text content of the CV/resume"
}
```

#### Response

```json
{
  "archetype": "The Builder",
  "short_description": "Practical problem-solver who excels at creating tangible solutions",
  "reasoning": "Your experience demonstrates a strong focus on implementation and building functional systems. You show a pattern of taking concepts and turning them into working solutions, with emphasis on technical execution rather than strategy or people management."
}
```

### Mock Interview Questions

Generate interview questions based on a job description and user profile.

```
POST /api/interview/questions
```

#### Request

Content-Type: `application/json`

```json
{
  "jobTitle": "Senior Frontend Developer",
  "jobDescription": "We are looking for a Senior Frontend Developer with experience in React...",
  "userProfile": {
    // User profile object from CV analysis
  }
}
```

#### Response

```json
{
  "questions": [
    {
      "question": "Can you describe a complex UI component you built with React and the challenges you faced?",
      "category": "Technical",
      "difficulty": "Medium"
    },
    {
      "question": "How do you approach optimizing the performance of a React application?",
      "category": "Technical",
      "difficulty": "Hard"
    },
    {
      "question": "Tell me about a time when you had to meet a tight deadline. How did you manage your time and priorities?",
      "category": "Behavioral",
      "difficulty": "Medium"
    }
  ]
}
```

### Career Path Recommendations

Get detailed career path recommendations based on skills and experience.

```
POST /api/career-paths
```

#### Request

Content-Type: `application/json`

```json
{
  "userProfile": {
    // User profile object from CV analysis
  },
  "preferences": {
    "industries": ["Technology", "Finance"],
    "roles": ["Engineering", "Product"],
    "workStyle": ["Remote", "Hybrid"]
  }
}
```

#### Response

```json
{
  "paths": [
    {
      "title": "Senior Frontend Developer",
      "match_percentage": 92,
      "transition_difficulty": "Easy",
      "required_skills": ["React", "TypeScript", "Redux", "CSS"],
      "skill_gaps": ["React Native"],
      "growth_potential": "High",
      "salary_range": "$120,000 - $160,000",
      "industry_outlook": "Strong growth expected over next 5 years"
    },
    {
      "title": "Frontend Tech Lead",
      "match_percentage": 78,
      "transition_difficulty": "Medium",
      "required_skills": ["React", "TypeScript", "System Design", "Team Leadership"],
      "skill_gaps": ["People Management", "Project Planning"],
      "growth_potential": "Very High",
      "salary_range": "$140,000 - $180,000",
      "industry_outlook": "High demand for technical leaders with strong coding skills"
    }
  ]
}
```

## Error Responses

The API uses conventional HTTP response codes to indicate the success or failure of requests.

- 200 OK: The request was successful
- 400 Bad Request: The request was invalid or cannot be served
- 404 Not Found: The requested resource does not exist
- 500 Internal Server Error: Something went wrong on the server

Error Response Format:

```json
{
  "error": {
    "status": 400,
    "message": "Invalid file format. Please upload a PDF, DOC, or DOCX file."
  }
}
```

## Rate Limiting

The API currently implements rate limiting to prevent abuse:
- 100 requests per hour for general API endpoints
- 5 requests per hour for resource-intensive operations (CV analysis, career path generation)

## File Upload Limits

- Maximum file size: 10MB
- Supported formats: PDF, DOC, DOCX

</details>
