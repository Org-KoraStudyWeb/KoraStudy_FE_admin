import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const adminExamService = {
  // Get all exams for admin
  getAllExams: () => api.get('/admin/exams'),

  // Get exam for editing
  getExamForEdit: (id) => api.get(`/admin/exams/${id}`),

  // Create new exam
  createExam: (examData) => api.post('/admin/exams', examData),

  // Update exam
  updateExam: (id, examData) => api.put(`/admin/exams/${id}`, examData),

  // Delete exam
  deleteExam: (id) => api.delete(`/admin/exams/${id}`),

  // Toggle exam active status
  toggleExamActive: (id) => api.patch(`/admin/exams/${id}/toggle-active`),

  // Duplicate exam
  duplicateExam: (id) => api.post(`/admin/exams/${id}/duplicate`),

  // Part management
  addPart: (examId, partData) => api.post(`/admin/exams/${examId}/parts`, partData),
  updatePart: (partId, partData) => api.put(`/admin/exams/parts/${partId}`, partData),
  deletePart: (partId) => api.delete(`/admin/exams/parts/${partId}`),

  // Question management
  addQuestion: (partId, questionData) => api.post(`/admin/exams/parts/${partId}/questions`, questionData),
  updateQuestion: (questionId, questionData) => api.put(`/admin/exams/questions/${questionId}`, questionData),
  deleteQuestion: (questionId) => api.delete(`/admin/exams/questions/${questionId}`),

  // File upload
  uploadQuestionImage: (questionId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/admin/exams/questions/${questionId}/upload-image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  uploadQuestionAudio: (questionId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/admin/exams/questions/${questionId}/upload-audio`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
};
