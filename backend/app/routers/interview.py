from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models import StudentProfileModel, InternshipModel, InterviewSessionModel, InterviewMessageModel
from app.schemas import (
    InterviewPrepResponse, MockChatRequest, MockChatResponse
)
from app.services.interview_prep import interview_prep

router = APIRouter(prefix="/api/interview", tags=["Interview Prep & Mock Interview"])

@router.get("/prep/{internship_id}", response_model=InterviewPrepResponse)
def get_interview_prep(internship_id: int, db: Session = Depends(get_db)):
    profile = db.query(StudentProfileModel).first()
    if not profile:
        raise HTTPException(status_code=400, detail="Student profile required")
    
    internship = db.query(InternshipModel).filter(InternshipModel.id == internship_id).first()
    if not internship:
        raise HTTPException(status_code=404, detail="Internship not found")

    profile_dict = {
        "name": profile.name,
        "degree": profile.degree,
        "skills": profile.skills or [],
        "projects": profile.projects or []
    }
    intern_dict = {
        "title": internship.title,
        "company": internship.company,
        "requirements": internship.requirements or []
    }

    return interview_prep.generate_prep_kit(profile_dict, intern_dict)

@router.post("/session/start/{internship_id}")
def start_mock_interview_session(internship_id: int, db: Session = Depends(get_db)):
    profile = db.query(StudentProfileModel).first()
    if not profile:
        raise HTTPException(status_code=400, detail="Student profile required")
    
    internship = db.query(InternshipModel).filter(InternshipModel.id == internship_id).first()
    if not internship:
        raise HTTPException(status_code=404, detail="Internship not found")

    session = InterviewSessionModel(
        student_id=profile.id,
        internship_id=internship.id,
        role_title=internship.title,
        company_name=internship.company,
        session_type="mixed"
    )
    db.add(session)
    db.commit()
    db.refresh(session)

    welcome_msg = (
        f"Hello {profile.name or 'there'}! I'm your AI Interviewer for the {internship.title} role at {internship.company}. "
        f"I'll ask you a sequence of technical, behavioral, and project-oriented questions. "
        f"Whenever you're ready, let's start with our first question: "
        f"Could you give me a brief overview of yourself and what inspired you to pursue software engineering?"
    )
    ai_msg = InterviewMessageModel(
        session_id=session.id,
        sender="ai",
        content=welcome_msg
    )
    db.add(ai_msg)
    db.commit()

    return {
        "session_id": session.id,
        "role_title": session.role_title,
        "company_name": session.company_name,
        "initial_message": welcome_msg
    }

@router.get("/session/{session_id}/messages")
def get_session_messages(session_id: int, db: Session = Depends(get_db)):
    session = db.query(InterviewSessionModel).filter(InterviewSessionModel.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    messages = db.query(InterviewMessageModel).filter(InterviewMessageModel.session_id == session_id).all()
    return [{
        "id": m.id,
        "sender": m.sender,
        "content": m.content,
        "evaluation": m.evaluation,
        "timestamp": m.timestamp
    } for m in messages]

@router.post("/chat", response_model=MockChatResponse)
async def mock_interview_chat(req: MockChatRequest, db: Session = Depends(get_db)):
    session = db.query(InterviewSessionModel).filter(InterviewSessionModel.id == req.session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    # Record User message
    user_msg = InterviewMessageModel(
        session_id=session.id,
        sender="user",
        content=req.user_message
    )
    db.add(user_msg)
    db.commit()

    # Find the last AI question asked
    previous_ai_msgs = db.query(InterviewMessageModel).filter(
        InterviewMessageModel.session_id == session.id,
        InterviewMessageModel.sender == "ai"
    ).all()
    last_question = previous_ai_msgs[-1].content if previous_ai_msgs else "General interview question"

    # Evaluate Answer
    eval_result = await interview_prep.evaluate_mock_answer(
        question=last_question,
        user_answer=req.user_message,
        role=session.role_title,
        company=session.company_name
    )

    # Attach evaluation to user message
    user_msg.evaluation = eval_result
    db.commit()

    user_msg_count = db.query(InterviewMessageModel).filter(
        InterviewMessageModel.session_id == session.id,
        InterviewMessageModel.sender == "user"
    ).count()

    # Next Question Sequence
    next_questions = [
        f"Great. Next technical question: Walk me through a challenging problem you solved in one of your recent software projects. What specific architectural tradeoffs did you make?",
        f"Thanks for that explanation. Now for a behavioral question: Tell me about a time you faced conflicting priorities or an unexpected deadline pressure. How did you handle it?",
        f"Excellent. Let's touch on system design: How would you ensure high availability and idempotency in a web service handling concurrent API requests?",
        f"Thank you for sharing. We have reached the end of this mock session! You demonstrated solid technical communication and structured problem solving. Keep practicing with targeted metrics!"
    ]

    idx = min(user_msg_count - 1, len(next_questions) - 1)
    next_q = next_questions[idx]
    is_complete = (idx == len(next_questions) - 1)

    ai_reply = f"**Feedback on your answer:**\n"
    ai_reply += f"Score: **{eval_result.get('score', 80)}/100** ({eval_result.get('verdict', 'Good')})\n"
    if eval_result.get("strengths"):
        ai_reply += f"• **Strengths**: {', '.join(eval_result['strengths'])}\n"
    if eval_result.get("improvements"):
        ai_reply += f"• **To Improve**: {', '.join(eval_result['improvements'])}\n\n"
    ai_reply += f"---\n\n**Next Question:**\n{next_q}"

    ai_msg = InterviewMessageModel(
        session_id=session.id,
        sender="ai",
        content=ai_reply
    )
    db.add(ai_msg)
    db.commit()

    return MockChatResponse(
        session_id=session.id,
        ai_response=ai_reply,
        evaluation=eval_result,
        next_question=next_q,
        is_session_complete=is_complete,
        current_score=float(eval_result.get("score", 80))
    )
