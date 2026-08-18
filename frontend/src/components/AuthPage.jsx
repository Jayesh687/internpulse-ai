import React, { useState } from 'react';
import { ArrowRight, Lock, Mail, User, Sparkles } from 'lucide-react';

export default function AuthPage({ onAuth, initialMode = 'login' }) {
  const [mode, setMode] = useState(initialMode);
  const [form, setForm] = useState({
    name: 'Jayesh',
    email: 'jayesh@university.edu',
    password: 'demo1234'
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!form.email || !form.password || (mode === 'signup' && !form.name)) {
      setError('Please fill in all required fields.');
      return;
    }

    onAuth({
      name: mode === 'signup' ? form.name : form.name || 'Jayesh',
      email: form.email,
      password: form.password
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b0f19] px-4 py-10">
      <div className="w-full max-w-5xl overflow-hidden rounded-[28px] border border-indigo-500/30 shadow-2xl shadow-indigo-950/30 bg-slate-950/80">
        <div className="grid md:grid-cols-2 md:gap-0">
          <div className="relative hidden md:flex flex-col justify-between bg-gradient-to-br from-indigo-600 via-violet-600 to-sky-500 p-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.2),transparent_35%)]" />
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs font-semibold text-white/90 backdrop-blur-sm">
                <Sparkles className="w-3.5 h-3.5" />
                InternPulse AI
              </div>
            </div>

            <div className="relative z-10 space-y-5 text-white">
              <h1 className="text-4xl font-black leading-tight">Your internship journey starts here.</h1>
              <p className="max-w-sm text-sm text-indigo-100/90">
                Discover opportunities, tailor applications, and practice mock interviews with an AI-powered workflow built for students.
              </p>
            </div>

            <div className="relative z-10 text-xs text-indigo-100/80">
              Built for 2026 tech internship success
            </div>
          </div>

          <div className="bg-slate-950/90 p-8 sm:p-10">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-indigo-400">Welcome</p>
                <h2 className="mt-2 text-2xl font-bold text-white">
                  {mode === 'login' ? 'Login to your account' : 'Create your account'}
                </h2>
              </div>
            </div>

            <div className="mb-6 grid grid-cols-2 rounded-xl border border-slate-800 bg-slate-900/70 p-1">
              <button
                type="button"
                onClick={() => setMode('login')}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                  mode === 'login' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => setMode('signup')}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                  mode === 'signup' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Sign Up
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <label className="block">
                  <span className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-300">
                    <User className="w-3.5 h-3.5 text-indigo-400" /> Full Name
                  </span>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-500"
                    placeholder="Jayesh"
                  />
                </label>
              )}

              <label className="block">
                <span className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-300">
                  <Mail className="w-3.5 h-3.5 text-indigo-400" /> Email
                </span>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-500"
                  placeholder="jayesh@university.edu"
                />
              </label>

              <label className="block">
                <span className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-300">
                  <Lock className="w-3.5 h-3.5 text-indigo-400" /> Password
                </span>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-500"
                  placeholder="••••••••"
                />
              </label>

              {error && <p className="text-xs text-rose-400">{error}</p>}

              <button
                type="submit"
                className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-indigo-500"
              >
                {mode === 'login' ? 'Login' : 'Create Account'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <p className="mt-6 text-center text-xs text-slate-400">
              {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
              <button
                type="button"
                onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                className="font-semibold text-indigo-400 hover:text-indigo-300"
              >
                {mode === 'login' ? 'Sign Up' : 'Login'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
