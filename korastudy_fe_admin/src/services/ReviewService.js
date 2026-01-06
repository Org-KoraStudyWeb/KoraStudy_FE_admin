import reviewApi from "../api/reviewApi";

class ReviewService {
  // ==================== CONSTANTS ====================
  static REVIEW_TYPES = {
    COURSE: "COURSE",
    MOCK_TEST: "MOCK_TEST",
    NEWS: "NEWS",
  };

  static REVIEW_STATUS = {
    ACTIVE: "ACTIVE",
    REPORTED: "REPORTED",
    HIDDEN: "HIDDEN",
    DELETED: "DELETED",
  };

  static RATING_LABELS = {
    1: "Rất tệ",
    2: "Tệ",
    3: "Bình thường",
    4: "Tốt",
    5: "Rất tốt",
  };

  // ==================== ADMIN DASHBOARD & STATS ====================

  /**
   * Lấy thống kê tổng quan
   */
  async getReviewStats() {
    try {
      console.log("📊 [ADMIN] Fetching review statistics");
      const response = await reviewApi.getReviewStats();

      return {
        success: true,
        data: response.data,
        message: "Lấy thống kê đánh giá thành công",
      };
    } catch (error) {
      console.error("❌ [ADMIN] Failed to fetch review stats:", error);
      return this.handleError(error, "Lỗi khi lấy thống kê đánh giá");
    }
  }

  /**
   * Lấy dashboard stats với chart data
   */
  async getDashboardStats() {
    try {
      console.log("📈 [ADMIN] Fetching dashboard statistics");
      const response = await reviewApi.getDashboardStats();

      return {
        success: true,
        data: response.data,
        message: "Lấy thống kê dashboard thành công",
      };
    } catch (error) {
      console.error("❌ [ADMIN] Failed to fetch dashboard stats:", error);
      return this.handleError(error, "Lỗi khi lấy thống kê dashboard");
    }
  }

  /**
   * Lấy thống kê legacy
   */
  async getReviewStatsLegacy() {
    try {
      console.log("📊 [ADMIN] Fetching legacy statistics");
      const response = await reviewApi.getReviewStatsLegacy();

      return {
        success: true,
        data: response.data,
        message: "Lấy thống kê cũ thành công",
      };
    } catch (error) {
      console.error("❌ [ADMIN] Failed to fetch legacy stats:", error);
      return this.handleError(error, "Lỗi khi lấy thống kê cũ");
    }
  }

  // ==================== ADMIN REVIEW MANAGEMENT ====================

  /**
   * Lấy tất cả review với filter
   */
  async getAllReviews(params = {}) {
    try {
      const {
        page: rawPage,
        size = 20,
        targetType = null,
        status = null,
        keyword = null,
      } = params;

      // Xử lý page
      const page = !isNaN(rawPage) && rawPage >= 0 ? rawPage : 0;

      // Build params object
      const cleanParams = { page, size };
      if (targetType) cleanParams.targetType = targetType;
      if (status) cleanParams.status = status;
      if (keyword) cleanParams.keyword = keyword;

      console.log("📦 [ADMIN] Fetching all reviews with params:", cleanParams);

      const response = await reviewApi.getAllReviews(cleanParams);

      return {
        success: true,
        data: response.data,
        message: "Lấy danh sách đánh giá thành công",
        pagination: this.extractPaginationInfo(response.data),
      };
    } catch (error) {
      console.error("❌ [ADMIN] Failed to fetch all reviews:", error);
      return this.handleError(error, "Lỗi khi lấy danh sách đánh giá");
    }
  }

  /**
   * Lấy review bị report
   */
  async getReportedReviews(params = {}) {
    try {
      const { page: rawPage, size = 20 } = params;

      const page = !isNaN(rawPage) && rawPage >= 0 ? rawPage : 0;
      const cleanParams = { page, size };

      console.log(
        "🚨 [ADMIN] Fetching reported reviews with params:",
        cleanParams
      );

      const response = await reviewApi.getReportedReviews(cleanParams);

      return {
        success: true,
        data: response.data,
        message: "Lấy danh sách review bị báo cáo thành công",
        pagination: this.extractPaginationInfo(response.data),
      };
    } catch (error) {
      console.error("❌ [ADMIN] Failed to fetch reported reviews:", error);
      return this.handleError(error, "Lỗi khi lấy review bị báo cáo");
    }
  }

