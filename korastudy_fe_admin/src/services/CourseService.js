// src/services/CourseService.js
import courseApi from "../api/courseApi";

class CourseService {
  // ==================== CONSTANTS ====================
  static COURSE_STATUS = {
    DRAFT: "DRAFT",
    PUBLISHED: "PUBLISHED",
    ARCHIVED: "ARCHIVED",
  };

  static COURSE_LEVELS = {
    BEGINNER: "BEGINNER",
    INTERMEDIATE: "INTERMEDIATE",
    ADVANCED: "ADVANCED",
  };

  // ==================== ADMIN COURSE MANAGEMENT ====================

  /**
   * Lấy danh sách khóa học (Admin) với phân trang và tìm kiếm
   */
  async getAllCoursesAdmin(params = {}) {
    try {
      console.log("📦 Fetching admin courses with params:", params);

      const response = await courseApi.getAllCoursesAdmin(params);

      return {
        success: true,
        data: response.data,
        message: "Lấy danh sách khóa học thành công",
        pagination: this.extractPaginationInfo(response.data),
      };
    } catch (error) {
      console.error("❌ Failed to fetch admin courses:", error);
      return this.handleError(error, "Lỗi khi lấy danh sách khóa học");
    }
  }

  /**
   * Lấy chi tiết khóa học theo ID (Admin)
   */
  async getCourseById(id) {
    try {
      if (!id) {
        return { success: false, message: "ID khóa học không được để trống" };
      }

      console.log("📦 Fetching course details for ID:", id);

      const response = await courseApi.getCourseByIdAdmin(id);

      return {
        success: true,
        data: response.data,
        message: "Lấy thông tin khóa học thành công",
      };
    } catch (error) {
      console.error(`❌ Failed to fetch course ${id}:`, error);
      return this.handleError(error, "Lỗi khi lấy thông tin khóa học");
    }
  }

  /**
   * Tạo khóa học mới
   */
  async createCourse(courseData) {
    try {
      console.log("🆕 Creating new course:", courseData);

      // Validate dữ liệu
      const validationResult = this.validateCourseData(courseData);
      if (!validationResult.isValid) {
        return {
          success: false,
          message: validationResult.errors.join(", "),
        };
      }

      // Chuẩn bị dữ liệu gửi đi
      const payload = this.prepareCoursePayload(courseData);

      const response = await courseApi.createCourse(payload);

      console.log("✅ Course created successfully:", response.data);

      return {
        success: true,
        data: response.data,
        message: "Tạo khóa học thành công",
      };
    } catch (error) {
      console.error("❌ Failed to create course:", error);
      return this.handleError(error, "Lỗi khi tạo khóa học");
    }
  }

  /**
   * Cập nhật khóa học
   */
  async updateCourse(id, courseData) {
    try {
      if (!id) {
        return { success: false, message: "ID khóa học không được để trống" };
      }

      console.log("📝 Updating course:", id, courseData);

      // Validate dữ liệu
      const validationResult = this.validateCourseData(courseData, false);
      if (!validationResult.isValid) {
        return {
          success: false,
          message: validationResult.errors.join(", "),
        };
      }

      const payload = this.prepareCoursePayload(courseData);

      const response = await courseApi.updateCourse(id, payload);

      console.log("✅ Course updated successfully:", response.data);

      return {
        success: true,
        data: response.data,
        message: "Cập nhật khóa học thành công",
      };
    } catch (error) {
      console.error(`❌ Failed to update course ${id}:`, error);
      return this.handleError(error, "Lỗi khi cập nhật khóa học");
    }
  }

  /**
   * Xóa khóa học
   */
  async deleteCourse(id) {
    try {
      if (!id) {
        return { success: false, message: "ID khóa học không được để trống" };
      }

      console.log("🗑️ Deleting course:", id);

      await courseApi.deleteCourse(id);

      console.log("✅ Course deleted successfully");

      return {
        success: true,
        message: "Xóa khóa học thành công",
      };
    } catch (error) {
      console.error(`❌ Failed to delete course ${id}:`, error);
      return this.handleError(error, "Lỗi khi xóa khóa học");
    }
  }

