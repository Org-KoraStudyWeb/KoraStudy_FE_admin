// src/services/EnrollmentService.js
import enrollmentApi from "../api/enrollmentApi";
import courseApi from "../api/courseApi";

class EnrollmentService {
  // ==================== ENROLLMENT MANAGEMENT ====================

  /**
   * Đăng ký khóa học
   */
  async enrollCourse(courseId) {
    try {
      console.log("🎯 Enrolling in course:", courseId);

      const response = await enrollmentApi.enrollCourse(courseId);

      return {
        success: true,
        data: response.data,
        message: "Đăng ký khóa học thành công",
      };
    } catch (error) {
      console.error("❌ Failed to enroll in course:", error);
      return this.handleError(error, "Lỗi khi đăng ký khóa học");
    }
  }

  /**
   * Lấy danh sách khóa học của tôi
   */
  async getMyEnrollments() {
    try {
      console.log("📚 Fetching my enrollments");

      const response = await enrollmentApi.getMyEnrollments();

      return {
        success: true,
        data: response.data,
        message: "Lấy danh sách khóa học của tôi thành công",
      };
    } catch (error) {
      console.error("❌ Failed to fetch my enrollments:", error);
      return this.handleError(error, "Lỗi khi lấy danh sách khóa học của tôi");
    }
  }

  /**
   * Lọc khóa học của tôi theo trạng thái
   */
  async getMyEnrollmentsByStatus(status) {
    try {
      console.log("🔍 Filtering my enrollments by status:", status);

      const response = await enrollmentApi.getMyEnrollmentsByStatus(status);

      return {
        success: true,
        data: response.data,
        message: "Lọc khóa học theo trạng thái thành công",
      };
    } catch (error) {
      console.error("❌ Failed to filter enrollments:", error);
      return this.handleError(error, "Lỗi khi lọc khóa học theo trạng thái");
    }
  }

  /**
   * Lấy chi tiết enrollment
   */
  async getEnrollmentById(id) {
    try {
      if (!id) {
        return { success: false, message: "ID enrollment không được để trống" };
      }

      console.log("📄 Fetching enrollment details for ID:", id);

      const response = await enrollmentApi.getEnrollmentById(id);

      return {
        success: true,
        data: response.data,
        message: "Lấy thông tin enrollment thành công",
      };
    } catch (error) {
      console.error(`❌ Failed to fetch enrollment ${id}:`, error);
      return this.handleError(error, "Lỗi khi lấy thông tin enrollment");
    }
  }

  /**
   * Cập nhật tiến độ học tập
   */
  async updateProgress(enrollmentId, progress) {
    try {
      if (!enrollmentId) {
        return { success: false, message: "Enrollment ID không được để trống" };
      }

      if (progress < 0 || progress > 100) {
        return { success: false, message: "Tiến độ phải từ 0-100%" };
      }

      console.log(
        "📈 Updating progress for enrollment:",
        enrollmentId,
        progress
      );

      const response = await enrollmentApi.updateProgress(
        enrollmentId,
        progress
      );

      return {
        success: true,
        data: response.data,
        message: "Cập nhật tiến độ thành công",
      };
    } catch (error) {
      console.error(
        `❌ Failed to update progress for enrollment ${enrollmentId}:`,
        error
      );
      return this.handleError(error, "Lỗi khi cập nhật tiến độ");
    }
  }

  /**
   * Hủy đăng ký khóa học
   */
  async cancelEnrollment(enrollmentId) {
    try {
      if (!enrollmentId) {
        return { success: false, message: "Enrollment ID không được để trống" };
      }

      console.log("🗑️ Canceling enrollment:", enrollmentId);

      await enrollmentApi.cancelEnrollment(enrollmentId);

      return {
        success: true,
        message: "Hủy đăng ký khóa học thành công",
      };
    } catch (error) {
      console.error(`❌ Failed to cancel enrollment ${enrollmentId}:`, error);
      return this.handleError(error, "Lỗi khi hủy đăng ký khóa học");
    }
  }

  // ==================== ENROLLMENT CHECK ====================

  /**
   * Kiểm tra đã đăng ký khóa học chưa (theo userId)
   */
  async checkEnrollment(userId, courseId) {
    try {
      if (!userId || !courseId) {
        return {
          success: false,
          message: "User ID và Course ID không được để trống",
        };
      }

      console.log(
        "🔎 Checking enrollment for user:",
        userId,
        "course:",
        courseId
      );

      const response = await enrollmentApi.checkEnrollment(userId, courseId);

      return {
        success: true,
        data: response.data,
        message: "Kiểm tra đăng ký thành công",
      };
    } catch (error) {
      console.error("❌ Failed to check enrollment:", error);
      return this.handleError(error, "Lỗi khi kiểm tra đăng ký");
    }
  }

