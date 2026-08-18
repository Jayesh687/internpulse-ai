import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const profileApi = {
  get: () => api.get('/profile').then(res => res.data),
  update: (data) => api.put('/profile', data).then(res => res.data),
  uploadResume: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/profile/upload-resume', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }).then(res => res.data);
  }
};

export const internshipsApi = {
  list: (params) => api.get('/internships', { params }).then(res => res.data),
  matched: (params) => api.get('/internships/matched', { params }).then(res => res.data),
  getById: (id) => api.get(`/internships/${id}`).then(res => res.data),
};

export const applicationsApi = {
  getAll: () => api.get('/applications').then(res => res.data),
  create: (data) => api.post('/applications', data).then(res => res.data),
  update: (id, data) => api.put(`/applications/${id}`, data).then(res => res.data),
  delete: (id) => api.delete(`/applications/${id}`).then(res => res.data),
  tailor: (internshipId, customQuestionPrompt = "") => 
    api.post('/applications/tailor', { internship_id: internshipId, custom_question_prompt: customQuestionPrompt }).then(res => res.data)
};

export const interviewApi = {
  getPrep: (internshipId) => api.get(`/interview/prep/${internshipId}`).then(res => res.data),
  startSession: (internshipId) => api.post(`/interview/session/start/${internshipId}`).then(res => res.data),
  getMessages: (sessionId) => api.get(`/interview/session/${sessionId}/messages`).then(res => res.data),
  sendChat: (sessionId, userMessage) => api.post('/interview/chat', { session_id: sessionId, user_message: userMessage }).then(res => res.data)
};

export default api;
