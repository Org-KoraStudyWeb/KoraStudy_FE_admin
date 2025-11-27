// src/services/LessonService.js
import lessonApi from "../api/lessonApi";

class LessonService {
  // ==================== CONSTANTS ====================
  static CONTENT_TYPES = {
    VIDEO: "VIDEO",
    TEXT: "TEXT",
    QUIZ: "QUIZ",
    ASSIGNMENT: "ASSIGNMENT",
  };

  static LESSON_STATUS = {
    DRAFT: "DRAFT",
    PUBLISHED: "PUBLISHED",
    ARCHIVED: "ARCHIVED",
  };

  // ==================== LESSON MANAGEMENT ====================

  /**
   * Lấy danh sách lessons của section
   */
  async getLessonsBySectionId(sectionId) {
    try {
      if (!sectionId) {
        return { success: false, message: "Section ID không được để trống" };
      }

      console.log("📖 Fetching lessons for section:", sectionId);

      const response = await lessonApi.getLessonsBySectionId(sectionId);

      return {
        success: true,
        data: response.data,
        message: "Lấy danh sách bài học thành công",
      };
    } catch (error) {
      console.error(
        `❌ Failed to fetch lessons for section ${sectionId}:`,
        error
      );
      return this.handleError(error, "Lỗi khi lấy danh sách bài học");
    }
  }

  /**
   * Lấy danh sách lessons của course
   */
  async getLessonsByCourseId(courseId) {
    try {
      if (!courseId) {
        return { success: false, message: "Course ID không được để trống" };
      }

      console.log("📚 Fetching lessons for course:", courseId);

      const response = await lessonApi.getLessonsByCourseId(courseId);

      return {
        success: true,
        data: response.data,
        message: "Lấy danh sách bài học thành công",
      };
    } catch (error) {
      console.error(
        `❌ Failed to fetch lessons for course ${courseId}:`,
        error
      );
      return this.handleError(error, "Lỗi khi lấy danh sách bài học");
    }
  }

  /**
   * Lấy chi tiết lesson theo ID
   */
  async getLessonById(id) {
    try {
      if (!id) {
        return { success: false, message: "Lesson ID không được để trống" };
      }

      console.log("🔍 Fetching lesson details for ID:", id);

      const response = await lessonApi.getLessonById(id);

      return {
        success: true,
        data: response.data,
        message: "Lấy thông tin bài học thành công",
      };
    } catch (error) {
      console.error(`❌ Failed to fetch lesson ${id}:`, error);
      return this.handleError(error, "Lỗi khi lấy thông tin bài học");
    }
  }

  /**
   * Tạo lesson mới
   */
  async createLesson(lessonData) {
    try {
      console.log("🆕 Creating new lesson:", lessonData);

      // Validate dữ liệu
      const validationResult = this.validateLessonData(lessonData);
      if (!validationResult.isValid) {
        return {
          success: false,
          message: validationResult.errors.join(", "),
        };
      }

      const payload = this.prepareLessonPayload(lessonData);
      const response = await lessonApi.createLesson(payload);

      console.log("✅ Lesson created successfully");

      return {
        success: true,
        data: response.data,
        message: "Tạo bài học thành công",
      };
    } catch (error) {
      console.error("❌ Failed to create lesson:", error);
      return this.handleError(error, "Lỗi khi tạo bài học");
    }
  }

  /**
   * Cập nhật lesson
   */
  async updateLesson(id, lessonData) {
    try {
      if (!id) {
        return { success: false, message: "Lesson ID không được để trống" };
      }

      console.log("📝 Updating lesson:", id, lessonData);

      // Validate dữ liệu
      const validationResult = this.validateLessonData(lessonData, false);
      if (!validationResult.isValid) {
        return {
          success: false,
          message: validationResult.errors.join(", "),
        };
      }

      const payload = this.prepareLessonPayload(lessonData);
      const response = await lessonApi.updateLesson(id, payload);

      console.log("✅ Lesson updated successfully");

      return {
        success: true,
        data: response.data,
        message: "Cập nhật bài học thành công",
      };
    } catch (error) {
      console.error(`❌ Failed to update lesson ${id}:`, error);
      return this.handleError(error, "Lỗi khi cập nhật bài học");
    }
  }

