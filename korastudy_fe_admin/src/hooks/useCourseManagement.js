// src/hooks/useCourseManagement.js
import { useState, useEffect, useCallback } from "react";
import CourseService from "../services/CourseService";

const useCourseManagement = () => {
  // States
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState({
    sortBy: "id",
    sortDir: "desc",
    search: "",
  });
  const [stats, setStats] = useState({
    totalCourses: 0,
    publishedCourses: 0,
    unpublishedCourses: 0,
    totalEnrollments: 0,
  });

  // src/hooks/useCourseManagement.js
  const loadCourses = useCallback(
    async (page = 1, params = {}) => {
      setLoading(true);
      setError(null);
      try {
        const keyword = (
          params.keyword ??
          params.search ??
          filters.search ??
          ""
        ).trim();

        const queryParams = {
          page: page - 1,
          size: pagination.pageSize,
          sortBy: params.sortBy || filters.sortBy,
          sortDir: params.sortDir || filters.sortDir,
          keyword,
        };

        const response = await CourseService.getAllCoursesAdmin(queryParams);
        console.log("API Response:", response); // Log response

        if (response.success) {
          const data = response.data;
          console.log("Course Data:", data); // Log raw data

          // ✅ Ép kiểu published (0/1, "0"/"1", boolean) thành true/false
          const normalizedCourses = (data.content || data).map((course) => {
            // Convert từ boolean thành số (1/0)
            const normalized = {
              ...course,
              published: course.published === true ? 1 : 0,
            };
            console.log(
              `Course ${course.id}:`,
              course.published,
              "→",
              normalized.published,
              `(type: ${typeof normalized.published})`
            );
            return normalized;
          });

          setCourses(normalizedCourses);
          setPagination((prev) => ({
            ...prev,
            current: page,
            total: data.totalElements ?? data.length ?? 0,
            totalPages:
              data.totalPages ?? Math.ceil((data.length ?? 0) / prev.pageSize),
          }));
        } else {
          throw new Error(response.message);
        }
      } catch (err) {
        setError(err.message || "Có lỗi xảy ra khi tải danh sách khóa học");
        setCourses([]);
      } finally {
        setLoading(false);
      }
    },
    [filters, pagination.pageSize]
  );

  // Load course stats
  const loadStats = useCallback(async () => {
    try {
      const response = await CourseService.getCourseStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (err) {
      console.error("Error loading stats:", err);
    }
  }, []);

  // Create course
  const createCourse = useCallback(
    async (courseData) => {
      setLoading(true);
      try {
        const response = await CourseService.createCourse(courseData);
        if (response.success) {
          await loadCourses(pagination.current);
          await loadStats();
          return {
            success: true,
            data: response.data,
            message: response.message,
          };
        } else {
          return { success: false, message: response.message };
        }
      } catch (err) {
        return { success: false, message: err.message };
      } finally {
        setLoading(false);
      }
    },
    [loadCourses, loadStats, pagination]
  );

  // Update course
  const updateCourse = useCallback(
    async (id, courseData) => {
      setLoading(true);
      try {
        const response = await CourseService.updateCourse(id, courseData);
        if (response.success) {
          await loadCourses(pagination.current);
          return {
            success: true,
            data: response.data,
            message: response.message,
          };
        } else {
          return { success: false, message: response.message };
        }
      } catch (err) {
        return { success: false, message: err.message };
      } finally {
        setLoading(false);
      }
    },
    [loadCourses, pagination]
  );

  // Delete course
  const deleteCourse = useCallback(
    async (id) => {
      setLoading(true);
      try {
        const response = await CourseService.deleteCourse(id);
        if (response.success) {
          await loadCourses(pagination.current);
          await loadStats();
          return { success: true, message: response.message };
        } else {
          return { success: false, message: response.message };
        }
      } catch (err) {
        return { success: false, message: err.message };
      } finally {
        setLoading(false);
      }
    },
    [loadCourses, loadStats, pagination]
  );

  // Toggle publish status
  const togglePublishCourse = useCallback(
    async (id, currentStatus) => {
      setLoading(true);
      try {
        // Convert số sang boolean cho API
        const newStatus = currentStatus !== 1;
        console.log("Toggle status:", {
          id,
          currentStatus,
          newStatus,
          currentType: typeof currentStatus,
          newType: typeof newStatus,
        });

        const response = await CourseService.togglePublishCourse(id, newStatus);
        if (response.success) {
          await loadCourses(pagination.current);
          await loadStats();
          return {
            success: true,
            message: `Khóa học đã được ${
              newStatus ? "xuất bản" : "chuyển về nháp"
            }`,
          };
        } else {
          return { success: false, message: response.message };
        }
      } catch (err) {
        console.error("Toggle error:", err);
        return { success: false, message: err.message };
      } finally {
        setLoading(false);
      }
    },
    [loadCourses, loadStats, pagination]
  );

  // Get course by ID
  const getCourse = useCallback(async (id) => {
    setLoading(true);
    try {
      const response = await CourseService.getCourseById(id);
      return response;
    } catch (err) {
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Search courses
  const searchCourses = useCallback(
    async (kw) => {
      setLoading(true);
      try {
        const keyword = (kw || "").trim();
        setFilters((prev) => ({ ...prev, search: keyword })); // giữ state
        await loadCourses(1, { keyword }); // <— QUAN TRỌNG: gọi với keyword
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [loadCourses]
  );
  // Change page
  const changePage = useCallback(
    (page, pageSize) => {
      setPagination((prev) => ({
        ...prev,
        current: page,
        pageSize: pageSize || prev.pageSize,
      }));
      loadCourses(page);
    },
    [loadCourses]
  );

  // Change filters
  const changeFilters = useCallback(
    (newFilters) => {
      setFilters((prev) => ({ ...prev, ...newFilters }));
      loadCourses(1, newFilters);
    },
    [loadCourses]
  );

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Initial load
  useEffect(() => {
    loadCourses();
    loadStats();
  }, [loadCourses, loadStats]);

  return {
    // States
    courses,
    loading,
    error,
    pagination,
    filters,
    stats,

    // Actions
    loadCourses,
    loadStats,
    createCourse,
    updateCourse,
    deleteCourse,
    togglePublishCourse,
    getCourse,
    searchCourses,
    changePage,
    changeFilters,
    clearError,
  };
};

export default useCourseManagement;
