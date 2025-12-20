// src/services/quiz/QuizService.js
import quizApi from "../../api/quizApi";
import { QUESTION_TYPES, QUESTION_TYPE_LABELS } from "./constants";
import quizValidationService from "./QuizValidationService";
import quizUtilityService from "./QuizUtilityService";
import cloudinaryService from "../../services/CloudinaryService";

class QuizService {
  // Export constants for external use
  static QUESTION_TYPES = QUESTION_TYPES;
  static QUESTION_TYPE_LABELS = QUESTION_TYPE_LABELS;

  /**
   * Xử lý response từ API
   */
  _extractDataFromResponse(response) {
    if (!response) return null;
    return response?.data !== undefined ? response.data : response;
  }

  // ==================== QUIZ MANAGEMENT (ADMIN ONLY) ====================

  async createQuiz(quizData) {
    try {
      console.log("[ADMIN] Creating new quiz:", quizData);

      const validationResult = quizValidationService.validateQuizData(
        quizData,
        true
      );
      if (!validationResult.isValid) {
        return {
          success: false,
          message: validationResult.errors.join(", "),
        };
      }

      const payload = quizUtilityService.prepareQuizPayload(quizData);
      const response = await quizApi.createQuiz(payload);
      const data = this._extractDataFromResponse(response);

      console.log("[ADMIN] Quiz created successfully:", data);
      return {
        success: true,
        data: data,
        message: "Tạo bài quiz thành công",
      };
    } catch (error) {
      return this.handleError(error, "Lỗi khi tạo bài quiz");
    }
  }

  async updateQuiz(quizId, quizData) {
    try {
      if (!quizId) {
        return { success: false, message: "Quiz ID không được để trống" };
      }

      console.log("[ADMIN] Updating quiz:", quizId, quizData);

      const validationResult = quizValidationService.validateQuizData(
        quizData,
        false
      );
      if (!validationResult.isValid) {
        return {
          success: false,
          message: validationResult.errors.join(", "),
        };
      }

      const payload = quizUtilityService.prepareQuizPayload(quizData);
      const response = await quizApi.updateQuiz(quizId, payload);
      const data = this._extractDataFromResponse(response);

      console.log("[ADMIN] Quiz updated successfully:", data);
      return {
        success: true,
        data: data,
        message: "Cập nhật bài quiz thành công",
      };
    } catch (error) {
      return this.handleError(error, "Lỗi khi cập nhật bài quiz");
    }
  }

  async deleteQuiz(quizId) {
    try {
      if (!quizId) {
        return { success: false, message: "Quiz ID không được để trống" };
      }

      console.log("[ADMIN] Deleting quiz:", quizId);
      await quizApi.deleteQuiz(quizId);

      console.log("[ADMIN] Quiz deleted successfully");
      return {
        success: true,
        message: "Xóa bài quiz thành công",
      };
    } catch (error) {
      return this.handleError(error, "Lỗi khi xóa bài quiz");
    }
  }

  async getQuizById(quizId) {
    try {
      if (!quizId) {
        return { success: false, message: "Quiz ID không được để trống" };
      }

      console.log("[ADMIN] Fetching quiz:", quizId);
      const response = await quizApi.getQuizById(quizId);
      const data = this._extractDataFromResponse(response);

      return {
        success: true,
        data: data,
        message: "Lấy thông tin quiz thành công",
      };
    } catch (error) {
      return this.handleError(error, "Lỗi khi lấy thông tin quiz");
    }
  }

  async getQuizzesBySectionId(sectionId) {
    try {
      if (!sectionId) {
        return { success: false, message: "Section ID không được để trống" };
      }

      console.log("[ADMIN] Fetching quizzes for section:", sectionId);
      const response = await quizApi.getQuizzesBySectionId(sectionId);
      const data = this._extractDataFromResponse(response);

      return {
        success: true,
        data: Array.isArray(data) ? data : [],
        message: "Lấy danh sách quiz thành công",
      };
    } catch (error) {
      return this.handleError(error, "Lỗi khi lấy danh sách quiz");
    }
  }

