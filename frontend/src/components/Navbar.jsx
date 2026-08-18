import React from 'react';
import { 
  Sparkles, Compass, FileText, Send, Kanban, MessageSquareText, User, 
  CheckCircle2, Flame, Bot
} from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, profile }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Compass },
    { id: 'profile', label: 'Resume & Profile', icon: User },
    { id: 'discovery', label: 'Internship Discovery', icon: Sparkles },
    { id: 'assistant', label: 'Application Assistant', icon: Send },
    { id: 'tracker', label: 'Kanban Tracker', icon: Kanban },
    { id: 'interview', label: 'Mock Interview', icon: MessageSquareText },
  ];

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3 py-3 md:py-0 md:h-16">
          {/* Logo & Brand */}
          <div className="flex min-w-0 items-center gap-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 shrink-0">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent">
                  InternPulse AI
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 whitespace-nowrap">
                  Agent v2.0
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Autonomous Internship Copilot</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5 flex-wrap">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-indigo-600/15 text-indigo-300 border border-indigo-500/30 shadow-sm shadow-indigo-500/10'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Profile Quick Pill */}
          <div className="flex items-center gap-3 ml-auto md:ml-0">
            <div 
              onClick={() => setActiveTab('profile')}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 cursor-pointer transition"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center font-bold text-xs text-white shrink-0">
                {profile?.name ? profile.name.charAt(0) : 'A'}
              </div>
              <div className="text-left hidden sm:block min-w-0">
                <div className="text-xs font-semibold text-slate-200 truncate">{profile?.name || 'Jayesh'}</div>
                <div className="text-[10px] text-emerald-400 flex items-center gap-1 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Agent Ready
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
