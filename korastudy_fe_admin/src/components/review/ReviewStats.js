import React from "react";
import { Star, MessageSquare, TrendingUp, Users, EyeOff } from "lucide-react";

const ReviewStats = ({ stats }) => {
  if (!stats) return null;

  const statCards = [
    {
      title: "Tổng đánh giá",
      value: stats.totalReviews || 0,
      icon: <MessageSquare size={24} />,
      iconBgColor: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      title: "Khóa học",
      value: stats.totalCourseReviews || 0,
      icon: <Users size={24} />,
      iconBgColor: "bg-emerald-100",
      iconColor: "text-emerald-600",
    },
    {
      title: "Bài thi",
      value: stats.totalMockTestReviews || 0,
      icon: <TrendingUp size={24} />,
      iconBgColor: "bg-purple-100",
      iconColor: "text-purple-600",
    },
    {
      title: "Bài viết",
      value: stats.totalNewsReviews || 0,
      icon: <MessageSquare size={24} />,
      iconBgColor: "bg-blue-50",
      iconColor: "text-blue-500",
    },
    {
      title: "Rating trung bình",
      value: stats.averageRating ? stats.averageRating.toFixed(1) : "0.0",
      icon: <Star size={24} />,
      iconBgColor: "bg-yellow-100",
      iconColor: "text-yellow-600",
    },
    {
      title: "Đã ẩn",
      value: stats.hiddenReviews || 0,
      icon: <EyeOff size={24} />,
      iconBgColor: "bg-gray-100",
      iconColor: "text-gray-600",
    },
  ];

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        📊 Thống kê đánh giá
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="bg-white p-6 rounded-lg border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                {stat.title === "Rating trung bình" && (
                  <div className="flex items-center mt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className={`text-lg ${
                          star <= (stats.averageRating || 0)
                            ? "text-yellow-400"
                            : "text-gray-300"
                        }`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div
                className={`w-12 h-12 ${stat.iconBgColor} rounded-lg flex items-center justify-center`}
              >
                <div className={stat.iconColor}>{stat.icon}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewStats;
