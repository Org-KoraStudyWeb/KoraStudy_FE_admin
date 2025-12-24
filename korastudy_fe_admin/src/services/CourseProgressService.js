// src/services/CourseProgressService.js
import SectionService from "./SectionService";
import LessonService from "./LessonService";
import QuizProgressService from "./Quiz/QuizProgressService";

class CourseProgressService {
  // ==================== TIẾN ĐỘ TỔNG QUAN KHÓA HỌC ====================

  /**
   * Lấy tổng tiến độ khóa học (bao gồm cả lesson và quiz) - ADMIN VIEW
   * @param {number} courseId - ID khóa học
   * @param {number} userId - ID người dùng
   * @returns {Object} - Thông tin tiến độ đầy đủ
   */
  async getOverallCourseProgressForAdmin(courseId, userId) {
    try {
      console.log(
        `[ADMIN] Getting overall progress for course ${courseId}, user ${userId}`
      );

      // 1. Lấy cấu trúc khóa học (sections, lessons, quizzes)
      const courseStructure = await this.getCourseStructure(courseId);

      if (!courseStructure.success || courseStructure.data.length === 0) {
        return {
          success: true,
          data: this.getEmptyProgressData(),
          message: "Khóa học chưa có nội dung",
        };
      }

      // 2. Lấy tiến độ lesson và quiz
      const [lessonProgress, quizProgress] = await Promise.all([
        this.getLessonProgressForAdmin(courseId, userId),
        this.getQuizProgressForAdmin(courseId, userId),
      ]);

      // 3. Tính toán tổng tiến độ
      const overallProgress = this.calculateOverallProgress(
        lessonProgress,
        quizProgress,
        courseStructure.data
      );

      // 4. Thêm thông tin metadata
      overallProgress.metadata = {
        courseId,
        userId,
        fetchedAt: new Date().toISOString(),
        totalSections: courseStructure.data.length,
        totalLessons: lessonProgress.totalLessons || 0,
        totalQuizzes: quizProgress.totalQuizzes || 0,
        structureSummary: this.generateStructureSummary(courseStructure.data),
      };

      return {
        success: true,
        data: overallProgress,
        message: "Lấy tiến độ khóa học thành công",
      };
    } catch (error) {
      console.error("[CourseProgress] Error getting overall progress:", error);
      return {
        success: false,
        message: "Lỗi khi lấy tiến độ khóa học",
        error: error.message,
      };
    }
  }

  /**
   * Lấy tiến độ lesson cho user trong khóa học - ADMIN VIEW
   */
  async getLessonProgressForAdmin(courseId, userId) {
    try {
      console.log(
        `[ADMIN] Getting lesson progress for course ${courseId}, user ${userId}`
      );

      const response = await LessonService.getUserProgressByCourseForAdmin(
        courseId,
        userId
      );

      if (response.success && response.data) {
        return this.analyzeLessonProgress(response.data);
      }

      console.warn(
        `[ADMIN] No lesson progress data for user ${userId} in course ${courseId}`
      );
      return this.getEmptyLessonProgress();
    } catch (error) {
      console.error("[CourseProgress] Error getting lesson progress:", error);
      return this.getEmptyLessonProgress();
    }
  }

  /**
   * Lấy tiến độ quiz cho user trong khóa học - ADMIN VIEW
   */
  async getQuizProgressForAdmin(courseId, userId) {
    try {
      console.log(
        `[ADMIN] Getting quiz progress for course ${courseId}, user ${userId}`
      );

      const response =
        await QuizProgressService.getComprehensiveQuizProgressForAdmin(
          courseId,
          userId
        );

      if (response.success && response.data) {
        const progressData = response.data;
        return {
          totalQuizzes: progressData.analysis?.totalQuizzes || 0,
          completedQuizzes: progressData.analysis?.completedQuizzes || 0,
          passedQuizzes: progressData.analysis?.passedQuizzes || 0,
          failedQuizzes: progressData.analysis?.failedQuizzes || 0,
          notAttemptedQuizzes: progressData.analysis?.notAttemptedQuizzes || 0,
          quizDetails: progressData.detailedProgress || [],
          analysis: progressData.analysis,
          summary: progressData.summary,
          averageScore: progressData.analysis?.averageScore || 0,
          completionRate: progressData.analysis?.completionRate || 0,
          passRate: progressData.analysis?.passRate || 0,
        };
      }

      console.warn(
        `[ADMIN] No quiz progress data for user ${userId} in course ${courseId}`
      );
      return this.getEmptyQuizProgress();
    } catch (error) {
      console.error("[CourseProgress] Error getting quiz progress:", error);
      return this.getEmptyQuizProgress();
    }
  }

