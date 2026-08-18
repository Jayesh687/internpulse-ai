import React, { useState } from 'react';
import { 
  Search, Filter, Sparkles, ExternalLink, Bookmark, Send, 
  MapPin, DollarSign, Calendar, CheckCircle2, AlertCircle, X, ChevronRight
} from 'lucide-react';
import { applicationsApi } from '../api/client';

export default function InternshipDiscovery({ 
  matchedJobs, 
  onSelectJobForTailoring, 
  onSaveToTracker,
  notify,
  searchParams,
  setSearchParams,
  onPerformSearch
}) {
  const [selectedMatch, setSelectedMatch] = useState(null);

  const rolesFilter = ['all', 'Software Engineering', 'AI/ML', 'Full-Stack', 'Backend', 'Frontend', 'Data'];
  const workModeFilter = ['all', 'remote', 'hybrid', 'onsite'];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header & Search Bar */}
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2.5">
            <Sparkles className="w-6 h-6 text-indigo-400" />
            Internship Discovery & AI Matching
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm">
            Real official 2026 internship postings scored against your verified student profile.
          </p>
        </div>

        {/* Search & Filter Controls */}
        <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchParams.query}
                onChange={(e) => setSearchParams({ ...searchParams, query: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && onPerformSearch()}
                placeholder="Search job title, company (Google, OpenAI...), or tech stack..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <button
              onClick={onPerformSearch}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-md shadow-indigo-600/25"
            >
              <Search className="w-3.5 h-3.5" /> Search Roles
            </button>
          </div>

          {/* Pill Filters */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-slate-400 text-[11px] font-semibold mr-1">Role:</span>
              {rolesFilter.map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    const next = { ...searchParams, role: r };
                    setSearchParams(next);
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                    searchParams.role === r 
                      ? 'bg-indigo-600 text-white font-bold' 
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {r === 'all' ? 'All Roles' : r}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 text-[11px] font-semibold mr-1">Mode:</span>
              {workModeFilter.map((wm) => (
                <button
                  key={wm}
                  onClick={() => {
                    const next = { ...searchParams, work_mode: wm };
                    setSearchParams(next);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs capitalize transition ${
                    searchParams.work_mode === wm 
                      ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 font-bold' 
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {wm}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Internship Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {matchedJobs?.map((match, idx) => {
          const job = match.internship;
          const score = Math.round(match.match_score);
          const scoreColor = score >= 85 ? 'text-emerald-400 bg-emerald-950/40 border-emerald-500/40' 
            : score >= 70 ? 'text-indigo-300 bg-indigo-950/40 border-indigo-500/40'
            : 'text-amber-400 bg-amber-950/40 border-amber-500/40';

          return (
            <div
              key={job.id || idx}
              className="glass-panel rounded-3xl p-6 border border-slate-800 hover:border-indigo-500/40 transition-all flex flex-col justify-between space-y-4 group relative"
            >
              <div className="space-y-3.5">
                {/* Top header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm">
                      {job.company_logo ? (
                        <img src={job.company_logo} alt={job.company} className="w-8 h-8 object-contain" />
                      ) : (
                        <span className="font-extrabold text-indigo-400 text-base">{job.company?.charAt(0)}</span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-white group-hover:text-indigo-300 transition line-clamp-1">
                        {job.title}
                      </h3>
                      <div className="text-xs text-slate-400 font-medium">{job.company}</div>
                    </div>
                  </div>

                  {/* Match Score Badge */}
                  <div className={`px-2.5 py-1 rounded-xl border text-xs font-bold flex-shrink-0 flex items-center gap-1 ${scoreColor}`}>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{score}%</span>
                  </div>
                </div>

                {/* Key metadata pills */}
                <div className="flex flex-wrap gap-2 text-[11px] text-slate-300">
                  <span className="px-2 py-0.5 rounded-lg bg-slate-900 border border-slate-800 font-medium">
                    💰 {job.stipend}
                  </span>
                  <span className="px-2 py-0.5 rounded-lg bg-slate-900 border border-slate-800 font-medium">
                    📍 {job.location}
                  </span>
                  <span className="px-2 py-0.5 rounded-lg bg-slate-900 border border-slate-800 font-medium capitalize">
                    🏷️ {job.work_mode}
                  </span>
                </div>

                {/* Match Summary Snippet */}
                <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-1 text-xs">
                  <div className="text-[11px] font-semibold text-indigo-300">
                    AI Match Insight:
                  </div>
                  <p className="text-[11px] text-slate-300 line-clamp-2">
                    {match.match_reasons?.[0] || 'Matches your core software engineering background.'}
                  </p>
                </div>

                {/* Skills Preview */}
                <div className="space-y-1">
                  <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Required Skills:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {job.requirements?.slice(0, 4).map((req, rIdx) => {
                      const isMatched = match.matched_skills?.some(s => s.toLowerCase() === req.toLowerCase());
                      return (
                        <span
                          key={rIdx}
                          className={`text-[10px] px-2 py-0.5 rounded-md font-medium ${
                            isMatched
                              ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/30'
                              : 'bg-slate-800/60 text-slate-400 border border-slate-700/50'
                          }`}
                        >
                          {req} {isMatched && '✓'}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-800/80 space-y-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onSelectJobForTailoring(job)}
                    className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/20"
                  >
                    <Send className="w-3.5 h-3.5" /> Tailor Application
                  </button>
                  <button
                    onClick={() => onSaveToTracker(job)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                    title="Save to Kanban Pipeline"
                  >
                    <Bookmark className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={() => setSelectedMatch(match)}
                    className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                  >
                    Deep Match Breakdown <ChevronRight className="w-3 h-3" />
                  </button>
                  <a
                    href={job.application_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1"
                  >
                    Official Portal <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Deep Match Explanation Modal */}
      {selectedMatch && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-2xl rounded-3xl p-6 sm:p-8 border border-slate-700 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs text-indigo-400 font-semibold">{selectedMatch.internship.company}</div>
                <h2 className="text-xl font-bold text-white">{selectedMatch.internship.title}</h2>
                <div className="text-xs text-emerald-400 font-medium mt-1">{selectedMatch.fit_verdict}</div>
              </div>
              <button
                onClick={() => setSelectedMatch(null)}
                className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Score Breakdown Bars */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
              <div className="text-xs font-bold text-white">Match Breakdown by Dimension:</div>
              <div className="space-y-2 text-xs">
                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>Technical Skills (40% weight)</span>
                    <span className="font-bold text-indigo-400">{selectedMatch.breakdown.skills_score}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${selectedMatch.breakdown.skills_score}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>Projects & Portfolio (30% weight)</span>
                    <span className="font-bold text-indigo-400">{selectedMatch.breakdown.projects_score}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${selectedMatch.breakdown.projects_score}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>Role & Work Mode Preference (15% weight)</span>
                    <span className="font-bold text-indigo-400">{selectedMatch.breakdown.preference_score}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${selectedMatch.breakdown.preference_score}%` }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Matched vs Missing Skills */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 space-y-2">
                <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Matched Skills ({selectedMatch.matched_skills?.length})
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedMatch.matched_skills?.map((s, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded-md bg-emerald-900/40 text-emerald-200 border border-emerald-500/30 text-[11px]">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/20 space-y-2">
                <div className="font-bold text-amber-400 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" /> Missing / Gap Tech ({selectedMatch.missing_skills?.length})
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedMatch.missing_skills?.length ? (
                    selectedMatch.missing_skills.map((s, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded-md bg-amber-900/40 text-amber-200 border border-amber-500/30 text-[11px]">
                        {s}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-400 text-[11px]">No critical skill gaps!</span>
                  )}
                </div>
              </div>
            </div>

            {/* Reasons & Recommendations */}
            <div className="space-y-3 text-xs">
              <div className="font-bold text-white">Why This Score Was Assigned:</div>
              <ul className="space-y-1.5 text-slate-300 text-[11px] list-disc list-inside">
                {selectedMatch.match_reasons?.map((reason, idx) => (
                  <li key={idx}>{reason}</li>
                ))}
              </ul>

              {selectedMatch.improvement_areas?.length > 0 && (
                <div className="pt-2">
                  <div className="font-bold text-indigo-400">Actionable Suggestions:</div>
                  <ul className="space-y-1.5 text-slate-300 text-[11px] list-disc list-inside mt-1">
                    {selectedMatch.improvement_areas.map((rec, idx) => (
                      <li key={idx}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  const j = selectedMatch.internship;
                  setSelectedMatch(null);
                  onSelectJobForTailoring(j);
                }}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2"
              >
                <Send className="w-4 h-4" /> Tailor Application Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
