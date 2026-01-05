// src/hooks/useCourseManagement.js
import { useState, useEffect, useCallback, useRef } from "react";
import CourseService from "../services/CourseService";

const useCourseManagement = () => {
  // States
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 5,
    total: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState({
    sortBy: "id",
    sortDir: "desc",
    search: "",
    level: null,        // NEW: Filter by level (Beginner/Intermediate/Advanced)
    minPrice: null,     // NEW: Filter by min price
    maxPrice: null,     // NEW: Filter by max price
    isPublished: null,  // NEW: Filter by published status (true/false/null for all)
  });
  const [stats, setStats] = useState({
    totalCourses: 0,
    publishedCourses: 0,
    unpublishedCourses: 0,
    totalEnrollments: 0,
  });

  //  FIX: Dùng ref để tránh dependency warnings
  const paginationRef = useRef(pagination);
  const filtersRef = useRef(filters);

  // Update refs khi state thay đổi
  useEffect(() => {
    paginationRef.current = pagination;
  }, [pagination]);

  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  // Load courses - ĐÃ FIX với ref
  const loadCourses = useCallback(
    async (page = paginationRef.current.current, params = {}) => {
      setLoading(true);
      setError(null);
      try {
        const currentFilters = filtersRef.current;
        const currentPagination = paginationRef.current;

        const keyword = (
          params.keyword ??
          params.search ??
          currentFilters.search ??
          ""
        ).trim();

        const queryParams = {
          page: page - 1,
          size: currentPagination.pageSize,
          sortBy: params.sortBy || currentFilters.sortBy,
          sortDir: params.sortDir || currentFilters.sortDir,
          keyword,
          // NEW: Add filter parameters
          level: params.level !== undefined ? params.level : currentFilters.level,
          minPrice: params.minPrice !== undefined ? params.minPrice : currentFilters.minPrice,
          maxPrice: params.maxPrice !== undefined ? params.maxPrice : currentFilters.maxPrice,
          isPublished: params.isPublished !== undefined ? params.isPublished : currentFilters.isPublished,
        };

        const response = await CourseService.getAllCoursesAdmin(queryParams);

        if (response.success) {
          const data = response.data;

          const coursesData = Array.isArray(data) ? data : data.content || [];
          const totalElements =
            data.totalElements || data.total || coursesData.length;
          const totalPages =
            data.totalPages ||
            Math.ceil(totalElements / currentPagination.pageSize);

          const normalizedCourses = coursesData.map((course) => ({
            ...course,
            published: Boolean(course.published),
          }));

          setCourses(normalizedCourses);
          setPagination((prev) => ({
            ...prev,
            current: page,
            total: totalElements,
            totalPages: totalPages,
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
    [] //  KHÔNG CÒN DEPENDENCIES!
  );

  // Load course stats
  const loadStats = useCallback(async () => {
    try {
      const response = await CourseService.getCourseStats();
      if (response.success) {
        setStats(response.data);
      } else {
        console.error("Stats API error:", response.message);
      }
    } catch (err) {
      console.error("Error loading stats:", err);
    }
  }, []);

  // Create course - ĐÃ FIX
  const createCourse = useCallback(
    async (courseData) => {
      setLoading(true);
      try {
        const response = await CourseService.createCourse(courseData);
        if (response.success) {
          await loadCourses(1);
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
    [loadCourses, loadStats]
  );

  // Update course - ĐÃ FIX
  const updateCourse = useCallback(
    async (id, courseData) => {
      setLoading(true);
      try {
        const response = await CourseService.updateCourse(id, courseData);
        if (response.success) {
          await loadCourses(); // Dùng current page từ ref
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
    [loadCourses]
  );

  // Delete course - ĐÃ FIX
  const deleteCourse = useCallback(
    async (id) => {
      setLoading(true);
      try {
        const response = await CourseService.deleteCourse(id);
        if (response.success) {
          await loadCourses(1);
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
    [loadCourses, loadStats]
  );

  // Toggle publish status - ĐÃ FIX
  const togglePublishCourse = useCallback(
    async (id, isPublished) => {
      setLoading(true);
      try {
        const response = await CourseService.togglePublishCourse(
          id,
          isPublished
        );
        if (response.success) {
          await loadCourses();
          await loadStats();
          return {
            success: true,
            message: `Khóa học đã được ${
              isPublished ? "xuất bản" : "chuyển về nháp"
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
    [loadCourses, loadStats]
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

  // Search courses - ĐÃ FIX
  const searchCourses = useCallback(
    async (keyword) => {
      setLoading(true);
      try {
        const searchTerm = (keyword || "").trim();
        setFilters((prev) => ({ ...prev, search: searchTerm }));
        await loadCourses(1, { keyword: searchTerm });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [loadCourses]
  );

  // Change page - ĐÃ FIX
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

  // Change filters - ĐÃ FIX
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

  // Apply filters - NEW
  const applyFilters = useCallback(
    (filterValues) => {
      setFilters((prev) => ({ ...prev, ...filterValues }));
      loadCourses(1, filterValues);
    },
    [loadCourses]
  );

  // Reset filters - NEW
  const resetFilters = useCallback(() => {
    const defaultFilters = {
      sortBy: "id",
      sortDir: "desc",
      search: "",
      level: null,
      minPrice: null,
      maxPrice: null,
      isPublished: null,
    };
    setFilters(defaultFilters);
    loadCourses(1, defaultFilters);
  }, [loadCourses]);

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
    applyFilters,    // NEW
    resetFilters,    // NEW
  };
};

export default useCourseManagement;
