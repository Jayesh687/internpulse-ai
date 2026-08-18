import React, { useState } from 'react';
import { 
  Upload, FileText, CheckCircle2, Plus, X, Sparkles, Save, 
  GraduationCap, Briefcase, Code, AlertCircle, RefreshCw
} from 'lucide-react';
import { profileApi } from '../api/client';

export default function ProfileResume({ profile, onUpdateProfile, notify }) {
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    email: profile?.email || '',
    phone: profile?.phone || '',
    degree: profile?.degree || 'B.S. in Computer Science',
    graduation_year: profile?.graduation_year || 2026,
    gpa: profile?.gpa || '3.85',
    university: profile?.university || 'State University of Technology',
    bio: profile?.bio || '',
    skills: profile?.skills || [],
    preferred_roles: profile?.preferred_roles || ['Software Engineering Intern', 'AI/ML Intern'],
    preferred_locations: profile?.preferred_locations || ['Remote', 'San Francisco, CA'],
    remote_preference: profile?.remote_preference || 'remote_ok',
    projects: profile?.projects || [],
    experience: profile?.experience || []
  });

  const [newSkill, setNewSkill] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const res = await profileApi.uploadResume(file);
      setUploadResult(res);
      // Reload profile
      const updated = await profileApi.get();
      setFormData(updated);
      onUpdateProfile(updated);
      notify('Resume successfully parsed and skills synchronized!', 'success');
    } catch (err) {
      notify('Failed to parse resume: ' + err.message, 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddSkill = () => {
    if (!newSkill.trim()) return;
    if (!formData.skills.includes(newSkill.trim())) {
      setFormData(prev => ({ ...prev, skills: [...prev.skills, newSkill.trim()] }));
    }
    setNewSkill('');
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skillToRemove)
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updated = await profileApi.update(formData);
      onUpdateProfile(updated);
      notify('Profile successfully saved!', 'success');
    } catch (err) {
      notify('Failed to save profile: ' + err.message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Student Profile & Resume Center</h1>
          <p className="text-slate-400 text-xs sm:text-sm">
            Upload your resume for automated entity extraction, edit your verified skills, and review gap recommendations.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition flex items-center gap-2 shadow-lg shadow-indigo-600/25 self-start sm:self-auto"
        >
          {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Profile Changes
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 1-col: Resume Upload & Analysis */}
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Upload className="w-4 h-4 text-indigo-400" />
              Upload Resume (PDF / DOCX)
            </h2>
            
            <label className="border-2 border-dashed border-slate-700 hover:border-indigo-500/60 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition bg-slate-900/40 hover:bg-slate-900/80 group">
              <input
                type="file"
                accept=".pdf,.docx,.doc,.txt"
                onChange={handleFileUpload}
                className="hidden"
                disabled={isUploading}
              />
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 group-hover:bg-indigo-500/20 flex items-center justify-center mb-3 transition">
                {isUploading ? (
                  <RefreshCw className="w-6 h-6 text-indigo-400 animate-spin" />
                ) : (
                  <FileText className="w-6 h-6 text-indigo-400" />
                )}
              </div>
              <span className="text-xs font-bold text-white text-center">
                {isUploading ? 'Analyzing Resume with AI...' : 'Click to Upload Resume'}
              </span>
              <span className="text-[11px] text-slate-400 text-center mt-1">
                Supports PDF, DOCX, DOC files
              </span>
            </label>

            {uploadResult && (
              <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" /> Resume Extracted Successfully!
                </div>
                <div className="text-[11px] text-slate-300">
                  <strong>Extracted Skills:</strong> {uploadResult.skills_found?.join(', ') || 'Skills cataloged'}
                </div>
              </div>
            )}
          </div>

          {/* Resume Gap Analysis & Tips */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              AI Resume Gap Recommendations
            </h3>
            <ul className="space-y-2 text-[11px] text-slate-300">
              <li className="flex items-start gap-2 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <CheckCircle2 className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                <span><strong>Include Quantifiable Metrics:</strong> Detail latency reductions, throughput numbers, or user counts in project descriptions.</span>
              </li>
              <li className="flex items-start gap-2 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <CheckCircle2 className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                <span><strong>Highlight System Fundamentals:</strong> Ensure Git, Docker, and REST API architectures are clearly listed.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Right 2-col: Profile Editor */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-indigo-400" />
              Personal & Academic Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:border-indigo-500"
                  placeholder="e.g. Alex Chen"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300">Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:border-indigo-500"
                  placeholder="alex@university.edu"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300">Degree & Major</label>
                <input
                  type="text"
                  value={formData.degree}
                  onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:border-indigo-500"
                  placeholder="B.S. in Computer Science"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300">Graduation Year</label>
                <input
                  type="number"
                  value={formData.graduation_year}
                  onChange={(e) => setFormData({ ...formData, graduation_year: parseInt(e.target.value) || 2026 })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:border-indigo-500"
                  placeholder="2026"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300">University / College</label>
                <input
                  type="text"
                  value={formData.university}
                  onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:border-indigo-500"
                  placeholder="e.g. State University"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300">GPA (Optional)</label>
                <input
                  type="text"
                  value={formData.gpa}
                  onChange={(e) => setFormData({ ...formData, gpa: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:border-indigo-500"
                  placeholder="3.85"
                />
              </div>
            </div>

            {/* Remote Preference & Target Roles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300">Work Mode Preference</label>
                <select
                  value={formData.remote_preference}
                  onChange={(e) => setFormData({ ...formData, remote_preference: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:border-indigo-500"
                >
                  <option value="remote_ok">Remote or On-site (Flexible)</option>
                  <option value="remote_only">Remote Only</option>
                  <option value="onsite_only">On-site / In-person Only</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300">Preferred Roles (comma separated)</label>
                <input
                  type="text"
                  value={formData.preferred_roles?.join(', ')}
                  onChange={(e) => setFormData({ ...formData, preferred_roles: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:border-indigo-500"
                  placeholder="Software Engineering, AI/ML, Full-Stack"
                />
              </div>
            </div>

            {/* Skills Tag Management */}
            <div className="space-y-3 pt-4 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-white flex items-center gap-2">
                  <Code className="w-4 h-4 text-indigo-400" />
                  Verified Skills & Tech Stack ({formData.skills.length})
                </label>
                <span className="text-[11px] text-slate-400">Used by AI matching engine</span>
              </div>

              <div className="flex flex-wrap gap-2 min-h-[50px] p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
                {formData.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                  placeholder="Add skill (e.g. PyTorch, Docker, React, Go)..."
                  className="flex-1 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>
            </div>

            {/* Projects Overview */}
            <div className="space-y-4 pt-4 border-t border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-indigo-400" />
                Featured Projects & Evidence
              </h3>

              {formData.projects?.map((proj, pIdx) => (
                <div key={pIdx} className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-indigo-300">{proj.title}</span>
                    <span className="text-[10px] text-slate-500">{proj.link || 'GitHub'}</span>
                  </div>
                  <p className="text-[11px] text-slate-300">{proj.description}</p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {proj.tech_stack?.map((t, tIdx) => (
                      <span key={tIdx} className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