  // ==================== THỐNG KÊ KHÓA HỌC (CHO ADMIN) ====================

  /**
   * Lấy thống kê tổng quan khóa học - ADMIN VIEW
   */
  async getCourseStatisticsForAdmin(courseId) {
    try {
      console.log(`[ADMIN] Getting course statistics for course ${courseId}`);

      // 1. Lấy cấu trúc khóa học
      const structureResponse = await this.getCourseStructure(courseId);
      if (!structureResponse.success) {
        return structureResponse;
      }

      // 2. Lấy thống kê lesson của tất cả users
      const lessonStatsResponse =
        await LessonService.getAllUsersProgressByCourse(courseId);

      // 3. Lấy thống kê quiz của tất cả users
      const quizStatsResponse =
        await QuizProgressService.getCourseQuizStatistics(courseId);

      // 4. Tổng hợp thống kê
      const courseStatistics = {
        structure: structureResponse.data,
        lessonStatistics: lessonStatsResponse.success
          ? this.analyzeAllUsersLessonProgress(lessonStatsResponse.data)
          : null,
        quizStatistics: quizStatsResponse.success
          ? quizStatsResponse.data
          : null,
        summary: this.generateCourseSummary(
          structureResponse.data,
          lessonStatsResponse.success ? lessonStatsResponse.data : null,
          quizStatsResponse.success ? quizStatsResponse.data : null
        ),
        metadata: {
          courseId,
          fetchedAt: new Date().toISOString(),
        },
      };

      return {
        success: true,
        data: courseStatistics,
        message: "Lấy thống kê khóa học thành công",
      };
    } catch (error) {
      console.error("[CourseProgress] Error getting course statistics:", error);
      return {
        success: false,
        message: "Lỗi khi lấy thống kê khóa học",
        error: error.message,
      };
    }
  }

  /**
   * Lấy tiến độ của tất cả users trong khóa học - ADMIN VIEW
   */
  async getAllUsersProgressInCourse(courseId) {
    try {
      console.log(`[ADMIN] Getting all users progress for course ${courseId}`);

      // 1. Lấy danh sách users (cần API lấy users của course)
      // Giả sử đã có danh sách userIds
      // 2. Lấy tiến độ của từng user
      // 3. Tổng hợp kết quả

      // Tạm thời trả về thông báo cần implement
      return {
        success: false,
        message:
          "Chức năng đang được phát triển. Cần API lấy danh sách users của course.",
      };
    } catch (error) {
      console.error(
        "[CourseProgress] Error getting all users progress:",
        error
      );
      return {
        success: false,
        message: "Lỗi khi lấy tiến độ của tất cả users",
        error: error.message,
      };
    }
  }

