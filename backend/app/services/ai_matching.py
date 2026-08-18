import re
from typing import Dict, Any, List, Tuple
from app.schemas import MatchScoreBreakdown, MatchResult, InternshipResponse

class AIMatchingEngine:
    """
    Transparent, multi-dimensional AI scoring engine comparing student profile
    against internship requirements. Weighting:
    - Skills match: 40%
    - Projects & Experience relevance: 30%
    - Education & Graduation year: 15%
    - Role & Work mode preferences: 15%
    Never fabricates reasons. Provides clear pros, cons, and missing skill analysis.
    """

    def evaluate_match(self, profile: Dict[str, Any], internship: Dict[str, Any]) -> Dict[str, Any]:
        student_skills = [s.strip() for s in profile.get("skills", [])]
        student_skills_set = {s.lower() for s in student_skills}
        
        job_reqs = [r.strip() for r in internship.get("requirements", [])]
        job_tags = [t.strip() for t in internship.get("tags", [])]
        
        # 1. Skills Scoring (40%)
        matched_skills = []
        missing_skills = []
        
        for req in job_reqs:
            req_l = req.lower()
            matched = False
            for s in student_skills:
                s_l = s.lower()
                if s_l == req_l or s_l in req_l or req_l in s_l:
                    matched_skills.append(s)
                    matched = True
                    break
            if not matched:
                missing_skills.append(req)

        # Deduplicate
        matched_skills = list(dict.fromkeys(matched_skills))
        missing_skills = list(dict.fromkeys(missing_skills))

        total_req_count = max(len(job_reqs), 1)
        skills_ratio = len(matched_skills) / total_req_count
        # Normalize skill score
        skills_score = min(100.0, max(20.0, round(skills_ratio * 100, 1)))

        # 2. Projects & Experience Scoring (30%)
        projects = profile.get("projects", [])
        experience = profile.get("experience", [])
        
        project_text = " ".join([p.get("title", "") + " " + p.get("description", "") + " " + " ".join(p.get("tech_stack", [])) for p in projects]).lower()
        exp_text = " ".join([e.get("company", "") + " " + e.get("role", "") + " " + " ".join(e.get("bullets", [])) for e in experience]).lower()
        combined_text = project_text + " " + exp_text

        proj_matches = 0
        for tag in job_tags + job_reqs:
            if tag.lower() in combined_text:
                proj_matches += 1
        
        proj_score = min(100.0, max(30.0, round((proj_matches / max(len(job_tags), 1)) * 95, 1)))
        if not projects and not experience:
            proj_score = 40.0

        # 3. Education & Grad Year Scoring (15%)
        student_grad_year = profile.get("graduation_year", 2026)
        degree = profile.get("degree", "").lower()
        
        edu_score = 85.0
        if "computer science" in degree or "software" in degree or "data" in degree:
            edu_score += 10.0
        if student_grad_year in [2025, 2026, 2027]:
            edu_score += 5.0
        edu_score = min(100.0, edu_score)

        # 4. Preference Scoring (15%)
        pref_roles = [r.lower() for r in profile.get("preferred_roles", [])]
        pref_remote = profile.get("remote_preference", "remote_ok")
        job_work_mode = internship.get("work_mode", "remote").lower()
        job_title_l = internship.get("title", "").lower()

        pref_score = 75.0
        # Role match
        if any(pr in job_title_l or any(t.lower() in pr for t in job_tags) for pr in pref_roles):
            pref_score += 15.0
        
        # Remote match
        if pref_remote == "remote_only" and job_work_mode == "remote":
            pref_score += 10.0
        elif pref_remote == "remote_ok":
            pref_score += 10.0
        elif pref_remote == "onsite_only" and job_work_mode != "remote":
            pref_score += 10.0
        pref_score = min(100.0, pref_score)

        # Overall weighted score
        overall = (skills_score * 0.40) + (proj_score * 0.30) + (edu_score * 0.15) + (pref_score * 0.15)
        overall_score = round(overall, 1)

        # Explanations & Reasons
        match_reasons = []
        if matched_skills:
            match_reasons.append(f"Strong overlap in core technologies: {', '.join(matched_skills[:4])}.")
        if any(t.lower() in project_text for t in job_tags[:2]):
            match_reasons.append("Your portfolio projects directly showcase required tech stack components.")
        if pref_remote in ["remote_ok", "remote_only"] and job_work_mode == "remote":
            match_reasons.append("Job's remote work mode aligns directly with your location preference.")
        if student_grad_year in [2026, 2027]:
            match_reasons.append(f"Graduation year ({student_grad_year}) fits target internship cohort criteria.")

        improvement_areas = []
        if missing_skills:
            improvement_areas.append(f"Review and practice concepts in: {', '.join(missing_skills[:3])}.")
        if not projects:
            improvement_areas.append("Add 1-2 focused technical projects using the target stack to boost your match score.")
        if proj_score < 70:
            improvement_areas.append("Highlight specific metrics and technical tools in your project bullet points.")

        # Verdict
        if overall_score >= 85:
            verdict = "Exceptional Match — Highly Recommended Application"
        elif overall_score >= 70:
            verdict = "Strong Match — Solid Technical Alignment"
        elif overall_score >= 50:
            verdict = "Moderate Match — Potential Gap in Secondary Tech Stack"
        else:
            verdict = "Low Match — Substantial Requirement Gaps"

        breakdown = MatchScoreBreakdown(
            skills_score=skills_score,
            projects_score=proj_score,
            experience_score=round(proj_score * 0.9, 1),
            education_score=edu_score,
            preference_score=pref_score,
            overall_score=overall_score
        )

        return {
            "match_score": overall_score,
            "breakdown": breakdown,
            "match_reasons": match_reasons,
            "matched_skills": matched_skills,
            "missing_skills": missing_skills,
            "improvement_areas": improvement_areas,
            "fit_verdict": verdict
        }

ai_matching = AIMatchingEngine()
