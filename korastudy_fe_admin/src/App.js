import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './layouts/AdminLayout';
import Dashboard from './pages/Dashboard';
import TestList from './pages/TestList';

function App() {
  return (
    <Router>
      <Routes>
        {/* Redirect root to admin dashboard */}
        <Route path="/" element={<Navigate to="/admin" replace />} />
        
        {/* Dashboard Route */}
        <Route 
          path="/admin" 
          element={
            <AdminLayout title="Dashboard">
              <Dashboard />
            </AdminLayout>
          } 
        />
        
        {/* Test Management Route */}
        <Route 
          path="/admin/tests" 
          element={
            <AdminLayout title="Quản lý đề thi">
              <TestList />
            </AdminLayout>
          } 
        />
        
        {/* Add more admin routes here as needed */}
        <Route path="/admin/tests/create" element={<AdminLayout title="Tạo đề thi mới"><div className="p-6">Tạo đề thi mới - Coming Soon</div></AdminLayout>} />
        <Route path="/admin/tests/statistics" element={<AdminLayout title="Thống kê"><div className="p-6">Thống kê - Coming Soon</div></AdminLayout>} />
        <Route path="/admin/users" element={<AdminLayout title="Quản lý người dùng"><div className="p-6">Quản lý người dùng - Coming Soon</div></AdminLayout>} />
        <Route path="/admin/users/create" element={<AdminLayout title="Thêm người dùng"><div className="p-6">Thêm người dùng - Coming Soon</div></AdminLayout>} />
        <Route path="/admin/courses" element={<AdminLayout title="Quản lý khóa học"><div className="p-6">Quản lý khóa học - Coming Soon</div></AdminLayout>} />
        <Route path="/admin/courses/create" element={<AdminLayout title="Tạo khóa học"><div className="p-6">Tạo khóa học - Coming Soon</div></AdminLayout>} />
        <Route path="/admin/settings" element={<AdminLayout title="Cài đặt"><div className="p-6">Cài đặt - Coming Soon</div></AdminLayout>} />
      </Routes>
    </Router>
  );
}

export default App;