  /**
   * Kiểm tra tôi đã đăng ký khóa học chưa
   */
  async checkMyEnrollment(courseId) {
    try {
      if (!courseId) {
        return { success: false, message: "Course ID không được để trống" };
      }

      console.log("🔎 Checking my enrollment for course:", courseId);

      const response = await enrollmentApi.checkMyEnrollment(courseId);

      return {
        success: true,
        data: response.data,
        message: "Kiểm tra đăng ký của tôi thành công",
      };
    } catch (error) {
      console.error("❌ Failed to check my enrollment:", error);
      return this.handleError(error, "Lỗi khi kiểm tra đăng ký của tôi");
    }
  }

  // ==================== ADMIN ENROLLMENT MANAGEMENT ====================

  /**
   * Lấy danh sách enrollment của user (Admin)
   */
  async getUserEnrollmentsAdmin(userId) {
    try {
      if (!userId) {
        return { success: false, message: "User ID không được để trống" };
      }

      console.log("👥 [ADMIN] Fetching enrollments for user:", userId);

      const response = await enrollmentApi.getUserEnrollmentsAdmin(userId);

      return {
        success: true,
        data: response.data,
        message: "Lấy danh sách enrollment của user thành công",
      };
    } catch (error) {
      console.error(
        `❌ [ADMIN] Failed to fetch enrollments for user ${userId}:`,
        error
      );
      return this.handleError(
        error,
        "Lỗi khi lấy danh sách enrollment của user"
      );
    }
  }

  /**
   * Lấy danh sách enrollment của khóa học (Admin) - CÓ USER INFO
   */
  async getCourseEnrollmentsAdmin(courseId, params = {}) {
    try {
      if (!courseId) {
        return { success: false, message: "Course ID không được để trống" };
      }

      console.log(
        "👥 [ADMIN] Fetching enrollments for course:",
        courseId,
        params
      );

      const response = await courseApi.getCourseEnrollmentsAdmin(
        courseId,
        params
      );

      return {
        success: true,
        data: response.data,
        message: "Lấy danh sách enrollment của khóa học thành công",
        pagination: this.extractPaginationInfo(response.data),
      };
    } catch (error) {
      console.error(
        `❌ [ADMIN] Failed to fetch enrollments for course ${courseId}:`,
        error
      );
      return this.handleError(
        error,
        "Lỗi khi lấy danh sách enrollment của khóa học"
      );
    }
  }

  /**
   * Lấy thống kê enrollment (Admin)
   */
  async getEnrollmentStats() {
    try {
      console.log("📊 [ADMIN] Fetching enrollment statistics");

      const response = await enrollmentApi.getEnrollmentStats();

      return {
        success: true,
        data: response.data,
        message: "Lấy thống kê enrollment thành công",
      };
    } catch (error) {
      console.error("❌ [ADMIN] Failed to fetch enrollment stats:", error);
      return this.handleError(error, "Lỗi khi lấy thống kê enrollment");
    }
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Trích xuất thông tin phân trang từ response
   */
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

  /**
   * Xử lý lỗi thống nhất
   */
  handleError(error, defaultMessage) {
    console.error("EnrollmentService Error Details:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });

    let message = defaultMessage;
    const status = error.response?.status;

    if (error.response?.data?.message) {
      message = error.response.data.message;
    }

    return {
      success: false,
      message,
      status,
      data: null,
    };
  }

  /**
   * Format date
   */
  formatDate(dateString, includeTime = true) {
    if (!dateString) return "Chưa có ngày";

    const options = {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    };

    if (includeTime) {
      options.hour = "2-digit";
      options.minute = "2-digit";
    }

    try {
      return new Intl.DateTimeFormat("vi-VN", options).format(
        new Date(dateString)
      );
    } catch {
      return "Chưa có ngày";
    }
  }

  /**
   * Lấy label cho trạng thái enrollment
   */
  getEnrollmentStatusLabel(status) {
    const statusLabels = {
      ACTIVE: { label: "Đang học", color: "blue" },
      COMPLETED: { label: "Hoàn thành", color: "green" },
      CANCELLED: { label: "Đã hủy", color: "red" },
      EXPIRED: { label: "Hết hạn", color: "orange" },
    };

    return statusLabels[status] || { label: status, color: "default" };
  }

  /**
   * Tính phần trăm hoàn thành từ progress
   */
  calculateCompletionPercentage(progress) {
    return Math.round(progress || 0);
  }

  /**
   * Kiểm tra enrollment có active không
   */
  isEnrollmentActive(status) {
    return status === "ACTIVE";
  }

  /**
   * Kiểm tra enrollment đã hoàn thành chưa
   */
  isEnrollmentCompleted(status, progress) {
    return status === "COMPLETED" || (progress || 0) >= 100;
  }
}

const enrollmentService = new EnrollmentService();
export default enrollmentService;
