import React from "react";
import { TrendingUp, PieChart, BarChart3, Activity } from "lucide-react";

const ReviewDashboardCharts = ({
  data: dashboardStats,
  isLoading: loading,
}) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-center py-12">
          <div className="inline-block animate-spin">
            <div className="h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
          </div>
          <span className="ml-2 text-gray-600">Đang tải biểu đồ...</span>
        </div>
      </div>
    );
  }

  if (!dashboardStats) {
    return (
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
        <p className="text-gray-600">Không có dữ liệu</p>
      </div>
    );
  }

  // Lấy dữ liệu daily reviews (7 ngày)
  const dailyReviews = dashboardStats.dailyReviews || [0, 0, 0, 0, 0, 0, 0];
  const reviewsLast7Days = dashboardStats.reviewsLast7Days || 0;
  const reviewsLast30Days = dashboardStats.reviewsLast30Days || 0;
  const totalReviews = dashboardStats.totalReviews || 0;
  const averageRating = dashboardStats.averageRating || 0;

  const ratingDistribution = dashboardStats.ratingDistribution || {};

  // Tính max cho biểu đồ
  const maxDailyReviews = Math.max(...dailyReviews, 1);

  // Tạo labels cho 7 ngày
  const getDayLabels = () => {
    const dayNames = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
    const today = new Date();
    const labels = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dayName = dayNames[date.getDay()];
      const dayNumber = date.getDate();
      const month = date.getMonth() + 1;
      labels.push(`${dayName}\n${dayNumber}/${month}`);
    }

    return labels;
  };

  const dayLabels = getDayLabels();

  // Get rating data
  const ratingLabels = {
    1: "⭐",
    2: "⭐⭐",
    3: "⭐⭐⭐",
    4: "⭐⭐⭐⭐",
    5: "⭐⭐⭐⭐⭐",
  };

  const ratingColors = {
    1: "bg-red-500",
    2: "bg-orange-500",
    3: "bg-yellow-500",
    4: "bg-blue-500",
    5: "bg-green-500",
  };

  // Tính tổng số rating
  const totalRatingCount = Object.values(ratingDistribution).reduce(
    (sum, count) => sum + count,
    0
  );

  // Get recent activities data
  const recentActivities = dashboardStats.recentActivities || [];

  // Get top reviewed courses
  const topReviewedCourses = dashboardStats.topReviewedCourses || [];

  // Summary cards data
  const summaryCards = [
    {
      title: "Tổng đánh giá",
      value: totalReviews.toLocaleString(),
      icon: "📊",
      color: "blue",
      description: "Tất cả thời gian",
    },
    {
      title: "7 ngày qua",
      value: reviewsLast7Days.toLocaleString(),
      icon: "📈",
      color: "green",
      description: "So tuần trước: +12%",
    },
    {
      title: "30 ngày qua",
      value: reviewsLast30Days.toLocaleString(),
      icon: "📅",
      color: "purple",
      description: "So tháng trước: +8%",
    },
    {
      title: "Điểm trung bình",
      value: averageRating.toFixed(1),
      icon: "⭐",
      color: "yellow",
      description: "Trên 5 sao",
    },
  ];

  const getColorClass = (color) => {
    switch (color) {
      case "blue":
        return "bg-blue-100 text-blue-600";
      case "green":
        return "bg-green-100 text-green-600";
      case "purple":
        return "bg-purple-100 text-purple-600";
      case "yellow":
        return "bg-yellow-100 text-yellow-600";
      default:
        return "bg-blue-100 text-blue-600";
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {summaryCards.map((card, index) => (
          <div
            key={index}
            className="bg-white rounded-lg border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {card.title}
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {card.value}
                </p>
                <p className="text-xs text-gray-500 mt-2">{card.description}</p>
              </div>
              <div
                className={`w-12 h-12 ${getColorClass(
                  card.color
                )} rounded-lg flex items-center justify-center`}
              >
                <span className="text-xl">{card.icon}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Daily Reviews Chart */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-6">
          <BarChart3 size={24} className="text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            📈 Số lượng đánh giá 7 ngày gần nhất
          </h3>
          <div className="ml-auto text-sm text-gray-600">
            Tổng:{" "}
            <span className="font-bold text-blue-600">{reviewsLast7Days}</span>{" "}
            đánh giá
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-end justify-around h-64 gap-2 bg-gray-50 p-4 rounded-lg">
            {dailyReviews.map((count, index) => {
              const height = (count / maxDailyReviews) * 100;
              const dayLabel = dayLabels[index];

              return (
                <div key={index} className="flex flex-col items-center flex-1">
                  <div
                    className="w-full bg-gradient-to-t from-blue-500 to-blue-600 rounded-t-lg hover:from-blue-600 hover:to-blue-700 transition-all cursor-help group relative"
                    style={{ height: `${height}%`, minHeight: "20px" }}
                    title={`${dayLabel.replace("\n", " ")}: ${count} đánh giá`}
                  >
                    <div className="hidden group-hover:block absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded whitespace-nowrap z-10">
                      {count} đánh giá
                    </div>
                  </div>
                  <p className="text-xs font-medium text-gray-700 mt-2 whitespace-pre-line text-center">
                    {dayLabel}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-7 gap-2 text-center">
            {dailyReviews.map((count, index) => (
              <div key={index} className="p-2">
                <div className="text-sm font-semibold text-blue-600">
                  {count}
                </div>
                <div className="text-xs text-gray-500">đánh giá</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Rating Distribution Pie Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-6">
            <PieChart size={24} className="text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              ⭐ Phân bố Rating ({totalRatingCount} đánh giá)
            </h3>
          </div>

          <div className="space-y-4">
            {Object.keys(ratingLabels).map((rating) => {
              const count = ratingDistribution[rating] || 0;
              const percentage =
                totalRatingCount > 0
                  ? Math.round((count / totalRatingCount) * 100)
                  : 0;

              return (
                <div key={rating} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700">
                        {ratingLabels[rating]}
                      </span>
                      <span className="text-xs text-gray-500">({count})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-gray-900">
                        {percentage}%
                      </span>
                      <div className="w-24 bg-gray-200 rounded-full h-2.5">
                        <div
                          className={`h-full rounded-full ${ratingColors[rating]}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {totalRatingCount > 0 && (
              <div className="pt-4 mt-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    Điểm trung bình:
                  </span>
                  <span className="text-lg font-bold text-gray-900">
                    {averageRating.toFixed(1)}/5.0
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Top Reviewed Courses */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp size={24} className="text-emerald-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              🏆 Khóa học được đánh giá nhiều nhất
            </h3>
          </div>

          <div className="space-y-4">
            {topReviewedCourses.length > 0 ? (
              topReviewedCourses.slice(0, 5).map((course, index) => (
                <div
                  key={course.id || index}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div
                      className={`w-8 h-8 flex items-center justify-center rounded-lg ${
                        index === 0
                          ? "bg-yellow-100 text-yellow-600"
                          : index === 1
                          ? "bg-gray-100 text-gray-600"
                          : index === 2
                          ? "bg-orange-100 text-orange-600"
                          : "bg-blue-100 text-blue-600"
                      }`}
                    >
                      <span className="font-bold">{index + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {course.title || `Khóa học #${course.id}`}
                      </p>
                      {course.averageRating > 0 && (
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-xs text-yellow-500">⭐</span>
                          <span className="text-xs text-gray-600">
                            {course.averageRating.toFixed(1)}/5.0
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="ml-4 flex flex-col items-end">
                    <div className="flex items-center gap-1">
                      <span className="text-lg font-bold text-emerald-600">
                        {course.reviewCount || 0}
                      </span>
                      <TrendingUp size={14} className="text-emerald-500" />
                    </div>
                    <span className="text-xs text-gray-500">đánh giá</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm text-center py-4">
                Không có dữ liệu khóa học
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-6">
          <Activity size={24} className="text-orange-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            🔔 Hoạt động gần đây
          </h3>
          <span className="ml-auto text-sm text-gray-500">
            {recentActivities.length} hoạt động
          </span>
        </div>

        <div className="space-y-4">
          {recentActivities.length > 0 ? (
            recentActivities.slice(0, 8).map((activity, index) => (
              <div
                key={activity.id || index}
                className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">{activity.icon || "📝"}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.actionType || "Hoạt động"}
                    </p>
                    <span className="text-xs text-gray-400">
                      {activity.createdAt
                        ? new Date(activity.createdAt).toLocaleTimeString(
                            "vi-VN",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )
                        : "Vừa xong"}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                    {activity.description ||
                      `Người dùng: ${activity.userName || "N/A"}`}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {activity.createdAt
                      ? new Date(activity.createdAt).toLocaleDateString("vi-VN")
                      : new Date().toLocaleDateString("vi-VN")}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-sm text-center py-4">
              Không có hoạt động gần đây
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewDashboardCharts;
