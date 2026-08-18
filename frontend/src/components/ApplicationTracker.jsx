import React, { useState } from 'react';
import { 
  Kanban, Plus, Clock, CheckCircle2, XCircle, ArrowRight, 
  Trash2, ExternalLink, MessageSquare, Send, Sparkles
} from 'lucide-react';
import { applicationsApi } from '../api/client';

export default function ApplicationTracker({ 
  applications, 
  onRefresh, 
  notify, 
  onStartInterviewPrep,
  onTailorJob
}) {
  const [isUpdating, setIsUpdating] = useState(false);

  const columns = [
    { id: 'saved', label: 'Saved', color: 'border-slate-700 text-slate-300 bg-slate-900/40' },
    { id: 'applied', label: 'Applied', color: 'border-sky-500/40 text-sky-300 bg-sky-950/20' },
    { id: 'assessment', label: 'Assessment / OA', color: 'border-purple-500/40 text-purple-300 bg-purple-950/20' },
    { id: 'interview', label: 'Interview', color: 'border-amber-500/40 text-amber-300 bg-amber-950/20' },
    { id: 'selected', label: 'Selected / Offer', color: 'border-emerald-500/40 text-emerald-300 bg-emerald-950/20' },
    { id: 'rejected', label: 'Rejected', color: 'border-rose-500/40 text-rose-300 bg-rose-950/20' },
  ];

  const handleStageChange = async (appId, newStatus) => {
    setIsUpdating(true);
    try {
      await applicationsApi.update(appId, { status: newStatus });
      onRefresh();
      notify(`Application moved to ${newStatus.toUpperCase()}`, 'success');
    } catch (err) {
      notify('Failed to update stage: ' + err.message, 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (appId) => {
    try {
      await applicationsApi.delete(appId);
      onRefresh();
      notify('Application removed from tracker', 'info');
    } catch (err) {
      notify('Delete error: ' + err.message, 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2.5">
          <Kanban className="w-6 h-6 text-indigo-400" />
          Application Kanban Pipeline
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm">
          Track internships across each stage: Saved → Applied → Assessment → Interview → Offer.
        </p>
      </div>

      {/* Kanban Board Horizontal Scroll */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 overflow-x-auto pb-4">
        {columns.map((col) => {
          const colApps = applications?.filter(a => a.status === col.id) || [];
          return (
            <div 
              key={col.id}
              className={`rounded-3xl p-4 border flex flex-col justify-between min-h-[500px] ${col.color}`}
            >
              {/* Col Header */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs uppercase tracking-wider">{col.label}</span>
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-[10px] font-bold flex items-center justify-center text-slate-300">
                    {colApps.length}
                  </span>
                </div>

                {/* Cards in this column */}
                <div className="space-y-3">
                  {colApps.map((app) => {
                    const job = app.internship;
                    return (
                      <div
                        key={app.id}
                        className="glass-panel p-3.5 rounded-2xl border border-slate-800 space-y-2.5 text-xs shadow-sm relative group"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="font-bold text-white line-clamp-1">{job?.title}</div>
                            <div className="text-[11px] text-indigo-400 font-semibold">{job?.company}</div>
                          </div>
                          <button
                            onClick={() => handleDelete(app.id)}
                            className="text-slate-600 hover:text-rose-400 transition"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="text-[10px] text-slate-400">
                          Match: <strong className="text-emerald-400">{Math.round(app.match_score)}%</strong>
                        </div>

                        {/* Move Stage Select */}
                        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-1">
                          <select
                            value={app.status}
                            onChange={(e) => handleStageChange(app.id, e.target.value)}
                            className="w-full text-[10px] py-1 px-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200"
                          >
                            {columns.map(c => (
                              <option key={c.id} value={c.id}>{c.label}</option>
                            ))}
                          </select>
                        </div>

                        {/* Action buttons on card */}
                        {col.id === 'interview' && (
                          <button
                            onClick={() => onStartInterviewPrep(job)}
                            className="w-full py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[10px] font-bold border border-amber-500/30 transition flex items-center justify-center gap-1"
                          >
                            <MessageSquare className="w-3 h-3" /> Practice Mock AI
                          </button>
                        )}

                        {col.id === 'saved' && (
                          <button
                            onClick={() => onTailorJob(job)}
                            className="w-full py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-[10px] font-bold border border-indigo-500/30 transition flex items-center justify-center gap-1"
                          >
                            <Send className="w-3 h-3" /> Tailor Application
                          </button>
                        )}
                      </div>
                    );
                  })}

                  {colApps.length === 0 && (
                    <div className="py-12 text-center text-[11px] text-slate-500">
                      No applications in this stage
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