  /**
   * Lấy chi tiết tiến độ của một user - ADMIN VIEW
   */
  async getUserProgressDetail(courseId, userId) {
    try {
      console.log(
        `[ADMIN] Getting progress detail for user ${userId} in course ${courseId}`
      );

      // 1. Lấy cấu trúc khóa học
      const structureResponse = await this.getCourseStructure(courseId);
      if (!structureResponse.success) {
        return structureResponse;
      }

      // 2. Lấy tiến độ lesson chi tiết
      const lessonProgressResponse =
        await LessonService.getUserProgressByCourseForAdmin(courseId, userId);

      // 3. Lấy tiến độ quiz chi tiết
      const quizProgressResponse =
        await QuizProgressService.getComprehensiveQuizProgressForAdmin(
          courseId,
          userId
        );

      // 4. Kết hợp dữ liệu
      const progressDetail = {
        userInfo: {
          userId,
          // Cần thêm thông tin user từ API khác
        },
        courseStructure: structureResponse.data,
        lessonProgress: lessonProgressResponse.success
          ? this.mapLessonsToStructure(
              structureResponse.data,
              lessonProgressResponse.data
            )
          : [],
        quizProgress: quizProgressResponse.success
          ? quizProgressResponse.data
          : null,
        summary: {
          overallProgress: this.calculateUserOverallProgress(
            lessonProgressResponse.success ? lessonProgressResponse.data : [],
            quizProgressResponse.success ? quizProgressResponse.data : null
          ),
          timeSpent: this.calculateTotalTimeSpent(
            lessonProgressResponse.success ? lessonProgressResponse.data : [],
            quizProgressResponse.success ? quizProgressResponse.data : null
          ),
          lastActivity: this.getLastActivity(
            lessonProgressResponse.success ? lessonProgressResponse.data : [],
            quizProgressResponse.success ? quizProgressResponse.data : null
          ),
        },
      };

      return {
        success: true,
        data: progressDetail,
        message: "Lấy chi tiết tiến độ thành công",
      };
    } catch (error) {
      console.error("[CourseProgress] Error getting progress detail:", error);
      return {
        success: false,
        message: "Lỗi khi lấy chi tiết tiến độ",
        error: error.message,
      };
    }
  }

  // ==================== CẤU TRÚC KHÓA HỌC ====================

  /**
   * Lấy cấu trúc khóa học đầy đủ
   */
  async getCourseStructure(courseId) {
    try {
      console.log(`[CourseProgress] Getting structure for course ${courseId}`);

      // 1. Lấy danh sách sections
      const sectionsResponse = await SectionService.getSectionsByCourseId(
        courseId
      );

      if (!sectionsResponse.success || !sectionsResponse.data) {
        return {
          success: false,
          message: "Không thể lấy cấu trúc khóa học",
          data: [],
        };
      }

      const sections = Array.isArray(sectionsResponse.data)
        ? sectionsResponse.data
        : [];

      if (sections.length === 0) {
        return {
          success: true,
          data: [],
          message: "Khóa học chưa có section",
        };
      }

      // 2. Lấy lessons và quizzes cho từng section
      const courseStructure = [];

      for (const section of sections) {
        const sectionInfo = {
          id: section.id,
          title: section.title,
          description: section.description || "",
          orderIndex: section.orderIndex || 0,
          totalDuration: 0,
          lessons: [],
          quizzes: [],
        };

        try {
          // Lấy lessons trong section
          const lessonsResponse = await LessonService.getLessonsBySectionId(
            section.id
          );
          if (lessonsResponse.success && lessonsResponse.data) {
            const lessons = Array.isArray(lessonsResponse.data)
              ? lessonsResponse.data.map((lesson) => ({
                  id: lesson.id,
                  title: lesson.title,
                  type: lesson.contentType || "TEXT",
                  duration: lesson.duration || 0,
                  isPublished: lesson.isPublished !== false,
                  isFree: lesson.isFree === true,
                  orderIndex: lesson.orderIndex || 0,
                  resourceType: "LESSON",
                }))
              : [];

            sectionInfo.lessons = lessons;
            sectionInfo.totalDuration += lessons.reduce(
              (sum, lesson) => sum + (lesson.duration || 0),
              0
            );
          }
        } catch (lessonError) {
          console.error(
            `Error getting lessons for section ${section.id}:`,
            lessonError
          );
        }

        try {
          // Lấy quizzes trong section
          const QuizService = (await import("./Quiz/QuizService")).default;
          const quizzesResponse = await QuizService.getQuizzesBySectionId(
            section.id
          );
          if (quizzesResponse.success && quizzesResponse.data) {
            const quizzes = Array.isArray(quizzesResponse.data)
              ? quizzesResponse.data
                  .filter((quiz) => quiz.published !== false)
                  .map((quiz) => ({
                    id: quiz.id,
                    title: quiz.title,
                    description: quiz.description || "",
                    passingScore: quiz.passingScore || 0,
                    timeLimit: quiz.timeLimit || 0,
                    isPublished: quiz.published !== false,
                    orderIndex: quiz.orderIndex || 0,
                    totalPoints: quiz.totalPoints || 0,
                    resourceType: "QUIZ",
                  }))
              : [];

            sectionInfo.quizzes = quizzes;
            // Quiz không có duration, nhưng có thể tính thời gian làm bài
            sectionInfo.totalDuration += quizzes.reduce(
              (sum, quiz) => sum + (quiz.timeLimit || 0),
              0
            );
          }
        } catch (quizError) {
          console.error(
            `Error getting quizzes for section ${section.id}:`,
            quizError
          );
        }

        courseStructure.push(sectionInfo);
      }

      return {
        success: true,
        data: courseStructure,
        message: "Lấy cấu trúc khóa học thành công",
      };
    } catch (error) {
      console.error("[CourseProgress] Error getting course structure:", error);
      return {
        success: false,
        message: "Lỗi khi lấy cấu trúc khóa học",
        data: null,
      };
    }
  }

