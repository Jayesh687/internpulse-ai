import pytest
from app.services.ai_matching import ai_matching
from app.services.resume_parser import resume_parser
from app.services.job_discovery import job_discovery

def test_resume_parser_skills_extraction():
    sample_text = """
    John Doe
    Computer Science Student, Class of 2026
    Skills: Python, Java, React, SQL, Docker, Git, FastAPI
    Projects: Built an AI agent workspace using React and FastAPI.
    """
    parsed = resume_parser.parse_resume_content(sample_text)
    assert "Python" in parsed["skills"]
    assert "React" in parsed["skills"]
    assert "SQL" in parsed["skills"]
    assert parsed["graduation_year"] == 2026

def test_ai_matching_scoring():
    profile = {
        "skills": ["Python", "Java", "SQL", "React"],
        "graduation_year": 2026,
        "degree": "B.S. in Computer Science",
        "preferred_roles": ["Software Engineering Intern"],
        "remote_preference": "remote_ok",
        "projects": [{"title": "Web App", "description": "React and Python backend", "tech_stack": ["React", "Python"]}]
    }
    internship = {
        "title": "Software Engineering Intern",
        "company": "Google",
        "work_mode": "hybrid",
        "requirements": ["Python", "Java", "SQL"],
        "tags": ["Python", "Software Engineering"]
    }
    result = ai_matching.evaluate_match(profile, internship)
    assert result["match_score"] >= 75
    assert "Python" in result["matched_skills"]
    assert len(result["match_reasons"]) > 0

def test_job_discovery_curated_list():
    jobs = job_discovery.get_all_jobs()
    assert len(jobs) >= 5
    companies = [j["company"] for j in jobs]
    assert "Google" in companies
    assert "OpenAI" in companies
    assert "Microsoft" in companies
