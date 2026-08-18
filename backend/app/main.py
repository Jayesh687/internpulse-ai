import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, HTMLResponse

from app.database import engine, Base
from app.routers import profile, internships, applications, interview

# Initialize Database Schema
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="InternPulse AI — Smart Internship Discovery & Application Agent",
    description="Autonomous AI Agent pipeline for Student Profile Analysis, Resume Parsing, Job Discovery, Transparent Matching, Tailored Applications, and Mock Interviews.",
    version="1.0.0"
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(profile.router)
app.include_router(internships.router)
app.include_router(applications.router)
app.include_router(interview.router)

# Mount Static Files & HTML UI
STATIC_DIR = os.path.join(os.path.dirname(__file__), "static")
if os.path.exists(STATIC_DIR):
    app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

@app.get("/", response_class=HTMLResponse)
def serve_ui():
    index_file = os.path.join(STATIC_DIR, "index.html")
    if os.path.exists(index_file):
        with open(index_file, "r", encoding="utf-8") as f:
            return HTMLResponse(content=f.read(), status_code=200)
    return HTMLResponse(content="<h1>InternPulse AI is Running</h1><p>Visit <a href='/docs'>/docs</a> for API.</p>")

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "service": "InternPulse AI"}