  async publishQuiz(quizId, publish) {
    try {
      if (!quizId) {
        return { success: false, message: "Quiz ID không được để trống" };
      }

      console.log("[ADMIN] Publishing quiz:", quizId, publish);
      await quizApi.publishQuiz(quizId, publish);

      return {
        success: true,
        message: publish ? "Đã công khai quiz" : "Đã ẩn quiz",
      };
    } catch (error) {
      return this.handleError(error, "Lỗi khi cập nhật trạng thái quiz");
    }
  }

  // ==================== QUESTION MANAGEMENT (ADMIN ONLY) ====================

  async addQuestionToQuiz(quizId, questionData) {
    try {
      if (!quizId) {
        return { success: false, message: "Quiz ID không được để trống" };
      }

      console.log("[ADMIN] Adding question to quiz:", quizId);
      const validationResult =
        quizValidationService.validateQuestionData(questionData);
      if (!validationResult.isValid) {
        return {
          success: false,
          message: validationResult.errors.join(", "),
        };
      }

      const payload = quizUtilityService.prepareQuestionPayload(questionData);
      const response = await quizApi.addQuestionToQuiz(quizId, payload);
      const data = this._extractDataFromResponse(response);

      console.log("[ADMIN] Question added successfully:", data);
      return {
        success: true,
        data: data,
        message: "Thêm câu hỏi thành công",
      };
    } catch (error) {
      return this.handleError(error, "Lỗi khi thêm câu hỏi");
    }
  }

  async updateQuestion(questionId, questionData) {
    try {
      if (!questionId) {
        return { success: false, message: "Question ID không được để trống" };
      }

      console.log("[ADMIN] Updating question:", questionId);
      const validationResult =
        quizValidationService.validateQuestionData(questionData);
      if (!validationResult.isValid) {
        return {
          success: false,
          message: validationResult.errors.join(", "),
        };
      }

      const payload = quizUtilityService.prepareQuestionPayload(questionData);
      const response = await quizApi.updateQuestion(questionId, payload);
      const data = this._extractDataFromResponse(response);

      console.log("[ADMIN] Question updated successfully:", data);
      return {
        success: true,
        data: data,
        message: "Cập nhật câu hỏi thành công",
      };
    } catch (error) {
      return this.handleError(error, "Lỗi khi cập nhật câu hỏi");
    }
  }

  async deleteQuestion(questionId) {
    try {
      if (!questionId) {
        return { success: false, message: "Question ID không được để trống" };
      }

      console.log("[ADMIN] Deleting question:", questionId);
      await quizApi.deleteQuestion(questionId);

      console.log("[ADMIN] Question deleted successfully");
      return {
        success: true,
        message: "Xóa câu hỏi thành công",
      };
    } catch (error) {
      return this.handleError(error, "Lỗi khi xóa câu hỏi");
    }
  }

  async getQuestionsByQuizId(quizId) {
    try {
      if (!quizId) {
        return { success: false, message: "Quiz ID không được để trống" };
      }

      console.log("[ADMIN] Fetching questions for quiz:", quizId);
      const response = await quizApi.getQuestionsByQuizId(quizId);
      const data = this._extractDataFromResponse(response);

      return {
        success: true,
        data: Array.isArray(data) ? data : [],
        message: "Lấy danh sách câu hỏi thành công",
      };
    } catch (error) {
      return this.handleError(error, "Lỗi khi lấy danh sách câu hỏi");
    }
  }

  // ==================== OPTION MANAGEMENT (ADMIN ONLY) ====================

  async addOptionToQuestion(questionId, optionData) {
    try {
      if (!questionId) {
        return { success: false, message: "Question ID không được để trống" };
      }

      console.log("[ADMIN] Adding option to question:", questionId, optionData);

      if (!optionData.optionText?.trim()) {
        return {
          success: false,
          message: "Nội dung option không được để trống",
        };
      }

      if (optionData.isCorrect === undefined || optionData.isCorrect === null) {
        return {
          success: false,
          message: "Trạng thái đúng/sai không được để trống",
        };
      }

      const response = await quizApi.addOptionToQuestion(
        questionId,
        optionData
      );
      const data = this._extractDataFromResponse(response);

      console.log("[ADMIN] Option added successfully:", data);
      return {
        success: true,
        data: data,
        message: "Thêm lựa chọn thành công",
      };
    } catch (error) {
      return this.handleError(error, "Lỗi khi thêm lựa chọn");
    }
  }