  /**
   * Xuất bản/Hủy xuất bản khóa học
   */
  async togglePublishCourse(id, isPublished) {
    try {
      if (!id) {
        return { success: false, message: "ID khóa học không được để trống" };
      }

      console.log(
        `🔄 ${isPublished ? "Publishing" : "Unpublishing"} course:`,
        id
      );

      const response = await courseApi.togglePublishCourse(id, isPublished);

      console.log("✅ Course publish status updated successfully");

      return {
        success: true,
        data: response.data,
        message: `${
          isPublished ? "Xuất bản" : "Hủy xuất bản"
        } khóa học thành công`,
      };
    } catch (error) {
      console.error(
        `❌ Failed to toggle publish status for course ${id}:`,
        error
      );
      return this.handleError(error, "Lỗi khi thay đổi trạng thái xuất bản");
    }
  }

  // ==================== COURSE STATISTICS ====================

  /**
   * Lấy thống kê khóa học
   */
  async getCourseStats() {
    try {
      console.log("📊 Fetching course statistics");

      const response = await courseApi.getCourseStats();

      return {
        success: true,
        data: response.data,
        message: "Lấy thống kê thành công",
      };
    } catch (error) {
      console.error("❌ Failed to fetch course stats:", error);
      return this.handleError(error, "Lỗi khi lấy thống kê khóa học");
    }
  }

  // ==================== COURSE ENROLLMENTS (ADMIN) ====================

  /**
   * Lấy danh sách đăng ký của khóa học (Admin)
   */
  async getCourseEnrollments(courseId, params = {}) {
    try {
      if (!courseId) {
        return { success: false, message: "ID khóa học không được để trống" };
      }

      console.log(
        "👥 [ADMIN] Fetching course enrollments for:",
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
        message: "Lấy danh sách đăng ký thành công",
        pagination: this.extractPaginationInfo(response.data),
      };
    } catch (error) {
      console.error(
        `❌ [ADMIN] Failed to fetch enrollments for course ${courseId}:`,
        error
      );
      return this.handleError(error, "Lỗi khi lấy danh sách đăng ký");
    }
  }

  // ==================== COURSE REVIEWS (ADMIN) ====================

  /**
   * Lấy danh sách đánh giá của khóa học (Admin)
   */
  async getCourseReviews(courseId, params = {}) {
    try {
      if (!courseId) {
        return { success: false, message: "ID khóa học không được để trống" };
      }

      console.log("⭐ [ADMIN] Fetching course reviews for:", courseId, params);

      const response = await courseApi.getCourseReviewsAdmin(courseId, params);

      return {
        success: true,
        data: response.data,
        message: "Lấy danh sách đánh giá thành công",
        pagination: this.extractPaginationInfo(response.data),
      };
    } catch (error) {
      console.error(
        `❌ [ADMIN] Failed to fetch reviews for course ${courseId}:`,
        error
      );
      return this.handleError(error, "Lỗi khi lấy danh sách đánh giá");
    }
  }

  /**
   * Xóa đánh giá (Admin)
   */
  async deleteReviewAdmin(courseId, reviewId) {
    try {
      if (!courseId || !reviewId) {
        return {
          success: false,
          message: "Course ID và Review ID không được để trống",
        };
      }

      console.log(
        "🗑️ [ADMIN] Deleting review:",
        reviewId,
        "from course:",
        courseId
      );

      await courseApi.deleteReviewAdmin(courseId, reviewId);

      console.log("✅ [ADMIN] Review deleted successfully");

      return {
        success: true,
        message: "Xóa đánh giá thành công",
      };
    } catch (error) {
      console.error(`❌ [ADMIN] Failed to delete review ${reviewId}:`, error);
      return this.handleError(error, "Lỗi khi xóa đánh giá");
    }
  }

