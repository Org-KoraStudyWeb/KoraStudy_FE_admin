import React from "react";
import {
  Eye,
  Trash2,
  AlertCircle,
  Check,
  EyeOff,
  Calendar,
  ThumbsUp,
  AlertTriangle,
} from "lucide-react";
import reviewService from "../../services/ReviewService";

const ReviewList = ({
  reviews,
  onViewDetail,
  onStatusChange,
  onDelete,
  isLoading,
}) => {
  const getStatusBadge = (status) => {
    const labels = reviewService.getReviewStatusLabel(status);
    const colors = {
      ACTIVE: "bg-emerald-50 text-emerald-700 border border-emerald-200",
      REPORTED: "bg-amber-50 text-amber-700 border border-amber-200",
      HIDDEN: "bg-gray-100 text-gray-700 border border-gray-300",
      DELETED: "bg-red-50 text-red-700 border border-red-200",
    };

    return (
      <span
        className={`px-3 py-1.5 rounded-full text-xs font-medium ${
          colors[status] || colors.ACTIVE
        }`}
      >
        {labels.label}
      </span>
    );
  };

  const getTypeBadge = (type) => {
    const labels = {
      COURSE: {
        text: "Khóa học",
        color: "bg-blue-50 text-blue-700 border border-blue-200",
      },
      MOCK_TEST: {
        text: "Bài thi",
        color: "bg-purple-50 text-purple-700 border border-purple-200",
      },
    };
    const label = labels[type] || {
      text: type,
      color: "bg-gray-50 text-gray-700 border border-gray-300",
    };

    return (
      <span
        className={`px-3 py-1.5 rounded-full text-xs font-medium ${label.color}`}
      >
        {label.text}
      </span>
    );
  };

  const getRatingStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          className={i <= rating ? "text-yellow-500" : "text-gray-300"}
        >
          ★
        </span>
      );
    }
    return stars;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const safeReviews = Array.isArray(reviews) ? reviews : [];

  if (isLoading) {
    return (
      <div className="py-12 text-center">
        <div className="inline-block animate-spin mb-4">
          <div className="h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full"></div>
        </div>
        <p className="text-gray-600 text-lg font-medium">Đang tải dữ liệu...</p>
        <p className="text-gray-500 text-sm mt-1">
          Vui lòng chờ trong giây lát
        </p>
      </div>
    );
  }

  if (!safeReviews || safeReviews.length === 0) {
    return (
      <div className="py-16 text-center">
        <AlertCircle size={64} className="mx-auto text-gray-400 mb-4" />
        <p className="text-gray-600 text-lg font-medium">
          Không tìm thấy đánh giá nào
        </p>
        <p className="text-gray-500 text-sm mt-1">
          Thử thay đổi bộ lọc hoặc thêm đánh giá mới
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr className="border-b border-gray-200">
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
              ID
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
              Thông tin
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
              Loại
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
              Đánh giá
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
              Thích
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
              Report
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
              Trạng thái
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
              Ngày tạo
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
              Hành động
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {safeReviews.map((review) => (
            <tr
              key={review.id}
              className="hover:bg-gray-50 transition-colors duration-150"
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="text-sm font-mono text-gray-900 bg-gray-100 px-2 py-1 rounded">
                  #{review.id}
                </span>
              </td>
              <td className="px-6 py-4">
                <div>
                  <p
                    className="text-sm font-medium text-gray-900"
                    title={review.targetTitle}
                  >
                    {review.targetTitle || "Không có tiêu đề"}
                  </p>
                  <p className="text-xs text-gray-500">ID: {review.targetId}</p>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {getTypeBadge(review.reviewType)}
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <div className="flex">{getRatingStars(review.rating)}</div>
                  <span className="text-sm font-semibold text-gray-900">
                    {review.rating}/5
                  </span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-2 text-sm">
                  <ThumbsUp size={14} className="text-blue-600" />
                  <span className="font-semibold text-gray-900">
                    {review.likesCount || 0}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-2 text-sm">
                  <AlertTriangle size={14} className="text-red-600" />
                  <span className="font-semibold text-gray-900">
                    {review.reportsCount || 0}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {getStatusBadge(review.status)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar size={14} />
                  {formatDate(review.createdAt)}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onViewDetail(review.id)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-blue-200"
                    title="Xem chi tiết"
                  >
                    <Eye size={18} />
                  </button>

                  {review.status === "ACTIVE" && (
                    <button
                      onClick={() => onStatusChange(review.id, "HIDDEN")}
                      className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors border border-amber-200"
                      title="Ẩn đánh giá"
                    >
                      <EyeOff size={18} />
                    </button>
                  )}

                  {review.status === "HIDDEN" && (
                    <button
                      onClick={() => onStatusChange(review.id, "ACTIVE")}
                      className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors border border-emerald-200"
                      title="Khôi phục"
                    >
                      <Check size={18} />
                    </button>
                  )}

                  <button
                    onClick={() => onDelete(review.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-200"
                    title="Xóa vĩnh viễn"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ReviewList;
