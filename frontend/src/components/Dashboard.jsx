import React from 'react';
import { 
  Sparkles, ArrowRight, Upload, Briefcase, FileCheck, CheckCircle, 
  Clock, TrendingUp, Target, ShieldCheck, Zap, ExternalLink, Bookmark, Send
} from 'lucide-react';

export default function Dashboard({ profile, matchedJobs, applications, setActiveTab, onSelectJobForTailoring }) {
  const activeAppsCount = applications?.length || 0;
  const topMatch = matchedJobs?.[0];
  const avgMatchScore = matchedJobs?.length 
    ? Math.round(matchedJobs.slice(0, 5).reduce((a, c) => a + c.match_score, 0) / Math.min(5, matchedJobs.length))
    : 0;

  const savedCount = applications?.filter(a => a.status === 'saved').length || 0;
  const appliedCount = applications?.filter(a => a.status === 'applied').length || 0;
  const interviewCount = applications?.filter(a => a.status === 'interview').length || 0;
  const offerCount = applications?.filter(a => a.status === 'selected').length || 0;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl glass-panel p-8 border border-indigo-500/20 bg-gradient-to-br from-indigo-950/40 via-slate-900/80 to-slate-950">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-semibold text-indigo-400">
              <Zap className="w-3.5 h-3.5" />
              Autonomous Internship Engine Active
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Welcome back, <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">{profile?.name || 'Applicant'}</span>
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Your profile is matched with <strong className="text-white font-semibold">{matchedJobs?.length || 0} active 2026 tech internships</strong>. 
              The agent has parsed your skills ({profile?.skills?.slice(0, 4).join(', ')}...) and prepared personalized application pipelines.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => setActiveTab('discovery')}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-indigo-600/25"
              >
                <Sparkles className="w-4 h-4" />
                Explore Matched Internships
              </button>
              <button
                onClick={() => setActiveTab('profile')}
                className="px-5 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 text-xs font-semibold transition flex items-center gap-2 border border-slate-700"
              >
                <Upload className="w-4 h-4 text-slate-400" />
                Update Resume & Skills
              </button>
            </div>
          </div>

          {/* Quick Match Score Metric */}
          <div className="w-full md:w-auto flex-shrink-0 p-5 rounded-2xl bg-slate-900/90 border border-slate-800 text-center min-w-[200px]">
            <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1">Avg Top Match Score</div>
            <div className="text-4xl font-extrabold text-indigo-400 flex items-center justify-center gap-1">
              {avgMatchScore || 88}<span className="text-base text-slate-500 font-normal">%</span>
            </div>
            <div className="text-xs text-emerald-400 font-medium mt-1 flex items-center justify-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> High Compatibility
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Saved Roles</span>
            <Bookmark className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white">{savedCount}</div>
          <div className="text-[11px] text-slate-500 mt-1">Ready for custom tailoring</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Applied</span>
            <Briefcase className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-bold text-white">{appliedCount}</div>
          <div className="text-[11px] text-slate-500 mt-1">Tracking live responses</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Interviews</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white">{interviewCount}</div>
          <div className="text-[11px] text-amber-400/80 mt-1 flex items-center gap-1">
            <Zap className="w-3 h-3" /> Practice with AI Agent
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Offers / Selected</span>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white">{offerCount}</div>
          <div className="text-[11px] text-emerald-400/80 mt-1">Goal milestone</div>
        </div>
      </div>

      {/* Top AI Recommendations Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              Top AI Recommended Opportunities
            </h2>
            <p className="text-xs text-slate-400">Ranked by transparent skill matching and preferences</p>
          </div>
          <button
            onClick={() => setActiveTab('discovery')}
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition"
          >
            View all ({matchedJobs?.length || 0}) <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {matchedJobs?.slice(0, 3).map((match, idx) => {
            const job = match.internship;
            return (
              <div 
                key={job.id || idx}
                className="glass-panel rounded-2xl p-5 border border-slate-800 hover:border-indigo-500/40 transition-all flex flex-col justify-between group relative overflow-hidden"
              >
                <div className="space-y-3">
                  {/* Top Bar: Company + Score */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {job.company_logo ? (
                          <img src={job.company_logo} alt={job.company} className="w-7 h-7 object-contain" />
                        ) : (
                          <span className="font-bold text-sm text-indigo-400">{job.company?.charAt(0)}</span>
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-white group-hover:text-indigo-300 transition line-clamp-1">
                          {job.title}
                        </h3>
                        <div className="text-xs text-slate-400">{job.company}</div>
                      </div>
                    </div>

                    <div className="px-2.5 py-1 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-bold flex items-center gap-1 flex-shrink-0">
                      <span>{Math.round(match.match_score)}%</span>
                    </div>
                  </div>

                  {/* Stipend & Location */}
                  <div className="flex flex-wrap gap-2 text-[11px] text-slate-300">
                    <span className="px-2 py-0.5 rounded-md bg-slate-800/80 border border-slate-700/60 font-medium">
                      💰 {job.stipend}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-800/80 border border-slate-700/60 font-medium">
                      📍 {job.location}
                    </span>
                  </div>

                  {/* AI Match Reason Highlight */}
                  {match.match_reasons?.[0] && (
                    <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80 text-[11px] text-slate-300">
                      <strong className="text-indigo-400 font-semibold">Why match: </strong>
                      {match.match_reasons[0]}
                    </div>
                  )}

                  {/* Matched Tags */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {job.requirements?.slice(0, 3).map((req, rIdx) => (
                      <span key={rIdx} className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-950/40 border border-indigo-500/20 text-indigo-300">
                        {req}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center gap-2">
                  <button
                    onClick={() => onSelectJobForTailoring(job)}
                    className="flex-1 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-xs font-bold border border-indigo-500/30 transition flex items-center justify-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Tailor Application
                  </button>
                  <a
                    href={job.application_url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                    title="View Official Job Page"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Workflow Step Guide */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-indigo-400" />
          Autonomous Internship Workflow
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1.5">
            <div className="font-bold text-indigo-400">1. Resume Analysis</div>
            <p className="text-slate-400 text-[11px]">Upload PDF/DOCX. Real skill parsing without hallucination.</p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1.5">
            <div className="font-bold text-indigo-400">2. AI Matching</div>
            <p className="text-slate-400 text-[11px]">Transparent 0-100 score breakdown with missing skill gap alerts.</p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1.5">
            <div className="font-bold text-indigo-400">3. Application Tailoring</div>
            <p className="text-slate-400 text-[11px]">Grounded cover letters, essay answers & resume tweaks.</p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1.5">
            <div className="font-bold text-indigo-400">4. Mock Interviews</div>
            <p className="text-slate-400 text-[11px]">Interactive conversational simulator with real-time scoring.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
