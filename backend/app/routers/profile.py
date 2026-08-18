import os
import shutil
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Dict, Any

from app.database import get_db
from app.models import StudentProfileModel, ResumeModel
from app.schemas import StudentProfileCreate, StudentProfileResponse, ResumeUploadResponse
from app.services.resume_parser import resume_parser

router = APIRouter(prefix="/api/profile", tags=["Student Profile"])

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.get("", response_model=StudentProfileResponse)
def get_current_profile(db: Session = Depends(get_db)):
    profile = db.query(StudentProfileModel).first()
    if not profile:
        # Create default profile if none exists
        profile = StudentProfileModel(
            name="Jayesh",
            email="jayesh@university.edu",
            phone="+1 (555) 234-5678",
            degree="B.S. in Computer Science",
            graduation_year=2026,
            gpa="3.85",
            university="State University of Technology",
            bio="3rd-year Computer Science student passionate about AI/ML, distributed backend systems, and developer tooling.",
            skills=["Python", "Java", "SQL", "React", "TypeScript", "FastAPI", "PyTorch", "Docker", "Git", "REST APIs"],
            projects=[
                {
                    "title": "Autonomous Agent Workspace",
                    "description": "Built an interactive AI workflow platform with FastAPI, React, and vector search, decreasing research latency by 40%.",
                    "tech_stack": ["Python", "FastAPI", "React", "Docker"],
                    "link": "https://github.com/alexchen/agent-workspace"
                },
                {
                    "title": "Distributed Task Queue",
                    "description": "Engineered high-throughput task worker pool in Python & Redis handling 10,000+ simulated jobs per minute.",
                    "tech_stack": ["Python", "Redis", "SQL", "Docker"],
                    "link": "https://github.com/alexchen/task-queue"
                }
            ],
            experience=[
                {
                    "company": "Campus Innovation Labs",
                    "role": "Undergraduate Software Engineering Intern",
                    "duration": "Summer 2025",
                    "bullets": [
                        "Developed automated test suites and backend endpoints in Python & SQL for 5,000+ active students.",
                        "Optimized database indexing to reduce API p99 response times from 320ms to 85ms."
                    ]
                }
            ],
            preferred_roles=["Software Engineering Intern", "AI/ML Intern", "Full-Stack Developer Intern", "Backend Intern"],
            preferred_locations=["Remote", "San Francisco, CA", "Seattle, WA", "New York, NY"],
            remote_preference="remote_ok"
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)
    elif profile.name == "Alex Chen":
        # Keep older seeded databases aligned with the updated default display name.
        profile.name = "Jayesh"
        if profile.email == "alex.chen@university.edu":
            profile.email = "jayesh@university.edu"
        db.commit()
        db.refresh(profile)
    return profile

@router.put("", response_model=StudentProfileResponse)
def update_profile(data: StudentProfileCreate, db: Session = Depends(get_db)):
    profile = db.query(StudentProfileModel).first()
    if not profile:
        profile = StudentProfileModel(**data.dict())
        db.add(profile)
    else:
        for k, v in data.dict().items():
            setattr(profile, k, v)
    db.commit()
    db.refresh(profile)
    return profile

@router.post("/upload-resume", response_model=ResumeUploadResponse)
async def upload_resume(file: UploadFile = File(...), db: Session = Depends(get_db)):
    content = await file.read()
    filename = file.filename or "resume.pdf"
    
    # Save file
    save_path = os.path.join(UPLOAD_DIR, filename)
    with open(save_path, "wb") as f:
        f.write(content)

    # Parse resume
    extracted_text = resume_parser.extract_text(content, filename)
    parsed = resume_parser.parse_resume_content(extracted_text)

    # Sync with student profile
    profile = db.query(StudentProfileModel).first()
    if not profile:
        profile = StudentProfileModel(
            name=parsed.get("name") or "Student Applicant",
            email=parsed.get("email") or "",
            phone=parsed.get("phone") or "",
            degree=parsed.get("degree") or "B.S. in Computer Science",
            graduation_year=parsed.get("graduation_year") or 2026,
            gpa=parsed.get("gpa") or "3.8",
            university=parsed.get("university") or "",
            skills=parsed.get("skills", []),
            projects=parsed.get("projects", []),
            experience=parsed.get("experience", []),
            preferred_roles=parsed.get("preferred_roles", []),
            preferred_locations=parsed.get("preferred_locations", []),
            remote_preference="remote_ok"
        )
        db.add(profile)
    else:
        if parsed.get("name"): profile.name = parsed["name"]
        if parsed.get("email"): profile.email = parsed["email"]
        if parsed.get("phone"): profile.phone = parsed["phone"]
        if parsed.get("degree"): profile.degree = parsed["degree"]
        if parsed.get("graduation_year"): profile.graduation_year = parsed["graduation_year"]
        if parsed.get("university"): profile.university = parsed["university"]
        
        # Merge skills
        existing_skills = set(profile.skills or [])
        new_skills = set(parsed.get("skills", []))
        profile.skills = list(existing_skills.union(new_skills))
        
        if parsed.get("projects"):
            profile.projects = parsed["projects"]
        if parsed.get("experience"):
            profile.experience = parsed["experience"]

    db.commit()
    db.refresh(profile)

    # Save resume record
    resume_record = ResumeModel(
        student_id=profile.id,
        filename=filename,
        file_path=save_path,
        raw_text=extracted_text,
        parsed_data=parsed
    )
    db.add(resume_record)
    db.commit()
    db.refresh(resume_record)

    missing_recs = []
    if "Git" not in parsed.get("skills", []):
        missing_recs.append("Add Version Control & Git to your skills.")
    if "Docker" not in parsed.get("skills", []):
        missing_recs.append("Consider learning Containerization (Docker) to broaden DevOps appeal.")

    return ResumeUploadResponse(
        id=resume_record.id,
        filename=filename,
        extracted_text=extracted_text[:1000] + ("..." if len(extracted_text) > 1000 else ""),
        parsed_profile=parsed,
        skills_found=parsed.get("skills", []),
        missing_recommendations=missing_recs
    )
