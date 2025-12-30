import axiosClient from "./axiosClient";

const reviewApi = {
  // ==================== ADMIN DASHBOARD & STATS ====================

  /**
   * ADMIN: Lấy thống kê tổng quan (DTO version)
   * API: GET /api/v1/reviews/admin/stats
   */
  getReviewStats: () => {
    return axiosClient.get("/api/v1/reviews/admin/stats");
  },

  /**
   * ADMIN: Lấy dashboard stats với chart data
   * API: GET /api/v1/reviews/admin/dashboard
   */
  getDashboardStats: () => {
    return axiosClient.get("/api/v1/reviews/admin/dashboard");
  },

  /**
   * ADMIN: Lấy thống kê legacy (Map version - backward compatibility)
   * API: GET /api/v1/reviews/admin/stats/legacy
   */
  getReviewStatsLegacy: () => {
    return axiosClient.get("/api/v1/reviews/admin/stats/legacy");
  },

  // ==================== ADMIN REVIEW MANAGEMENT ====================

  /**
   * ADMIN: Lấy tất cả review với filter
   * API: GET /api/v1/reviews/admin/all
   */
  getAllReviews: (params = {}) => {
    const {
      page = 0,
      size = 20,
      targetType = "",
      status = "",
      keyword = "",
    } = params;

    return axiosClient.get("/api/v1/reviews/admin/all", {
      params: {
        page,
        size,
        targetType,
        status,
        keyword,
      },
    });
  },

  /**
   * ADMIN: Lấy review bị report
   * API: GET /api/v1/reviews/admin/reported
   */
  getReportedReviews: (params = {}) => {
    const { page = 0, size = 20 } = params;

    return axiosClient.get("/api/v1/reviews/admin/reported", {
      params: {
        page,
        size,
      },
    });
  },

  /**
   * ADMIN: Xem chi tiết một review (admin version)
   * API: GET /api/v1/reviews/admin/{reviewId}
   */
  getReviewDetail: (reviewId) => {
    return axiosClient.get(`/api/v1/reviews/admin/${reviewId}`);
  },

  /**
   * ADMIN: Cập nhật trạng thái review (ẩn/xóa/active)
   * API: PUT /api/v1/reviews/admin/{reviewId}/status
   */
  updateReviewStatus: (reviewId, statusData) => {
    return axiosClient.put(
      `/api/v1/reviews/admin/${reviewId}/status`,
      statusData
    );
  },

  /**
   * ADMIN: Xử lý report (resolve)
   * API: PUT /api/v1/reviews/admin/{reviewId}/resolve-report
   */
  resolveReport: (reviewId, takeAction, adminNote = "") => {
    return axiosClient.put(
      `/api/v1/reviews/admin/${reviewId}/resolve-report`,
      null,
      {
        params: {
          takeAction,
          adminNote,
        },
      }
    );
  },

  /**
   * ADMIN: Xóa review (hard delete)
   * API: DELETE /api/v1/reviews/admin/{reviewId}
   */
  deleteReview: (reviewId) => {
    return axiosClient.delete(`/api/v1/reviews/admin/${reviewId}`);
  },
};

export default reviewApi;