  /**
   * Lấy chi tiết review (admin version)
   */
  async getReviewDetail(reviewId) {
    try {
      if (!reviewId) {
        return { success: false, message: "ID review không được để trống" };
      }

      console.log("🔍 [ADMIN] Fetching review detail ID:", reviewId);

      const response = await reviewApi.getReviewDetail(reviewId);

      return {
        success: true,
        data: response.data,
        message: "Lấy thông tin review thành công",
      };
    } catch (error) {
      console.error(
        `❌ [ADMIN] Failed to fetch review detail ${reviewId}:`,
        error
      );
      return this.handleError(error, "Lỗi khi lấy thông tin review");
    }
  }

  /**
   * Cập nhật trạng thái review
   */
  async updateReviewStatus(reviewId, statusData) {
    try {
      if (!reviewId) {
        return { success: false, message: "ID review không được để trống" };
      }

      const validationResult = this.validateStatusData(statusData);
      if (!validationResult.isValid) {
        return {
          success: false,
          message: validationResult.errors.join(", "),
        };
      }

      console.log("🔄 [ADMIN] Updating review status:", reviewId, statusData);

      const response = await reviewApi.updateReviewStatus(reviewId, statusData);

      console.log("✅ [ADMIN] Review status updated successfully");

      return {
        success: true,
        data: response.data,
        message: this.getStatusUpdateMessage(statusData.status),
      };
    } catch (error) {
      console.error(
        `❌ [ADMIN] Failed to update review status ${reviewId}:`,
        error
      );
      return this.handleError(error, "Lỗi khi cập nhật trạng thái review");
    }
  }

  /**
   * Xử lý report (resolve)
   */
  async resolveReport(reviewId, takeAction, adminNote = "") {
    try {
      if (!reviewId) {
        return { success: false, message: "ID review không được để trống" };
      }

      console.log(
        "🔧 [ADMIN] Resolving report for review:",
        reviewId,
        takeAction,
        adminNote
      );

      const response = await reviewApi.resolveReport(
        reviewId,
        takeAction,
        adminNote
      );

      const message = takeAction
        ? "Đã ẩn review và đánh dấu đã xử lý"
        : "Đã khôi phục review và đánh dấu đã xử lý";

      console.log("✅ [ADMIN] Report resolved successfully");

      return {
        success: true,
        data: response.data,
        message,
      };
    } catch (error) {
      console.error(`❌ [ADMIN] Failed to resolve report ${reviewId}:`, error);
      return this.handleError(error, "Lỗi khi xử lý báo cáo");
    }
  }

  /**
   * Xóa review (hard delete)
   */
  async deleteReview(reviewId) {
    try {
      if (!reviewId) {
        return { success: false, message: "ID review không được để trống" };
      }

      console.log("🗑️ [ADMIN] Hard deleting review:", reviewId);

      await reviewApi.deleteReview(reviewId);

      console.log("✅ [ADMIN] Review hard deleted successfully");

      return {
        success: true,
        message: "Xóa đánh giá vĩnh viễn thành công",
      };
    } catch (error) {
      console.error(`❌ [ADMIN] Failed to delete review ${reviewId}:`, error);
      return this.handleError(error, "Lỗi khi xóa review");
    }
  }

  // ==================== BULK ACTIONS ====================

