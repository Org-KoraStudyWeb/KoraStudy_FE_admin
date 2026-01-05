import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  Clock,
  Target,
  Award,
  BarChart3,
  ClipboardCheck,
  UserCheck,
} from "lucide-react";
import userApi from "../api/userApi";
import courseApi from "../api/courseApi";
import enrollmentApi from "../api/enrollmentApi";
import reviewService from "../services/ReviewService";
import AdminExamService from "../services/AdminExamService";
import ReviewDashboardCharts from "../components/review/ReviewDashboardCharts";

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalExams: 0,
    totalCourses: 0,
    totalTaken: 0,
    todayTests: 0,
    takenLast7Days: 0,
    averageScore: 0,
    uniqueTestTakers: 0,
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

        // Fetch exam data using new stats API
        let examStats = { totalExams: 0, activeExams: 0, totalTaken: 0, todayTaken: 0, topPerformingTests: [] };
        try {
          console.log("📝 Dashboard: Fetching exam stats...");
          const statsData = await AdminExamService.getDashboardStats();
          examStats = {
            totalExams: statsData.totalExams || 0,
            activeExams: statsData.activeExams || 0,
            totalTaken: statsData.totalTaken || 0,
            todayTaken: statsData.todayTaken || 0,
            takenLast7Days: statsData.takenLast7Days || 0,
            averageScore: statsData.averageScore || 0,
            uniqueTestTakers: statsData.uniqueTestTakers || 0,
            topPerformingTests: statsData.topPerformingTests || [],
          };
          console.log("✅ Dashboard: Exam stats fetched successfully", examStats);
          
          // Set top tests from the stats API
          if (examStats.topPerformingTests && examStats.topPerformingTests.length > 0) {
            setTopTests(examStats.topPerformingTests);
          }
        } catch (error) {
          console.error("❌ Dashboard: Error fetching exam stats:", error);
          // Fallback to getAllExams if stats API fails
          try {
            const examsData = await AdminExamService.getAllExams();
            if (Array.isArray(examsData)) {
              examStats = {
                totalExams: examsData.length,
                activeExams: examsData.filter((e) => e.isActive).length,
                totalTaken: examsData.reduce((sum, e) => sum + (e.totalTaken || 0), 0),
                todayTaken: 0,
              };
            }
          } catch (fallbackError) {
            console.error("❌ Dashboard: Fallback also failed:", fallbackError);
          }
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
          totalExams: examStats.activeExams,
          totalTaken: examStats.totalTaken,
          todayTests: examStats.todayTaken,
          takenLast7Days: examStats.takenLast7Days || 0,
          averageScore: examStats.averageScore || 0,
          uniqueTestTakers: examStats.uniqueTestTakers || 0,
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
      title: "Tổng lượt thi",
      value: loading ? "..." : stats.totalTaken.toLocaleString(),
      change: "+15%",
      changeType: "increase",
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

      {/* Exam Statistics Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <BarChart3 size={20} className="text-gray-600" />
              Thống kê Đề thi Chi tiết
            </h3>
            <p className="text-gray-500 text-sm mt-1">Dữ liệu cập nhật realtime từ hệ thống</p>
          </div>
          <button 
            onClick={() => navigate('/admin/tests')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Quản lý đề thi →
          </button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {/* Lượt thi hôm nay */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <Clock size={16} className="text-blue-500" />
              <span className="text-xs text-gray-500">Hôm nay</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{loading ? "..." : stats.todayTests}</p>
            <p className="text-xs text-gray-500">lượt thi</p>
          </div>

          {/* Lượt thi 7 ngày */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <Calendar size={16} className="text-green-500" />
              <span className="text-xs text-gray-500">7 ngày qua</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{loading ? "..." : stats.takenLast7Days}</p>
            <p className="text-xs text-gray-500">lượt thi</p>
          </div>

          {/* Tổng lượt thi */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <ClipboardCheck size={16} className="text-purple-500" />
              <span className="text-xs text-gray-500">Tổng cộng</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{loading ? "..." : stats.totalTaken}</p>
            <p className="text-xs text-gray-500">lượt thi</p>
          </div>

          {/* Điểm trung bình */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <Target size={16} className="text-orange-500" />
              <span className="text-xs text-gray-500">Điểm Đánh Giá</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{loading ? "..." : stats.averageScore}</p>
            <p className="text-xs text-gray-500">điểm</p>
          </div>

          {/* Thí sinh unique */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <UserCheck size={16} className="text-blue-500" />
              <span className="text-xs text-gray-500">Thí sinh</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{loading ? "..." : stats.uniqueTestTakers}</p>
            <p className="text-xs text-gray-500">người đã thi</p>
          </div>

          {/* Đề thi active */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <Award size={16} className="text-green-500" />
              <span className="text-xs text-gray-500">Đề thi</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{loading ? "..." : stats.totalExams}</p>
            <p className="text-xs text-gray-500">đang hoạt động</p>
          </div>
        </div>
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
            🏆 Đề thi phổ biến nhất
          </h3>
          <button 
            onClick={() => navigate('/admin/tests')}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
          >
            Xem tất cả <ArrowUpRight size={14} />
          </button>
        </div>
        
        {topTests.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FileText size={48} className="mx-auto mb-2 text-gray-300" />
            <p>Chưa có dữ liệu đề thi</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">
                    Tên đề thi
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">
                    Level
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
                {topTests.map((test, index) => (
                  <tr
                    key={test.id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          index === 0 ? 'bg-yellow-100 text-yellow-700' :
                          index === 1 ? 'bg-gray-100 text-gray-600' :
                          index === 2 ? 'bg-orange-100 text-orange-700' :
                          'bg-blue-50 text-blue-600'
                        }`}>
                          {index + 1}
                        </span>
                        <span className="font-medium text-gray-900">
                          {test.title}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        test.level === 'TOPIK I' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'
                      }`}>
                        {test.level}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1 text-gray-600">
                        <Users size={14} />
                        <span>{test.participants}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              test.completionRate >= 90 ? 'bg-green-500' :
                              test.completionRate >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${test.completionRate}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600 w-12">
                          {test.completionRate}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-medium text-gray-900">
                          {test.avgScore}
                        </span>
                        <span className="text-yellow-500">★</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button 
                        onClick={() => navigate(`/admin/tests/${test.id}`)}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium hover:underline"
                      >
                        Xem chi tiết
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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
