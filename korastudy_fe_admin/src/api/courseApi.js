// src/api/courseApi.js
import axiosClient from "./axiosClient";

const courseApi = {
  // ==================== ADMIN COURSE MANAGEMENT ====================

  /**
   * Lấy danh sách khóa học (Admin)
   * @param {Object} params - Query parameters
   * @param {number} params.page - Số trang (bắt đầu từ 0)
   * @param {number} params.size - Số lượng items mỗi trang
   * @param {string} params.sortBy - Trường để sắp xếp
   * @param {string} params.sortDir - Hướng sắp xếp (asc/desc)
   * @param {string} params.keyword - Tìm kiếm theo tên hoặc mô tả
   * @param {string} params.level - Lọc theo cấp độ (Beginner/Intermediate/Advanced)
   * @param {number} params.minPrice - Giá tối thiểu
   * @param {number} params.maxPrice - Giá tối đa
   * @param {boolean} params.isPublished - Lọc theo trạng thái xuất bản
   */
  getAllCoursesAdmin: (params = {}) => {
    const {
      page = 0,
      size = 5,
      sortBy = "id",
      sortDir = "desc",
      keyword = "",
      level,
      minPrice,
      maxPrice,
      isPublished,
    } = params;

    // Build query params object, only include non-null/undefined values
    const queryParams = {
      page,
      size,
      sortBy,
      sortDir,
    };

    // Add optional parameters only if they have values
    if (keyword) queryParams.keyword = keyword;
    if (level) queryParams.level = level;
    if (minPrice !== null && minPrice !== undefined) queryParams.minPrice = minPrice;
    if (maxPrice !== null && maxPrice !== undefined) queryParams.maxPrice = maxPrice;
    if (isPublished !== null && isPublished !== undefined) queryParams.isPublished = isPublished;

    return axiosClient.get("/api/v1/admin/courses", {
      params: queryParams,
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
