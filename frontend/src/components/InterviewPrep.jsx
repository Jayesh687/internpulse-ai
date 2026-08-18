import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquareText, Send, Sparkles, CheckCircle2, AlertCircle, 
  HelpCircle, User, Bot, RefreshCw, Award, ArrowRight
} from 'lucide-react';
import { interviewApi } from '../api/client';

export default function InterviewPrep({ selectedJob, allJobs, onSelectJob, profile, notify }) {
  const currentJob = selectedJob || allJobs?.[0];
  const [prepKit, setPrepKit] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMsg, setInputMsg] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoadingPrep, setIsLoadingPrep] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (currentJob) {
      loadPrep();
    }
  }, [currentJob?.id]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadPrep = async () => {
    if (!currentJob) return;
    setIsLoadingPrep(true);
    try {
      const kit = await interviewApi.getPrep(currentJob.id);
      setPrepKit(kit);

      // Start fresh mock session
      const sess = await interviewApi.startSession(currentJob.id);
      setSessionId(sess.session_id);
      setMessages([
        { id: 1, sender: 'ai', content: sess.initial_message }
      ]);
    } catch (err) {
      notify('Interview prep load error: ' + err.message, 'error');
    } finally {
      setIsLoadingPrep(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMsg.trim() || !sessionId || isSending) return;

    const userText = inputMsg.trim();
    setInputMsg('');
    setMessages(prev => [...prev, { id: Date.now(), sender: 'user', content: userText }]);

    setIsSending(true);
    try {
      const res = await interviewApi.sendChat(sessionId, userText);
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'ai',
          content: res.ai_response,
          evaluation: res.evaluation
        }
      ]);
    } catch (err) {
      notify('Mock interview chat error: ' + err.message, 'error');
    } finally {
      setIsSending(false);
    }
  };

  if (!currentJob) {
    return (
      <div className="max-w-7xl mx-auto glass-panel p-12 rounded-3xl border border-slate-800 text-center space-y-4">
        <MessageSquareText className="w-10 h-10 text-indigo-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">Select a Role to Begin Interview Preparation</h2>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2.5">
            <MessageSquareText className="w-6 h-6 text-indigo-400" />
            Interview Preparation & AI Mock Simulator
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm">
            Realistic technical, behavioral, and project deep-dive questions with real-time scoring.
          </p>
        </div>

        {/* Role selector */}
        <select
          value={currentJob.id}
          onChange={(e) => {
            const found = allJobs?.find(j => j.id === parseInt(e.target.value));
            if (found) onSelectJob(found);
          }}
          className="px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 font-semibold self-start sm:self-auto"
        >
          {allJobs?.map(j => (
            <option key={j.id} value={j.id}>
              {j.company} — {j.title}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Col: Questions Bank & STAR Rubric */}
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-indigo-400" />
              Role Question Catalog ({prepKit?.questions?.length || 5})
            </h2>

            <div className="space-y-3">
              {prepKit?.questions?.map((q, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-950 text-indigo-400 border border-indigo-500/20">
                      {q.category}
                    </span>
                  </div>
                  <div className="font-semibold text-slate-200">{q.question}</div>
                  <p className="text-[11px] text-slate-400 italic">Tip: {q.context_or_tip}</p>
                </div>
              ))}
            </div>
          </div>

          {/* STAR Method Guide */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-2 text-xs">
            <div className="font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              STAR Response Framework
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed whitespace-pre-line">
              {prepKit?.star_framework_guide || "Situation → Task → Action → Result"}
            </p>
          </div>
        </div>

        {/* Right 2-Cols: Live Interactive Mock Interview Arena */}
        <div className="lg:col-span-2 space-y-4 flex flex-col h-[650px]">
          <div className="glass-panel p-4 rounded-3xl border border-slate-800 flex-1 flex flex-col justify-between overflow-hidden">
            {/* Session Header */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800/80">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">AI Engineering Interviewer</div>
                  <div className="text-[10px] text-slate-400">{currentJob.company} • {currentJob.title}</div>
                </div>
              </div>
              <button
                onClick={loadPrep}
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Restart Session
              </button>
            </div>

            {/* Chat message history */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((m, mIdx) => (
                <div
                  key={m.id || mIdx}
                  className={`flex items-start gap-3 ${m.sender === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                    m.sender === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-indigo-400 border border-slate-700'
                  }`}>
                    {m.sender === 'user' ? 'You' : <Bot className="w-4 h-4" />}
                  </div>
                  <div className={`max-w-[80%] rounded-2xl p-4 text-xs leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-indigo-600/25 border border-indigo-500/40 text-slate-100'
                      : 'bg-slate-900 border border-slate-800 text-slate-200 whitespace-pre-wrap'
                  }`}>
                    {m.content}
                  </div>
                </div>
              ))}
              {isSending && (
                <div className="flex items-center gap-2 text-xs text-indigo-400 p-2">
                  <RefreshCw className="w-4 h-4 animate-spin" /> Evaluating answer and formulating next question...
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendMessage} className="pt-3 border-t border-slate-800/80 flex items-center gap-2">
              <input
                type="text"
                value={inputMsg}
                onChange={(e) => setInputMsg(e.target.value)}
                placeholder="Type your structured interview response..."
                disabled={isSending}
                className="flex-1 px-4 py-2.5 rounded-2xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                disabled={isSending || !inputMsg.trim()}
                className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-indigo-600/25"
              >
                <Send className="w-3.5 h-3.5" /> Submit Answer
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
