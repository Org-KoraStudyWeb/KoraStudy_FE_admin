// src/api/sectionApi.js
import axiosClient from "./axiosClient";

const sectionApi = {
  // ==================== SECTION MANAGEMENT ====================

  /**
   * Lấy danh sách sections của khóa học
   */
  getSectionsByCourseId: (courseId) => {
    return axiosClient.get(`/api/v1/sections/course/${courseId}`);
  },

  /**
   * Lấy chi tiết section theo ID
   */
  getSectionById: (id) => {
    return axiosClient.get(`/api/v1/sections/${id}`);
  },

  /**
   * Tạo section mới
   */
  createSection: (sectionData) => {
    return axiosClient.post("/api/v1/sections", sectionData);
  },

  /**
   * Cập nhật section
   */
  updateSection: (id, sectionData) => {
    return axiosClient.put(`/api/v1/sections/${id}`, sectionData);
  },

  /**
   * Xóa section
   */
  deleteSection: (id) => {
    return axiosClient.delete(`/api/v1/sections/${id}`);
  },

  // ==================== CÁC ENDPOINT SAU KHÔNG TỒN TẠI TRONG BACKEND - CẦN XÓA ====================
  /*
  reorderSections: (courseId, sectionOrder) => {
    return axiosClient.put(`/api/v1/sections/course/${courseId}/reorder`, sectionOrder);
  },

  getSectionProgress: (sectionId) => {
    return axiosClient.get(`/api/v1/sections/${sectionId}/progress`);
  },

  markSectionComplete: (sectionId) => {
    return axiosClient.put(`/api/v1/sections/${sectionId}/complete`);
  },
  */
};

export default sectionApi;
