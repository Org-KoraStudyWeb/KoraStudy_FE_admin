// src/services/SectionService.js
import sectionApi from "../api/sectionApi";

class SectionService {
  // ==================== CONSTANTS ====================
  static SECTION_TYPES = {
    THEORY: "THEORY",
    PRACTICE: "PRACTICE",
    QUIZ: "QUIZ",
    ASSIGNMENT: "ASSIGNMENT",
  };

  // ==================== SECTION MANAGEMENT ====================

  /**
   * Lấy danh sách sections của khóa học
   */
  async getSectionsByCourseId(courseId) {
    try {
      if (!courseId) {
        return { success: false, message: "Course ID không được để trống" };
      }

      console.log("📚 Fetching sections for course:", courseId);

      const response = await sectionApi.getSectionsByCourseId(courseId);

      return {
        success: true,
        data: response.data,
        message: "Lấy danh sách chương học thành công",
      };
    } catch (error) {
      console.error(
        `❌ Failed to fetch sections for course ${courseId}:`,
        error
      );
      return this.handleError(error, "Lỗi khi lấy danh sách chương học");
    }
  }

  /**
   * Lấy chi tiết section theo ID
   */
  async getSectionById(id) {
    try {
      if (!id) {
        return { success: false, message: "Section ID không được để trống" };
      }

      console.log("📖 Fetching section details for ID:", id);

      const response = await sectionApi.getSectionById(id);

      return {
        success: true,
        data: response.data,
        message: "Lấy thông tin chương học thành công",
      };
    } catch (error) {
      console.error(`❌ Failed to fetch section ${id}:`, error);
      return this.handleError(error, "Lỗi khi lấy thông tin chương học");
    }
  }

  /**
   * Tạo section mới
   */
  async createSection(sectionData) {
    try {
      console.log("🆕 Creating new section:", sectionData);

      // Validate dữ liệu
      const validationResult = this.validateSectionData(sectionData);
      if (!validationResult.isValid) {
        return {
          success: false,
          message: validationResult.errors.join(", "),
        };
      }

      const payload = this.prepareSectionPayload(sectionData);
      const response = await sectionApi.createSection(payload);

      console.log("✅ Section created successfully");

      return {
        success: true,
        data: response.data,
        message: "Tạo chương học thành công",
      };
    } catch (error) {
      console.error("❌ Failed to create section:", error);
      return this.handleError(error, "Lỗi khi tạo chương học");
    }
  }

  /**
   * Cập nhật section
   */
  async updateSection(id, sectionData) {
    try {
      if (!id) {
        return { success: false, message: "Section ID không được để trống" };
      }

      console.log("📝 Updating section:", id, sectionData);

      // Validate dữ liệu
      const validationResult = this.validateSectionData(sectionData, false);
      if (!validationResult.isValid) {
        return {
          success: false,
          message: validationResult.errors.join(", "),
        };
      }

      const payload = this.prepareSectionPayload(sectionData);
      const response = await sectionApi.updateSection(id, payload);

      console.log("✅ Section updated successfully");

      return {
        success: true,
        data: response.data,
        message: "Cập nhật chương học thành công",
      };
    } catch (error) {
      console.error(`❌ Failed to update section ${id}:`, error);
      return this.handleError(error, "Lỗi khi cập nhật chương học");
    }
  }

  /**
   * Xóa section
   */
  async deleteSection(id) {
    try {
      if (!id) {
        return { success: false, message: "Section ID không được để trống" };
      }

      console.log("🗑️ Deleting section:", id);

      await sectionApi.deleteSection(id);

      console.log("✅ Section deleted successfully");

      return {
        success: true,
        message: "Xóa chương học thành công",
      };
    } catch (error) {
      console.error(`❌ Failed to delete section ${id}:`, error);
      return this.handleError(error, "Lỗi khi xóa chương học");
    }
  }

  // ==================== VALIDATION METHODS ====================

  /**
   * Validate dữ liệu section
   */
  validateSectionData(sectionData, isCreate = true) {
    const errors = [];

    // Required fields validation
    if (!sectionData.sectionName?.trim()) {
      errors.push("Tiêu đề chương học không được để trống");
    } else if (sectionData.sectionName.length > 200) {
      errors.push("Tiêu đề chương học không được vượt quá 200 ký tự");
    }

    if (isCreate && !sectionData.courseId) {
      errors.push("ID khóa học không được để trống");
    }

    // Description validation (nếu có)
    if (
      sectionData.sectionDescription &&
      sectionData.sectionDescription.length > 1000
    ) {
      errors.push("Mô tả chương học không được vượt quá 1000 ký tự");
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
  prepareSectionPayload(sectionData) {
    return {
      sectionName: sectionData.sectionName?.trim(),
      sectionDescription: sectionData.sectionDescription?.trim() || "",
      courseId: sectionData.courseId,
      orderIndex: sectionData.orderIndex || 0,
      isPublished:
        sectionData.isPublished !== undefined ? sectionData.isPublished : true,
      ...sectionData,
    };
  }

  /**
   * Xử lý lỗi thống nhất
   */
  handleError(error, defaultMessage) {
    console.error("SectionService Error Details:", {
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
          message = "Dữ liệu section không hợp lệ: " + message;
          break;
        case 401:
          message = "Bạn cần đăng nhập để thực hiện thao tác này";
          break;
        case 403:
          message = "Bạn không có quyền thực hiện thao tác này";
          break;
        case 404:
          message = "Không tìm thấy chương học";
          break;
        case 409:
          message = "Chương học đã tồn tại hoặc có xung đột dữ liệu";
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
   * Tính tổng số bài học trong section
   */
  calculateTotalLessons(section) {
    if (!section || !section.lessons) return 0;
    return section.lessons.length;
  }

  /**
   * Tính tổng thời lượng section
   */
  calculateSectionDuration(section) {
    if (!section || !section.lessons) return 0;

    return section.lessons.reduce((total, lesson) => {
      return total + (lesson.duration || 0);
    }, 0);
  }

  /**
   * Format thời lượng section
   */
  formatSectionDuration(durationInMinutes) {
    if (!durationInMinutes) return "0 phút";

    const hours = Math.floor(durationInMinutes / 60);
    const minutes = durationInMinutes % 60;

    if (hours === 0) {
      return `${minutes} phút`;
    }

    return minutes > 0 ? `${hours} giờ ${minutes} phút` : `${hours} giờ`;
  }

  /**
   * Tính phần trăm hoàn thành section
   */
  calculateCompletionPercentage(section, completedLessons = []) {
    if (!section || !section.lessons || section.lessons.length === 0) return 0;

    const completedCount = completedLessons.filter((lessonId) =>
      section.lessons.some((lesson) => lesson.id === lessonId)
    ).length;

    return Math.round((completedCount / section.lessons.length) * 100);
  }

  /**
   * Kiểm tra section có bài học không
   */
  hasLessons(section) {
    return section && section.lessons && section.lessons.length > 0;
  }

  /**
   * Lấy số thứ tự section (dạng "Chương 1", "Chương 2", ...)
   */
  getSectionNumber(index) {
    return `Chương ${index + 1}`;
  }

  /**
   * Sắp xếp sections theo orderIndex
   */
  sortSectionsByOrder(sections) {
    if (!sections) return [];

    return [...sections].sort((a, b) => {
      const orderA = a.orderIndex || 0;
      const orderB = b.orderIndex || 0;
      return orderA - orderB;
    });
  }
}

const sectionService = new SectionService();
export default sectionService;
