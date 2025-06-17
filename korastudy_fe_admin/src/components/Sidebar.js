import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  FileText, 
  Users, 
  BookOpen, 
  Settings, 
  ChevronDown, 
  ChevronRight,
  PlusCircle,
  List,
  BarChart3,
  User
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = useState({
    tests: true,
    users: false,
    courses: false
  });

  const toggleMenu = (menu) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menu]: !prev[menu]
    }));
  };

  const menuItems = [
    {
      title: 'Dashboard',
      icon: <Home size={20} />,
      path: '/admin',
      exact: true
    },
    {
      title: 'Quản lý đề thi',
      icon: <FileText size={20} />,
      key: 'tests',
      submenu: [
        {
          title: 'Danh sách đề thi',
          icon: <List size={16} />,
          path: '/admin/tests'
        },
        {
          title: 'Tạo đề thi mới',
          icon: <PlusCircle size={16} />,
          path: '/admin/tests/create'
        },
        {
          title: 'Thống kê',
          icon: <BarChart3 size={16} />,
          path: '/admin/tests/statistics'
        }
      ]
    },
    {
      title: 'Quản lý người dùng',
      icon: <Users size={20} />,
      key: 'users',
      submenu: [
        {
          title: 'Danh sách người dùng',
          icon: <List size={16} />,
          path: '/admin/users'
        },
        {
          title: 'Thêm người dùng',
          icon: <PlusCircle size={16} />,
          path: '/admin/users/create'
        }
      ]
    },
    {
      title: 'Quản lý khóa học',
      icon: <BookOpen size={20} />,
      key: 'courses',
      submenu: [
        {
          title: 'Danh sách khóa học',
          icon: <List size={16} />,
          path: '/admin/courses'
        },
        {
          title: 'Tạo khóa học',
          icon: <PlusCircle size={16} />,
          path: '/admin/courses/create'
        }
      ]
    },
    {
      title: 'Cài đặt',
      icon: <Settings size={20} />,
      path: '/admin/settings'
    }
  ];

  const isActive = (path, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen overflow-y-auto">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        {/* <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">K</span>
          </div>
          <span className="font-bold text-xl text-gray-800">KoraStudy</span>
        </div> */}
        <div className="nav-logo flex items-center">
          <Link to="/" className="flex items-center">
            <img 
              src="logo192.png" 
              alt="KoraStudy Logo" 
              className="h-12 md:h-16 w-auto mr-2 dark:filter dark:brightness-0 dark:invert"
            />
          </Link>
        </div>
        <p className="text-sm text-gray-500 mt-1">Admin Panel</p>
      </div>

      {/* Navigation */}
      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item, index) => (
            <li key={index}>
              {item.submenu ? (
                <div>
                  <button
                    onClick={() => toggleMenu(item.key)}
                    className="w-full flex items-center justify-between p-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                  >
                    <div className="flex items-center gap-3">
                      {item.icon}
                      <span className="font-medium">{item.title}</span>
                    </div>
                    {expandedMenus[item.key] ? (
                      <ChevronDown size={16} />
                    ) : (
                      <ChevronRight size={16} />
                    )}
                  </button>
                  {expandedMenus[item.key] && (
                    <ul className="ml-6 mt-2 space-y-1">
                      {item.submenu.map((subItem, subIndex) => (
                        <li key={subIndex}>
                          <Link
                            to={subItem.path}
                            className={`flex items-center gap-3 p-2 rounded-lg transition-colors duration-200 ${
                              isActive(subItem.path)
                                ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600'
                                : 'text-gray-600 hover:bg-gray-50'
                            }`}
                          >
                            {subItem.icon}
                            <span className="text-sm">{subItem.title}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-colors duration-200 ${
                    isActive(item.path, item.exact)
                      ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {item.icon}
                  <span className="font-medium">{item.title}</span>
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* User Profile */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
        <div className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
            <User size={16} className="text-gray-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-800">Admin User</p>
            <p className="text-xs text-gray-500">admin@korastudy.com</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
