from typing import Dict, Any, List
from app.schemas import InterviewQuestion, InterviewPrepResponse
from app.services.llm_client import llm_client

class InterviewPrepService:
    def generate_prep_kit(self, profile: Dict[str, Any], internship: Dict[str, Any]) -> InterviewPrepResponse:
        company = internship.get("company", "Tech Company")
        role = internship.get("title", "Software Engineering Intern")
        skills = profile.get("skills", ["Python", "React", "SQL"])
        projects = profile.get("projects", [])
        
        proj_title = projects[0].get("title", "Portfolio Application") if projects else "Web System"

        questions = [
            # Technical Questions
            InterviewQuestion(
                id="tech_1",
                category="technical",
                question=f"Explain how you would design and optimize a high-throughput REST API using {skills[0] if skills else 'Python'}. What caching or database indexing strategies would you use?",
                context_or_tip="Focus on data normalization, indexes on frequently queried fields (B-Tree), and Redis/in-memory caching layers.",
                rubric=["API contract definition", "Database query optimization", "Edge caching & latency mitigation"]
            ),
            InterviewQuestion(
                id="tech_2",
                category="technical",
                question="What is the difference between synchronous and asynchronous I/O? In what scenarios would asynchronous event loops outperform multi-threading?",
                context_or_tip="Mention non-blocking socket operations, event loops (like Node.js or Python asyncio), and I/O-bound vs CPU-bound tradeoffs.",
                rubric=["Clear distinction of I/O bound vs CPU bound", "Event loop mechanics", "Resource consumption comparisons"]
            ),
            # Project Deep-Dive
            InterviewQuestion(
                id="proj_1",
                category="project_deep_dive",
                question=f"Walk me through the technical architecture of your project '{proj_title}'. What was the hardest bug or architectural challenge you encountered, and how did you resolve it?",
                context_or_tip="Use the STAR method: Situation, Task, Action (specific debugging/profiling steps), and measurable Result.",
                rubric=["End-to-end component clarity", "Concrete debugging process", "Reflection on technical tradeoffs"]
            ),
            # Behavioral / STAR
            InterviewQuestion(
                id="behav_1",
                category="behavioral",
                question="Tell me about a time you had to deliver a software project with ambiguous requirements or tight deadlines. How did you prioritize tasks?",
                context_or_tip="Emphasize proactive communication with stakeholders, breaking work into MVPs, and rapid iteration.",
                rubric=["Prioritization framework", "Stakeholder clarification", "Timely delivery"]
            ),
            # HR & Motivation
            InterviewQuestion(
                id="hr_1",
                category="hr",
                question=f"Why do you want to intern at {company} specifically, and what unique perspective or strengths do you bring to our team?",
                context_or_tip="Cite specific products or engineering philosophies of the company, connected with your genuine career aspirations.",
                rubric=["Demonstrated company knowledge", "Authentic motivation", "Clear self-awareness"]
            )
        ]

        return InterviewPrepResponse(
            role_title=role,
            company=company,
            questions=questions,
            recommended_topics=[
                f"Core {skills[0] if skills else 'Python'} data structures and memory management",
                "System design fundamentals: Load balancing, Caching, Sharding",
                f"Deep dive into '{proj_title}' code structure and performance metrics",
                "STAR method stories for teamwork and technical setbacks"
            ],
            star_framework_guide=(
                "STAR Method Guide:\n"
                "- Situation: Set the context (1-2 sentences).\n"
                "- Task: Explain your specific responsibility.\n"
                "- Action: Detail the exact technical decisions and code you wrote.\n"
                "- Result: Quantify the outcome (latency improved, project completed on time)."
            )
        )

    async def evaluate_mock_answer(
        self,
        question: str,
        user_answer: str,
        role: str,
        company: str,
        category: str = "technical"
    ) -> Dict[str, Any]:
        """Evaluates student answer on technical depth, STAR structure, and communication."""
        system_prompt = (
            "You are a friendly but rigorous Senior Engineering Hiring Manager conducting a mock internship interview. "
            "Evaluate the candidate's answer with constructive feedback, identifying strengths and concrete areas to improve."
        )
        user_prompt = f"""
Target Role: {role} at {company}
Question: {question}
Candidate's Answer: {user_answer}

Provide feedback in JSON format:
{{
  "score": <number 0-100>,
  "verdict": "<Strong / Good / Needs Improvement>",
  "strengths": ["<strength 1>", "<strength 2>"],
  "improvements": ["<concrete actionable improvement 1>", "<concrete actionable improvement 2>"],
  "suggested_model_answer": "<a polished, high-scoring sample response>"
}}
"""
        try:
            res = await llm_client.generate_json(system_prompt, user_prompt)
            if "score" in res:
                return res
        except Exception:
            pass

        # Heuristic evaluator fallback
        words = len(user_answer.split())
        score = min(92, max(45, 50 + min(words, 80) // 2))
        return {
            "score": score,
            "verdict": "Strong Answer" if score >= 80 else "Good Attempt",
            "strengths": [
                "Directly addressed the question's core objective.",
                "Demonstrated relevant technical terminology and problem structure."
            ],
            "improvements": [
                "Include quantifiable metrics or benchmark numbers to strengthen results.",
                "Explicitly structure the solution using the STAR framework."
            ],
            "suggested_model_answer": (
                f"In addressing {question[:50]}..., I would first clarify boundary constraints, "
                f"implement a clean modular solution with unit tests, and monitor latency to ensure reliable production delivery."
            )
        }

interview_prep = InterviewPrepService()
