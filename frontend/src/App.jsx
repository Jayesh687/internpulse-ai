import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import ProfileResume from './components/ProfileResume';
import InternshipDiscovery from './components/InternshipDiscovery';
import ApplicationAssistant from './components/ApplicationAssistant';
import ApplicationTracker from './components/ApplicationTracker';
import InterviewPrep from './components/InterviewPrep';
import AuthPage from './components/AuthPage';

import { profileApi, internshipsApi, applicationsApi } from './api/client';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [profile, setProfile] = useState(null);
  const [matchedJobs, setMatchedJobs] = useState([]);
  const [allJobs, setAllJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [notification, setNotification] = useState(null);

  const [searchParams, setSearchParams] = useState({
    query: '',
    role: 'all',
    work_mode: 'all',
    location: 'all'
  });

  const notify = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  const loadInitialData = async () => {
    try {
      const p = await profileApi.get();
      setProfile(p);

      const matches = await internshipsApi.matched();
      setMatchedJobs(matches);

      const rawJobs = await internshipsApi.list();
      setAllJobs(rawJobs);

      const apps = await applicationsApi.getAll();
      setApplications(apps);

      if (matches?.length > 0) {
        setSelectedJob(matches[0].internship);
      }
    } catch (err) {
      console.error('Initial load error:', err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadInitialData();
    }
  }, [isAuthenticated]);

  const handleAuth = (user) => {
    setProfile((prev) => ({
      ...(prev || {}),
      name: user.name || prev?.name || 'Jayesh',
      email: user.email || prev?.email || 'jayesh@university.edu',
      skills: prev?.skills || ['Python', 'Java', 'SQL', 'React']
    }));
    setIsAuthenticated(true);
    notify('Welcome back, ' + (user.name || 'Jayesh') + '!', 'success');
  };

  const handlePerformSearch = async () => {
    try {
      const matches = await internshipsApi.matched({
        query: searchParams.query,
        role: searchParams.role,
        work_mode: searchParams.work_mode
      });
      setMatchedJobs(matches);
      notify(`Found ${matches.length} matching internships!`, 'success');
    } catch (err) {
      notify('Search error: ' + err.message, 'error');
    }
  };

  const handleSaveToTracker = async (job) => {
    try {
      await applicationsApi.create({ internship_id: job.id, status: 'saved' });
      const apps = await applicationsApi.getAll();
      setApplications(apps);
      notify(`Saved ${job.company} (${job.title}) to Kanban Tracker!`, 'success');
    } catch (err) {
      notify('Error saving to tracker: ' + err.message, 'error');
    }
  };

  const handleSelectJobForTailoring = (job) => {
    setSelectedJob(job);
    setActiveTab('assistant');
  };

  const handleStartInterviewPrep = (job) => {
    setSelectedJob(job);
    setActiveTab('interview');
  };

  if (!isAuthenticated) {
    return <AuthPage onAuth={handleAuth} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0f19] text-slate-100">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div className={`px-4 py-3 rounded-2xl shadow-xl border text-xs font-bold flex items-center gap-2 ${
            notification.type === 'success' ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/40' :
            notification.type === 'error' ? 'bg-rose-950/90 text-rose-300 border-rose-500/40' :
            'bg-indigo-950/90 text-indigo-300 border-indigo-500/40'
          }`}>
            <span>●</span> {notification.message}
          </div>
        </div>
      )}

      {/* Top Navigation */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} profile={profile} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === 'dashboard' && (
          <Dashboard
            profile={profile}
            matchedJobs={matchedJobs}
            applications={applications}
            setActiveTab={setActiveTab}
            onSelectJobForTailoring={handleSelectJobForTailoring}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileResume
            profile={profile}
            onUpdateProfile={(updated) => {
              setProfile(updated);
              handlePerformSearch();
            }}
            notify={notify}
          />
        )}

        {activeTab === 'discovery' && (
          <InternshipDiscovery
            matchedJobs={matchedJobs}
            onSelectJobForTailoring={handleSelectJobForTailoring}
            onSaveToTracker={handleSaveToTracker}
            notify={notify}
            searchParams={searchParams}
            setSearchParams={setSearchParams}
            onPerformSearch={handlePerformSearch}
          />
        )}

        {activeTab === 'assistant' && (
          <ApplicationAssistant
            selectedJob={selectedJob}
            allJobs={allJobs}
            onSelectJob={setSelectedJob}
            profile={profile}
            notify={notify}
            onSaveToTracker={handleSaveToTracker}
          />
        )}

        {activeTab === 'tracker' && (
          <ApplicationTracker
            applications={applications}
            onRefresh={async () => {
              const apps = await applicationsApi.getAll();
              setApplications(apps);
            }}
            notify={notify}
            onStartInterviewPrep={handleStartInterviewPrep}
            onTailorJob={handleSelectJobForTailoring}
          />
        )}

        {activeTab === 'interview' && (
          <InterviewPrep
            selectedJob={selectedJob}
            allJobs={allJobs}
            onSelectJob={setSelectedJob}
            profile={profile}
            notify={notify}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-500">
        InternPulse AI Agent — Built for 2026 Tech Internship Discovery & Applications
      </footer>
    </div>
  );
}
