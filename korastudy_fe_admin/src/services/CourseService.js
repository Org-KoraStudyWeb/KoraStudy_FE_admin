// src/services/CourseService.js
import courseApi from "../api/courseApi";
import CloudinaryService from "./CloudinaryService";

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

  async createCourse(courseData) {
    try {
      console.log("🆕 Creating new course:", courseData);

      const validationResult = this.validateCourseData(courseData);
      if (!validationResult.isValid) {
        return {
          success: false,
          message: validationResult.errors.join(", "),
        };
      }

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

  async updateCourse(id, courseData) {
    try {
      if (!id) {
        return { success: false, message: "ID khóa học không được để trống" };
      }

      console.log("📝 Updating course:", id, courseData);

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

  // ==================== COURSE REVIEWS (ADMIN) ====================

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

  async uploadCourseImage(file) {
    try {
      if (!file) {
        return { success: false, message: "File không được để trống" };
      }

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

      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        return {
          success: false,
          message: "Kích thước file không được vượt quá 5MB",
        };
      }

      console.log("🖼️ Uploading course image:", file.name);

      const response = await CloudinaryService.uploadImage(file);

      console.log("✅ Course image uploaded successfully");

      return {
        success: true,
        data: { url: response.url },
        message: "Tải lên ảnh khóa học thành công",
      };
    } catch (error) {
      console.error("❌ Failed to upload course image:", error);
      return this.handleError(error, "Lỗi khi tải lên ảnh khóa học");
    }
  }

  // ==================== VALIDATION & UTILS ====================

  validateCourseData(courseData, isCreate = true) {
    const errors = [];

    if (!courseData.courseName?.trim()) {
      errors.push("Tên khóa học không được để trống");
    }

    if (!courseData.courseDescription?.trim()) {
      errors.push("Mô tả khóa học không được để trống");
    }

    return { isValid: errors.length === 0, errors };
  }

  prepareCoursePayload(courseData) {
    return {
      courseName: courseData.courseName?.trim(),
      courseDescription: courseData.courseDescription?.trim(),
      price: courseData.price || 0,
      courseLevel:
        courseData.courseLevel || CourseService.COURSE_LEVELS.BEGINNER,
      category: courseData.category,
      thumbnailUrl: courseData.thumbnailUrl,
      ...courseData,
    };
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
    }

    return {
      success: false,
      message,
      status,
      data: null,
    };
  }

  // ==================== FORMATTING UTILS ====================

  formatCurrency(amount) {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount || 0);
  }

  getCourseStatusLabel(status) {
    const statusLabels = {
      DRAFT: { label: "Bản nháp", color: "warning" },
      PUBLISHED: { label: "Đã xuất bản", color: "success" },
      ARCHIVED: { label: "Đã lưu trữ", color: "secondary" },
    };
    return statusLabels[status] || { label: status, color: "default" };
  }

  getCourseLevelLabel(level) {
    const levelLabels = {
      BEGINNER: { label: "Người mới bắt đầu", color: "success" },
      INTERMEDIATE: { label: "Trung cấp", color: "warning" },
      ADVANCED: { label: "Nâng cao", color: "error" },
    };
    return levelLabels[level] || { label: level, color: "default" };
  }

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

  calculateAverageRating(reviews = []) {
    if (!reviews.length) return 0;
    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return Math.round((total / reviews.length) * 10) / 10;
  }

  formatStudentCount(count) {
    if (count >= 1000) return (count / 1000).toFixed(1) + "k";
    return count.toString();
  }

  isFreeCourse(price) {
    return !price || price === 0;
  }

  estimateCourseDuration(sections = []) {
    if (!sections.length) return "0 giờ";
    const totalMinutes = sections.reduce(
      (total, section) => total + (section.estimatedDuration || 0),
      0
    );
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return minutes > 0 ? `${hours} giờ ${minutes} phút` : `${hours} giờ`;
  }
}

const courseService = new CourseService();
export default courseService;
