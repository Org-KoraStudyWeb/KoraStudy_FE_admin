// src/services/quiz/QuizProgressService.js
import quizApi from "../../api/quizApi";

class QuizProgressService {
  _extractDataFromResponse(response) {
    if (!response) return null;
    return response?.data !== undefined ? response.data : response;
  }

  handleError(error, defaultMessage) {
    console.error("QuizProgressService Error:", {
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

  // ==================== TIẾN ĐỘ QUIZ THEO COURSE (ADMIN ONLY) ====================

  async getUserQuizProgressInCourseForAdmin(courseId, userId) {
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

  async getUserQuizProgressSummaryForAdmin(courseId, userId) {
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

  // ==================== KẾT QUẢ & THỐNG KÊ CHI TIẾT (ADMIN ONLY) ====================

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
      return this.handleError(error, "Lỗi khi lấy trạng thái quiz");
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

  // ==================== PHÂN TÍCH TIẾN ĐỘ (ADMIN ONLY) ====================

  analyzeUserQuizProgress(quizProgressData) {
    if (!Array.isArray(quizProgressData)) {
      return null;
    }

    console.log(
      "[QuizProgressService] analyzeUserQuizProgress received data:",
      quizProgressData
    );
    const analysis = {
      totalQuizzes: quizProgressData.length,
      completedQuizzes: quizProgressData.filter((q) => q.isCompleted).length,
      passedQuizzes: quizProgressData.filter((q) => q.isPassed).length,
      failedQuizzes: quizProgressData.filter(
        (q) => q.isCompleted && !q.isPassed
      ).length,
      notAttemptedQuizzes: quizProgressData.filter((q) => !q.isCompleted)
        .length,
      averageScore: 0,
      bestScore: 0,
      worstScore: 100,
      totalTimeSpent: 0,
      lastActivity: null,
      quizzesByStatus: {
        passed: [],
        failed: [],
        notAttempted: [],
        inProgress: [],
      },
    };

    const totalQuizzesForAvg = analysis.totalQuizzes;
    let totalScoreForAvg = 0;

    quizProgressData.forEach((quiz) => {
      console.log(
        `[QuizProgressService] Processing quiz ${
          quiz.quizId || quiz.quizTitle
        }: score = ${quiz.score}, isCompleted = ${quiz.isCompleted}`
      );
      // Tính điểm trung bình trên TẤT CẢ các quiz, coi quiz chưa làm là 0 điểm
      totalScoreForAvg += quiz.score || 0;

      if (quiz.score !== undefined && quiz.score !== null) {
        analysis.bestScore = Math.max(analysis.bestScore, quiz.score);
        analysis.worstScore = Math.min(analysis.worstScore, quiz.score);
      }

      // Tính tổng thời gian
      if (quiz.timeSpent) {
        analysis.totalTimeSpent += quiz.timeSpent;
      }

      // Tìm last activity
      if (quiz.lastAttemptDate) {
        const quizDate = new Date(quiz.lastAttemptDate);
        if (
          !analysis.lastActivity ||
          quizDate > new Date(analysis.lastActivity)
        ) {
          analysis.lastActivity = quiz.lastAttemptDate;
        }
      }

      // Phân loại theo trạng thái
      if (quiz.isCompleted) {
        if (quiz.isPassed) {
          analysis.quizzesByStatus.passed.push(quiz);
        } else {
          analysis.quizzesByStatus.failed.push(quiz);
        }
      } else if (quiz.attemptCount > 0) {
        analysis.quizzesByStatus.inProgress.push(quiz);
      } else {
        analysis.quizzesByStatus.notAttempted.push(quiz);
      }
    });

    analysis.averageScore =
      totalQuizzesForAvg > 0
        ? parseFloat((totalScoreForAvg / totalQuizzesForAvg).toFixed(2))
        : 0;
    analysis.worstScore = analysis.worstScore === 100 ? 0 : analysis.worstScore;

    // Tính phần trăm
    analysis.completionRate =
      analysis.totalQuizzes > 0
        ? parseFloat(
            ((analysis.completedQuizzes / analysis.totalQuizzes) * 100).toFixed(
              2
            )
          )
        : 0;
    analysis.passRate =
      analysis.completedQuizzes > 0
        ? parseFloat(
            (
              (analysis.passedQuizzes / analysis.completedQuizzes) *
              100
            ).toFixed(2)
          )
        : 0;

    return analysis;
  }

  async getComprehensiveQuizProgressForAdmin(courseId, userId) {
    try {
      if (!courseId || !userId) {
        return {
          success: false,
          message: "Course ID và User ID không được để trống",
        };
      }

      console.log(
        `[ADMIN] Getting comprehensive quiz progress for course ${courseId}, user ${userId}`
      );

      // Lấy tiến độ chi tiết
      const progressResponse = await this.getUserQuizProgressInCourseForAdmin(
        courseId,
        userId
      );

      if (!progressResponse.success) {
        return progressResponse;
      }

      // Lấy tổng hợp tiến độ
      const summaryResponse = await this.getUserQuizProgressSummaryForAdmin(
        courseId,
        userId
      );

      // Phân tích tiến độ
      const progressAnalysis = this.analyzeUserQuizProgress(
        progressResponse.data
      );

      return {
        success: true,
        data: {
          detailedProgress: progressResponse.data,
          summary: summaryResponse.success ? summaryResponse.data : null,
          analysis: progressAnalysis,
          metadata: {
            courseId,
            userId,
            fetchedAt: new Date().toISOString(),
            totalQuizzes: progressAnalysis?.totalQuizzes || 0,
          },
        },
        message: "Lấy thông tin tiến độ quiz đầy đủ thành công",
      };
    } catch (error) {
      return this.handleError(error, "Lỗi khi lấy thông tin tiến độ quiz");
    }
  }

  // ==================== TỔNG HỢP THỐNG KÊ THEO COURSE (ADMIN ONLY) ====================

  async getCourseQuizStatistics(courseId) {
    try {
      if (!courseId) {
        return { success: false, message: "Course ID không được để trống" };
      }

      console.log(`[ADMIN] Getting course quiz statistics:`, courseId);

      // Lấy tiến độ của tất cả users
      const allUsersProgressResponse =
        await this.getAllUsersQuizProgressInCourse(courseId);

      if (!allUsersProgressResponse.success) {
        return allUsersProgressResponse;
      }

      const allUsersProgress = allUsersProgressResponse.data;

      // Tổng hợp thống kê
      const courseStats = {
        totalUsers: allUsersProgress.length,
        averageCompletionRate: 0,
        averagePassRate: 0,
        totalQuizAttempts: 0,
        usersByPerformance: {
          excellent: 0, // > 90%
          good: 0, // 70-90%
          average: 0, // 50-70%
          poor: 0, // < 50%
          notAttempted: 0,
        },
        userProgressDetails: allUsersProgress,
      };

      let totalCompletionRate = 0;
      let totalPassRate = 0;

      allUsersProgress.forEach((userProgress) => {
        // Phân tích tiến độ của từng user
        const userAnalysis = this.analyzeUserQuizProgress(
          userProgress.quizDetails || []
        );

        if (userAnalysis) {
          totalCompletionRate += userAnalysis.completionRate;
          totalPassRate += userAnalysis.passRate;
          courseStats.totalQuizAttempts += userAnalysis.completedQuizzes;

          // Phân loại theo hiệu suất
          if (userAnalysis.completionRate === 0) {
            courseStats.usersByPerformance.notAttempted++;
          } else if (userAnalysis.passRate >= 90) {
            courseStats.usersByPerformance.excellent++;
          } else if (userAnalysis.passRate >= 70) {
            courseStats.usersByPerformance.good++;
          } else if (userAnalysis.passRate >= 50) {
            courseStats.usersByPerformance.average++;
          } else {
            courseStats.usersByPerformance.poor++;
          }
        }
      });

      // Tính trung bình
      if (allUsersProgress.length > 0) {
        courseStats.averageCompletionRate = parseFloat(
          (totalCompletionRate / allUsersProgress.length).toFixed(2)
        );
        courseStats.averagePassRate = parseFloat(
          (totalPassRate / allUsersProgress.length).toFixed(2)
        );
      }

      return {
        success: true,
        data: courseStats,
        message: "Lấy thống kê khóa học thành công",
      };
    } catch (error) {
      return this.handleError(error, "Lỗi khi lấy thống kê khóa học");
    }
  }
}

const quizProgressService = new QuizProgressService();
export default quizProgressService;