  /**
   * Xóa lesson
   */
  async deleteLesson(id) {
    try {
      if (!id) {
        return { success: false, message: "Lesson ID không được để trống" };
      }

      console.log("🗑️ Deleting lesson:", id);

      await lessonApi.deleteLesson(id);

      console.log("✅ Lesson deleted successfully");

      return {
        success: true,
        message: "Xóa bài học thành công",
      };
    } catch (error) {
      console.error(`❌ Failed to delete lesson ${id}:`, error);
      return this.handleError(error, "Lỗi khi xóa bài học");
    }
  }

  // ==================== LESSON FILE UPLOAD ====================

  /**
   * Upload video cho lesson
   */
  async uploadVideo(file, title = "") {
    try {
      if (!file) {
        return { success: false, message: "File không được để trống" };
      }

      // Validate file type
      const allowedTypes = ["video/mp4", "video/mov", "video/avi", "video/mkv"];
      if (!allowedTypes.includes(file.type)) {
        return {
          success: false,
          message: "Chỉ chấp nhận file video (MP4, MOV, AVI, MKV)",
        };
      }

      // Validate file size (max 500MB)
      const maxSize = 500 * 1024 * 1024;
      if (file.size > maxSize) {
        return {
          success: false,
          message: "Kích thước file không được vượt quá 500MB",
        };
      }

      console.log("🎥 Uploading video:", file.name);

      const response = await lessonApi.uploadVideo(file, title);

      console.log("✅ Video uploaded successfully");

      return {
        success: true,
        data: response.data,
        message: "Tải lên video thành công",
      };
    } catch (error) {
      console.error("❌ Failed to upload video:", error);
      return this.handleError(error, "Lỗi khi tải lên video");
    }
  }

