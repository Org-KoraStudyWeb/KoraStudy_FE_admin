// src/hooks/useCourseManagement.js
import { useState, useEffect, useCallback } from 'react';
import CourseService from '../services/CourseService';

const useCourseManagement = () => {
  // States
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0
  });
  const [filters, setFilters] = useState({
    sortBy: 'id',
    sortDir: 'desc',
    search: ''
  });
  const [stats, setStats] = useState({
    totalCourses: 0,
    publishedCourses: 0,
    unpublishedCourses: 0,
    totalEnrollments: 0
  });

  // Load courses
  const loadCourses = useCallback(async (page = 1, params = {}) => {
    setLoading(true);
    setError(null);

    try {
      const queryParams = {
        page: page - 1, // Backend uses 0-based pagination
        size: pagination.pageSize,
        sortBy: params.sortBy || filters.sortBy,
        sortDir: params.sortDir || filters.sortDir,
        ...params
      };

      const response = await CourseService.getAllCoursesAdmin(queryParams);

      if (response.success) {
        setCourses(response.data.content || response.data);
        setPagination(prev => ({
          ...prev,
          current: page,
          total: response.data.totalElements || response.data.length,
          totalPages: response.data.totalPages || Math.ceil(response.data.length / prev.pageSize)
        }));
      } else {
        throw new Error(response.message);
      }
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra khi tải danh sách khóa học');
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.pageSize]);

  // Load course stats
  const loadStats = useCallback(async () => {
    try {
      const response = await CourseService.getCourseStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  }, []);

  // Create course
  const createCourse = useCallback(async (courseData) => {
    setLoading(true);
    try {
      const response = await CourseService.createCourse(courseData);
      if (response.success) {
        await loadCourses(pagination.current);
        await loadStats();
        return { success: true, data: response.data, message: response.message };
      } else {
        return { success: false, message: response.message };
      }
    } catch (err) {
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  }, [loadCourses, loadStats, pagination]);

  // Update course
  const updateCourse = useCallback(async (id, courseData) => {
    setLoading(true);
    try {
      const response = await CourseService.updateCourse(id, courseData);
      if (response.success) {
        await loadCourses(pagination.current);
        return { success: true, data: response.data, message: response.message };
      } else {
        return { success: false, message: response.message };
      }
    } catch (err) {
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  }, [loadCourses, pagination]);

  // Delete course
  const deleteCourse = useCallback(async (id) => {
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
  }, [loadCourses, loadStats, pagination]);

  // Toggle publish status
  const togglePublishCourse = useCallback(async (id, isPublished) => {
    setLoading(true);
    try {
      const response = await CourseService.togglePublishCourse(id, isPublished);
      if (response.success) {
        await loadCourses(pagination.current);
        await loadStats();
        return { success: true, data: response.data, message: response.message };
      } else {
        return { success: false, message: response.message };
      }
    } catch (err) {
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  }, [loadCourses, loadStats, pagination]);

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
  const searchCourses = useCallback(async (keyword) => {
    setLoading(true);
    try {
      setFilters(prev => ({ ...prev, search: keyword }));
      await loadCourses(1, { search: keyword });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [loadCourses]);

  // Change page
  const changePage = useCallback((page, pageSize) => {
    setPagination(prev => ({ ...prev, current: page, pageSize: pageSize || prev.pageSize }));
    loadCourses(page);
  }, [loadCourses]);

  // Change filters
  const changeFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    loadCourses(1, newFilters);
  }, [loadCourses]);

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
    clearError
  };
};

export default useCourseManagement;
