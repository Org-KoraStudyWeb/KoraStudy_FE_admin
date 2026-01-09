import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import reviewService from "../../services/ReviewService";
import ReviewList from "../../components/review/ReviewList";
import ReviewFilter from "../../components/review/ReviewFilter";
import ReviewDetail from "../../components/review/ReviewDetail";
import ReviewStats from "../../components/review/ReviewStats";

const ReviewListContainer = () => {
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReview, setSelectedReview] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [stats, setStats] = useState(null);

  // Pagination
  const [pagination, setPagination] = useState({
    page: 0,
    size: 20,
    totalElements: 0,
    totalPages: 0,
  });

  // Filters
  const [filters, setFilters] = useState({
    targetType: "",
    status: "",
    search: "",
  });

  // Fetch reviews
  const fetchReviews = async () => {
    setIsLoading(true);

    try {
      const params = {
        page: pagination.page,
        size: pagination.size,
        targetType: filters.targetType || null,
        status: filters.status || null,
        keyword: filters.search || null,
      };

      const result = await reviewService.getAllReviews(params);
      if (result.success) {
        // Backend trả về PagedResponse object, cần extract content array
        const reviewList = result.data?.content || result.data || [];
        setReviews(Array.isArray(reviewList) ? reviewList : []);

        if (result.pagination) {
          setPagination({
            page: result.pagination.page,
            size: result.pagination.size,
            totalElements: result.pagination.totalElements,
            totalPages: result.pagination.totalPages,
          });
        }
      } else {
        toast.error(result.message || "Lỗi khi tải danh sách đánh giá");
        setReviews([]);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
      toast.error("Lỗi khi tải danh sách đánh giá");
      setReviews([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch stats
  const fetchStats = async () => {
    try {
      console.log("📊 Fetching review stats...");
      const result = await reviewService.getReviewStats();
      console.log("📊 Stats result:", result);

      if (result.success && result.data) {
        console.log("✅ Stats loaded successfully:", result.data);

        // Ensure numeric values
        const statsData = {
          totalReviews: result.data.totalReviews || 0,
          totalCourseReviews: result.data.courseReviews || 0,
          totalMockTestReviews: result.data.mockTestReviews || 0,
          totalNewsReviews: result.data.newsReviews || 0,
          averageRating: parseFloat(result.data.averageRating) || 0,
          todayReviews: result.data.todayReviews || 0,
          reportedReviews: result.data.reportedReviews || 0,
          hiddenReviews: result.data.hiddenReviews || 0,
        };

        console.log("🎯 Processed stats:", statsData);
        setStats(statsData);
      } else {
        console.warn("⚠️ Stats fetch failed:", result.message);
        setStats(null);
      }
    } catch (error) {
      console.error("❌ Error fetching stats:", error);
      console.error("Error details:", error.response?.data || error.message);
      setStats(null);
    }
  };

  // Initial load
  useEffect(() => {
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-fetch reviews when filters or page change
  useEffect(() => {
    fetchReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, pagination.page]);

  // Handle filter
  const handleFilter = (newFilters) => {
    // Reset to page 0 when filters change
    setPagination((p) => ({ ...p, page: 0 }));
    setFilters(newFilters);
  };

  // Handle view detail
  const handleViewDetail = async (reviewId) => {
    try {
      const result = await reviewService.getReviewDetail(reviewId);
      if (result.success) {
        setSelectedReview(result.data);
        setShowDetailModal(true);
      } else {
        toast.error(result.message || "Lỗi khi lấy thông tin đánh giá");
      }
    } catch (error) {
      console.error("Error fetching review detail:", error);
      toast.error("Lỗi khi lấy thông tin đánh giá");
    }
  };

  // Handle status change
  const handleStatusChange = async (reviewId, newStatus) => {
    try {
      const result = await reviewService.updateReviewStatus(reviewId, {
        status: newStatus,
      });

      if (result.success) {
        toast.success(result.message || "Cập nhật trạng thái thành công");
        // Update the review in the list
        setReviews(
          reviews.map((r) =>
            r.id === reviewId ? { ...r, status: newStatus } : r
          )
        );
        // Update selected review if open
        if (selectedReview && selectedReview.id === reviewId) {
          setSelectedReview({ ...selectedReview, status: newStatus });
        }
        // Refresh stats
        fetchStats();
      } else {
        toast.error(result.message || "Lỗi khi cập nhật trạng thái");
      }
    } catch (error) {
      console.error("Error updating review status:", error);
      toast.error("Lỗi khi cập nhật trạng thái");
    }
  };

  // Handle delete
  const handleDelete = async (reviewId) => {
    if (!window.confirm("Bạn chắc chắn muốn xóa vĩnh viễn đánh giá này?")) {
      return;
    }

    try {
      const result = await reviewService.deleteReview(reviewId);

      if (result.success) {
        toast.success(result.message || "Xóa đánh giá thành công");
        // Remove from list
        setReviews(reviews.filter((r) => r.id !== reviewId));
        // Refresh stats from server
        fetchStats();
        // Close modal if open
        if (selectedReview && selectedReview.id === reviewId) {
          setShowDetailModal(false);
          setSelectedReview(null);
        }
      } else {
        toast.error(result.message || "Lỗi khi xóa đánh giá");
      }
    } catch (error) {
      console.error("Error deleting review:", error);
      toast.error("Lỗi khi xóa đánh giá");
    }
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    setPagination((p) => ({ ...p, page: newPage }));
  };

  return (
    <div className="space-y-6 p-4">
      {/* Stats */}
      {stats && <ReviewStats stats={stats} />}

      {/* Filter */}
      <ReviewFilter onFilter={handleFilter} isLoading={isLoading} />

      {/* List */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">
              Danh sách đánh giá
              {pagination.totalElements > 0 && (
                <span className="text-sm text-gray-500 ml-2">
                  ({pagination.totalElements} kết quả)
                </span>
              )}
            </h2>
            <div className="text-sm text-gray-600">
              Trang {pagination.page + 1} / {Math.max(pagination.totalPages, 1)}
            </div>
          </div>
        </div>

        <ReviewList
          reviews={reviews}
          onViewDetail={handleViewDetail}
          onStatusChange={handleStatusChange}
          onDelete={handleDelete}
          isLoading={isLoading}
        />

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Hiển thị {Math.min(pagination.size, reviews.length)} trong số{" "}
                {pagination.totalElements} đánh giá
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 0}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ← Trước
                </button>

                <div className="flex gap-1">
                  {Array.from({
                    length: Math.min(5, pagination.totalPages),
                  }).map((_, i) => {
                    let pageNum;
                    if (pagination.totalPages <= 5) {
                      pageNum = i;
                    } else if (pagination.page < 3) {
                      pageNum = i;
                    } else if (pagination.page > pagination.totalPages - 4) {
                      pageNum = pagination.totalPages - 5 + i;
                    } else {
                      pageNum = pagination.page - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-10 h-10 rounded-lg transition-colors ${
                          pagination.page === pageNum
                            ? "bg-blue-600 text-white"
                            : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {pageNum + 1}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages - 1}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sau →
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && (
        <ReviewDetail
          review={selectedReview}
          onClose={() => setShowDetailModal(false)}
          onStatusChange={handleStatusChange}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
};

export default ReviewListContainer;