  // ==================== PHÂN TÍCH VÀ TÍNH TOÁN ====================

  /**
   * Phân tích tiến độ lesson
   */
  analyzeLessonProgress(lessonProgressData) {
    if (!Array.isArray(lessonProgressData)) {
      return this.getEmptyLessonProgress();
    }

    const analysis = {
      totalLessons: lessonProgressData.length,
      completedLessons: 0,
      inProgressLessons: 0,
      notStartedLessons: 0,
      totalDuration: 0,
      completedDuration: 0,
      averageProgress: 0,
      lastActivity: null,
      lessonsByStatus: {
        completed: [],
        inProgress: [],
        notStarted: [],
      },
    };

    let totalProgress = 0;

    lessonProgressData.forEach((lesson) => {
      const progress = lesson.progress || 0;
      const timeSpent = lesson.timeSpent || 0;
      const duration = lesson.duration || 0;

      // Phân loại trạng thái
      if (progress >= 100) {
        analysis.completedLessons++;
        analysis.lessonsByStatus.completed.push(lesson);
      } else if (progress > 0) {
        analysis.inProgressLessons++;
        analysis.lessonsByStatus.inProgress.push(lesson);
      } else {
        analysis.notStartedLessons++;
        analysis.lessonsByStatus.notStarted.push(lesson);
      }

      // Tính toán thời gian
      analysis.totalDuration += duration;
      analysis.completedDuration += (progress / 100) * duration;

      // Tính tổng progress
      totalProgress += progress;

      // Tìm last activity
      if (lesson.lastAccessed) {
        const lessonDate = new Date(lesson.lastAccessed);
        if (
          !analysis.lastActivity ||
          lessonDate > new Date(analysis.lastActivity)
        ) {
          analysis.lastActivity = lesson.lastAccessed;
        }
      }
    });

    // Tính trung bình
    analysis.averageProgress =
      analysis.totalLessons > 0
        ? parseFloat((totalProgress / analysis.totalLessons).toFixed(2))
        : 0;

    // Tính phần trăm hoàn thành
    analysis.completionRate =
      analysis.totalLessons > 0
        ? parseFloat(
            ((analysis.completedLessons / analysis.totalLessons) * 100).toFixed(
              2
            )
          )
        : 0;

    analysis.progressRate =
      analysis.totalDuration > 0
        ? parseFloat(
            (
              (analysis.completedDuration / analysis.totalDuration) *
              100
            ).toFixed(2)
          )
        : 0;

    return {
      ...analysis,
      detailedProgress: lessonProgressData,
    };
  }

