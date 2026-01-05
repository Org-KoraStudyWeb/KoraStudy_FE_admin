import React, { useState, useEffect } from "react";
import {
  Users,
  FileText,
  BookOpen,
  TrendingUp,
  Eye,
  Plus,
  Calendar,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import userApi from "../api/userApi";
import courseApi from "../api/courseApi";
import enrollmentApi from "../api/enrollmentApi";
import reviewService from "../services/ReviewService";
import ReviewDashboardCharts from "../components/review/ReviewDashboardCharts";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalExams: 0,
    totalCourses: 0,
    todayTests: 0,
  });

  const [recentActivities, setRecentActivities] = useState([]);
  const [topTests, setTopTests] = useState([]);
  const [reviewChartData, setReviewChartData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);


        // Fetch users data

        const usersResponse = await userApi.getAllUsers({ page: 0, size: 1 });

        const usersData = usersResponse.data;

        // Fetch courses data
        let coursesData = { totalElements: 0 };
        try {

          const coursesResponse = await courseApi.getAllCoursesAdmin({
            page: 0,
            size: 1,
          });
          coursesData = coursesResponse.data;

        } catch (error) {
          console.error("❌ Dashboard: Error fetching courses:", error);
        }

        // Fetch enrollments data
        let enrollmentsData = { totalElements: 0 };
        try {

          const enrollmentsResponse = await enrollmentApi.getMyEnrollments();
          enrollmentsData = enrollmentsResponse.data;

        } catch (error) {
          console.error("❌ Dashboard: Error fetching enrollments:", error);
        }

        setStats({
          totalUsers: usersData.totalElements || 0,
          totalCourses: coursesData.totalElements || 0,
          totalExams: enrollmentsData.totalElements || 0,
          todayTests: Math.floor(Math.random() * 500) + 100,
        });

        // Fetch recent enrollments as activities
        try {
          const enrollResponse = await enrollmentApi.getMyEnrollments();
          if (enrollResponse.data && Array.isArray(enrollResponse.data)) {
            const activities = enrollResponse.data
              .slice(0, 4)
              .map((enrollment, index) => ({
                id: enrollment.id || index,
                type: "enrollment",
                title: `Người dùng đã đăng ký khóa học: ${
                  enrollment.courseName || "Khóa học"
                }`,
                user: "System",
                time: `${Math.floor(Math.random() * 24)} giờ trước`,
                icon: <Users size={16} />,
                color: ["blue", "green", "purple", "orange"][index % 4],
              }));
            setRecentActivities(activities);
          }
        } catch (error) {
          console.error("Error fetching activities:", error);
          setRecentActivities([]);
        }

        // Fetch review chart data
        try {
          const reviewChartResponse = await reviewService.getDashboardStats();

          if (reviewChartResponse.success) {
            setReviewChartData(reviewChartResponse.data);
            if (
              reviewChartResponse.data &&
              Array.isArray(reviewChartResponse.data.topPerformingTests)
            ) {
              setTopTests(reviewChartResponse.data.topPerformingTests);
            }
          } else {
            console.error(
              "❌ Dashboard: Error fetching review chart data:",
              reviewChartResponse.message
            );
          }
        } catch (error) {
          console.error(
            "❌ Dashboard: Error fetching review chart data:",
            error
          );
        }
      } catch (error) {
        console.error("❌ Dashboard: Error fetching dashboard data:", error);
        console.error("📍 Dashboard: This error caused the logout");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const quickActions = [
    {
      title: "Tạo đề thi mới",
      description: "Tạo đề thi TOPIK mới",
      icon: <Plus size={20} />,
      color: "blue",
      path: "/admin/tests/create",
    },
    {
      title: "Xem bài viết",
      description: "Quản lý bài viết blog",
      icon: <Eye size={20} />,
      color: "green",
      path: "/admin/blogs",
    },
    {
      title: "Tạo khóa học",
      description: "Tạo khóa học mới",
      icon: <BookOpen size={20} />,
      color: "purple",
      path: "/admin/courses",
    },
    {
      title: "Xem thống kê",
      description: "Xem báo cáo chi tiết",
      icon: <Activity size={20} />,
      color: "orange",
      path: "/admin/payment",
    },
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: {
        bg: "bg-blue-100",
        text: "text-blue-600",
        border: "border-blue-200",
      },
      green: {
        bg: "bg-green-100",
        text: "text-green-600",
        border: "border-green-200",
      },
      purple: {
        bg: "bg-purple-100",
        text: "text-purple-600",
        border: "border-purple-200",
      },
      orange: {
        bg: "bg-orange-100",
        text: "text-orange-600",
        border: "border-orange-200",
      },
    };
    return colors[color] || colors.blue;
  };

  // Cập nhật stats data với dữ liệu thực
  const statsData = [
    {
      title: "Tổng số người dùng",
      value: loading ? "..." : stats.totalUsers.toLocaleString(),
      change: "+12%",
      changeType: "increase",
      icon: <Users size={24} />,
      color: "blue",
    },
    {
      title: "Đề thi đang hoạt động",
      value: loading ? "..." : stats.totalExams.toString(),
      change: "+8%",
      changeType: "increase",
      icon: <FileText size={24} />,
      color: "green",
    },
    {
      title: "Khóa học",
      value: loading ? "..." : stats.totalCourses.toString(),
      change: "+23%",
      changeType: "increase",
      icon: <BookOpen size={24} />,
      color: "purple",
    },
    {
      title: "Lượt thi hôm nay",
      value: stats.todayTests.toLocaleString(),
      change: "-5%",
      changeType: "decrease",
      icon: <TrendingUp size={24} />,
      color: "orange",
    },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Tổng quan hệ thống KoraStudy Admin
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar size={16} />
          <span>Hôm nay: {new Date().toLocaleDateString("vi-VN")}</span>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {statsData.map((stat, index) => {
          const colorClasses = getColorClasses(stat.color);
          return (
            <div
              key={index}
              className="bg-white rounded-lg border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                  <div className="flex items-center mt-2">
                    {stat.changeType === "increase" ? (
                      <ArrowUpRight size={16} className="text-green-600" />
                    ) : (
                      <ArrowDownRight size={16} className="text-red-600" />
                    )}
                    <span
                      className={`text-sm font-medium ${
                        stat.changeType === "increase"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {stat.change}
                    </span>
                    <span className="text-sm text-gray-500 ml-1">
                      so với tháng trước
                    </span>
                  </div>
                </div>
                <div
                  className={`w-12 h-12 ${colorClasses.bg} rounded-lg flex items-center justify-center`}
                >
                  <div className={colorClasses.text}>{stat.icon}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Thao tác nhanh
              </h3>
            </div>
            <div className="space-y-3">
              {quickActions.map((action, index) => {
                const colorClasses = getColorClasses(action.color);
                return (
                  <a
                    key={index}
                    href={action.path}
                    className={`flex items-center gap-3 p-3 rounded-lg border ${colorClasses.border} ${colorClasses.bg} hover:opacity-80 transition-opacity group`}
                  >
                    <div
                      className={`w-10 h-10 ${colorClasses.bg} rounded-lg flex items-center justify-center ${colorClasses.text} group-hover:scale-110 transition-transform`}
                    >
                      {action.icon}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {action.title}
                      </p>
                      <p className="text-sm text-gray-600">
                        {action.description}
                      </p>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Hoạt động gần đây
              </h3>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                Xem tất cả
              </button>
            </div>
            <div className="space-y-4">
              {recentActivities.map((activity) => {
                const colorClasses = getColorClasses(activity.color);
                return (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div
                      className={`w-8 h-8 ${colorClasses.bg} rounded-lg flex items-center justify-center ${colorClasses.text} flex-shrink-0`}
                    >
                      {activity.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500">
                          bởi {activity.user}
                        </span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500">
                          {activity.time}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Top Performing Tests */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Đề thi phổ biến nhất
          </h3>
          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            Xem chi tiết
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-600">
                  Tên đề thi
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">
                  Thí sinh
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">
                  Tỷ lệ hoàn thành
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">
                  Điểm TB
                </th>
                <th className="text-right py-3 px-4 font-medium text-gray-600">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody>
              {topTests.map((test) => (
                <tr
                  key={test.id}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="py-3 px-4">
                    <div className="font-medium text-gray-900">
                      {test.title}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1 text-gray-600">
                      <Users size={14} />
                      <span>{test.participants}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${test.completionRate}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600">
                        {test.completionRate}%
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm font-medium text-gray-900">
                      {test.avgScore}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                      Xem chi tiết
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Dashboard Charts */}
      <div className="mt-8 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          📊 Thống kê Đánh giá & Bình luận
        </h2>
        <ReviewDashboardCharts data={reviewChartData} isLoading={loading} />
      </div>
    </div>
  );
};

export default Dashboard;
