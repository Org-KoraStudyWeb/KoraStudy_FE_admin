// src/api/quizApi.js (Admin only - chỉ chứa API cần admin role)
import axiosClient from "./axiosClient";

const quizApi = {
  // ==================== QUIZ MANAGEMENT (ADMIN ONLY) ====================

  createQuiz: (quizData) => {
    return axiosClient.post("/api/v1/quizzes", quizData);
  },

  updateQuiz: (quizId, quizData) => {
    return axiosClient.put(`/api/v1/quizzes/${quizId}`, quizData);
  },

  deleteQuiz: (quizId) => {
    return axiosClient.delete(`/api/v1/quizzes/${quizId}`);
  },

  getQuizByIdForAdmin: (quizId) => {
    return axiosClient.get(`/api/v1/quizzes/${quizId}/admin`);
  },

  publishQuiz: (quizId, publish) => {
    return axiosClient.put(`/api/v1/quizzes/${quizId}/publish/${publish}`);
  },

  // ==================== QUESTION MANAGEMENT (ADMIN ONLY) ====================

  addQuestionToQuiz: (quizId, questionData) => {
    return axiosClient.post(
      `/api/v1/quizzes/${quizId}/questions`,
      questionData
    );
  },

  importQuestions: (quizId, file) => {
    const formData = new FormData();
    formData.append("file", file);
    return axiosClient.post(
      `/api/v1/quizzes/${quizId}/import-questions`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
  },

  updateQuestion: (questionId, questionData) => {
    return axiosClient.put(
      `/api/v1/quizzes/questions/${questionId}`,
      questionData
    );
  },

  deleteQuestion: (questionId) => {
    return axiosClient.delete(`/api/v1/quizzes/questions/${questionId}`);
  },

  getQuestionsByQuizIdForAdmin: (quizId) => {
    return axiosClient.get(`/api/v1/quizzes/${quizId}/questions/admin`);
  },

  // ==================== OPTION MANAGEMENT (ADMIN ONLY) ====================

  addOptionToQuestion: (questionId, optionData) => {
    return axiosClient.post(
      `/api/v1/quizzes/questions/${questionId}/options`,
      optionData
    );
  },

  updateOption: (optionId, optionData) => {
    return axiosClient.put(`/api/v1/quizzes/options/${optionId}`, optionData);
  },

  deleteOption: (optionId) => {
    return axiosClient.delete(`/api/v1/quizzes/options/${optionId}`);
  },

  getOptionsByQuestionId: (questionId) => {
    return axiosClient.get(`/api/v1/quizzes/questions/${questionId}/options`);
  },

  // ==================== RESULTS & ANALYTICS (ADMIN ONLY) ====================

  // Lấy chi tiết kết quả quiz cho admin (có đầy đủ thông tin)
  getQuizResultForAdmin: (resultId) => {
    return axiosClient.get(`/api/v1/quizzes/results/${resultId}/admin`);
  },

  // Lấy trạng thái quiz của một user (admin xem user khác)
  getQuizStatusForUser: (quizId, userId) => {
    return axiosClient.get(`/api/v1/quizzes/${quizId}/user/${userId}/status`);
  },

  // Lấy danh sách kết quả của quiz (tất cả users)
  getQuizResults: (quizId) => {
    return axiosClient.get(`/api/v1/quizzes/${quizId}/results`);
  },

  // Lấy thống kê quiz
  getQuizStatistics: (quizId) => {
    return axiosClient.get(`/api/v1/quizzes/${quizId}/statistics`);
  },

  // ==================== COURSE QUIZ PROGRESS (ADMIN ONLY) ====================

  // Lấy tiến độ chi tiết quiz của user trong course
  getUserQuizProgressInCourse: (courseId, userId) => {
    return axiosClient.get(
      `/api/v1/quizzes/admin/course/${courseId}/user/${userId}/progress`
    );
  },

  // Lấy tổng hợp tiến độ quiz của user trong course
  getUserQuizProgressSummary: (courseId, userId) => {
    return axiosClient.get(
      `/api/v1/quizzes/admin/course/${courseId}/user/${userId}/progress/summary`
    );
  },

  // Lấy tiến độ quiz của tất cả users trong course
  getAllUsersQuizProgressInCourse: (courseId) => {
    return axiosClient.get(
      `/api/v1/quizzes/admin/course/${courseId}/all-users-progress`
    );
  },

  // Lấy điểm trung bình chi tiết của user trong course
  getUserDetailedAverageScoreInCourse: (courseId, userId) => {
    return axiosClient.get(
      `/api/v1/quizzes/admin/course/${courseId}/user/${userId}/average-score/detailed`
    );
  },

  // Lấy điểm trung bình đơn giản của user trong course
  getUserSimpleAverageScoreInCourse: (courseId, userId) => {
    return axiosClient.get(
      `/api/v1/quizzes/admin/course/${courseId}/user/${userId}/average-score/simple`
    );
  },

  // ==================== VALIDATION & UTILITIES (MIXED) ====================

  // API này cả admin và user đều có thể gọi (không có @PreAuthorize)
  getQuizzesBySectionId: (sectionId) => {
    return axiosClient.get(`/api/v1/quizzes/section/${sectionId}`);
  },

  // API này cả admin và user đều có thể gọi (không có @PreAuthorize)
  checkQuizExistsBySectionId: (sectionId) => {
    return axiosClient.get(`/api/v1/quizzes/section/${sectionId}/exists`);
  },

  // API này cả admin và user đều có thể gọi (không có @PreAuthorize)
  checkQuizExists: (quizId) => {
    return axiosClient.get(`/api/v1/quizzes/${quizId}/exists`);
  },
};

export default quizApi;