  /**
   * Cập nhật trạng thái nhiều review
   */
  async bulkUpdateReviewStatus(reviewIds, statusData) {
    try {
      if (!reviewIds || !Array.isArray(reviewIds) || reviewIds.length === 0) {
        return {
          success: false,
          message: "Danh sách review không được để trống",
        };
      }

      const validationResult = this.validateStatusData(statusData);
      if (!validationResult.isValid) {
        return {
          success: false,
          message: validationResult.errors.join(", "),
        };
      }

      console.log(
        "🔄 [ADMIN] Bulk updating review status for:",
        reviewIds,
        statusData
      );

      // Thực hiện từng request (có thể optimize thành batch nếu BE hỗ trợ)
      const results = [];
      for (const reviewId of reviewIds) {
        try {
          const result = await this.updateReviewStatus(reviewId, statusData);
          results.push({ reviewId, success: result.success });
        } catch (error) {
          results.push({ reviewId, success: false, error: error.message });
        }
      }

      const successfulCount = results.filter((r) => r.success).length;
      const failedCount = results.length - successfulCount;

      return {
        success: failedCount === 0,
        data: { results },
        message: `Đã cập nhật ${successfulCount} review, thất bại ${failedCount} review`,
      };
    } catch (error) {
      console.error("❌ [ADMIN] Failed to bulk update review status:", error);
      return this.handleError(error, "Lỗi khi cập nhật hàng loạt");
    }
  }

  /**
   * Xóa nhiều review
   */
  async bulkDeleteReviews(reviewIds) {
    try {
      if (!reviewIds || !Array.isArray(reviewIds) || reviewIds.length === 0) {
        return {
          success: false,
          message: "Danh sách review không được để trống",
        };
      }

      console.log("🗑️ [ADMIN] Bulk deleting reviews:", reviewIds);

      // Thực hiện từng request
      const results = [];
      for (const reviewId of reviewIds) {
        try {
          const result = await this.deleteReview(reviewId);
          results.push({ reviewId, success: result.success });
        } catch (error) {
          results.push({ reviewId, success: false, error: error.message });
        }
      }

      const successfulCount = results.filter((r) => r.success).length;
      const failedCount = results.length - successfulCount;

      return {
        success: failedCount === 0,
        data: { results },
        message: `Đã xóa ${successfulCount} review, thất bại ${failedCount} review`,
      };
    } catch (error) {
      console.error("❌ [ADMIN] Failed to bulk delete reviews:", error);
      return this.handleError(error, "Lỗi khi xóa hàng loạt");
    }
  }

  // ==================== VALIDATION & UTILS ====================

  validateStatusData(statusData) {
    const errors = [];

    if (!statusData.status) {
      errors.push("Trạng thái không được để trống");
    }

    if (
      !Object.values(ReviewService.REVIEW_STATUS).includes(statusData.status)
    ) {
      errors.push(
        `Trạng thái không hợp lệ. Sử dụng: ${Object.values(
          ReviewService.REVIEW_STATUS
        ).join(", ")}`
      );
    }

    return { isValid: errors.length === 0, errors };
  }

  extractPaginationInfo(responseData) {
    if (!responseData) return null;

    return {
      page: responseData.page || responseData.number || 0,
      size: responseData.size || 10,
      totalElements: responseData.totalElements || responseData.totalItems || 0,
      totalPages: responseData.totalPages || 0,
      isFirst: responseData.first !== undefined ? responseData.first : true,
      isLast: responseData.last !== undefined ? responseData.last : false,
    };
  }

  handleError(error, defaultMessage) {
    let message = defaultMessage;
    const status = error.response?.status;

    if (error.response?.data?.message) {
      message = error.response.data.message;
    } else if (error.response?.data?.error) {
      message = error.response.data.error;
    }

    // Xử lý các status code cụ thể
    if (status === 401) {
      message = "Bạn cần đăng nhập với quyền ADMIN để thực hiện thao tác này";
    } else if (status === 403) {
      message = "Bạn không có quyền ADMIN để thực hiện thao tác này";
    } else if (status === 404) {
      message = "Không tìm thấy dữ liệu";
    } else if (status === 409) {
      message = "Dữ liệu đang bị xung đột";
    } else if (status === 400) {
      message = "Dữ liệu không hợp lệ";
    }

    return {
      success: false,
      message,
      status,
      data: null,
    };
  }