  async updateOption(optionId, optionData) {
    try {
      if (!optionId) {
        return { success: false, message: "Option ID không được để trống" };
      }

      console.log("[ADMIN] Updating option:", optionId, optionData);

      if (!optionData.optionText?.trim()) {
        return {
          success: false,
          message: "Nội dung option không được để trống",
        };
      }

      if (optionData.isCorrect === undefined || optionData.isCorrect === null) {
        return {
          success: false,
          message: "Trạng thái đúng/sai không được để trống",
        };
      }

      const response = await quizApi.updateOption(optionId, optionData);
      const data = this._extractDataFromResponse(response);

      console.log("[ADMIN] Option updated successfully:", data);
      return {
        success: true,
        data: data,
        message: "Cập nhật lựa chọn thành công",
      };
    } catch (error) {
      return this.handleError(error, "Lỗi khi cập nhật lựa chọn");
    }
  }

  async deleteOption(optionId) {
    try {
      if (!optionId) {
        return { success: false, message: "Option ID không được để trống" };
      }

      console.log("[ADMIN] Deleting option:", optionId);
      await quizApi.deleteOption(optionId);

      console.log("[ADMIN] Option deleted successfully");
      return {
        success: true,
        message: "Xóa lựa chọn thành công",
      };
    } catch (error) {
      return this.handleError(error, "Lỗi khi xóa lựa chọn");
    }
  }

  async getOptionsByQuestionId(questionId) {
    try {
      if (!questionId) {
        return { success: false, message: "Question ID không được để trống" };
      }

      console.log("[ADMIN] Fetching options for question:", questionId);
      const response = await quizApi.getOptionsByQuestionId(questionId);
      const data = this._extractDataFromResponse(response);

      return {
        success: true,
        data: Array.isArray(data) ? data : [],
        message: "Lấy danh sách lựa chọn thành công",
      };
    } catch (error) {
      return this.handleError(error, "Lỗi khi lấy danh sách lựa chọn");
    }
  }
  // ==================== UPLOAD FILE (ADMIN ONLY) ====================
  async uploadQuestionImage(questionId, imageFile) {
    try {
      console.log(
        `Uploading image for question ${questionId}:`,
        imageFile.name
      );

      // 1. Upload lên Cloudinary
      const cloudinaryResult = await cloudinaryService.uploadImage(imageFile);

      // 2. Cập nhật URL ảnh vào câu hỏi
      const updateData = {
        imageUrl: cloudinaryResult.url,
      };

      const response = await this.updateQuestion(questionId, updateData);
      return response;
    } catch (error) {
      console.error("Upload question image error:", error);
      return {
        success: false,
        message: `Lỗi upload ảnh: ${error.message}`,
      };
    }
  }

  async uploadOptionImage(optionId, imageFile) {
    try {
      console.log(`Uploading image for option ${optionId}:`, imageFile.name);

      // 1. Upload lên Cloudinary
      const cloudinaryResult = await cloudinaryService.uploadImage(imageFile);

      // 2. Cập nhật URL ảnh vào option
      const updateData = {
        optionText: `[IMAGE]${cloudinaryResult.url}`, // Hoặc có trường riêng cho image
        imageUrl: cloudinaryResult.url,
      };

      const response = await this.updateOption(optionId, updateData);
      return response;
    } catch (error) {
      console.error("Upload option image error:", error);
      return {
        success: false,
        message: `Lỗi upload ảnh: ${error.message}`,
      };
    }
  }

  // ==================== RESULTS & ANALYTICS (ADMIN ONLY) ====================

