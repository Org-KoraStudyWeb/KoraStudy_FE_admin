// src/api/quizApi.js
import axiosClient from "./axiosClient";

const quizApi = {
  // ==================== QUIZ MANAGEMENT ====================

  // Tạo quiz mới (Admin/Content Manager)
  createQuiz: (quizData) => {
    return axiosClient.post("/api/v1/quizzes", quizData);
  },

  // Cập nhật quiz (Admin/Content Manager)
  updateQuiz: (quizId, quizData) => {
    return axiosClient.put(`/api/v1/quizzes/${quizId}`, quizData);
  },

  // Xóa quiz (Admin/Content Manager)
  deleteQuiz: (quizId) => {
    return axiosClient.delete(`/api/v1/quizzes/${quizId}`);
  },

  // Lấy chi tiết quiz (Admin/Content Manager)
  getQuizById: (quizId) => {
    return axiosClient.get(`/api/v1/quizzes/${quizId}`);
  },

  // Lấy danh sách quiz theo section (Admin/Content Manager)
  getQuizzesBySectionId: (sectionId) => {
    return axiosClient.get(`/api/v1/quizzes/section/${sectionId}`);
  },

  // Publish/Unpublish quiz (Admin/Content Manager)
  publishQuiz: (quizId, publish) => {
    return axiosClient.put(`/api/v1/quizzes/${quizId}/publish/${publish}`);
  },

  // ==================== QUESTION MANAGEMENT ====================

  // Thêm câu hỏi vào quiz (Admin/Content Manager)
  addQuestionToQuiz: (quizId, questionData) => {
    return axiosClient.post(
      `/api/v1/quizzes/${quizId}/questions`,
      questionData
    );
  },

  // Cập nhật câu hỏi (Admin/Content Manager)
  updateQuestion: (questionId, questionData) => {
    return axiosClient.put(
      `/api/v1/quizzes/questions/${questionId}`,
      questionData
    );
  },

  // Xóa câu hỏi (Admin/Content Manager)
  deleteQuestion: (questionId) => {
    return axiosClient.delete(`/api/v1/quizzes/questions/${questionId}`);
  },

  // Lấy danh sách câu hỏi của quiz (Admin/Content Manager)
  getQuestionsByQuizId: (quizId) => {
    return axiosClient.get(`/api/v1/quizzes/${quizId}/questions`);
  },

  // ==================== OPTION MANAGEMENT ====================

  // Thêm option vào câu hỏi (Admin/Content Manager)
  addOptionToQuestion: (questionId, optionData) => {
    return axiosClient.post(
      `/api/v1/quizzes/questions/${questionId}/options`,
      optionData
    );
  },

  // Cập nhật option (Admin/Content Manager)
  updateOption: (optionId, optionData) => {
    return axiosClient.put(`/api/v1/quizzes/options/${optionId}`, optionData);
  },

  // Xóa option (Admin/Content Manager)
  deleteOption: (optionId) => {
    return axiosClient.delete(`/api/v1/quizzes/options/${optionId}`);
  },

  // Lấy danh sách option của câu hỏi (Admin/Content Manager)
  getOptionsByQuestionId: (questionId) => {
    return axiosClient.get(`/api/v1/quizzes/questions/${questionId}/options`);
  },

  // ==================== RESULTS & ANALYTICS ====================

  // Lấy kết quả quiz theo ID (Admin/Content Manager)
  getQuizResult: (resultId) => {
    return axiosClient.get(`/api/v1/quizzes/results/${resultId}`);
  },

  // Lấy chi tiết kết quả quiz (Admin/Content Manager)
  getQuizResultDetail: (resultId) => {
    return axiosClient.get(`/api/v1/quizzes/results/${resultId}/details`);
  },

  // Lấy kết quả quiz cho giáo viên (Admin/Content Manager)
  getQuizResultForTeacher: (resultId) => {
    return axiosClient.get(`/api/v1/quizzes/results/${resultId}/teacher`);
  },

  // Lấy danh sách kết quả của quiz (Admin/Content Manager)
  getQuizResults: (quizId) => {
    return axiosClient.get(`/api/v1/quizzes/${quizId}/results`);
  },

  // Lấy tất cả kết quả chi tiết của quiz (Admin/Content Manager)
  getAllQuizResults: (quizId) => {
    return axiosClient.get(`/api/v1/quizzes/${quizId}/results/all`);
  },

  // Lấy thống kê quiz (Admin/Content Manager)
  getQuizStatistics: (quizId) => {
    return axiosClient.get(`/api/v1/quizzes/${quizId}/statistics`);
  },

  // Lấy thống kê quiz theo section (Admin/Content Manager)
  getQuizStatisticsBySectionId: (sectionId) => {
    return axiosClient.get(`/api/v1/quizzes/section/${sectionId}/statistics`);
  },

  // ==================== VALIDATION & UTILITIES ====================

  // Kiểm tra quiz có tồn tại trong section (Admin/Content Manager)
  checkQuizExistsBySectionId: (sectionId) => {
    return axiosClient.get(`/api/v1/quizzes/section/${sectionId}/exists`);
  },

  // Đếm số quiz trong section (Admin/Content Manager)
  countQuizzesBySectionId: (sectionId) => {
    return axiosClient.get(`/api/v1/quizzes/section/${sectionId}/count`);
  },

  // Kiểm tra quiz có tồn tại (Admin/Content Manager)
  checkQuizExists: (quizId) => {
    return axiosClient.get(`/api/v1/quizzes/${quizId}/exists`);
  },

  // Tìm kiếm quiz (Admin/Content Manager)
  searchQuizzes: (params) => {
    return axiosClient.get("/api/v1/quizzes/search", { params });
  },
};

export default quizApi;
