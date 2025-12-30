import React, { useState } from "react";
import {
  X,
  Mail,
  Check,
  EyeOff,
  Trash2,
  Loader,
  ThumbsUp,
  AlertTriangle,
} from "lucide-react";
import reviewService from "../../services/ReviewService";

const ReviewDetail = ({
  review,
  onClose,
  onStatusChange,
  onDelete,
  isLoading,
}) => {
  const [isModalLoading, setIsModalLoading] = useState(false);

  if (!review) {
    return null;
  }

  const getStatusBadge = (status) => {
    const labels = reviewService.getReviewStatusLabel(status);
    const colors = {
      ACTIVE: "bg-green-100 text-green-800 border border-green-300",
      REPORTED: "bg-yellow-100 text-yellow-800 border border-yellow-300",
      HIDDEN: "bg-gray-100 text-gray-800 border border-gray-300",
      DELETED: "bg-red-100 text-red-800 border border-red-300",
    };

    return (
      <span
        className={`px-4 py-2 rounded-full text-sm font-semibold ${
          colors[status] || colors.ACTIVE
        }`}
      >
        {labels.label}
      </span>
    );
  };

  const getTypeLabel = (type) => {
    const labels = {
      COURSE: "Khóa học",
      MOCK_TEST: "Bài thi thử",
    };
    return labels[type] || type;
  };

  const getRatingLabel = (rating) => {
    return reviewService.getRatingLabel(rating);
  };

  const getRatingStars = (rating) => {
    return reviewService.generateStars(rating);
  };

  const formatDate = (dateString) => {
    return reviewService.formatDate(dateString, true);
  };

  const handleStatusChange = async (newStatus) => {
    setIsModalLoading(true);
    await onStatusChange(review.id, newStatus);
    setIsModalLoading(false);
  };

  const handleDelete = async () => {
    if (
      window.confirm(
        "Bạn chắc chắn muốn xóa vĩnh viễn đánh giá này không? Không thể hoàn tác!"
      )
    ) {
      setIsModalLoading(true);
      await onDelete(review.id);
      setIsModalLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gray-50 border-b border-gray-200 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            Chi tiết Đánh giá
          </h2>
          <button
            onClick={onClose}
            disabled={isModalLoading}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Thông tin cơ bản */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-600 block mb-1">
                ID Đánh giá
              </label>
              <p className="text-lg text-gray-900 font-mono bg-gray-50 p-3 rounded">
                {review.id}
              </p>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600 block mb-1">
                Trạng thái
              </label>
              <div>{getStatusBadge(review.status)}</div>
            </div>
          </div>

          {/* Thông tin đối tượng */}
          <div>
            <label className="text-sm font-semibold text-gray-600 block mb-2">
              Đối tượng đánh giá
            </label>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-600">Loại:</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {getTypeLabel(review.targetType)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">ID Đối tượng:</p>
                  <p className="text-lg font-mono text-gray-900">
                    {review.targetId}
                  </p>
                </div>
              </div>
              {review.targetTitle && (
                <div>
                  <p className="text-sm text-gray-600">Tên:</p>
                  <p className="text-base text-gray-900">
                    {review.targetTitle}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Thông tin rating */}
          <div>
            <label className="text-sm font-semibold text-gray-600 block mb-2">
              Đánh giá sao
            </label>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-4">
                <div className="text-4xl font-bold text-yellow-600">
                  {review.rating}
                </div>
                <div>
                  <p className="text-2xl text-yellow-500">
                    {getRatingStars(review.rating)}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {getRatingLabel(review.rating)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Nội dung */}
          <div>
            <label className="text-sm font-semibold text-gray-600 block mb-2">
              Nội dung đánh giá
            </label>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-32 overflow-y-auto">
              <p className="text-gray-800 whitespace-pre-wrap">
                {review.comment}
              </p>
            </div>
          </div>

          {/* Likes và Reports */}
          <div className="grid grid-cols-2 gap-4">
            {/* Likes Section */}
            <div>
              <label className="text-sm font-semibold text-gray-600 block mb-2 flex items-center gap-2">
                <ThumbsUp size={16} className="text-blue-600" />
                Lượt thích
              </label>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-3xl font-bold text-blue-600 mb-3">
                  {review.likesCount || 0}
                </p>
                {review.likedUserIds && review.likedUserIds.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-gray-600 mb-2">
                      Những người đã thích ({review.likedUserIds.length}):
                    </p>
                    <div className="max-h-24 overflow-y-auto space-y-1">
                      {review.likedUserIds.map((userId, idx) => (
                        <div
                          key={idx}
                          className="text-xs text-gray-700 bg-white p-1 rounded border border-blue-100"
                        >
                          <p className="font-mono">User ID: {userId}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 italic">
                    Chưa có lượt thích
                  </p>
                )}
              </div>
            </div>

            {/* Reports Section */}
            <div>
              <label className="text-sm font-semibold text-gray-600 block mb-2 flex items-center gap-2">
                <AlertTriangle size={16} className="text-red-600" />
                Báo cáo
              </label>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-3xl font-bold text-red-600 mb-3">
                  {review.reportsCount || 0}
                </p>
                {review.reportDetails && review.reportDetails.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-gray-600 mb-2">
                      Chi tiết báo cáo:
                    </p>
                    <div className="max-h-24 overflow-y-auto space-y-1">
                      {review.reportDetails.map((report, idx) => (
                        <div
                          key={idx}
                          className="text-xs text-gray-700 bg-white p-2 rounded border border-red-100"
                        >
                          <p className="font-medium">{report.username}</p>
                          <p className="text-gray-600 text-xs">
                            {report.reason}
                          </p>
                          <p className="text-gray-500 text-xs">
                            {new Date(report.reportedAt).toLocaleDateString(
                              "vi-VN"
                            )}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 italic">
                    Chưa có báo cáo nào
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Thông tin người đánh giá */}
          <div>
            <label className="text-sm font-semibold text-gray-600 block mb-2">
              Người đánh giá
            </label>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-4">
                <img
                  src={
                    review.userAvatar ||
                    `https://ui-avatars.com/api/?name=${review.username}&background=random`
                  }
                  alt={review.username}
                  className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md"
                />
                <div className="flex-1">
                  <p className="text-lg font-bold text-gray-900">
                    {review.username}
                  </p>
                  <p className="text-sm text-gray-500 font-mono">
                    User ID: {review.userId}
                  </p>
                </div>
              </div>
              {review.reviewerInfo && (
                <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-semibold text-gray-700 flex items-center gap-2">
                      <Mail size={14} /> Email
                    </p>
                    <p className="text-gray-600">{review.reviewerInfo.email}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-700">Ngày tham gia</p>
                    <p className="text-gray-600">
                      {formatDate(review.reviewerInfo.joinedDate)}
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-700">Tổng đánh giá</p>
                    <p className="text-gray-600">
                      {review.reviewerInfo.totalReviews}
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-700">
                      Tổng lượt thích nhận được
                    </p>
                    <p className="text-gray-600">
                      {review.reviewerInfo.totalLikes}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Thời gian */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-600 block mb-1">
                Ngày tạo
              </label>
              <p className="text-gray-900 bg-gray-50 p-2 rounded text-sm">
                {formatDate(review.createdAt)}
              </p>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600 block mb-1">
                Cập nhật lần cuối
              </label>
              <p className="text-gray-900 bg-gray-50 p-2 rounded text-sm">
                {formatDate(review.lastModified)}
              </p>
            </div>
          </div>

          {/* Nút hành động */}
          <div className="border-t border-gray-200 pt-6">
            <label className="text-sm font-semibold text-gray-600 block mb-4">
              Hành động
            </label>
            <div className="flex gap-3 flex-wrap">
              {review.status === "ACTIVE" && (
                <button
                  onClick={() => handleStatusChange("HIDDEN")}
                  disabled={isModalLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-400 transition-colors"
                >
                  <EyeOff size={18} />
                  Ẩn đánh giá
                </button>
              )}

              {review.status === "HIDDEN" && (
                <button
                  onClick={() => handleStatusChange("ACTIVE")}
                  disabled={isModalLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors"
                >
                  <Check size={18} />
                  Khôi phục
                </button>
              )}

              {review.status === "REPORTED" && (
                <button
                  onClick={() => handleStatusChange("ACTIVE")}
                  disabled={isModalLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors"
                >
                  <Check size={18} />
                  Phê duyệt
                </button>
              )}

              <button
                onClick={handleDelete}
                disabled={isModalLoading}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 transition-colors"
              >
                <Trash2 size={18} />
                Xóa vĩnh viễn
              </button>

              <button
                onClick={onClose}
                disabled={isModalLoading}
                className="flex items-center gap-2 px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 disabled:bg-gray-400 transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>

        {/* Loading overlay */}
        {isModalLoading && (
          <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center rounded-lg">
            <div className="flex flex-col items-center gap-3 bg-white p-6 rounded-lg">
              <Loader className="animate-spin text-blue-600" size={32} />
              <p className="text-gray-700 font-medium">Đang xử lý...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewDetail;