  async getQuizResult(resultId) {
    try {
      if (!resultId) {
        return { success: false, message: "Result ID không được để trống" };
      }

      console.log("[ADMIN] Fetching quiz result:", resultId);
      const response = await quizApi.getQuizResult(resultId);
      const data = this._extractDataFromResponse(response);

      return {
        success: true,
        data: data,
        message: "Lấy kết quả bài làm thành công",
      };
    } catch (error) {
      return this.handleError(error, "Lỗi khi lấy kết quả bài làm");
    }
  }

  async getQuizzesWithStatusBySection(sectionId, userId) {
    try {
      // 1. Lấy danh sách quiz trong section
      const quizzesResponse = await this.getQuizzesBySectionId(sectionId);

      if (!quizzesResponse.success) {
        return {
          success: false,
          message: quizzesResponse.message,
          data: [],
        };
      }

      const quizzes = quizzesResponse.data || [];
      const quizzesWithStatus = [];

      // 2. Lấy trạng thái của từng quiz cho user
      for (const quiz of quizzes) {
        const statusResponse = await this.getQuizStatusForUser(quiz.id, userId);

        quizzesWithStatus.push({
          ...quiz,
          userStatus: statusResponse.success ? statusResponse.data : null,
        });
      }

      return {
        success: true,
        data: quizzesWithStatus,
        message: "Lấy thông tin quiz thành công",
      };
    } catch (error) {
      return this.handleError(error, "Lỗi khi lấy thông tin quiz");
    }
  }

  async getQuizResultForTeacher(resultId) {
    try {
      if (!resultId) {
        return { success: false, message: "Result ID không được để trống" };
      }

      console.log("[ADMIN] Fetching result for teacher:", resultId);
      const response = await quizApi.getQuizResultForTeacher(resultId);
      const data = this._extractDataFromResponse(response);

      return {
        success: true,
        data: data,
        message: "Lấy kết quả thành công",
      };
    } catch (error) {
      return this.handleError(error, "Lỗi khi lấy kết quả");
    }
  }

  async getQuizStatusForUser(quizId, userId) {
    try {
      if (!quizId || !userId) {
        return {
          success: false,
          message: "Quiz ID và User ID không được để trống",
        };
      }
      console.log(
        `[ADMIN] Fetching quiz status for quiz ${quizId}, user ${userId}`
      );
      const response = await quizApi.getQuizStatusForUser(quizId, userId);
      const data = this._extractDataFromResponse(response);

      // ⭐ THÊM DEBUG Ở ĐÂY
      console.log(
        `[ADMIN] Quiz status API response for quiz ${quizId}, user ${userId}:`,
        {
          responseData: data,
          hasIsPassed: data?.isPassed !== undefined,
          isPassedValue: data?.isPassed,
          fullDataKeys: data ? Object.keys(data) : "no data",
        }
      );

      return { success: true, data };
    } catch (error) {
      return this.handleError(
        error,
        "Lỗi khi lấy trạng thái quiz của người dùng"
      );
    }
  }

  async getQuizResults(quizId) {
    try {
      if (!quizId) {
        return { success: false, message: "Quiz ID không được để trống" };
      }

      console.log("[ADMIN] Fetching quiz results:", quizId);
      const response = await quizApi.getQuizResults(quizId);
      const data = this._extractDataFromResponse(response);

      return {
        success: true,
        data: Array.isArray(data) ? data : [],
        message: "Lấy kết quả quiz thành công",
      };
    } catch (error) {
      return this.handleError(error, "Lỗi khi lấy kết quả quiz");
    }
  }

  // XÓA PHƯƠNG THỨC NÀY VÌ KHÔNG CÓ TRONG API
  // async getAllQuizResults(quizId) { ... }

  async getQuizStatistics(quizId) {
    try {
      if (!quizId) {
        return { success: false, message: "Quiz ID không được để trống" };
      }

      console.log("[ADMIN] Fetching quiz statistics:", quizId);
      const response = await quizApi.getQuizStatistics(quizId);
      const data = this._extractDataFromResponse(response);

      return {
        success: true,
        data: data,
        message: "Lấy thống kê quiz thành công",
      };
    } catch (error) {
      return this.handleError(error, "Lỗi khi lấy thống kê quiz");
    }
  }