  // ==================== FORMATTING UTILS ====================

  getStatusUpdateMessage(status) {
    const messages = {
      [ReviewService.REVIEW_STATUS.ACTIVE]: "Khôi phục review thành công",
      [ReviewService.REVIEW_STATUS.REPORTED]:
        "Đánh dấu review bị report thành công",
      [ReviewService.REVIEW_STATUS.HIDDEN]: "Ẩn review thành công",
      [ReviewService.REVIEW_STATUS.DELETED]: "Xóa review thành công",
    };
    return messages[status] || "Cập nhật trạng thái thành công";
  }

  getReviewTypeLabel(type) {
    const typeLabels = {
      [ReviewService.REVIEW_TYPES.COURSE]: {
        label: "Khóa học",
        color: "primary",
        icon: "book",
      },
      [ReviewService.REVIEW_TYPES.MOCK_TEST]: {
        label: "Bài thi thử",
        color: "secondary",
        icon: "quiz",
      },
      [ReviewService.REVIEW_TYPES.NEWS]: {
        label: "Bài viết",
        color: "info",
        icon: "article",
      },
    };
    return typeLabels[type] || { label: type, color: "default", icon: "help" };
  }

  getReviewStatusLabel(status) {
    const statusLabels = {
      [ReviewService.REVIEW_STATUS.ACTIVE]: {
        label: "Đang hiển thị",
        color: "success",
        variant: "contained",
      },
      [ReviewService.REVIEW_STATUS.REPORTED]: {
        label: "Bị report",
        color: "warning",
        variant: "contained",
      },
      [ReviewService.REVIEW_STATUS.HIDDEN]: {
        label: "Đã ẩn",
        color: "default",
        variant: "outlined",
      },
      [ReviewService.REVIEW_STATUS.DELETED]: {
        label: "Đã xóa",
        color: "error",
        variant: "outlined",
      },
    };
    return (
      statusLabels[status] || {
        label: status,
        color: "default",
        variant: "text",
      }
    );
  }

  getRatingLabel(rating) {
    return ReviewService.RATING_LABELS[rating] || "Chưa đánh giá";
  }

