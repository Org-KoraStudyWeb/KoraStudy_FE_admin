import React from "react";
import { Routes, Route } from "react-router-dom";
import AdminLayout from "./layouts/AdminLayout";
import Dashboard from "./pages/Dashboard";
import TestList from "./pages/Exam/TestList"; // kiểm tra path này kỹ nhé
import UploadTest from "./pages/TestPage/UploadTest";
import LoginPages from "./pages/auth/LoginPages";
import CourseList from "./pages/course/CourseListPages";
import CourseContainer from "./containers/course/AddCourseContainer";

// Import các component mới cho Flash Card và Blog
import FlashCardList from "./pages/flashcard/FlashCardList";
import CreateFlashCard from "./pages/flashcard/CreateFlashCard";
import BlogList from "./pages/blog/BlogList";
import CreateBlog from "./pages/blog/CreateBlog";
import ExamEditor from "./pages/Exam/ExamEditor";
import ExamDetail from "./pages/Exam/ExamDetail";

function App() {
  return (
    <Router>
      <Routes>
        {/* Login Route */}
        <Route path="/login" element={<LoginPages />} />

        {/* Dashboard và các routes khác */}
        <Route
          path="/"
          element={
            <AdminLayout title="Dashboard">
              <Dashboard />
            </AdminLayout>
          }
        />
        <Route
          path="/admin"
          element={
            <AdminLayout title="Dashboard">
              <Dashboard />
            </AdminLayout>
          }
        />
        
        {/* Test Management Routes */}
        <Route
          path="/admin/tests"
          element={
            <AdminLayout title="Quản lý đề thi">
              <TestList />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/tests/create"
          element={
            <AdminLayout title="Tạo đề thi mới">
              <UploadTest />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/tests/statistics"
          element={
            <AdminLayout title="Thống kê đề thi">
              <div className="p-6">Thống kê đề thi - Coming Soon</div>
            </AdminLayout>
          }
        />

        {/* User Management Routes */}
        <Route
          path="/admin/users"
          element={
            <AdminLayout title="Quản lý người dùng">
              <div className="p-6">Quản lý người dùng - Coming Soon</div>
            </AdminLayout>
          }
        />
        <Route
          path="/admin/users/create"
          element={
            <AdminLayout title="Thêm người dùng">
              <div className="p-6">Thêm người dùng - Coming Soon</div>
            </AdminLayout>
          }
        />

        {/* Course Management Routes */}
        <Route
          path="/admin/courses"
          element={
            <AdminLayout title="Quản lý khóa học">
              <CourseList />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/courses/create"
          element={
            <AdminLayout title="Tạo khóa học">
              <CourseContainer />
            </AdminLayout>
          }
        />

        {/* Flash Card Management Routes */}
        <Route
          path="/admin/flashcards"
          element={
            <AdminLayout title="Quản lý Flash Card">
              <FlashCardList />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/flashcards/create"
          element={
            <AdminLayout title="Tạo Flash Card mới">
              <CreateFlashCard />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/flashcards/edit/:id"
          element={
            <AdminLayout title="Chỉnh sửa Flash Card">
              <CreateFlashCard />
            </AdminLayout>
          }
        />

        {/* Blog Management Routes */}
        <Route
          path="/admin/blogs"
          element={
            <AdminLayout title="Quản lý Blog">
              <BlogList />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/blogs/create"
          element={
            <AdminLayout title="Tạo bài viết mới">
              <CreateBlog />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/blogs/edit/:id"
          element={
            <AdminLayout title="Chỉnh sửa bài viết">
              <CreateBlog />
            </AdminLayout>
          }
        />

        {/* Settings Route */}
        <Route
          path="/admin/settings"
          element={
            <AdminLayout title="Cài đặt">
              <div className="p-6">Cài đặt - Coming Soon</div>
            </AdminLayout>
          }
        />

        {/* Fallback route - 404 Page */}
        <Route
          path="*"
          element={
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
              <div className="text-center bg-white p-8 rounded-lg shadow-md">
                <h1 className="text-4xl font-bold text-gray-800 mb-4">404</h1>
                <p className="text-xl text-gray-600 mb-6">
                  Trang không tồn tại
                </p>
                <a
                  href="/admin"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Quay lại Dashboard
                </a>
              </div>
            </div>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;