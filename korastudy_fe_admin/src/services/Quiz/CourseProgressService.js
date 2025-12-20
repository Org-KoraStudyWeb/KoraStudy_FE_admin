// src/services/CourseProgressService.js
import SectionService from "./../SectionService";
import LessonService from "./../LessonService";
import QuizService from "./QuizService";

class CourseProgressService {
  /**
   * Lấy tổng tiến độ khóa học (bao gồm cả lesson và quiz)
   * @param {number} courseId - ID khóa học
   * @param {number} userId - ID người dùng
   * @returns {Object} - Thông tin tiến độ
   */
  async getOverallCourseProgress(courseId, userId) {
    try {
      console.log(
        `[CourseProgress] Getting overall progress for course ${courseId}, user ${userId}`
      );

      // 1. Lấy danh sách sections trong khóa học
      const sections = await this.getSectionsByCourseId(courseId);

      if (!sections || sections.length === 0) {
        return {
          success: true,
          data: {
            lessonStats: {
              totalLessons: 0,
              completedLessons: 0,
              progressPercentage: 0,
              totalDuration: 0,
              lastActivity: null,
            },
            quizStats: {
              totalQuizzes: 0,
              completedQuizzes: 0,
              passedQuizzes: 0,
              failedQuizzes: 0,
              notAttemptedQuizzes: 0,
              quizDetails: [],
            },
            overall: {
              totalItems: 0,
              completedItems: 0,
              progressPercentage: 0,
              isCourseCompleted: false,
              lastActivity: null,
            },
          },
          message: "Khóa học chưa có nội dung",
        };
      }

      // 2. Lấy tiến độ lesson và quiz
      const [lessonProgress, quizProgress] = await Promise.all([
        this.getLessonProgressForCourse(courseId, userId),
        this.getQuizProgressForCourse(sections, userId),
      ]);

      // 3. Tính toán tổng tiến độ
      const overallProgress = this.calculateOverallProgress(
        lessonProgress,
        quizProgress
      );

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
        data: null,
      };
    }
  }

  /**
   * Lấy tiến độ lesson cho user trong khóa học
   */
  async getLessonProgressForCourse(courseId, userId) {
    try {
      const response = await LessonService.getUserProgressByCourseForAdmin(
        courseId,
        userId
      );

      if (response.success && response.data) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error("[CourseProgress] Error getting lesson progress:", error);
      return [];
    }
  }

  /**
   * Lấy tiến độ quiz cho user trong khóa học
   */
  async getQuizProgressForCourse(sections, userId) {
    try {
      let quizProgress = {
        totalQuizzes: 0,
        completedQuizzes: 0,
        passedQuizzes: 0,
        failedQuizzes: 0,
        notAttemptedQuizzes: 0,
        quizDetails: [],
      };

      if (!sections || sections.length === 0) {
        return quizProgress;
      }

      // Duyệt qua từng section để tìm quiz
      for (const section of sections) {
        // Lấy danh sách quiz trong section
        const quizResponse = await QuizService.getQuizzesBySectionId(
          section.id
        );

        if (quizResponse.success && quizResponse.data) {
          const quizzes = Array.isArray(quizResponse.data)
            ? quizResponse.data
            : [];

          for (const quiz of quizzes) {
            // Kiểm tra xem quiz có published không
            if (!quiz.published) {
              continue;
            }

            quizProgress.totalQuizzes++;
            const quizStatus = {
              quizId: quiz.id,
              quizTitle: quiz.title,
              sectionId: section.id,
              sectionTitle: section.title,
              isCompleted: false,
              isPassed: false,
              score: 0,
              attempts: 0,
              lastAttemptDate: null,
            };

            try {
              // Lấy trạng thái quiz của user
              const statusResponse = await QuizService.getQuizStatusForUser(
                quiz.id,
                userId
              );

              if (statusResponse.success && statusResponse.data) {
                const statusData = statusResponse.data;

                // ⭐ QUAN TRỌNG: Kiểm tra trường isPassed
                quizStatus.isPassed = statusData.isPassed || false;
                quizStatus.isCompleted =
                  statusData.isCompleted || statusData.isPassed || false;
                quizStatus.score = statusData.score || 0;
                quizStatus.attempts = statusData.attempts || 0;
                quizStatus.lastAttemptDate =
                  statusData.lastAttemptDate || statusData.submittedAt;

                if (quizStatus.isPassed) {
                  quizProgress.passedQuizzes++;
                  quizProgress.completedQuizzes++;
                } else if (quizStatus.isCompleted && !quizStatus.isPassed) {
                  quizProgress.failedQuizzes++;
                  quizProgress.completedQuizzes++;
                } else {
                  quizProgress.notAttemptedQuizzes++;
                }
              } else {
                quizProgress.notAttemptedQuizzes++;
              }
            } catch (error) {
              console.error(
                `[CourseProgress] Error getting quiz status for quiz ${quiz.id}:`,
                error
              );
              quizProgress.notAttemptedQuizzes++;
            }

            quizProgress.quizDetails.push(quizStatus);
          }
        }
      }

      return quizProgress;
    } catch (error) {
      console.error("[CourseProgress] Error getting quiz progress:", error);
      return {
        totalQuizzes: 0,
        completedQuizzes: 0,
        passedQuizzes: 0,
        failedQuizzes: 0,
        notAttemptedQuizzes: 0,
        quizDetails: [],
      };
    }
  }

  /**
   * Tính toán tổng tiến độ (lesson + quiz)
   */
  calculateOverallProgress(lessonProgressData, quizProgress) {
    // Tính tiến độ lesson
    let lessonStats = {
      totalLessons: 0,
      completedLessons: 0,
      progressPercentage: 0,
      totalDuration: 0,
      lastActivity: null,
    };

    if (Array.isArray(lessonProgressData)) {
      lessonStats.totalLessons = lessonProgressData.length;
      lessonStats.completedLessons = lessonProgressData.filter(
        (item) => item.status === "COMPLETED"
      ).length;
      lessonStats.progressPercentage =
        lessonStats.totalLessons > 0
          ? (lessonStats.completedLessons / lessonStats.totalLessons) * 100
          : 0;

      // Tính tổng thời gian
      lessonStats.totalDuration = lessonProgressData.reduce(
        (sum, item) => sum + (item.timeSpent || 0),
        0
      );

      // Tìm last activity
      if (lessonProgressData.length > 0) {
        const allDates = lessonProgressData.flatMap((item) =>
          [
            item.lastAccessed,
            item.completedDate,
            item.startedDate,
            item.updatedAt,
          ].filter(Boolean)
        );

        if (allDates.length > 0) {
          lessonStats.lastActivity = allDates.reduce((latest, date) => {
            const date1 = new Date(latest);
            const date2 = new Date(date);
            return date2 > date1 ? date : latest;
          }, allDates[0]);
        }
      }
    }

    // Tính tiến độ tổng hợp
    const totalItems = lessonStats.totalLessons + quizProgress.totalQuizzes;
    const completedItems =
      lessonStats.completedLessons + quizProgress.passedQuizzes;

    const overallProgressPercentage =
      totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

    // Kiểm tra hoàn thành khóa học
    // Điều kiện: tất cả lesson đã hoàn thành VÀ tất cả quiz đã pass
    const isCourseCompleted =
      lessonStats.completedLessons === lessonStats.totalLessons &&
      quizProgress.passedQuizzes === quizProgress.totalQuizzes &&
      totalItems > 0;

    return {
      // Thống kê lesson
      lessonStats,

      // Thống kê quiz
      quizStats: quizProgress,

      // Thống kê tổng hợp
      overall: {
        totalItems,
        completedItems,
        progressPercentage: overallProgressPercentage,
        isCourseCompleted,
        lastActivity: this.getLatestDate(
          lessonStats.lastActivity,
          quizProgress.quizDetails
        ),
      },
    };
  }

  /**
   * Lấy danh sách section theo courseId
   */
  async getSectionsByCourseId(courseId) {
    try {
      const response = await SectionService.getSectionsByCourseId(courseId);
      if (response.success && response.data) {
        return Array.isArray(response.data) ? response.data : [];
      }
      return [];
    } catch (error) {
      console.error("[CourseProgress] Error getting sections:", error);
      return [];
    }
  }

  /**
   * Lấy ngày hoạt động mới nhất
   */
  getLatestDate(lessonLastActivity, quizDetails) {
    const dates = [];

    if (lessonLastActivity) dates.push(new Date(lessonLastActivity));

    if (quizDetails && quizDetails.length > 0) {
      quizDetails.forEach((quiz) => {
        if (quiz.lastAttemptDate) dates.push(new Date(quiz.lastAttemptDate));
      });
    }

    if (dates.length === 0) return null;

    const latestDate = dates.reduce((latest, date) =>
      date > latest ? date : latest
    );

    return latestDate.toISOString();
  }

  /**
   * Lấy thông tin cấu trúc khóa học (sections, lessons, quizzes)
   * Phục vụ cho việc debug hoặc hiển thị chi tiết
   */
  async getCourseStructure(courseId) {
    try {
      const sections = await this.getSectionsByCourseId(courseId);

      if (!sections || sections.length === 0) {
        return {
          success: true,
          data: [],
          message: "Khóa học chưa có section",
        };
      }

      const courseStructure = [];

      for (const section of sections) {
        const sectionInfo = {
          id: section.id,
          title: section.title,
          description: section.description,
          orderIndex: section.orderIndex,
          lessons: [],
          quizzes: [],
        };

        try {
          // Lấy lessons trong section
          const lessonsResponse = await LessonService.getLessonsBySectionId(
            section.id
          );
          if (lessonsResponse.success && lessonsResponse.data) {
            sectionInfo.lessons = Array.isArray(lessonsResponse.data)
              ? lessonsResponse.data.map((lesson) => ({
                  id: lesson.id,
                  title: lesson.title,
                  type: lesson.type,
                  duration: lesson.duration,
                  isPublished: lesson.isPublished,
                }))
              : [];
          }
        } catch (error) {
          console.error(
            `Error getting lessons for section ${section.id}:`,
            error
          );
        }

        try {
          // Lấy quizzes trong section
          const quizzesResponse = await QuizService.getQuizzesBySectionId(
            section.id
          );
          if (quizzesResponse.success && quizzesResponse.data) {
            sectionInfo.quizzes = Array.isArray(quizzesResponse.data)
              ? quizzesResponse.data
                  .filter((quiz) => quiz.published)
                  .map((quiz) => ({
                    id: quiz.id,
                    title: quiz.title,
                    passingScore: quiz.passingScore,
                    timeLimit: quiz.timeLimit,
                    isPublished: quiz.published,
                  }))
              : [];
          }
        } catch (error) {
          console.error(
            `Error getting quizzes for section ${section.id}:`,
            error
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
}

const courseProgressService = new CourseProgressService();
export default courseProgressService;