  formatDate(dateString, includeTime = true) {
    if (!dateString) return "Chưa có ngày";

    const options = {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour12: false,
    };

    if (includeTime) {
      options.hour = "2-digit";
      options.minute = "2-digit";
    }

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Chưa có ngày";

      return new Intl.DateTimeFormat("vi-VN", options).format(date);
    } catch {
      return "Chưa có ngày";
    }
  }

  formatTimeAgo(dateString) {
    if (!dateString) return "";

    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffSec = Math.floor(diffMs / 1000);
      const diffMin = Math.floor(diffSec / 60);
      const diffHour = Math.floor(diffMin / 60);
      const diffDay = Math.floor(diffHour / 24);

      if (diffDay > 30) {
        return this.formatDate(dateString, false);
      } else if (diffDay > 0) {
        return `${diffDay} ngày trước`;
      } else if (diffHour > 0) {
        return `${diffHour} giờ trước`;
      } else if (diffMin > 0) {
        return `${diffMin} phút trước`;
      } else {
        return "Vừa xong";
      }
    } catch {
      return "";
    }
  }

  generateStars(rating) {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(i <= rating ? "★" : "☆");
    }
    return stars.join(" ");
  }

  truncateContent(content, maxLength = 100) {
    if (!content) return "";
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + "...";
  }

  calculateAverageRating(reviews = []) {
    if (!reviews.length) return 0;
    const total = reviews.reduce(
      (sum, review) => sum + (review.rating || 0),
      0
    );
    return Math.round((total / reviews.length) * 10) / 10;
  }

  getRatingDistribution(reviews = []) {
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    reviews.forEach((review) => {
      if (review.rating >= 1 && review.rating <= 5) {
        distribution[review.rating]++;
      }
    });

    const total = reviews.length;
    const percentages = {};
    Object.keys(distribution).forEach((rating) => {
      percentages[rating] =
        total > 0 ? Math.round((distribution[rating] / total) * 100) : 0;
    });

    return {
      counts: distribution,
      percentages,
      total,
    };
  }

  filterByStatus(reviews = [], status) {
    if (!status) return reviews;
    return reviews.filter((review) => review.status === status);
  }

  filterByType(reviews = [], type) {
    if (!type) return reviews;
    return reviews.filter((review) => review.reviewType === type);
  }

  searchReviews(reviews = [], searchTerm) {
    if (!searchTerm) return reviews;
    const term = searchTerm.toLowerCase();
    return reviews.filter(
      (review) =>
        review.content?.toLowerCase().includes(term) ||
        review.author?.fullName?.toLowerCase().includes(term) ||
        review.id?.toString().includes(term)
    );
  }

  sortReviews(reviews = [], sortBy = "newest") {
    const sorted = [...reviews];

    switch (sortBy) {
      case "newest":
        return sorted.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
      case "oldest":
        return sorted.sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        );
      case "highest_rating":
        return sorted.sort((a, b) => b.rating - a.rating);
      case "lowest_rating":
        return sorted.sort((a, b) => a.rating - b.rating);
      case "most_likes":
        return sorted.sort((a, b) => (b.likes || 0) - (a.likes || 0));
      case "most_reports":
        return sorted.sort((a, b) => (b.reports || 0) - (a.reports || 0));
      default:
        return sorted;
    }
  }

  // ==================== EXPORT UTILS ====================

  /**
   * Format dữ liệu cho export CSV/Excel
   */
  formatForExport(reviews = []) {
    return reviews.map((review) => ({
      ID: review.id,
      "Loại đánh giá": this.getReviewTypeLabel(review.reviewType).label,
      "ID đối tượng": review.targetId,
      "Người đánh giá": review.author?.fullName || "Ẩn danh",
      "Số sao": review.rating,
      "Đánh giá": review.ratingLabel || this.getRatingLabel(review.rating),
      "Nội dung": review.content,
      "Số lượt thích": review.likes || 0,
      "Số báo cáo": review.reports || 0,
      "Trạng thái": this.getReviewStatusLabel(review.status).label,
      "Ngày tạo": this.formatDate(review.createdAt),
      "Ngày cập nhật": this.formatDate(review.updatedAt),
    }));
  }

  /**
   * Tạo summary report
   */
  generateSummaryReport(reviews = []) {
    const totalReviews = reviews.length;
    const averageRating = this.calculateAverageRating(reviews);
    const ratingDistribution = this.getRatingDistribution(reviews);
    const statusCount = {
      ACTIVE: 0,
      REPORTED: 0,
      HIDDEN: 0,
      DELETED: 0,
    };

    reviews.forEach((review) => {
      if (statusCount[review.status] !== undefined) {
        statusCount[review.status]++;
      }
    });

    const typeCount = {
      COURSE: 0,
      MOCK_TEST: 0,
    };

    reviews.forEach((review) => {
      if (typeCount[review.reviewType] !== undefined) {
        typeCount[review.reviewType]++;
      }
    });

    return {
      totalReviews,
      averageRating,
      ratingDistribution,
      statusCount,
      typeCount,
      dateRange: {
        from: reviews.length
          ? this.formatDate(
              reviews.reduce(
                (min, review) =>
                  new Date(review.createdAt) < new Date(min)
                    ? review.createdAt
                    : min,
                reviews[0].createdAt
              ),
              false
            )
          : "N/A",
        to: reviews.length
          ? this.formatDate(
              reviews.reduce(
                (max, review) =>
                  new Date(review.createdAt) > new Date(max)
                    ? review.createdAt
                    : max,
                reviews[0].createdAt
              ),
              false
            )
          : "N/A",
      },
    };
  }
}

// Tạo instance
const reviewService = new ReviewService();
export default reviewService;
