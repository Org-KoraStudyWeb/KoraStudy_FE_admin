// src/api/courseApi.js
import axiosClient from "./axiosClient";

const courseApi = {
  // ==================== ADMIN COURSE MANAGEMENT ====================

  // Lấy danh sách tất cả khóa học (admin) với pagination
  getAllCoursesAdmin: (params = {}) => {
    const {
      page = 0,
      size = 10,
      sortBy = "id",
      sortDir = "desc",
      keyword = "", // <— nhận keyword
    } = params;

    return axiosClient.get("/api/v1/admin/courses", {
      params: {
        page,
        size,
        sortBy,
        sortDir,
        ...(keyword ? { keyword } : {}), // <— chỉ gửi khi có
      },
    });
  },

  // Lấy chi tiết khóa học theo ID (admin)
  getCourseByIdAdmin: (id) => {
    return axiosClient.get(`/api/v1/admin/courses/${id}`);
  },

  // Tạo khóa học mới
  createCourse: (courseData) => {
    return axiosClient.post("/api/v1/admin/courses", courseData);
  },

  // Cập nhật khóa học
  updateCourse: (id, courseData) => {
    return axiosClient.put(`/api/v1/admin/courses/${id}`, courseData);
  },

  // Xóa khóa học
  deleteCourse: (id) => {
    return axiosClient.delete(`/api/v1/admin/courses/${id}`);
  },

  // Xuất bản/hủy xuất bản khóa học
  togglePublishCourse: (id, isPublished) => {
    return axiosClient.put(`/api/v1/admin/courses/${id}/publish`, null, {
      params: { isPublished },
    });
  },

  // Lấy thống kê khóa học
  getCourseStats: () => {
    return axiosClient.get("/api/v1/admin/courses/stats");
  },

  // Lấy danh sách đăng ký của khóa học
  getCourseEnrollments: (id, params = {}) => {
    const { page = 0, size = 10 } = params;
    return axiosClient.get(`/api/v1/admin/courses/${id}/enrollments`, {
      params: { page, size },
    });
  },

  // ==================== PUBLIC COURSE APIs ====================

  // Lấy tất cả khóa học đã xuất bản
  getAllPublishedCourses: () => {
    return axiosClient.get("/api/v1/courses");
  },

  // Lấy chi tiết khóa học theo ID
  getCourseById: (id) => {
    return axiosClient.get(`/api/v1/courses/${id}`);
  },

  // Tìm kiếm khóa học
  searchCourses: (keyword) => {
    return axiosClient.get("/api/v1/courses/search", {
      params: { keyword },
    });
  },

  // ==================== SECTION MANAGEMENT ====================

  // Lấy tất cả sections của một khóa học
  getSectionsByCourseId: (courseId) => {
    return axiosClient.get(`/api/v1/sections/course/${courseId}`);
  },

  // Lấy chi tiết section theo ID
  getSectionById: (id) => {
    return axiosClient.get(`/api/v1/sections/${id}`);
  },

  // Tạo section mới
  createSection: (sectionData) => {
    return axiosClient.post("/api/v1/sections", sectionData);
  },

  // Cập nhật section
  updateSection: (id, sectionData) => {
    return axiosClient.put(`/api/v1/sections/${id}`, sectionData);
  },

  // Xóa section
  deleteSection: (id) => {
    return axiosClient.delete(`/api/v1/sections/${id}`);
  },

  // ==================== LESSON MANAGEMENT ====================

  // Lấy tất cả lessons của một section
  getLessonsBySectionId: (sectionId) => {
    return axiosClient.get(`/api/v1/lessons/section/${sectionId}`);
  },

  // Lấy chi tiết lesson theo ID
  getLessonById: (id) => {
    return axiosClient.get(`/api/v1/lessons/${id}`);
  },

  // Tạo lesson mới
  createLesson: (lessonData) => {
    return axiosClient.post("/api/v1/lessons", lessonData);
  },

  // Cập nhật lesson
  updateLesson: (id, lessonData) => {
    return axiosClient.put(`/api/v1/lessons/${id}`, lessonData);
  },

  // Xóa lesson
  deleteLesson: (id) => {
    return axiosClient.delete(`/api/v1/lessons/${id}`);
  },

  // ==================== ENROLLMENT MANAGEMENT ====================

  // Đăng ký khóa học
  enrollCourse: (enrollmentData) => {
    return axiosClient.post("/api/v1/enrollments", enrollmentData);
  },

  // Lấy thông tin đăng ký theo ID
  getEnrollmentById: (id) => {
    return axiosClient.get(`/api/v1/enrollments/${id}`);
  },

  // Lấy danh sách đăng ký của user
  getUserEnrollments: (userId) => {
    return axiosClient.get(`/api/v1/enrollments/user/${userId}`);
  },

  // Lấy danh sách đăng ký của khóa học
  getCourseEnrollmentsList: (courseId) => {
    return axiosClient.get(`/api/v1/enrollments/course/${courseId}`);
  },

  // Lấy khóa học của tôi
  getMyEnrollments: () => {
    return axiosClient.get("/api/v1/enrollments/my-courses");
  },

  // Cập nhật tiến độ học tập
  updateProgress: (id, progress) => {
    return axiosClient.put(`/api/v1/enrollments/${id}/progress`, null, {
      params: { progress },
    });
  },

  // Hủy đăng ký khóa học
  cancelEnrollment: (id) => {
    return axiosClient.delete(`/api/v1/enrollments/${id}`);
  },

  // Kiểm tra đã đăng ký hay chưa
  checkEnrollment: (userId, courseId) => {
    return axiosClient.get("/api/v1/enrollments/check", {
      params: { userId, courseId },
    });
  },

  // ==================== REVIEW MANAGEMENT ====================

  // Thêm đánh giá
  addReview: (reviewData) => {
    return axiosClient.post("/api/v1/reviews", reviewData);
  },

  // Lấy chi tiết đánh giá theo ID
  getReviewById: (id) => {
    return axiosClient.get(`/api/v1/reviews/${id}`);
  },

  // Lấy danh sách đánh giá của khóa học
  getCourseReviews: (courseId) => {
    return axiosClient.get(`/api/v1/reviews/course/${courseId}`);
  },

  // Lấy điểm trung bình của khóa học
  getAverageRating: (courseId) => {
    return axiosClient.get(`/api/v1/reviews/course/${courseId}/rating`);
  },

  // Cập nhật đánh giá
  updateReview: (id, reviewData) => {
    return axiosClient.put(`/api/v1/reviews/${id}`, reviewData);
  },

  // Xóa đánh giá
  deleteReview: (id) => {
    return axiosClient.delete(`/api/v1/reviews/${id}`);
  },

  // ==================== UTILITY METHODS ====================

  // Upload hình ảnh khóa học
  uploadCourseImage: (file) => {
    const formData = new FormData();
    formData.append("file", file);

    return axiosClient.post("/api/v1/upload/course-image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  // Upload video bài học
  uploadLessonVideo: (file) => {
    const formData = new FormData();
    formData.append("file", file);

    return axiosClient.post("/api/v1/upload/lesson-video", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
};

export default courseApi;
