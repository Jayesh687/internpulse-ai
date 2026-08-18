from sqlalchemy import Column, Integer, String, Float, Text, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class StudentProfileModel(Base):
    __tablename__ = "student_profiles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), default="")
    email = Column(String(255), default="")
    phone = Column(String(100), default="")
    degree = Column(String(255), default="Computer Science")
    graduation_year = Column(Integer, default=2026)
    gpa = Column(String(50), default="3.8")
    university = Column(String(255), default="")
    bio = Column(Text, default="")
    
    # JSON fields
    skills = Column(JSON, default=list)  # list of skill strings
    projects = Column(JSON, default=list)  # list of dicts {title, description, tech_stack, link}
    experience = Column(JSON, default=list)  # list of dicts {company, role, duration, bullets}
    preferred_roles = Column(JSON, default=list)  # ["Software Engineer", "AI/ML Intern"]
    preferred_locations = Column(JSON, default=list)  # ["San Francisco, CA", "New York, NY", "Remote"]
    remote_preference = Column(String(50), default="remote_ok")  # remote_only, remote_ok, onsite_only
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    applications = relationship("ApplicationModel", back_populates="student", cascade="all, delete-orphan")
    resumes = relationship("ResumeModel", back_populates="student", cascade="all, delete-orphan")
    interviews = relationship("InterviewSessionModel", back_populates="student", cascade="all, delete-orphan")


class ResumeModel(Base):
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("student_profiles.id"))
    filename = Column(String(255))
    file_path = Column(String(500))
    raw_text = Column(Text)
    parsed_data = Column(JSON, default=dict)
    uploaded_at = Column(DateTime, default=datetime.utcnow)

    student = relationship("StudentProfileModel", back_populates="resumes")


class InternshipModel(Base):
    __tablename__ = "internships"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), index=True)
    company = Column(String(255), index=True)
    company_logo = Column(String(500), default="")
    location = Column(String(255), default="Remote")
    work_mode = Column(String(50), default="remote")  # remote, hybrid, onsite
    stipend = Column(String(100), default="$45 - $60 / hr")
    deadline = Column(String(100), default="Rolling basis")
    application_url = Column(String(1000))
    description = Column(Text)
    requirements = Column(JSON, default=list)  # list of required skills/qualifications
    preferred_qualifications = Column(JSON, default=list)
    responsibilities = Column(JSON, default=list)
    tags = Column(JSON, default=list)  # ["AI/ML", "Python", "Remote", "Full-Stack"]
    source = Column(String(100), default="Curated Partner Feed")
    is_active = Column(Boolean, default=True)
    posted_date = Column(String(100), default="Recent")
    created_at = Column(DateTime, default=datetime.utcnow)

    applications = relationship("ApplicationModel", back_populates="internship")


class ApplicationModel(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("student_profiles.id"))
    internship_id = Column(Integer, ForeignKey("internships.id"))
    
    # Stages: saved, applied, assessment, interview, rejected, selected
    status = Column(String(50), default="saved", index=True)
    match_score = Column(Float, default=0.0)
    match_breakdown = Column(JSON, default=dict)  # {skills: 90, projects: 85, education: 100, preferences: 95}
    match_reasons = Column(JSON, default=list)  # ["Strong Python & React stack", "Remote aligns with preference"]
    missing_skills = Column(JSON, default=list)  # ["Kubernetes", "GraphQL"]
    improvement_areas = Column(JSON, default=list)
    
    # Generated Application Materials
    cover_letter = Column(Text, default="")
    why_hire_me = Column(Text, default="")
    why_company = Column(Text, default="")
    custom_answers = Column(JSON, default=dict)
    resume_suggestions = Column(JSON, default=list)
    
    notes = Column(Text, default="")
    applied_at = Column(DateTime, nullable=True)
    deadline = Column(String(100), default="")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    student = relationship("StudentProfileModel", back_populates="applications")
    internship = relationship("InternshipModel", back_populates="applications")


class InterviewSessionModel(Base):
    __tablename__ = "interview_sessions"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("student_profiles.id"))
    internship_id = Column(Integer, ForeignKey("internships.id"), nullable=True)
    role_title = Column(String(255), default="Software Engineering Intern")
    company_name = Column(String(255), default="Tech Corp")
    session_type = Column(String(50), default="mixed")  # technical, behavioral, hr, project_deep_dive, mixed
    overall_score = Column(Float, default=0.0)
    summary_feedback = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.utcnow)

    student = relationship("StudentProfileModel", back_populates="interviews")
    messages = relationship("InterviewMessageModel", back_populates="session", cascade="all, delete-orphan")


class InterviewMessageModel(Base):
    __tablename__ = "interview_messages"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("interview_sessions.id"))
    sender = Column(String(50))  # "ai", "user", "system"
    content = Column(Text)
    evaluation = Column(JSON, default=dict)  # {score: 85, feedback: "...", key_strengths: [], improvements: []}
    timestamp = Column(DateTime, default=datetime.utcnow)

    session = relationship("InterviewSessionModel", back_populates="messages")
