from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.models import InternshipModel, StudentProfileModel
from app.schemas import InternshipResponse, MatchResult, JobSearchQuery
from app.services.job_discovery import job_discovery
from app.services.ai_matching import ai_matching

router = APIRouter(prefix="/api/internships", tags=["Internships Discovery & Matching"])

def sync_initial_internships(db: Session):
    """Seed initial verified internships if database is empty."""
    count = db.query(InternshipModel).count()
    if count == 0:
        for item in job_discovery.get_all_jobs():
            job = InternshipModel(**item)
            db.add(job)
        db.commit()

@router.get("", response_model=List[InternshipResponse])
def list_internships(
    query: Optional[str] = "",
    role: Optional[str] = "",
    location: Optional[str] = "",
    work_mode: Optional[str] = "",
    live_web: bool = False,
    db: Session = Depends(get_db)
):
    sync_initial_internships(db)
    
    if live_web and query:
        # Perform live search and persist newly discovered verified jobs
        discovered = job_discovery.search_jobs(query, role, location, work_mode, live_web=True)
        for d in discovered:
            exists = db.query(InternshipModel).filter(
                InternshipModel.title == d["title"],
                InternshipModel.company == d["company"]
            ).first()
            if not exists:
                new_job = InternshipModel(**d)
                db.add(new_job)
        db.commit()

    db_query = db.query(InternshipModel)
    if query:
        db_query = db_query.filter(
            (InternshipModel.title.ilike(f"%{query}%")) |
            (InternshipModel.company.ilike(f"%{query}%")) |
            (InternshipModel.description.ilike(f"%{query}%"))
        )
    if role and role != "all":
        db_query = db_query.filter(InternshipModel.title.ilike(f"%{role}%"))
    if work_mode and work_mode != "all":
        db_query = db_query.filter(InternshipModel.work_mode == work_mode)
    if location and location != "all":
        db_query = db_query.filter(InternshipModel.location.ilike(f"%{location}%"))

    return db_query.all()

@router.get("/matched", response_model=List[MatchResult])
def get_matched_internships(
    query: Optional[str] = "",
    role: Optional[str] = "",
    work_mode: Optional[str] = "",
    min_score: float = 0.0,
    live_web: bool = False,
    db: Session = Depends(get_db)
):
    sync_initial_internships(db)
    
    # 1. Fetch current student profile
    profile = db.query(StudentProfileModel).first()
    if not profile:
        raise HTTPException(status_code=400, detail="Please complete student profile first.")

    profile_dict = {
        "name": profile.name,
        "degree": profile.degree,
        "graduation_year": profile.graduation_year,
        "gpa": profile.gpa,
        "skills": profile.skills or [],
        "projects": profile.projects or [],
        "experience": profile.experience or [],
        "preferred_roles": profile.preferred_roles or [],
        "preferred_locations": profile.preferred_locations or [],
        "remote_preference": profile.remote_preference or "remote_ok"
    }

    # 2. Query internships
    db_query = db.query(InternshipModel)
    if query:
        db_query = db_query.filter(
            (InternshipModel.title.ilike(f"%{query}%")) |
            (InternshipModel.company.ilike(f"%{query}%")) |
            (InternshipModel.description.ilike(f"%{query}%"))
        )
    if work_mode and work_mode != "all":
        db_query = db_query.filter(InternshipModel.work_mode == work_mode)

    internships = db_query.all()
    
    # 3. Score each internship
    results = []
    for intern in internships:
        intern_dict = {
            "title": intern.title,
            "company": intern.company,
            "work_mode": intern.work_mode,
            "location": intern.location,
            "requirements": intern.requirements or [],
            "tags": intern.tags or [],
            "description": intern.description or ""
        }
        match_data = ai_matching.evaluate_match(profile_dict, intern_dict)
        if match_data["match_score"] >= min_score:
            results.append(
                MatchResult(
                    internship=intern,
                    match_score=match_data["match_score"],
                    breakdown=match_data["breakdown"],
                    match_reasons=match_data["match_reasons"],
                    matched_skills=match_data["matched_skills"],
                    missing_skills=match_data["missing_skills"],
                    improvement_areas=match_data["improvement_areas"],
                    fit_verdict=match_data["fit_verdict"]
                )
            )

    # Rank best to worst
    results.sort(key=lambda x: x.match_score, reverse=True)
    return results

@router.get("/{internship_id}", response_model=InternshipResponse)
def get_internship_by_id(internship_id: int, db: Session = Depends(get_db)):
    job = db.query(InternshipModel).filter(InternshipModel.id == internship_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Internship not found")
    return job
