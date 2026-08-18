import React, { useState, useEffect } from 'react';
import { 
  Send, Sparkles, Copy, Check, FileText, HelpCircle, Briefcase, 
  CheckCircle2, RefreshCw, ExternalLink, Bookmark
} from 'lucide-react';
import { applicationsApi } from '../api/client';
import confetti from 'canvas-confetti';

export default function ApplicationAssistant({ 
  selectedJob, 
  allJobs, 
  onSelectJob, 
  profile, 
  notify,
  onSaveToTracker
}) {
  const [activeTab, setActiveTab] = useState('cover_letter');
  const [isGenerating, setIsGenerating] = useState(false);
  const [tailoredData, setTailoredData] = useState(null);
  const [customQuestion, setCustomQuestion] = useState('');
  const [copiedKey, setCopiedKey] = useState('');

  const currentJob = selectedJob || allJobs?.[0];

  useEffect(() => {
    if (currentJob) {
      handleGenerate();
    }
  }, [currentJob?.id]);

  const handleGenerate = async (customQ = "") => {
    if (!currentJob) return;
    setIsGenerating(true);
    try {
      const res = await applicationsApi.tailor(currentJob.id, customQ || customQuestion);
      setTailoredData(res);
      notify('Personalized application materials generated!', 'success');
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.8 } });
    } catch (err) {
      notify('Generation error: ' + err.message, 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    notify('Copied to clipboard!', 'info');
    setTimeout(() => setCopiedKey(''), 2000);
  };

  if (!currentJob) {
    return (
      <div className="max-w-7xl mx-auto glass-panel p-12 rounded-3xl border border-slate-800 text-center space-y-4">
        <Sparkles className="w-10 h-10 text-indigo-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">Select an Internship to Tailor Your Application</h2>
        <p className="text-xs text-slate-400">Choose from discovered internships to generate tailored cover letters and answers.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2.5">
            <Send className="w-6 h-6 text-indigo-400" />
            AI Application Assistant Studio
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm">
            Generates role-specific, grounded application materials without fabricating experience.
          </p>
        </div>

        {/* Job Switcher Dropdown */}
        <div className="flex items-center gap-3">
          <select
            value={currentJob.id}
            onChange={(e) => {
              const found = allJobs?.find(j => j.id === parseInt(e.target.value));
              if (found) onSelectJob(found);
            }}
            className="px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-semibold"
          >
            {allJobs?.map(j => (
              <option key={j.id} value={j.id}>
                {j.company} — {j.title}
              </option>
            ))}
          </select>

          <button
            onClick={() => onSaveToTracker(currentJob)}
            className="px-4 py-2.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 font-bold text-xs transition flex items-center gap-1.5"
          >
            <Bookmark className="w-3.5 h-3.5" /> Save to Tracker
          </button>
        </div>
      </div>

      {/* Split Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Col: Target Job Summary */}
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                {currentJob.company_logo ? (
                  <img src={currentJob.company_logo} alt={currentJob.company} className="w-8 h-8 object-contain" />
                ) : (
                  <span className="font-extrabold text-indigo-400 text-base">{currentJob.company?.charAt(0)}</span>
                )}
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">{currentJob.title}</h3>
                <div className="text-xs text-indigo-400 font-semibold">{currentJob.company}</div>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Location:</span>
                <span className="font-medium">{currentJob.location}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Stipend:</span>
                <span className="font-medium text-emerald-400">{currentJob.stipend}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Deadline:</span>
                <span className="font-medium text-amber-400">{currentJob.deadline}</span>
              </div>
            </div>

            <div className="space-y-1.5 pt-2">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Requirements:</div>
              <div className="flex flex-wrap gap-1.5">
                {currentJob.requirements?.map((req, idx) => (
                  <span key={idx} className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-950/40 border border-indigo-500/20 text-indigo-300">
                    {req}
                  </span>
                ))}
              </div>
            </div>

            <a
              href={currentJob.application_url}
              target="_blank"
              rel="noreferrer"
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition flex items-center justify-center gap-2 border border-slate-700 mt-4"
            >
              Open Company Application Page <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Custom Question Prompt Box */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-white flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-indigo-400" />
              Tailor Specific Portal Question
            </h4>
            <textarea
              value={customQuestion}
              onChange={(e) => setCustomQuestion(e.target.value)}
              placeholder="e.g. Describe a time you demonstrated leadership, or Why are you interested in this team?"
              rows={3}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
            />
            <button
              onClick={() => handleGenerate(customQuestion)}
              disabled={isGenerating || !customQuestion.trim()}
              className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs transition flex items-center justify-center gap-1.5"
            >
              {isGenerating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              Generate Custom Answer
            </button>
          </div>
        </div>

        {/* Right 2-Cols: Generated Output Tabs */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
            {/* Tabs */}
            <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-4">
              {[
                { id: 'cover_letter', label: 'Cover Letter', icon: FileText },
                { id: 'why_hire_me', label: 'Why Hire Me?', icon: CheckCircle2 },
                { id: 'why_company', label: `Why ${currentJob.company}?`, icon: Briefcase },
                { id: 'resume_tweaks', label: 'Resume Bullet Optimizer', icon: Sparkles },
                { id: 'custom_answers', label: 'Custom Answers', icon: HelpCircle },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                        : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {isGenerating ? (
              <div className="py-16 text-center space-y-3">
                <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mx-auto" />
                <div className="text-sm font-bold text-white">Crafting Tailored Application Materials...</div>
                <p className="text-xs text-slate-400">Synthesizing verified profile projects with {currentJob.company} requirements.</p>
              </div>
            ) : tailoredData ? (
              <div className="space-y-4">
                {/* Tab: Cover Letter */}
                {activeTab === 'cover_letter' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-300">Formatted Formal Cover Letter</span>
                      <button
                        onClick={() => copyToClipboard(tailoredData.cover_letter, 'cl')}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 flex items-center gap-1.5 transition"
                      >
                        {copiedKey === 'cl' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        {copiedKey === 'cl' ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                    <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-200 leading-relaxed font-mono whitespace-pre-wrap">
                      {tailoredData.cover_letter}
                    </div>
                  </div>
                )}

                {/* Tab: Why Hire Me */}
                {activeTab === 'why_hire_me' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-300">Tailored "Why should we hire you?" Response</span>
                      <button
                        onClick={() => copyToClipboard(tailoredData.why_hire_me, 'whm')}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 flex items-center gap-1.5 transition"
                      >
                        {copiedKey === 'whm' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        {copiedKey === 'whm' ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                    <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-200 leading-relaxed">
                      {tailoredData.why_hire_me}
                    </div>
                  </div>
                )}

                {/* Tab: Why Company */}
                {activeTab === 'why_company' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-300">Tailored "Why do you want to join us?" Response</span>
                      <button
                        onClick={() => copyToClipboard(tailoredData.why_company, 'wc')}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 flex items-center gap-1.5 transition"
                      >
                        {copiedKey === 'wc' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        {copiedKey === 'wc' ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                    <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-200 leading-relaxed">
                      {tailoredData.why_company}
                    </div>
                  </div>
                )}

                {/* Tab: Resume Bullet Suggestions */}
                {activeTab === 'resume_tweaks' && (
                  <div className="space-y-4">
                    <div className="text-xs font-bold text-slate-300">Grounded Resume Optimization Suggestions:</div>
                    {tailoredData.resume_suggestions?.map((sug, sIdx) => (
                      <div key={sIdx} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
                        <div className="font-bold text-indigo-300">{sug.section}</div>
                        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-emerald-300 font-medium">
                          " {sug.tailored_recommendation} "
                        </div>
                        <div className="text-[11px] text-slate-400">
                          <strong>Why this works:</strong> {sug.reason}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Tab: Custom Answers */}
                {activeTab === 'custom_answers' && (
                  <div className="space-y-4">
                    {Object.keys(tailoredData.custom_answers || {}).length ? (
                      Object.entries(tailoredData.custom_answers).map(([q, a], qIdx) => (
                        <div key={qIdx} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
                          <div className="font-bold text-indigo-400">Q: {q}</div>
                          <p className="text-slate-200 leading-relaxed">{a}</p>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center text-xs text-slate-400">
                        Type a question into the left panel prompt to generate a custom application response!
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
