import React from 'react';
import { FileText, Users, BookOpen, TrendingUp } from 'lucide-react';

const Dashboard = () => {
  const stats = [
    {
      title: 'Tổng đề thi',
      value: '24',
      change: '+12%',
      icon: FileText,
      color: 'blue'
    },
    {
      title: 'Người dùng',
      value: '1,234',
      change: '+5%',
      icon: Users,
      color: 'green'
    },
    {
      title: 'Khóa học',
      value: '18',
      change: '+8%',
      icon: BookOpen,
      color: 'purple'
    },
    {
      title: 'Lượt thi',
      value: '5,678',
      change: '+15%',
      icon: TrendingUp,
      color: 'yellow'
    }
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Tổng quan hệ thống KoraStudy</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-green-600">{stat.change}</p>
                </div>
                <div className={`p-3 rounded-full bg-${stat.color}-100`}>
                  <Icon className={`h-6 w-6 text-${stat.color}-600`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Hoạt động gần đây</h2>
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <div>
              <p className="text-sm font-medium">Đề thi mới được tạo</p>
              <p className="text-xs text-gray-500">TOPIK I - Đề 25 • 2 giờ trước</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <div>
              <p className="text-sm font-medium">Người dùng mới đăng ký</p>
              <p className="text-xs text-gray-500">5 người dùng • 3 giờ trước</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
      icon: <BookOpen size={16} />,
      color: 'orange'
    }
  ];

  const quickActions = [
    {
      title: 'Tạo đề thi mới',
      description: 'Tạo đề thi TOPIK mới',
      icon: <Plus size={20} />,
      color: 'blue',
      path: '/admin/tests/create'
    },
    {
      title: 'Thêm người dùng',
      description: 'Thêm người dùng mới',
      icon: <Users size={20} />,
      color: 'green',
      path: '/admin/users/create'
    },
    {
      title: 'Tạo khóa học',
      description: 'Tạo khóa học mới',
      icon: <BookOpen size={20} />,
      color: 'purple',
      path: '/admin/courses/create'
    },
    {
      title: 'Xem thống kê',
      description: 'Xem báo cáo chi tiết',
      icon: <Activity size={20} />,
      color: 'orange',
      path: '/admin/tests/statistics'
    }
  ];

  const topTests = [
    {
      id: 1,
      title: 'TOPIK I - Đề thi thử số 1',
      participants: 156,
      completionRate: 89,
      avgScore: 78
    },
    {
      id: 2,
      title: 'TOPIK II - Đề thi thử số 2',
      participants: 134,
      completionRate: 92,
      avgScore: 82
    },
    {
      id: 3,
      title: 'Kiểm tra ngữ pháp cơ bản',
      participants: 234,
      completionRate: 95,
      avgScore: 85
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: {
        bg: 'bg-blue-100',
        text: 'text-blue-600',
        border: 'border-blue-200'
      },
      green: {
        bg: 'bg-green-100',
        text: 'text-green-600',
        border: 'border-green-200'
      },
      purple: {
        bg: 'bg-purple-100',
        text: 'text-purple-600',
        border: 'border-purple-200'
      },
      orange: {
        bg: 'bg-orange-100',
        text: 'text-orange-600',
        border: 'border-orange-200'
      }
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Tổng quan hệ thống KoraStudy Admin</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar size={16} />
            <span>Hôm nay: {new Date().toLocaleDateString('vi-VN')}</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const colorClasses = getColorClasses(stat.color);
          return (
            <div key={index} className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  <div className="flex items-center mt-2">
                    {stat.changeType === 'increase' ? (
                      <ArrowUpRight size={16} className="text-green-600" />
                    ) : (
                      <ArrowDownRight size={16} className="text-red-600" />
                    )}
                    <span className={`text-sm font-medium ml-1 ${
                      stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.change}
                    </span>
                    <span className="text-sm text-gray-500 ml-1">so với tháng trước</span>
                  </div>
                </div>
                <div className={`w-12 h-12 ${colorClasses.bg} rounded-lg flex items-center justify-center`}>
                  <div className={colorClasses.text}>
                    {stat.icon}
                  </div>
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
              <h3 className="text-lg font-semibold text-gray-900">Thao tác nhanh</h3>
            </div>
            <div className="space-y-3">
              {quickActions.map((action, index) => {
                const colorClasses = getColorClasses(action.color);
                return (
                  <button
                    key={index}
                    className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className={`w-10 h-10 ${colorClasses.bg} rounded-lg flex items-center justify-center`}>
                      <div className={colorClasses.text}>
                        {action.icon}
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{action.title}</p>
                      <p className="text-sm text-gray-600">{action.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Hoạt động gần đây</h3>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                Xem tất cả
              </button>
            </div>
            <div className="space-y-4">
              {recentActivities.map((activity) => {
                const colorClasses = getColorClasses(activity.color);
                return (
                  <div key={activity.id} className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className={`w-8 h-8 ${colorClasses.bg} rounded-full flex items-center justify-center flex-shrink-0`}>
                      <div className={colorClasses.text}>
                        {activity.icon}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500">bởi {activity.user}</span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500">{activity.time}</span>
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
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Đề thi phổ biến nhất</h3>
          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            Xem chi tiết
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-600">Tên đề thi</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Thí sinh</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Tỷ lệ hoàn thành</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Điểm TB</th>
                <th className="text-right py-3 px-4 font-medium text-gray-600">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {topTests.map((test) => (
                <tr key={test.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="font-medium text-gray-900">{test.title}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1 text-gray-600">
                      <Users size={14} />
                      <span>{test.participants}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: `${test.completionRate}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600">{test.completionRate}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-medium text-gray-900">{test.avgScore}/100</span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button className="p-1 hover:bg-gray-100 rounded text-gray-600">
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
