// src/api/lessonApi.js
import axiosClient from "./axiosClient";

const lessonApi = {
  // ==================== LESSON MANAGEMENT ====================

  /**
   * Lấy danh sách lessons của section
   */
  getLessonsBySectionId: (sectionId) => {
    return axiosClient.get(`/api/v1/lessons/section/${sectionId}`);
  },

  /**
   * Lấy danh sách lessons của course
   */
  getLessonsByCourseId: (courseId) => {
    return axiosClient.get(`/api/v1/lessons/course/${courseId}`);
  },

  /**
   * Lấy chi tiết lesson theo ID
   */
  getLessonById: (id) => {
    return axiosClient.get(`/api/v1/lessons/${id}`);
  },

  /**
   * Tạo lesson mới
   */
  createLesson: (lessonData) => {
    return axiosClient.post("/api/v1/lessons", lessonData);
  },

  /**
   * Cập nhật lesson
   */
  updateLesson: (id, lessonData) => {
    return axiosClient.put(`/api/v1/lessons/${id}`, lessonData);
  },

  /**
   * Xóa lesson
   */
  deleteLesson: (id) => {
    return axiosClient.delete(`/api/v1/lessons/${id}`);
  },

  // ==================== LESSON FILE UPLOAD ====================

  /**
   * Upload video cho lesson
   */
  uploadVideo: (file, title = "") => {
    const formData = new FormData();
    formData.append("file", file);
    if (title) {
      formData.append("title", title);
    }

    return axiosClient.post("/api/v1/lessons/upload/video", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      timeout: 60000,
    });
  },

  /**
   * Upload document cho lesson
   */
  uploadDocument: (file, title = "") => {
    const formData = new FormData();
    formData.append("file", file);
    if (title) {
      formData.append("title", title);
    }

    return axiosClient.post("/api/v1/lessons/upload/document", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      timeout: 120000, // Tăng timeout lên 2 phút cho upload document
    });
  },

  /**
   * Xóa file
   */
  deleteFile: (fileUrl) => {
    return axiosClient.delete("/api/v1/lessons/files", {
      params: { fileUrl },
    });
  },

  // ==================== LESSON PROGRESS ====================

  /**
   * Cập nhật tiến độ lesson
   */
  updateLessonProgress: (progressData) => {
    return axiosClient.post("/api/v1/lessons/progress", progressData);
  },

  /**
   * Lấy tiến độ lesson của user hiện tại
   */
  getLessonProgress: (lessonId) => {
    return axiosClient.get(`/api/v1/lessons/${lessonId}/progress`);
  },

  /**
   * Lấy tiến độ lessons của user trong course
   */
  getUserProgressByCourse: (courseId) => {
    return axiosClient.get(`/api/v1/lessons/course/${courseId}/progress`);
  },

  /**
   * Lấy tiến độ của tất cả users trong khóa học (admin)
   */
  getAllUsersProgressByCourse: (courseId) => {
    return axiosClient.get(
      `/api/v1/lessons/admin/course/${courseId}/progress/all`
    );
  },

  /**
   * Lấy tiến độ của user cụ thể trong khóa học (admin)
   */
  getUserProgressByCourseForAdmin: (courseId, userId) => {
    return axiosClient.get(
      `/api/v1/lessons/admin/course/${courseId}/user/${userId}/progress`
    );
  },
};

export default lessonApi;
