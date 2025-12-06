// src/api/courseApi.js
import axiosClient from "./axiosClient";

const courseApi = {
  // ==================== ADMIN COURSE MANAGEMENT ====================

  getAllCoursesAdmin: (params = {}) => {
    const {
      page = 0,
      size = 10,
      sortBy = "id",
      sortDir = "desc",
      keyword = "",
    } = params;

    return axiosClient.get("/api/v1/admin/courses", {
      params: {
        page,
        size,
        sortBy,
        sortDir,
        ...(keyword && { keyword }), // ✅ Chỉ gửi khi có giá trị
      },
    });
  },

  getCourseByIdAdmin: (id) => {
    return axiosClient.get(`/api/v1/admin/courses/${id}`);
  },

  createCourse: (courseData) => {
    return axiosClient.post("/api/v1/admin/courses", courseData);
  },

  updateCourse: (id, courseData) => {
    return axiosClient.put(`/api/v1/admin/courses/${id}`, courseData);
  },

  deleteCourse: (id) => {
    return axiosClient.delete(`/api/v1/admin/courses/${id}`);
  },

  togglePublishCourse: (id, isPublished) => {
    return axiosClient.put(`/api/v1/admin/courses/${id}/publish`, null, {
      params: { isPublished },
    });
  },

  getCourseStats: () => {
    return axiosClient.get("/api/v1/admin/courses/stats");
  },

  // ✅ FIXED: Đổi tên cho rõ ràng hơn
  getCourseEnrollmentsAdmin: (courseId, params = {}) => {
    const { page = 0, size = 10 } = params;
    return axiosClient.get(`/api/v1/admin/courses/${courseId}/enrollments`, {
      params: { page, size },
    });
  },

  // ==================== PUBLIC COURSE APIs ====================

  getAllPublishedCourses: () => {
    return axiosClient.get("/api/v1/courses");
  },

  getCourseById: (id) => {
    return axiosClient.get(`/api/v1/courses/${id}`);
  },

  searchCourses: (keyword) => {
    return axiosClient.get("/api/v1/courses/search", {
      params: { keyword },
    });
  },

  // ==================== SECTION MANAGEMENT ====================

  getSectionsByCourseId: (courseId) => {
    return axiosClient.get(`/api/v1/sections/course/${courseId}`);
  },

  getSectionById: (id) => {
    return axiosClient.get(`/api/v1/sections/${id}`);
  },

  createSection: (sectionData) => {
    return axiosClient.post("/api/v1/sections", sectionData);
  },

  updateSection: (id, sectionData) => {
    return axiosClient.put(`/api/v1/sections/${id}`, sectionData);
  },

  deleteSection: (id) => {
    return axiosClient.delete(`/api/v1/sections/${id}`);
  },

  // ==================== LESSON MANAGEMENT ====================

  getLessonsBySectionId: (sectionId) => {
    return axiosClient.get(`/api/v1/lessons/section/${sectionId}`);
  },

  getLessonById: (id) => {
    return axiosClient.get(`/api/v1/lessons/${id}`);
  },

  createLesson: (lessonData) => {
    return axiosClient.post("/api/v1/lessons", lessonData);
  },

  updateLesson: (id, lessonData) => {
    return axiosClient.put(`/api/v1/lessons/${id}`, lessonData);
  },

  deleteLesson: (id) => {
    return axiosClient.delete(`/api/v1/lessons/${id}`);
  },

  // ==================== ENROLLMENT MANAGEMENT ====================

  enrollCourse: (enrollmentData) => {
    return axiosClient.post("/api/v1/enrollments", enrollmentData);
  },

  getEnrollmentById: (id) => {
    return axiosClient.get(`/api/v1/enrollments/${id}`);
  },

  getUserEnrollments: (userId) => {
    return axiosClient.get(`/api/v1/enrollments/user/${userId}`);
  },

  // ✅ FIXED: Đổi tên để phân biệt với admin version
  getCourseEnrollmentsPublic: (courseId) => {
    return axiosClient.get(`/api/v1/enrollments/course/${courseId}`);
  },

  getMyEnrollments: () => {
    return axiosClient.get("/api/v1/enrollments/my-courses");
  },

  updateProgress: (enrollmentId, progress) => {
    return axiosClient.put(
      `/api/v1/enrollments/${enrollmentId}/progress`,
      null,
      {
        params: { progress },
      }
    );
  },

  cancelEnrollment: (id) => {
    return axiosClient.delete(`/api/v1/enrollments/${id}`);
  },

  checkEnrollment: (userId, courseId) => {
    return axiosClient.get("/api/v1/enrollments/check", {
      params: { userId, courseId },
    });
  },

  // ==================== REVIEW MANAGEMENT ====================

  addReview: (reviewData) => {
    return axiosClient.post("/api/v1/reviews", reviewData);
  },

  getReviewById: (id) => {
    return axiosClient.get(`/api/v1/reviews/${id}`);
  },

  getCourseReviews: (courseId) => {
    return axiosClient.get(`/api/v1/reviews/course/${courseId}`);
  },

  getAverageRating: (courseId) => {
    return axiosClient.get(`/api/v1/reviews/course/${courseId}/rating`);
  },

  updateReview: (id, reviewData) => {
    return axiosClient.put(`/api/v1/reviews/${id}`, reviewData);
  },

  deleteReview: (id) => {
    return axiosClient.delete(`/api/v1/reviews/${id}`);
  },

  // ==================== UTILITY METHODS ====================

  uploadCourseImage: (file) => {
    const formData = new FormData();
    formData.append("file", file);

    return axiosClient.post("/api/v1/upload/course-image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      timeout: 30000, // ✅ Thêm timeout cho upload
    });
  },

  uploadLessonVideo: (file) => {
    const formData = new FormData();
    formData.append("file", file);

    return axiosClient.post("/api/v1/upload/lesson-video", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      timeout: 60000, // ✅ Timeout dài hơn cho video
    });
  },
};

// ✅ THÊM: Error handling wrapper (tùy chọn)
export const withErrorHandling = (apiCall) => {
  return async (...args) => {
    try {
      const response = await apiCall(...args);
      return response;
    } catch (error) {
      console.error("API Call failed:", error);
      throw error;
    }
  };
};

export default courseApi;
