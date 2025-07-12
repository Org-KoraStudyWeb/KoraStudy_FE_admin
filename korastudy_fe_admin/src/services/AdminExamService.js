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

const AdminExamService = {
  // Get all exams for admin
  getAllExams: async () => {
    try {
      const response = await api.get('/admin/exams');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get exam detail for editing
  getExamDetail: async (id) => {
    try {
      const response = await api.get(`/admin/exams/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create new exam
  createExam: async (examData) => {
    try {
      const response = await api.post('/admin/exams', examData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update exam
  updateExam: async (id, examData) => {
    try {
      const response = await api.put(`/admin/exams/${id}`, examData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete exam
  deleteExam: async (id) => {
    try {
      const response = await api.delete(`/admin/exams/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Toggle exam active status
  toggleExamActive: async (id) => {
    try {
      const response = await api.patch(`/admin/exams/${id}/toggle-active`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Duplicate exam
  duplicateExam: async (id) => {
    try {
      const response = await api.post(`/admin/exams/${id}/duplicate`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // File upload methods
  uploadQuestionImage: async (questionId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await api.post(`/admin/exams/questions/${questionId}/upload-image`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  uploadQuestionAudio: async (questionId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await api.post(`/admin/exams/questions/${questionId}/upload-audio`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default AdminExamService;