  /**
   * Phân tích tiến độ của tất cả users
   */
  analyzeAllUsersLessonProgress(allUsersProgress) {
    if (!Array.isArray(allUsersProgress)) {
      return null;
    }

    const analysis = {
      totalUsers: allUsersProgress.length,
      averageCompletionRate: 0,
      averageProgressRate: 0,
      usersByPerformance: {
        excellent: 0, // > 90% completion
        good: 0, // 70-90% completion
        average: 0, // 50-70% completion
        poor: 0, // < 50% completion
        notStarted: 0,
      },
      userDetails: [],
    };

    let totalCompletionRate = 0;
    let totalProgressRate = 0;

    allUsersProgress.forEach((userProgress) => {
      const userAnalysis = this.analyzeLessonProgress(
        userProgress.lessons || []
      );

      const completionRate = userAnalysis.completionRate || 0;
      const progressRate = userAnalysis.progressRate || 0;

      totalCompletionRate += completionRate;
      totalProgressRate += progressRate;

      // Phân loại theo hiệu suất
      if (completionRate === 0) {
        analysis.usersByPerformance.notStarted++;
      } else if (completionRate >= 90) {
        analysis.usersByPerformance.excellent++;
      } else if (completionRate >= 70) {
        analysis.usersByPerformance.good++;
      } else if (completionRate >= 50) {
        analysis.usersByPerformance.average++;
      } else {
        analysis.usersByPerformance.poor++;
      }

      analysis.userDetails.push({
        userId: userProgress.userId,
        completionRate,
        progressRate,
        totalLessons: userAnalysis.totalLessons,
        completedLessons: userAnalysis.completedLessons,
        lastActivity: userAnalysis.lastActivity,
      });
    });

    // Tính trung bình
    if (analysis.totalUsers > 0) {
      analysis.averageCompletionRate = parseFloat(
        (totalCompletionRate / analysis.totalUsers).toFixed(2)
      );
      analysis.averageProgressRate = parseFloat(
        (totalProgressRate / analysis.totalUsers).toFixed(2)
      );
    }

    return analysis;
  }

  /**
   * Tính toán tổng tiến độ (lesson + quiz)
   */
  calculateOverallProgress(lessonProgress, quizProgress, courseStructure) {
    // Tổng hợp lesson stats
    const lessonStats = {
      total: lessonProgress.totalLessons || 0,
      completed: lessonProgress.completedLessons || 0,
      inProgress: lessonProgress.inProgressLessons || 0,
      notStarted: lessonProgress.notStartedLessons || 0,
      completionRate: lessonProgress.completionRate || 0,
      progressRate: lessonProgress.progressRate || 0,
      totalDuration: lessonProgress.totalDuration || 0,
      completedDuration: lessonProgress.completedDuration || 0,
      averageProgress: lessonProgress.averageProgress || 0,
    };

    // Tổng hợp quiz stats
    const quizStats = {
      total: quizProgress.totalQuizzes || 0,
      completed: quizProgress.completedQuizzes || 0,
      passed: quizProgress.passedQuizzes || 0,
      failed: quizProgress.failedQuizzes || 0,
      notAttempted: quizProgress.notAttemptedQuizzes || 0,
      completionRate: quizProgress.completionRate || 0,
      passRate: quizProgress.passRate || 0,
      averageScore: quizProgress.averageScore || 0,
    };

    // Tính tổng tiến độ
    const totalItems = lessonStats.total + quizStats.total;
    const completedItems = lessonStats.completed + quizStats.passed;

    const overallProgressPercentage =
      totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

    // Kiểm tra hoàn thành khóa học
    const isCourseCompleted =
      lessonStats.completed === lessonStats.total &&
      quizStats.passed === quizStats.total &&
      totalItems > 0;

    // Tính tổng thời gian
    const totalTimeSpent = this.calculateTotalTimeSpentFromData(
      lessonProgress.detailedProgress || [],
      quizProgress.quizDetails || []
    );

    return {
      // Thống kê lesson
      lessonStats,

      // Thống kê quiz
      quizStats,

      // Thống kê tổng hợp
      overall: {
        totalItems,
        completedItems,
        inProgressItems:
          lessonStats.inProgress + (quizStats.completed - quizStats.passed),
        notStartedItems: lessonStats.notStarted + quizStats.notAttempted,
        progressPercentage: parseFloat(overallProgressPercentage.toFixed(2)),
        isCourseCompleted,
        timeSpent: totalTimeSpent,
        lastActivity: this.getLatestDate(
          lessonProgress.lastActivity,
          quizProgress.quizDetails || []
        ),
      },

      // Chi tiết theo section
      sectionProgress: this.calculateSectionProgress(
        courseStructure,
        lessonProgress.detailedProgress || [],
        quizProgress.quizDetails || []
      ),
    };
  }

