import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './components/Layout/AdminLayout';
import Dashboard from './pages/Dashboard';
import ExamManagement from './pages/ExamManagement';
import ExamEditor from './pages/ExamEditor';
import ExamDetail from './pages/ExamDetail';

function App() {
  return (
    <Routes>
      {/* Admin routes with layout */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="exams" element={<ExamManagement />} />
        <Route path="exams/create" element={<ExamEditor />} />
        <Route path="exams/:id" element={<ExamDetail />} />
        <Route path="exams/:id/edit" element={<ExamEditor />} />
      </Route>
      
      {/* Redirect root to admin */}
      <Route path="/" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
}

export default App;
//           <Route path="users" element={<AdminLayout title="Quản lý người dùng"><div className="p-6">Quản lý người dùng - Coming Soon</div></AdminLayout>} />
//           <Route path="users/create" element={<AdminLayout title="Thêm người dùng"><div className="p-6">Thêm người dùng - Coming Soon</div></AdminLayout>} />
//           <Route path="courses" element={<AdminLayout title="Quản lý khóa học"><div className="p-6">Quản lý khóa học - Coming Soon</div></AdminLayout>} />
//           <Route path="courses/create" element={<AdminLayout title="Tạo khóa học"><div className="p-6">Tạo khóa học - Coming Soon</div></AdminLayout>} />
//           <Route path="settings" element={<AdminLayout title="Cài đặt"><div className="p-6">Cài đặt - Coming Soon</div></AdminLayout>} />
//         </Route>
        
//         {/* Redirect root to admin */}
//         <Route path="/" element={<Navigate to="/admin" replace />} />
//       </Routes>
//     </Router>
//   );
// }

// export default App;
//         {/* Add more admin routes here as needed */}
//         <Route path="/admin/tests/create" element={<AdminLayout title="Tạo đề thi mới"><div className="p-6">Tạo đề thi mới - Coming Soon</div></AdminLayout>} />
//         <Route path="/admin/tests/statistics" element={<AdminLayout title="Thống kê"><div className="p-6">Thống kê - Coming Soon</div></AdminLayout>} />
//         <Route path="/admin/users" element={<AdminLayout title="Quản lý người dùng"><div className="p-6">Quản lý người dùng - Coming Soon</div></AdminLayout>} />
//         <Route path="/admin/users/create" element={<AdminLayout title="Thêm người dùng"><div className="p-6">Thêm người dùng - Coming Soon</div></AdminLayout>} />
//         <Route path="/admin/courses" element={<AdminLayout title="Quản lý khóa học"><div className="p-6">Quản lý khóa học - Coming Soon</div></AdminLayout>} />
//         <Route path="/admin/courses/create" element={<AdminLayout title="Tạo khóa học"><div className="p-6">Tạo khóa học - Coming Soon</div></AdminLayout>} />
//         <Route path="/admin/settings" element={<AdminLayout title="Cài đặt"><div className="p-6">Cài đặt - Coming Soon</div></AdminLayout>} />
//       </Routes>
//     </Router>
//   );
// }

// export default App;