  // ==================== PUBLIC COURSE METHODS ====================

  /**
   * Lấy danh sách khóa học công khai
   */
  async getAllPublishedCourses(params = {}) {
    try {
      console.log("🌐 Fetching published courses");

      const response = await courseApi.getAllPublishedCourses(params);

      return {
        success: true,
        data: response.data,
        message: "Lấy danh sách khóa học thành công",
      };
    } catch (error) {
      console.error("❌ Failed to fetch published courses:", error);
      return this.handleError(error, "Lỗi khi lấy danh sách khóa học");
    }
  }

  /**
   * Tìm kiếm khóa học nâng cao
   */
  async searchCoursesAdvanced(searchParams = {}) {
    try {
      console.log("🔍 Advanced course search with params:", searchParams);

      const response = await courseApi.searchCoursesAdvanced(searchParams);

      return {
        success: true,
        data: response.data,
        message: "Tìm kiếm khóa học thành công",
        pagination: this.extractPaginationInfo(response.data),
      };
    } catch (error) {
      console.error("❌ Failed to search courses:", error);
      return this.handleError(error, "Lỗi khi tìm kiếm khóa học");
    }
  }

  // ==================== COURSE IMAGE MANAGEMENT ====================

  /**
   * Upload ảnh khóa học
   */
  async uploadCourseImage(file) {
    try {
      if (!file) {
        return { success: false, message: "File không được để trống" };
      }

      // Validate file type
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/jpg",
        "image/gif",
      ];
      if (!allowedTypes.includes(file.type)) {
        return {
          success: false,
          message: "Chỉ chấp nhận file ảnh (JPEG, PNG, JPG, GIF)",
        };
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        return {
          success: false,
          message: "Kích thước file không được vượt quá 5MB",
        };
      }

      console.log("🖼️ Uploading course image:", file.name);

      const response = await courseApi.uploadCourseImage(file);

      console.log("✅ Course image uploaded successfully");

      return {
        success: true,
        data: response.data,
        message: "Tải lên ảnh khóa học thành công",
      };
    } catch (error) {
      console.error("❌ Failed to upload course image:", error);
      return this.handleError(error, "Lỗi khi tải lên ảnh khóa học");
    }
  }

  // ==================== VALIDATION METHODS ====================

  /**
   * Validate dữ liệu khóa học
   */
  validateCourseData(courseData, isCreate = true) {
    const errors = [];

    // Required fields validation
    if (!courseData.courseName?.trim()) {
      errors.push("Tên khóa học không được để trống");
    } else if (courseData.courseName.length > 100) {
      errors.push("Tên khóa học không được vượt quá 100 ký tự");
    }

    if (!courseData.courseDescription?.trim()) {
      errors.push("Mô tả khóa học không được để trống");
    } else if (courseData.courseDescription.length > 1000) {
      errors.push("Mô tả khóa học không được vượt quá 1000 ký tự");
    }

    // Price validation
    if (courseData.price !== undefined && courseData.price !== null) {
      if (courseData.price < 0) {
        errors.push("Giá khóa học không được âm");
      }
    }

    // Level validation
    if (
      courseData.courseLevel &&
      !Object.values(CourseService.COURSE_LEVELS).includes(
        courseData.courseLevel
      )
    ) {
      errors.push("Cấp độ khóa học không hợp lệ");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Chuẩn bị payload cho API
   */
  prepareCoursePayload(courseData) {
    return {
      courseName: courseData.courseName?.trim(),
      courseDescription: courseData.courseDescription?.trim(),
      price: courseData.price || 0,
      courseLevel:
        courseData.courseLevel || CourseService.COURSE_LEVELS.BEGINNER,
      category: courseData.category,
      tags: courseData.tags || [],
      requirements: courseData.requirements || [],
      learningOutcomes: courseData.learningOutcomes || [],
      thumbnailUrl: courseData.thumbnailUrl,
      isFeatured: courseData.isFeatured || false,
      ...courseData,
    };
  }

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
    console.error("CourseService Error Details:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });

    let message = defaultMessage;
    let status = error.response?.status || 500;
    let errorCode = null;

    // Xử lý các loại lỗi cụ thể
    if (error.response) {
      const errorData = error.response.data;

      // Lấy message từ server nếu có
      message = errorData?.message || errorData?.error || defaultMessage;
      errorCode = errorData?.code;

      // Xử lý các HTTP status code cụ thể
      switch (status) {
        case 400:
          message = "Dữ liệu không hợp lệ: " + message;
          break;
        case 401:
          message = "Bạn cần đăng nhập để thực hiện thao tác này";
          break;
        case 403:
          message = "Bạn không có quyền thực hiện thao tác này";
          break;
        case 404:
          message = "Không tìm thấy khóa học";
          break;
        case 409:
          message = "Khóa học đã tồn tại hoặc có xung đột dữ liệu";
          break;
        case 500:
          message = "Lỗi server, vui lòng thử lại sau";
          break;
        default:
          break;
      }
    } else if (error.request) {
      message = "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.";
    }

    return {
      success: false,
      message,
      status,
      errorCode,
      data: null,
    };
  }

  /**
   * Format currency
   */
  formatCurrency(amount) {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount || 0);
  }

  /**
   * Format date
   */
  formatDate(dateString, includeTime = true) {
    if (!dateString) return "N/A";

    const options = {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    };

    if (includeTime) {
      options.hour = "2-digit";
      options.minute = "2-digit";
    }

    return new Intl.DateTimeFormat("vi-VN", options).format(
      new Date(dateString)
    );
  }

  /**
   * Tính phần trăm giảm giá
   */
  calculateDiscountPercentage(originalPrice, salePrice) {
    if (!originalPrice || !salePrice || originalPrice <= salePrice) {
      return 0;
    }

    return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
  }

  /**
   * Lấy label cho trạng thái khóa học
   */
  getCourseStatusLabel(status) {
    const statusLabels = {
      DRAFT: { label: "Bản nháp", color: "secondary", variant: "warning" },
      PUBLISHED: { label: "Đã xuất bản", color: "success", variant: "success" },
      ARCHIVED: { label: "Đã lưu trữ", color: "default", variant: "secondary" },
    };

    return (
      statusLabels[status] || {
        label: status,
        color: "default",
        variant: "secondary",
      }
    );
  }

  /**
   * Lấy label cho cấp độ khóa học
   */
  getCourseLevelLabel(level) {
    const levelLabels = {
      BEGINNER: { label: "Người mới bắt đầu", color: "success" },
      INTERMEDIATE: { label: "Trung cấp", color: "warning" },
      ADVANCED: { label: "Nâng cao", color: "error" },
    };

    return levelLabels[level] || { label: level, color: "default" };
  }

  /**
   * Tính rating trung bình
   */
  calculateAverageRating(reviews = []) {
    if (!reviews.length) return 0;

    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return Math.round((total / reviews.length) * 10) / 10; // Làm tròn 1 chữ số thập phân
  }

  /**
   * Format số học viên
   */
  formatStudentCount(count) {
    if (count >= 1000) {
      return (count / 1000).toFixed(1) + "k";
    }
    return count.toString();
  }

  /**
   * Kiểm tra khóa học có phải miễn phí không
   */
  isFreeCourse(price) {
    return !price || price === 0;
  }

  /**
   * Lấy thời lượng ước tính của khóa học
   */
  estimateCourseDuration(sections = []) {
    if (!sections.length) return "0 giờ";

    const totalMinutes = sections.reduce((total, section) => {
      return total + (section.estimatedDuration || 0);
    }, 0);

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours === 0) {
      return `${minutes} phút`;
    }

    return minutes > 0 ? `${hours} giờ ${minutes} phút` : `${hours} giờ`;
  }
}

const courseService = new CourseService();
export default courseService;
