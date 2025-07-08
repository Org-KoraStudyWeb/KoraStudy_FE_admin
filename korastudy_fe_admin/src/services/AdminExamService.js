import ApiService from './ApiService';

class AdminExamService {
  
  // Get all exams for admin
  async getAllExams() {
    return ApiService.get('/admin/exams');
  }

  // Get exam detail for editing
  async getExamDetail(id) {
    return ApiService.get(`/admin/exams/${id}`);
  }

  // Create new exam
  async createExam(examData) {
    const requestData = {
      title: examData.title,
      description: examData.description,
      level: examData.level,
      durationTimes: examData.durationTimes,
      instructions: examData.instructions,
      requirements: examData.requirements
    };
    return ApiService.post('/admin/exams', requestData);
  }

  // Update exam
  async updateExam(id, examData) {
    const requestData = {
      title: examData.title,
      description: examData.description,
      level: examData.level,
      durationTimes: examData.durationTimes,
      instructions: examData.instructions,
      requirements: examData.requirements
    };
    return ApiService.put(`/admin/exams/${id}`, requestData);
  }

  // Delete exam
  async deleteExam(id) {
    return ApiService.delete(`/admin/exams/${id}`);
  }

  // Toggle exam active status
  async toggleExamActive(id) {
    return ApiService.patch(`/admin/exams/${id}/toggle-active`);
  }

  // Duplicate exam
  async duplicateExam(id) {
    return ApiService.post(`/admin/exams/${id}/duplicate`);
  }

  // Part operations
  async addPart(examId, partData) {
    return ApiService.post(`/admin/exams/${examId}/parts`, partData);
  }

  async updatePart(partId, partData) {
    return ApiService.put(`/admin/exams/parts/${partId}`, partData);
  }

  async deletePart(partId) {
    return ApiService.delete(`/admin/exams/parts/${partId}`);
  }

  // Question operations
  async addQuestion(partId, questionData) {
    return ApiService.post(`/admin/exams/parts/${partId}/questions`, questionData);
  }

  async updateQuestion(questionId, questionData) {
    return ApiService.put(`/admin/exams/questions/${questionId}`, questionData);
  }

  async deleteQuestion(questionId) {
    return ApiService.delete(`/admin/exams/questions/${questionId}`);
  }

  // File upload operations
  async uploadQuestionImage(questionId, file) {
    return ApiService.uploadFile(`/admin/exams/questions/${questionId}/upload-image`, file);
  }

  async uploadQuestionAudio(questionId, file) {
    return ApiService.uploadFile(`/admin/exams/questions/${questionId}/upload-audio`, file);
  }
}

export default new AdminExamService();
