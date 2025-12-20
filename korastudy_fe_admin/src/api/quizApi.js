// src/api/quizApi.js (Admin only)
import axiosClient from "./axiosClient";

const quizApi = {
  // ==================== QUIZ MANAGEMENT ====================

  // Tạo quiz mới
  createQuiz: (quizData) => {
    return axiosClient.post("/api/v1/quizzes", quizData);
  },

  // Cập nhật quiz
  updateQuiz: (quizId, quizData) => {
    return axiosClient.put(`/api/v1/quizzes/${quizId}`, quizData);
  },

  // Xóa quiz
  deleteQuiz: (quizId) => {
    return axiosClient.delete(`/api/v1/quizzes/${quizId}`);
  },

  // Lấy chi tiết quiz (Admin view - có đáp án)
  getQuizById: (quizId) => {
    return axiosClient.get(`/api/v1/quizzes/${quizId}`);
  },

  // Lấy danh sách quiz theo section
  getQuizzesBySectionId: (sectionId) => {
    return axiosClient.get(`/api/v1/quizzes/section/${sectionId}`);
  },

  // Publish/Unpublish quiz
  publishQuiz: (quizId, publish) => {
    return axiosClient.put(`/api/v1/quizzes/${quizId}/publish/${publish}`);
  },

  // ==================== QUESTION MANAGEMENT ====================

  // Thêm câu hỏi vào quiz
  addQuestionToQuiz: (quizId, questionData) => {
    return axiosClient.post(
      `/api/v1/quizzes/${quizId}/questions`,
      questionData
    );
  },

  // Cập nhật câu hỏi
  updateQuestion: (questionId, questionData) => {
    return axiosClient.put(
      `/api/v1/quizzes/questions/${questionId}`,
      questionData
    );
  },

  // Xóa câu hỏi
  deleteQuestion: (questionId) => {
    return axiosClient.delete(`/api/v1/quizzes/questions/${questionId}`);
  },

  // Lấy danh sách câu hỏi của quiz (Admin view - có đáp án)
  getQuestionsByQuizId: (quizId) => {
    return axiosClient.get(`/api/v1/quizzes/${quizId}/questions`);
  },

  // ==================== OPTION MANAGEMENT ====================

  // Thêm option vào câu hỏi
  addOptionToQuestion: (questionId, optionData) => {
    return axiosClient.post(
      `/api/v1/quizzes/questions/${questionId}/options`,
      optionData
    );
  },

  // Cập nhật option
  updateOption: (optionId, optionData) => {
    return axiosClient.put(`/api/v1/quizzes/options/${optionId}`, optionData);
  },

  // Xóa option
  deleteOption: (optionId) => {
    return axiosClient.delete(`/api/v1/quizzes/options/${optionId}`);
  },

  // Lấy danh sách option của câu hỏi
  getOptionsByQuestionId: (questionId) => {
    return axiosClient.get(`/api/v1/quizzes/questions/${questionId}/options`);
  },

  // ==================== RESULTS & ANALYTICS ====================

  // Lấy kết quả quiz theo ID
  getQuizResult: (resultId) => {
    return axiosClient.get(`/api/v1/quizzes/results/${resultId}`);
  },

  // Lấy chi tiết kết quả quiz cho giáo viên
  getQuizResultForTeacher: (resultId) => {
    return axiosClient.get(`/api/v1/quizzes/results/${resultId}/teacher`);
  },

  // Lấy trạng thái quiz của một user (Admin view)
  getQuizStatusForUser: (quizId, userId) => {
    return axiosClient.get(`/api/v1/quizzes/${quizId}/user/${userId}/status`);
  },

  // Lấy danh sách kết quả của quiz
  getQuizResults: (quizId) => {
    return axiosClient.get(`/api/v1/quizzes/${quizId}/results`);
  },

  // Lấy thống kê quiz
  getQuizStatistics: (quizId) => {
    return axiosClient.get(`/api/v1/quizzes/${quizId}/statistics`);
  },

  // ==================== VALIDATION & UTILITIES ====================

  // Kiểm tra quiz có tồn tại trong section
  checkQuizExistsBySectionId: (sectionId) => {
    return axiosClient.get(`/api/v1/quizzes/section/${sectionId}/exists`);
  },

  // Kiểm tra quiz có tồn tại
  checkQuizExists: (quizId) => {
    return axiosClient.get(`/api/v1/quizzes/${quizId}/exists`);
  },

  // Kiểm tra user có quyền truy cập quiz
  canUserAccessQuiz: (quizId) => {
    return axiosClient.get(`/api/v1/quizzes/${quizId}/can-access`);
  },
};

export default quizApi;