  /**
   * Tính tiến độ theo section
   */
  calculateSectionProgress(sections, lessonProgress, quizProgress) {
    if (!Array.isArray(sections)) return [];

    return sections.map((section) => {
      // Filter lessons và quizzes trong section
      const sectionLessons = section.lessons || [];
      const sectionQuizzes = section.quizzes || [];

      // Map progress với lessons
      const lessonsWithProgress = sectionLessons.map((lesson) => {
        const progress = lessonProgress.find((lp) => lp.lessonId === lesson.id);
        return {
          ...lesson,
          progress: progress?.progress || 0,
          timeSpent: progress?.timeSpent || 0,
          status:
            progress?.progress >= 100
              ? "COMPLETED"
              : progress?.progress > 0
              ? "IN_PROGRESS"
              : "NOT_STARTED",
          lastAccessed: progress?.lastAccessed,
        };
      });

      // Map progress với quizzes
      const quizzesWithProgress = sectionQuizzes.map((quiz) => {
        const progress = quizProgress.find((qp) => qp.quizId === quiz.id);
        return {
          ...quiz,
          isCompleted: progress?.isCompleted || false,
          isPassed: progress?.isPassed || false,
          score: progress?.score || 0,
          attemptCount: progress?.attemptCount || 0,
          lastAttemptDate: progress?.lastAttemptDate,
          status: progress?.isCompleted
            ? progress?.isPassed
              ? "PASSED"
              : "FAILED"
            : progress?.attemptCount > 0
            ? "IN_PROGRESS"
            : "NOT_ATTEMPTED",
        };
      });

      // Tính toán tổng hợp cho section
      const totalItems = sectionLessons.length + sectionQuizzes.length;
      const completedLessons = lessonsWithProgress.filter(
        (l) => l.status === "COMPLETED"
      ).length;
      const passedQuizzes = quizzesWithProgress.filter(
        (q) => q.status === "PASSED"
      ).length;
      const completedItems = completedLessons + passedQuizzes;

      return {
        sectionId: section.id,
        sectionTitle: section.title,
        totalDuration: section.totalDuration,
        lessons: lessonsWithProgress,
        quizzes: quizzesWithProgress,
        summary: {
          totalItems,
          completedItems,
          progressPercentage:
            totalItems > 0 ? (completedItems / totalItems) * 100 : 0,
          isCompleted: totalItems > 0 && completedItems === totalItems,
        },
      };
    });
  }

  /**
   * Tính tổng thời gian học
   */
  calculateTotalTimeSpentFromData(lessonProgress, quizProgress) {
    let totalTime = 0;

    // Thời gian học lesson
    if (Array.isArray(lessonProgress)) {
      totalTime += lessonProgress.reduce(
        (sum, lesson) => sum + (lesson.timeSpent || 0),
        0
      );
    }

    // Thời gian làm quiz (nếu có trong data)
    if (Array.isArray(quizProgress)) {
      totalTime += quizProgress.reduce(
        (sum, quiz) => sum + (quiz.timeSpent || 0),
        0
      );
    }

    return totalTime; // Trả về giây
  }

  /**
   * Tính tổng thời gian học cho user
   */
  calculateTotalTimeSpent(lessonProgress, quizProgress) {
    return this.calculateTotalTimeSpentFromData(
      lessonProgress,
      quizProgress?.quizDetails || []
    );
  }