  /**
   * Upload document cho lesson
   */
  async uploadDocument(file, title = "") {
    try {
      if (!file) {
        return { success: false, message: "File không được để trống" };
      }

      // Validate file type
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain",
        "application/vnd.ms-powerpoint",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      ];

      if (!allowedTypes.includes(file.type)) {
        return {
          success: false,
          message:
            "Chỉ chấp nhận file tài liệu (PDF, DOC, DOCX, TXT, PPT, PPTX)",
        };
      }

      // Validate file size (max 50MB)
      const maxSize = 50 * 1024 * 1024;
      if (file.size > maxSize) {
        return {
          success: false,
          message: "Kích thước file không được vượt quá 50MB",
        };
      }

      console.log("📄 Uploading document:", file.name);

      const response = await lessonApi.uploadDocument(file, title);

      console.log("✅ Document uploaded successfully");

      return {
        success: true,
        data: response.data,
        message: "Tải lên tài liệu thành công",
      };
    } catch (error) {
      console.error("❌ Failed to upload document:", error);
      return this.handleError(error, "Lỗi khi tải lên tài liệu");
    }
  }

  /**
   * Xóa file
   */
  async deleteFile(fileUrl) {
    try {
      if (!fileUrl) {
        return { success: false, message: "File URL không được để trống" };
      }

      console.log("🗑️ Deleting file:", fileUrl);

      await lessonApi.deleteFile(fileUrl);

      console.log("✅ File deleted successfully");

      return {
        success: true,
        message: "Xóa file thành công",
      };
    } catch (error) {
      console.error("❌ Failed to delete file:", error);
      return this.handleError(error, "Lỗi khi xóa file");
    }
  }

  // ==================== LESSON PROGRESS ====================

  /**
   * Cập nhật tiến độ lesson
   */
  async updateLessonProgress(progressData) {
    try {
      const validationResult = this.validateProgressData(progressData);
      if (!validationResult.isValid) {
        return {
          success: false,
          message: validationResult.errors.join(", "),
        };
      }

      console.log("📈 Updating lesson progress:", progressData);

      const response = await lessonApi.updateLessonProgress(progressData);

      return {
        success: true,
        data: response.data,
        message: "Cập nhật tiến độ thành công",
      };
    } catch (error) {
      console.error("❌ Failed to update lesson progress:", error);
      return this.handleError(error, "Lỗi khi cập nhật tiến độ");
    }
  }

  /**
   * Lấy tiến độ lesson của user hiện tại
   */
  async getLessonProgress(lessonId) {
    try {
      if (!lessonId) {
        return { success: false, message: "Lesson ID không được để trống" };
      }

      console.log("📊 Fetching lesson progress for:", lessonId);

      const response = await lessonApi.getLessonProgress(lessonId);

      return {
        success: true,
        data: response.data,
        message: "Lấy tiến độ bài học thành công",
      };
    } catch (error) {
      console.error(
        `❌ Failed to fetch progress for lesson ${lessonId}:`,
        error
      );
      return this.handleError(error, "Lỗi khi lấy tiến độ bài học");
    }
  }

  /**
   * Lấy tiến độ lessons của user trong course
   */
  async getUserProgressByCourse(courseId) {
    try {
      if (!courseId) {
        return { success: false, message: "Course ID không được để trống" };
      }

      console.log("📈 Fetching user progress for course:", courseId);

      const response = await lessonApi.getUserProgressByCourse(courseId);

      return {
        success: true,
        data: response.data,
        message: "Lấy tiến độ khóa học thành công",
      };
    } catch (error) {
      console.error(
        `❌ Failed to fetch user progress for course ${courseId}:`,
        error
      );
      return this.handleError(error, "Lỗi khi lấy tiến độ khóa học");
    }
  }

  // ==================== VALIDATION METHODS ====================

  /**
   * Validate dữ liệu lesson
   */
  validateLessonData(lessonData, isCreate = true) {
    const errors = [];

    // Required fields validation
    if (!lessonData.lessonTitle?.trim()) {
      errors.push("Tiêu đề bài học không được để trống");
    } else if (lessonData.lessonTitle.length > 200) {
      errors.push("Tiêu đề bài học không được vượt quá 200 ký tự");
    }

    if (isCreate && !lessonData.sectionId) {
      errors.push("ID chương học không được để trống");
    }

    // Content type validation
    if (
      lessonData.contentType &&
      !Object.values(LessonService.CONTENT_TYPES).includes(
        lessonData.contentType
      )
    ) {
      errors.push("Loại nội dung không hợp lệ");
    }

    // Duration validation
    if (lessonData.duration !== undefined && lessonData.duration < 0) {
      errors.push("Thời lượng bài học không được âm");
    }

    // Description validation
    if (
      lessonData.lessonDescription &&
      lessonData.lessonDescription.length > 2000
    ) {
      errors.push("Mô tả bài học không được vượt quá 2000 ký tự");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate dữ liệu progress
   */
  validateProgressData(progressData) {
    const errors = [];

    if (!progressData.lessonId) {
      errors.push("Lesson ID không được để trống");
    }

    if (
      progressData.progress !== undefined &&
      (progressData.progress < 0 || progressData.progress > 100)
    ) {
      errors.push("Tiến độ phải từ 0 đến 100");
    }

    if (progressData.timeSpent !== undefined && progressData.timeSpent < 0) {
      errors.push("Thời gian học không được âm");
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
  prepareLessonPayload(lessonData) {
    return {
      lessonTitle: lessonData.lessonTitle?.trim(),
      lessonDescription: lessonData.lessonDescription?.trim() || "",
      sectionId: lessonData.sectionId,
      contentType: lessonData.contentType || LessonService.CONTENT_TYPES.TEXT,
      contentUrl: lessonData.contentUrl || "",
      duration: lessonData.duration || 0,
      orderIndex: lessonData.orderIndex || 0,
      isPublished:
        lessonData.isPublished !== undefined ? lessonData.isPublished : true,
      isFree: lessonData.isFree !== undefined ? lessonData.isFree : false,
      ...lessonData,
    };
  }

  /**
   * Xử lý lỗi thống nhất
   */
  handleError(error, defaultMessage) {
    console.error("LessonService Error Details:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });

    let message = defaultMessage;
    let status = error.response?.status || 500;

    if (error.response) {
      const errorData = error.response.data;
      message = errorData?.message || errorData?.error || defaultMessage;

      switch (status) {
        case 400:
          message = "Dữ liệu bài học không hợp lệ: " + message;
          break;
        case 401:
          message = "Bạn cần đăng nhập để thực hiện thao tác này";
          break;
        case 403:
          message = "Bạn không có quyền thực hiện thao tác này";
          break;
        case 404:
          message = "Không tìm thấy bài học";
          break;
        case 409:
          message = "Bài học đã tồn tại hoặc có xung đột dữ liệu";
          break;
        case 413:
          message = "File quá lớn, vui lòng chọn file nhỏ hơn";
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
      data: null,
    };
  }

  /**
   * Lấy label cho loại nội dung
   */
  getContentTypeLabel(contentType) {
    const typeLabels = {
      VIDEO: { label: "Video", color: "primary", icon: "🎥" },
      TEXT: { label: "Văn bản", color: "secondary", icon: "📄" },
      QUIZ: { label: "Bài quiz", color: "warning", icon: "📝" },
      ASSIGNMENT: { label: "Bài tập", color: "info", icon: "📚" },
    };

    return (
      typeLabels[contentType] || {
        label: contentType,
        color: "default",
        icon: "📖",
      }
    );
  }

  /**
   * Format thời lượng bài học
   */
  formatLessonDuration(durationInMinutes) {
    if (!durationInMinutes) return "0 phút";

    const hours = Math.floor(durationInMinutes / 60);
    const minutes = durationInMinutes % 60;

    if (hours === 0) {
      return `${minutes} phút`;
    }

    return minutes > 0 ? `${hours} giờ ${minutes} phút` : `${hours} giờ`;
  }

  /**
   * Kiểm tra bài học có phải miễn phí không
   */
  isFreeLesson(lesson) {
    return lesson && lesson.isFree === true;
  }

  /**
   * Kiểm tra bài học đã hoàn thành chưa
   */
  isLessonCompleted(progress) {
    return progress && progress.progress === 100;
  }

  /**
   * Tính phần trăm hoàn thành
   */
  calculateCompletionPercentage(progress) {
    if (!progress) return 0;
    return Math.min(100, Math.max(0, progress.progress || 0));
  }

  /**
   * Format thời gian học
   */
  formatTimeSpent(timeSpentInSeconds) {
    if (!timeSpentInSeconds) return "0 giây";

    const hours = Math.floor(timeSpentInSeconds / 3600);
    const minutes = Math.floor((timeSpentInSeconds % 3600) / 60);
    const seconds = timeSpentInSeconds % 60;

    if (hours > 0) {
      return `${hours} giờ ${minutes} phút`;
    } else if (minutes > 0) {
      return `${minutes} phút ${seconds} giây`;
    } else {
      return `${seconds} giây`;
    }
  }

  /**
   * Sắp xếp lessons theo orderIndex
   */
  sortLessonsByOrder(lessons) {
    if (!lessons) return [];

    return [...lessons].sort((a, b) => {
      const orderA = a.orderIndex || 0;
      const orderB = b.orderIndex || 0;
      return orderA - orderB;
    });
  }

  /**
   * Lấy số thứ tự lesson (dạng "Bài 1", "Bài 2", ...)
   */
  getLessonNumber(index) {
    return `Bài ${index + 1}`;
  }
}

const lessonService = new LessonService();
export default lessonService;
