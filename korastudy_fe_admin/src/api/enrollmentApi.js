// src/api/enrollmentApi.js
import axiosClient from "./axiosClient";

const enrollmentApi = {
  // ==================== ENROLLMENT MANAGEMENT ====================

  /**
   * Đăng ký khóa học
   */
  enrollCourse: (courseId) => {
    return axiosClient.post("/api/v1/enrollments", { courseId });
  },

  /**
   * Lấy danh sách khóa học của tôi
   */
  getMyEnrollments: () => {
    return axiosClient.get("/api/v1/enrollments/my-courses");
  },

  /**
   * Lọc khóa học của tôi theo trạng thái - ✅ API MỚI
   */
  getMyEnrollmentsByStatus: (status) => {
    return axiosClient.get("/api/v1/enrollments/my-courses/filter", {
      params: { status },
    });
  },

  /**
   * Lấy chi tiết enrollment
   */
  getEnrollmentById: (id) => {
    return axiosClient.get(`/api/v1/enrollments/${id}`);
  },

  /**
   * Cập nhật tiến độ học tập
   */
  updateProgress: (enrollmentId, progress) => {
    return axiosClient.put(
      `/api/v1/enrollments/${enrollmentId}/progress`,
      null,
      {
        params: { progress },
      }
    );
  },

  /**
   * Hủy đăng ký khóa học
   */
  cancelEnrollment: (enrollmentId) => {
    return axiosClient.delete(`/api/v1/enrollments/${enrollmentId}`);
  },

  // ==================== ENROLLMENT CHECK ====================

  /**
   * Kiểm tra đã đăng ký khóa học chưa (theo userId)
   */
  checkEnrollment: (userId, courseId) => {
    return axiosClient.get("/api/v1/enrollments/check", {
      params: { userId, courseId },
    });
  },

  /**
   * Kiểm tra tôi đã đăng ký khóa học chưa
   */
  checkMyEnrollment: (courseId) => {
    return axiosClient.get("/api/v1/enrollments/check-my-enrollment", {
      params: { courseId },
    });
  },

  // ==================== ADMIN ENROLLMENT MANAGEMENT ====================

  /**
   * Lấy danh sách enrollment của user (Admin)
   */
  getUserEnrollmentsAdmin: (userId) => {
    return axiosClient.get(`/api/v1/enrollments/user/${userId}`);
  },

  /**
   * Lấy thống kê enrollment (Admin)
   */
  getEnrollmentStats: () => {
    return axiosClient.get("/api/v1/enrollments/stats");
  },

  /**
   * Lấy danh sách hoạt động đăng ký gần đây (Admin)
   */
  getRecentEnrollments: (limit = 5) => {
    return axiosClient.get("/api/v1/enrollments/recent", {
      params: { limit },
    });
  },
};

export default enrollmentApi;