  /**
   * Lấy ngày hoạt động gần nhất
   */
  getLatestDate(lessonLastActivity, quizDetails) {
    const dates = [];

    if (lessonLastActivity) {
      dates.push(new Date(lessonLastActivity));
    }

    if (quizDetails && Array.isArray(quizDetails)) {
      quizDetails.forEach((quiz) => {
        if (quiz.lastAttemptDate) {
          dates.push(new Date(quiz.lastAttemptDate));
        }
      });
    }

    if (dates.length === 0) return null;

    const latestDate = dates.reduce((latest, date) =>
      date > latest ? date : latest
    );

    return latestDate.toISOString();
  }

  /**
   * Lấy last activity từ dữ liệu
   */
  getLastActivity(lessonProgress, quizProgress) {
    return this.getLatestDate(
      lessonProgress.length > 0 ? lessonProgress[0].lastAccessed : null,
      quizProgress?.detailedProgress || []
    );
  }

  /**
   * Tính tổng quát tiến độ user
   */
  calculateUserOverallProgress(lessonProgress, quizProgress) {
    if (!Array.isArray(lessonProgress)) lessonProgress = [];
    if (!quizProgress) quizProgress = { analysis: {} };

    const totalLessons = lessonProgress.length;
    const completedLessons = lessonProgress.filter(
      (l) => l.progress >= 100
    ).length;

    const totalQuizzes = quizProgress.analysis?.totalQuizzes || 0;
    const passedQuizzes = quizProgress.analysis?.passedQuizzes || 0;

    const totalItems = totalLessons + totalQuizzes;
    const completedItems = completedLessons + passedQuizzes;

    return {
      totalItems,
      completedItems,
      progressPercentage:
        totalItems > 0
          ? parseFloat(((completedItems / totalItems) * 100).toFixed(2))
          : 0,
      lessonProgress:
        totalLessons > 0
          ? parseFloat(((completedLessons / totalLessons) * 100).toFixed(2))
          : 0,
      quizProgress:
        totalQuizzes > 0
          ? parseFloat(((passedQuizzes / totalQuizzes) * 100).toFixed(2))
          : 0,
    };
  }

