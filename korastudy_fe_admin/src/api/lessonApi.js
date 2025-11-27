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
      timeout: 60000,
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

  // ==================== CÁC ENDPOINT SAU KHÔNG TỒN TẠI TRONG BACKEND - CẦN XÓA ====================
  /*
  reorderLessons: (sectionId, lessonOrder) => {
    return axiosClient.put(`/api/v1/lessons/section/${sectionId}/reorder`, lessonOrder);
  },

  uploadLessonFile: (lessonId, fileData) => {
    const formData = new FormData();
    formData.append("file", fileData);
    return axiosClient.post(`/api/v1/lessons/${lessonId}/files`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 60000,
    });
  },

  deleteLessonFile: (fileId) => {
    return axiosClient.delete(`/api/v1/lessons/files/${fileId}`);
  },

  uploadLessonVideo: (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return axiosClient.post("/api/v1/upload/lesson-video", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 60000,
    });
  },

  markLessonComplete: (lessonId) => {
    return axiosClient.put(`/api/v1/lessons/${lessonId}/complete`);
  },
  */
};

export default lessonApi;