  // ==================== VALIDATION (ADMIN ONLY) ====================

  async checkQuizExistsBySectionId(sectionId) {
    try {
      if (!sectionId) {
        return { success: false, message: "Section ID không được để trống" };
      }

      console.log("[ADMIN] Checking quiz exists for section:", sectionId);
      const response = await quizApi.checkQuizExistsBySectionId(sectionId);
      const data = this._extractDataFromResponse(response);

      return {
        success: true,
        data: data,
        message: "Kiểm tra quiz thành công",
      };
    } catch (error) {
      return this.handleError(error, "Lỗi khi kiểm tra quiz");
    }
  }

  async checkQuizExists(quizId) {
    try {
      if (!quizId) {
        return { success: false, message: "Quiz ID không được để trống" };
      }

      console.log("[ADMIN] Checking quiz exists:", quizId);
      const response = await quizApi.checkQuizExists(quizId);
      const data = this._extractDataFromResponse(response);

      return {
        success: true,
        data: data,
        message: "Kiểm tra quiz thành công",
      };
    } catch (error) {
      return this.handleError(error, "Lỗi khi kiểm tra quiz");
    }
  }

  // XÓA PHƯƠNG THỨC NÀY VÌ KHÔNG CÓ TRONG API
  // async searchQuizzes(params) { ... }

  async canUserAccessQuiz(quizId) {
    try {
      if (!quizId) {
        return { success: false, message: "Quiz ID không được để trống" };
      }

      console.log("[ADMIN] Checking user access to quiz:", quizId);
      const response = await quizApi.canUserAccessQuiz(quizId);
      const data = this._extractDataFromResponse(response);

      return {
        success: true,
        data: data,
        message: "Kiểm tra quyền truy cập thành công",
      };
    } catch (error) {
      return this.handleError(error, "Lỗi khi kiểm tra quyền truy cập");
    }
  }

  // ==================== UTILITY METHODS ====================

  getQuestionTypeLabel(questionType) {
    return quizUtilityService.getQuestionTypeLabel(questionType);
  }

  getAllQuestionTypes() {
    return quizUtilityService.getAllQuestionTypes();
  }

  calculateScorePercentage(earnedPoints, totalPoints) {
    return quizUtilityService.calculateScorePercentage(
      earnedPoints,
      totalPoints
    );
  }

  isQuizPassed(score, passingScore) {
    return quizUtilityService.isQuizPassed(score, passingScore);
  }

  formatTimeSpent(timeSpentInSeconds) {
    return quizUtilityService.formatTimeSpent(timeSpentInSeconds);
  }

  calculateTimeRemaining(timeLimitInMinutes, timeSpentInSeconds) {
    return quizUtilityService.calculateTimeRemaining(
      timeLimitInMinutes,
      timeSpentInSeconds
    );
  }

  createSampleOptions(questionType) {
    return quizUtilityService.createSampleOptions(questionType);
  }

  sortQuestionsByOrder(questions) {
    return quizUtilityService.sortQuestionsByOrder(questions);
  }

  calculateTotalPoints(questions) {
    return quizUtilityService.calculateTotalPoints(questions);
  }

  countQuestionsByType(questions) {
    return quizUtilityService.countQuestionsByType(questions);
  }

  createSampleQuiz(sectionId) {
    return quizUtilityService.createSampleQuiz(sectionId);
  }

  // ==================== ERROR HANDLING ====================

  handleError(error, defaultMessage) {
    console.error("QuizService Error:", {
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
          message = "Dữ liệu không hợp lệ: " + message;
          break;
        case 401:
          message = "Bạn cần đăng nhập để thực hiện thao tác này";
          break;
        case 403:
          message = "Bạn không có quyền thực hiện thao tác này";
          break;
        case 404:
          message = "Không tìm thấy dữ liệu";
          break;
        case 409:
          message = "Đã tồn tại hoặc có xung đột dữ liệu";
          break;
        case 422:
          message = "Dữ liệu validation không hợp lệ: " + message;
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
}

const quizService = new QuizService();
export default quizService;
