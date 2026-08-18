from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any
from datetime import datetime

class ProjectSchema(BaseModel):
    title: str
    description: str
    tech_stack: List[str] = []
    link: Optional[str] = ""

class ExperienceSchema(BaseModel):
    company: str
    role: str
    duration: str
    bullets: List[str] = []

class StudentProfileBase(BaseModel):
    name: str = ""
    email: str = ""
    phone: str = ""
    degree: str = "B.S. in Computer Science"
    graduation_year: int = 2026
    gpa: str = "3.8"
    university: str = ""
    bio: str = ""
    skills: List[str] = []
    projects: List[ProjectSchema] = []
    experience: List[ExperienceSchema] = []
    preferred_roles: List[str] = ["Software Engineering Intern", "AI/ML Intern"]
    preferred_locations: List[str] = ["Remote", "San Francisco, CA"]
    remote_preference: str = "remote_ok"

class StudentProfileCreate(StudentProfileBase):
    pass

class StudentProfileResponse(StudentProfileBase):
    id: int
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True

class ResumeUploadResponse(BaseModel):
    id: int
    filename: str
    extracted_text: str
    parsed_profile: Dict[str, Any]
    skills_found: List[str]
    missing_recommendations: List[str]

class InternshipBase(BaseModel):
    title: str
    company: str
    company_logo: str = ""
    location: str = "Remote"
    work_mode: str = "remote"
    stipend: str = "$45 - $60 / hr"
    deadline: str = "Rolling basis"
    application_url: str
    description: str
    requirements: List[str] = []
    preferred_qualifications: List[str] = []
    responsibilities: List[str] = []
    tags: List[str] = []
    source: str = "Curated Verified Feed"
    is_active: bool = True
    posted_date: str = "Recent"

class InternshipResponse(InternshipBase):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True

class MatchScoreBreakdown(BaseModel):
    skills_score: float
    projects_score: float
    experience_score: float
    education_score: float
    preference_score: float
    overall_score: float

class MatchResult(BaseModel):
    internship: InternshipResponse
    match_score: float
    breakdown: MatchScoreBreakdown
    match_reasons: List[str]
    matched_skills: List[str]
    missing_skills: List[str]
    improvement_areas: List[str]
    fit_verdict: str

class ApplicationCreate(BaseModel):
    internship_id: int
    status: str = "saved"
    notes: Optional[str] = ""

class ApplicationUpdate(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None
    deadline: Optional[str] = None
    applied_at: Optional[datetime] = None

class ApplicationResponse(BaseModel):
    id: int
    student_id: int
    internship_id: int
    internship: InternshipResponse
    status: str
    match_score: float
    match_breakdown: Dict[str, Any] = {}
    match_reasons: List[str] = []
    missing_skills: List[str] = []
    improvement_areas: List[str] = []
    cover_letter: str = ""
    why_hire_me: str = ""
    why_company: str = ""
    custom_answers: Dict[str, Any] = {}
    resume_suggestions: List[Dict[str, Any]] = []
    notes: str = ""
    applied_at: Optional[datetime] = None
    deadline: str = ""
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True

class TailorRequest(BaseModel):
    internship_id: int
    custom_question_prompt: Optional[str] = None

class TailoredApplicationResponse(BaseModel):
    cover_letter: str
    why_hire_me: str
    why_company: str
    custom_answers: Dict[str, str] = {}
    resume_suggestions: List[Dict[str, str]] = []
    role_insights: Dict[str, Any] = {}

class InterviewQuestion(BaseModel):
    id: str
    category: str  # technical, behavioral, hr, project_deep_dive
    question: str
    context_or_tip: str
    rubric: List[str] = []

class InterviewPrepResponse(BaseModel):
    role_title: str
    company: str
    questions: List[InterviewQuestion]
    recommended_topics: List[str]
    star_framework_guide: str

class MockChatRequest(BaseModel):
    session_id: int
    user_message: str

class MockChatResponse(BaseModel):
    session_id: int
    ai_response: str
    evaluation: Optional[Dict[str, Any]] = None
    next_question: Optional[str] = None
    is_session_complete: bool = False
    current_score: float = 0.0

class JobSearchQuery(BaseModel):
    query: Optional[str] = ""
    role: Optional[str] = ""
    location: Optional[str] = ""
    work_mode: Optional[str] = "" # all, remote, onsite, hybrid
    min_score: Optional[float] = 0.0
