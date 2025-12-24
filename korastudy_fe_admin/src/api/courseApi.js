// src/api/courseApi.js
import axiosClient from "./axiosClient";

const courseApi = {
  // ==================== ADMIN COURSE MANAGEMENT ====================

  /**
   * Lấy danh sách khóa học (Admin)
   */
  getAllCoursesAdmin: (params = {}) => {
    const {
      page = 0,
      size = 5,
      sortBy = "id",
      sortDir = "desc",
      keyword = "",
    } = params;

    return axiosClient.get("/api/v1/admin/courses", {
      params: {
        page,
        size,
        sortBy,
        sortDir,
        keyword,
      },
    });
  },

  /**
   * Lấy chi tiết khóa học (Admin)
   */
  getCourseByIdAdmin: (id) => {
    return axiosClient.get(`/api/v1/admin/courses/${id}`);
  },

  /**
   * Tạo khóa học mới (Admin)
   */
  createCourse: (courseData) => {
    return axiosClient.post("/api/v1/admin/courses", courseData);
  },

  /**
   * Cập nhật khóa học (Admin)
   */
  updateCourse: (id, courseData) => {
    return axiosClient.put(`/api/v1/admin/courses/${id}`, courseData);
  },

  /**
   * Xóa khóa học (Admin)
   */
  deleteCourse: (id) => {
    return axiosClient.delete(`/api/v1/admin/courses/${id}`);
  },

  /**
   * Xuất bản/hủy xuất bản khóa học (Admin)
   */
  togglePublishCourse: (id, isPublished) => {
    return axiosClient.put(`/api/v1/admin/courses/${id}/publish`, null, {
      params: { isPublished },
    });
  },

  /**
   * Lấy thống kê khóa học (Admin) - ✅ ĐÃ CẬP NHẬT
   */
  getCourseStats: () => {
    return axiosClient.get("/api/v1/admin/courses/stats");
  },

  // ==================== COURSE ENROLLMENTS (ADMIN) ====================

  /**
   * Lấy danh sách đăng ký của khóa học (Admin)
   */
  getCourseEnrollmentsAdmin: (courseId, params = {}) => {
    const { page = 0, size = 10 } = params;
    return axiosClient.get(`/api/v1/admin/courses/${courseId}/enrollments`, {
      params: { page, size },
    });
  },

  // ==================== COURSE REVIEWS (ADMIN) ====================

  /**
   * Lấy danh sách đánh giá của khóa học (Admin)
   */
  getCourseReviewsAdmin: (courseId, params = {}) => {
    const { page = 0, size = 10 } = params;
    return axiosClient.get(`/api/v1/admin/courses/${courseId}/reviews`, {
      params: { page, size },
    });
  },

  /**
   * Xóa đánh giá (Admin)
   */
  deleteReviewAdmin: (courseId, reviewId) => {
    return axiosClient.delete(
      `/api/v1/admin/courses/${courseId}/reviews/${reviewId}`
    );
  },

  // ==================== PUBLIC COURSE APIs ====================

  /**
   * Lấy danh sách khóa học đã xuất bản (Public)
   */
  getAllPublishedCourses: () => {
    return axiosClient.get("/api/v1/courses");
  },

  /**
   * Lấy chi tiết khóa học (Public)
   */
  getCourseById: (id) => {
    return axiosClient.get(`/api/v1/courses/${id}`);
  },

  /**
   * Tìm kiếm khóa học nâng cao (Public)
   */
  searchCoursesAdvanced: (searchParams = {}) => {
    const {
      keyword = "",
      courseLevel = "",
      minPrice = null,
      maxPrice = null,
      startDate = null,
      endDate = null,
      page = 0,
      size = 10,
    } = searchParams;

    return axiosClient.get("/api/v1/courses/search", {
      params: {
        keyword,
        courseLevel,
        minPrice,
        maxPrice,
        startDate,
        endDate,
        page,
        size,
      },
    });
  },

  // ==================== COURSE IMAGE UPLOAD ====================

  /**
   * Upload ảnh khóa học
   */
  uploadCourseImage: (file) => {
    const formData = new FormData();
    formData.append("file", file);

    return axiosClient.post("/api/v1/upload/course-image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      timeout: 30000,
    });
  },
};

export default courseApi;
