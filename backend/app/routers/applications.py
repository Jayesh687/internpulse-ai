from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from app.database import get_db
from app.models import ApplicationModel, StudentProfileModel, InternshipModel
from app.schemas import (
    ApplicationCreate, ApplicationUpdate, ApplicationResponse,
    TailorRequest, TailoredApplicationResponse
)
from app.services.ai_matching import ai_matching
from app.services.application_assistant import application_assistant

router = APIRouter(prefix="/api/applications", tags=["Application Tracker & Assistant"])

@router.get("", response_model=List[ApplicationResponse])
def get_all_applications(db: Session = Depends(get_db)):
    return db.query(ApplicationModel).all()

@router.post("", response_model=ApplicationResponse)
def create_or_save_application(data: ApplicationCreate, db: Session = Depends(get_db)):
    profile = db.query(StudentProfileModel).first()
    if not profile:
        raise HTTPException(status_code=400, detail="Profile required")
    
    internship = db.query(InternshipModel).filter(InternshipModel.id == data.internship_id).first()
    if not internship:
        raise HTTPException(status_code=404, detail="Internship not found")

    existing = db.query(ApplicationModel).filter(
        ApplicationModel.student_id == profile.id,
        ApplicationModel.internship_id == data.internship_id
    ).first()

    if existing:
        existing.status = data.status
        if data.notes: existing.notes = data.notes
        db.commit()
        db.refresh(existing)
        return existing

    # Compute match
    profile_dict = {
        "name": profile.name,
        "degree": profile.degree,
        "graduation_year": profile.graduation_year,
        "skills": profile.skills or [],
        "projects": profile.projects or [],
        "experience": profile.experience or [],
        "preferred_roles": profile.preferred_roles or [],
        "remote_preference": profile.remote_preference or "remote_ok"
    }
    intern_dict = {
        "title": internship.title,
        "company": internship.company,
        "work_mode": internship.work_mode,
        "requirements": internship.requirements or [],
        "tags": internship.tags or []
    }
    eval_res = ai_matching.evaluate_match(profile_dict, intern_dict)

    app_record = ApplicationModel(
        student_id=profile.id,
        internship_id=internship.id,
        status=data.status,
        match_score=eval_res["match_score"],
        match_breakdown=eval_res["breakdown"].dict(),
        match_reasons=eval_res["match_reasons"],
        missing_skills=eval_res["missing_skills"],
        improvement_areas=eval_res["improvement_areas"],
        notes=data.notes or "",
        deadline=internship.deadline
    )
    db.add(app_record)
    db.commit()
    db.refresh(app_record)
    return app_record

@router.put("/{app_id}", response_model=ApplicationResponse)
def update_application(app_id: int, data: ApplicationUpdate, db: Session = Depends(get_db)):
    app_record = db.query(ApplicationModel).filter(ApplicationModel.id == app_id).first()
    if not app_record:
        raise HTTPException(status_code=404, detail="Application not found")

    if data.status is not None:
        app_record.status = data.status
        if data.status == "applied" and not app_record.applied_at:
            app_record.applied_at = datetime.utcnow()
    if data.notes is not None:
        app_record.notes = data.notes
    if data.deadline is not None:
        app_record.deadline = data.deadline
    if data.applied_at is not None:
        app_record.applied_at = data.applied_at

    db.commit()
    db.refresh(app_record)
    return app_record

@router.delete("/{app_id}")
def delete_application(app_id: int, db: Session = Depends(get_db)):
    app_record = db.query(ApplicationModel).filter(ApplicationModel.id == app_id).first()
    if not app_record:
        raise HTTPException(status_code=404, detail="Application not found")
    db.delete(app_record)
    db.commit()
    return {"message": "Application deleted successfully"}

@router.post("/tailor", response_model=TailoredApplicationResponse)
async def generate_tailored_application(req: TailorRequest, db: Session = Depends(get_db)):
    profile = db.query(StudentProfileModel).first()
    if not profile:
        raise HTTPException(status_code=400, detail="Profile required")
    
    internship = db.query(InternshipModel).filter(InternshipModel.id == req.internship_id).first()
    if not internship:
        raise HTTPException(status_code=404, detail="Internship not found")

    profile_dict = {
        "name": profile.name,
        "degree": profile.degree,
        "graduation_year": profile.graduation_year,
        "university": profile.university,
        "skills": profile.skills or [],
        "projects": profile.projects or [],
        "experience": profile.experience or []
    }
    intern_dict = {
        "title": internship.title,
        "company": internship.company,
        "requirements": internship.requirements or [],
        "tags": internship.tags or [],
        "description": internship.description or ""
    }

    result = await application_assistant.generate_tailored_materials(
        profile_dict, intern_dict, req.custom_question_prompt or ""
    )

    # Save generated materials to application if it exists
    app_record = db.query(ApplicationModel).filter(
        ApplicationModel.student_id == profile.id,
        ApplicationModel.internship_id == internship.id
    ).first()
    if app_record:
        app_record.cover_letter = result["cover_letter"]
        app_record.why_hire_me = result["why_hire_me"]
        app_record.why_company = result["why_company"]
        app_record.custom_answers = result["custom_answers"]
        app_record.resume_suggestions = result["resume_suggestions"]
        db.commit()

    return TailoredApplicationResponse(**result)
