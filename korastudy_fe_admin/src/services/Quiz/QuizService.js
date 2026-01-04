// src/services/quiz/QuizService.js
import quizApi from "../../api/quizApi";
import { QUESTION_TYPES, QUESTION_TYPE_LABELS } from "./constants";
import quizValidationService from "./QuizValidationService";
import quizUtilityService from "./QuizUtilityService";
import cloudinaryService from "../../services/CloudinaryService";

class QuizService {
  static QUESTION_TYPES = QUESTION_TYPES;
  static QUESTION_TYPE_LABELS = QUESTION_TYPE_LABELS;

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

  async getQuizByIdForAdmin(quizId) {
    try {
      if (!quizId) {
        return { success: false, message: "Quiz ID không được để trống" };
      }

      console.log("[ADMIN] Fetching quiz for admin:", quizId);
      const response = await quizApi.getQuizByIdForAdmin(quizId);
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

      // Normalize score nếu cần
      let processedData = { ...questionData };
      if (questionData.score) {
        console.log(`📌 Question Score: ${questionData.score}`);
      }

      const payload = quizUtilityService.prepareQuestionPayload(processedData);
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

  async importQuestions(quizId, file) {
    try {
      if (!quizId) {
        return { success: false, message: "Quiz ID không được để trống" };
      }
      if (!file) {
        return { success: false, message: "Vui lòng chọn file Excel" };
      }

      console.log("[ADMIN] Importing questions for quiz:", quizId);
      const response = await quizApi.importQuestions(quizId, file);
      const data = this._extractDataFromResponse(response);

      console.log("[ADMIN] Questions imported successfully:", data);
      return {
        success: true,
        data: data,
        message: "Import câu hỏi thành công",
      };
    } catch (error) {
      return this.handleError(error, "Lỗi khi import câu hỏi từ Excel");
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

  async getQuestionsByQuizIdForAdmin(quizId) {
    try {
      if (!quizId) {
        return { success: false, message: "Quiz ID không được để trống" };
      }

      console.log("[ADMIN] Fetching questions for quiz:", quizId);
      const response = await quizApi.getQuestionsByQuizIdForAdmin(quizId);
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

  // ==================== RESULTS & ANALYTICS (ADMIN ONLY) ====================

  async getQuizResultDetailForAdmin(resultId) {
    try {
      if (!resultId) {
        return { success: false, message: "Result ID không được để trống" };
      }

      console.log("[ADMIN] Fetching quiz result detail:", resultId);
      const response = await quizApi.getQuizResultForAdmin(resultId);
      const data = this._extractDataFromResponse(response);

      return {
        success: true,
        data: data,
        message: "Lấy chi tiết kết quả thành công",
      };
    } catch (error) {
      return this.handleError(error, "Lỗi khi lấy chi tiết kết quả");
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

      return {
        success: true,
        data: data,
        message: "Lấy trạng thái quiz của người dùng thành công",
      };
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

      console.log("[ADMIN] Fetching all results for quiz:", quizId);
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

  // ==================== COURSE QUIZ PROGRESS (ADMIN ONLY) ====================

  async getUserQuizProgressInCourse(courseId, userId) {
    try {
      if (!courseId || !userId) {
        return {
          success: false,
          message: "Course ID và User ID không được để trống",
        };
      }

      console.log(
        `[ADMIN] Fetching quiz progress for user ${userId} in course ${courseId}`
      );

      const response = await quizApi.getUserQuizProgressInCourse(
        courseId,
        userId
      );
      const data = this._extractDataFromResponse(response);

      return {
        success: true,
        data: Array.isArray(data) ? data : [],
        message: "Lấy tiến độ quiz của user thành công",
      };
    } catch (error) {
      return this.handleError(error, "Lỗi khi lấy tiến độ quiz của user");
    }
  }

  async getUserQuizProgressSummary(courseId, userId) {
    try {
      if (!courseId || !userId) {
        return {
          success: false,
          message: "Course ID và User ID không được để trống",
        };
      }

      console.log(
        `[ADMIN] Fetching quiz progress summary for user ${userId} in course ${courseId}`
      );

      const response = await quizApi.getUserQuizProgressSummary(
        courseId,
        userId
      );
      const data = this._extractDataFromResponse(response);

      return {
        success: true,
        data: data,
        message: "Lấy thống kê tiến độ quiz thành công",
      };
    } catch (error) {
      return this.handleError(error, "Lỗi khi lấy thống kê tiến độ quiz");
    }
  }

  async getAllUsersQuizProgressInCourse(courseId) {
    try {
      if (!courseId) {
        return { success: false, message: "Course ID không được để trống" };
      }

      console.log(
        `[ADMIN] Fetching all users quiz progress for course ${courseId}`
      );

      const response = await quizApi.getAllUsersQuizProgressInCourse(courseId);
      const data = this._extractDataFromResponse(response);

      return {
        success: true,
        data: Array.isArray(data) ? data : [],
        message: "Lấy tiến độ của tất cả users thành công",
      };
    } catch (error) {
      return this.handleError(error, "Lỗi khi lấy tiến độ của tất cả users");
    }
  }

  async getUserDetailedAverageScoreInCourse(courseId, userId) {
    try {
      if (!courseId || !userId) {
        return {
          success: false,
          message: "Course ID và User ID không được để trống",
        };
      }

      console.log(
        `[ADMIN] Fetching detailed average score for user ${userId} in course ${courseId}`
      );

      const response = await quizApi.getUserDetailedAverageScoreInCourse(
        courseId,
        userId
      );
      const data = this._extractDataFromResponse(response);

      return {
        success: true,
        data: data,
        message: "Lấy điểm trung bình chi tiết của user thành công",
      };
    } catch (error) {
      return this.handleError(
        error,
        "Lỗi khi lấy điểm trung bình chi tiết của user"
      );
    }
  }

  async getUserSimpleAverageScoreInCourse(courseId, userId) {
    try {
      if (!courseId || !userId) {
        return {
          success: false,
          message: "Course ID và User ID không được để trống",
        };
      }

      console.log(
        `[ADMIN] Fetching simple average score for user ${userId} in course ${courseId}`
      );

      const response = await quizApi.getUserSimpleAverageScoreInCourse(
        courseId,
        userId
      );
      const data = this._extractDataFromResponse(response);

      return {
        success: true,
        data: data,
        message: "Lấy điểm trung bình của user thành công",
      };
    } catch (error) {
      return this.handleError(error, "Lỗi khi lấy điểm trung bình của user");
    }
  }

  // ==================== UTILITY METHODS (MIXED - Cả ADMIN và USER) ====================

  async getQuizzesBySectionId(sectionId) {
    try {
      if (!sectionId) {
        return { success: false, message: "Section ID không được để trống" };
      }

      console.log("[UTILITY] Fetching quizzes for section:", sectionId);
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

  async checkQuizExistsBySectionId(sectionId) {
    try {
      if (!sectionId) {
        return { success: false, message: "Section ID không được để trống" };
      }

      console.log("[UTILITY] Checking quiz exists for section:", sectionId);
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

      console.log("[UTILITY] Checking quiz exists:", quizId);
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

  // ==================== UPLOAD FILE (ADMIN ONLY) ====================

  async uploadQuestionImage(questionId, imageFile) {
    try {
      console.log(
        `[ADMIN] Uploading image for question ${questionId}:`,
        imageFile.name
      );

      const cloudinaryResult = await cloudinaryService.uploadImage(imageFile);

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
      console.log(
        `[ADMIN] Uploading image for option ${optionId}:`,
        imageFile.name
      );

      const cloudinaryResult = await cloudinaryService.uploadImage(imageFile);

      const updateData = {
        optionText: `[IMAGE]${cloudinaryResult.url}`,
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

  // ==================== UTILITY METHODS (Các hàm tiện ích) ====================

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

  /**
   * Normalize điểm cho tất cả câu hỏi của một quiz
   * Auto-scale điểm nếu tổng < target (mặc định 10)
   * @param {Array} questions - Danh sách câu hỏi
   * @param {Number} targetTotal - Tổng điểm mục tiêu (mặc định: 10)
   * @returns {Object} - { success, normalizedQuestions, totalScore }
   */
  normalizeQuizScores(questions, targetTotal = 10) {
    try {
      if (!questions || questions.length === 0) {
        return {
          success: false,
          message: "Quiz phải có ít nhất 1 câu hỏi",
          questions: [],
        };
      }

      const normalizedQuestions = quizUtilityService.normalizeQuestionScores(
        questions,
        targetTotal
      );
      const totalScore =
        quizUtilityService.calculateTotalPoints(normalizedQuestions);

      return {
        success: true,
        normalizedQuestions,
        totalScore,
        message: `Chuẩn hóa điểm thành công. Tổng: ${totalScore}`,
      };
    } catch (error) {
      console.error("❌ Normalize scores error:", error);
      return {
        success: false,
        message: "Lỗi khi chuẩn hóa điểm",
        questions: questions,
      };
    }
  }

  /**
   * Validate điểm số của quiz trước khi lưu
   * @param {Object} quiz - Dữ liệu quiz (có questions)
   * @returns {Object} - { isValid, validation, warnings }
   */
  validateQuizPointsConfig(quiz) {
    try {
      if (!quiz.questions || quiz.questions.length === 0) {
        return {
          isValid: false,
          validation: { message: "Quiz phải có ít nhất 1 câu hỏi" },
          warnings: [],
        };
      }

      const validation = quizUtilityService.validateQuizScoring(
        quiz.questions,
        quiz.passingScore || 60
      );

      const warnings = [];

      // Check nếu điểm quá thấp so với target
      if (validation.totalPoints < 10) {
        warnings.push(
          `⚠️ Tổng điểm chỉ ${validation.totalPoints}, khuyến nghị >= 10 để tính toán chính xác`
        );
      }

      // Check nếu passingScore quá cao
      if (quiz.passingScore > validation.totalPoints) {
        warnings.push(
          `⚠️ Điểm cần đạt (${quiz.passingScore}%) > tổng điểm (${validation.totalPoints}). Điều này sẽ khiến quiz không thể pass!`
        );
        return { isValid: false, validation, warnings };
      }

      return {
        isValid: true,
        validation,
        warnings,
      };
    } catch (error) {
      console.error("❌ Validate quiz points error:", error);
      return {
        isValid: false,
        validation: { message: "Lỗi khi validate điểm" },
        warnings: [error.message],
      };
    }
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