  /**
   * Map lessons vào cấu trúc
   */
  mapLessonsToStructure(courseStructure, lessonProgress) {
    if (!Array.isArray(courseStructure) || !Array.isArray(lessonProgress)) {
      return [];
    }

    const mappedProgress = [];

    courseStructure.forEach((section) => {
      section.lessons.forEach((lesson) => {
        const progress = lessonProgress.find((lp) => lp.lessonId === lesson.id);
        if (progress) {
          mappedProgress.push({
            sectionId: section.id,
            sectionTitle: section.title,
            ...lesson,
            progress: progress.progress || 0,
            timeSpent: progress.timeSpent || 0,
            status:
              progress.progress >= 100
                ? "COMPLETED"
                : progress.progress > 0
                ? "IN_PROGRESS"
                : "NOT_STARTED",
            lastAccessed: progress.lastAccessed,
            startedDate: progress.startedDate,
            completedDate: progress.completedDate,
          });
        }
      });
    });

    return mappedProgress;
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Tạo dữ liệu progress rỗng
   */
  getEmptyProgressData() {
    return {
      lessonStats: {
        total: 0,
        completed: 0,
        inProgress: 0,
        notStarted: 0,
        completionRate: 0,
        progressRate: 0,
        totalDuration: 0,
        completedDuration: 0,
        averageProgress: 0,
      },
      quizStats: {
        total: 0,
        completed: 0,
        passed: 0,
        failed: 0,
        notAttempted: 0,
        completionRate: 0,
        passRate: 0,
        averageScore: 0,
      },
      overall: {
        totalItems: 0,
        completedItems: 0,
        inProgressItems: 0,
        notStartedItems: 0,
        progressPercentage: 0,
        isCourseCompleted: false,
        timeSpent: 0,
        lastActivity: null,
      },
      sectionProgress: [],
      metadata: {
        fetchedAt: new Date().toISOString(),
      },
    };
  }

  /**
   * Tạo dữ liệu lesson progress rỗng
   */
  getEmptyLessonProgress() {
    return {
      totalLessons: 0,
      completedLessons: 0,
      inProgressLessons: 0,
      notStartedLessons: 0,
      totalDuration: 0,
      completedDuration: 0,
      averageProgress: 0,
      completionRate: 0,
      progressRate: 0,
      lastActivity: null,
      lessonsByStatus: {
        completed: [],
        inProgress: [],
        notStarted: [],
      },
      detailedProgress: [],
    };
  }

  /**
   * Tạo dữ liệu quiz progress rỗng
   */
  getEmptyQuizProgress() {
    return {
      totalQuizzes: 0,
      completedQuizzes: 0,
      passedQuizzes: 0,
      failedQuizzes: 0,
      notAttemptedQuizzes: 0,
      quizDetails: [],
      analysis: null,
      summary: null,
      averageScore: 0,
      completionRate: 0,
      passRate: 0,
    };
  }

  /**
   * Tạo summary cho khóa học
   */
  generateCourseSummary(structure, lessonStats, quizStats) {
    const totalSections = structure.length;
    const totalLessons = structure.reduce(
      (sum, section) => sum + (section.lessons?.length || 0),
      0
    );
    const totalQuizzes = structure.reduce(
      (sum, section) => sum + (section.quizzes?.length || 0),
      0
    );

    const summary = {
      totalSections,
      totalLessons,
      totalQuizzes,
      totalDuration: structure.reduce(
        (sum, section) => sum + (section.totalDuration || 0),
        0
      ),
      lessonStats: lessonStats
        ? {
            averageCompletionRate: lessonStats.averageCompletionRate,
            averageProgressRate: lessonStats.averageProgressRate,
            totalUsers: lessonStats.totalUsers,
          }
        : null,
      quizStats: quizStats
        ? {
            averageCompletionRate: quizStats.averageCompletionRate,
            averagePassRate: quizStats.averagePassRate,
            totalUsers: quizStats.totalUsers,
          }
        : null,
    };

    return summary;
  }

  /**
   * Tạo summary cho cấu trúc
   */
  generateStructureSummary(structure) {
    return {
      totalSections: structure.length,
      totalLessons: structure.reduce(
        (sum, section) => sum + (section.lessons?.length || 0),
        0
      ),
      totalQuizzes: structure.reduce(
        (sum, section) => sum + (section.quizzes?.length || 0),
        0
      ),
      totalDuration: structure.reduce(
        (sum, section) => sum + (section.totalDuration || 0),
        0
      ),
      sections: structure.map((section) => ({
        id: section.id,
        title: section.title,
        lessonsCount: section.lessons?.length || 0,
        quizzesCount: section.quizzes?.length || 0,
        duration: section.totalDuration || 0,
      })),
    };
  }

  /**
   * Format thời gian
   */
  formatTime(seconds) {
    if (!seconds) return "0 giây";

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours} giờ ${minutes} phút`;
    } else if (minutes > 0) {
      return `${minutes} phút ${remainingSeconds} giây`;
    } else {
      return `${remainingSeconds} giây`;
    }
  }

  /**
   * Format ngày tháng
   */
  formatDate(dateString) {
    if (!dateString) return "";

    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  /**
   * Tính số ngày đã học
   */
  calculateLearningDays(lessonProgress) {
    if (!Array.isArray(lessonProgress)) return 0;

    const uniqueDays = new Set();

    lessonProgress.forEach((lesson) => {
      if (lesson.lastAccessed) {
        const date = new Date(lesson.lastAccessed);
        const dateString = date.toISOString().split("T")[0];
        uniqueDays.add(dateString);
      }
    });

    return uniqueDays.size;
  }
}

const courseProgressService = new CourseProgressService();
export default courseProgressService;
