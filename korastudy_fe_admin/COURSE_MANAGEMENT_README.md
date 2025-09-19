# Course Management System - Frontend Admin

Hệ thống quản lý khóa học cho phần admin frontend của KoraStudy.

## Cấu trúc File

### API Layer
- **`src/api/courseApi.js`** - Chứa tất cả các API calls liên quan đến khóa học
- **`src/services/CourseService.js`** - Service layer xử lý logic business và validation

### Hooks
- **`src/hooks/useCourseManagement.js`** - Custom hook quản lý state và actions cho khóa học

### Components
- **`src/pages/course/CourseManagement.js`** - Trang quản lý danh sách khóa học
- **`src/pages/course/CourseDetail.js`** - Trang chi tiết khóa học (quản lý sections và lessons)
- **`src/components/course/CourseEnrollmentList.js`** - Component hiển thị danh sách học viên

## Tính Năng Chính

### 1. Quản Lý Khóa Học
- ✅ Xem danh sách khóa học với pagination
- ✅ Tìm kiếm khóa học
- ✅ Thêm khóa học mới
- ✅ Chỉnh sửa thông tin khóa học
- ✅ Xóa khóa học
- ✅ Xuất bản/Hủy xuất bản khóa học
- ✅ Upload hình ảnh khóa học
- ✅ Xem thống kê khóa học
- ✅ Xem danh sách học viên đăng ký

### 2. Quản Lý Nội Dung Khóa Học
- ✅ Quản lý Sections (chương học)
  - Thêm/sửa/xóa section
  - Sắp xếp thứ tự section
- ✅ Quản lý Lessons (bài học)
  - Thêm/sửa/xóa lesson
  - Hỗ trợ các loại content: Video, Text, Quiz, Assignment
  - Upload video bài học
  - Sắp xếp thứ tự lesson

### 3. Theo Dõi Học Viên
- ✅ Xem danh sách học viên đăng ký
- ✅ Theo dõi tiến độ học tập
- ✅ Thống kê số liệu học viên
- ✅ Trạng thái hoàn thành khóa học

## API Endpoints Được Sử Dụng

### Admin Course Management
```
GET    /api/v1/admin/courses                    - Lấy tất cả khóa học (admin)
GET    /api/v1/admin/courses/{id}               - Lấy chi tiết khóa học
POST   /api/v1/admin/courses                    - Tạo khóa học mới
PUT    /api/v1/admin/courses/{id}               - Cập nhật khóa học
DELETE /api/v1/admin/courses/{id}               - Xóa khóa học
PUT    /api/v1/admin/courses/{id}/publish       - Xuất bản/Hủy xuất bản
GET    /api/v1/admin/courses/stats              - Thống kê khóa học
GET    /api/v1/admin/courses/{id}/enrollments   - Danh sách đăng ký
```

### Sections Management
```
GET    /api/v1/sections/course/{courseId}       - Lấy sections của khóa học
GET    /api/v1/sections/{id}                    - Lấy chi tiết section
POST   /api/v1/sections                         - Tạo section mới
PUT    /api/v1/sections/{id}                    - Cập nhật section
DELETE /api/v1/sections/{id}                    - Xóa section
```

### Lessons Management
```
GET    /api/v1/lessons/section/{sectionId}      - Lấy lessons của section
GET    /api/v1/lessons/{id}                     - Lấy chi tiết lesson
POST   /api/v1/lessons                          - Tạo lesson mới
PUT    /api/v1/lessons/{id}                     - Cập nhật lesson
DELETE /api/v1/lessons/{id}                     - Xóa lesson
```

### Enrollments & Reviews
```
GET    /api/v1/enrollments/course/{courseId}    - Danh sách đăng ký khóa học
GET    /api/v1/reviews/course/{courseId}        - Danh sách đánh giá
GET    /api/v1/reviews/course/{courseId}/rating - Điểm trung bình
```

## Routes

```
/admin/courses           - Danh sách khóa học
/admin/courses/:id       - Chi tiết khóa học (quản lý nội dung)
```

## Cách Sử Dụng

### 1. Quản Lý Khóa Học
1. Truy cập `/admin/courses`
2. Sử dụng nút "Thêm khóa học" để tạo khóa học mới
3. Click vào các icon hành động để chỉnh sửa, xóa, hoặc thay đổi trạng thái
4. Sử dụng thanh tìm kiếm để lọc khóa học

### 2. Quản Lý Nội Dung
1. Click vào tên khóa học hoặc icon "Xem chi tiết" để vào trang quản lý nội dung
2. Sử dụng "Thêm chương học" để tạo section mới
3. Trong mỗi section, sử dụng "Thêm bài học" để tạo lesson mới
4. Hỗ trợ upload video cho bài học loại VIDEO

### 3. Theo Dõi Học Viên
1. Trong danh sách khóa học, click icon "Xem học viên"
2. Xem thống kê và tiến độ học tập của từng học viên
3. Theo dõi tỷ lệ hoàn thành khóa học

## Validation & Error Handling

- ✅ Validation form đầu vào
- ✅ Xử lý lỗi API
- ✅ Loading states
- ✅ Confirmation dialogs cho các hành động nguy hiểm
- ✅ Toast messages cho feedback

## Dependencies

Các thư viện chính được sử dụng:
- `antd` - UI Components
- `react-router-dom` - Routing
- `axios` - HTTP Client

## Environment Setup

1. Đảm bảo backend server chạy trên `http://localhost:8080`
2. Token authentication được xử lý tự động qua axios interceptor
3. Cấu hình CORS trên backend để cho phép frontend truy cập

## Known Issues & TODOs

### Current Limitations
- [ ] Upload file chưa được implement đầy đủ (cần backend API)
- [ ] Chưa có tính năng preview video
- [ ] Chưa có rich text editor cho lesson content
- [ ] Chưa có bulk operations

### Future Enhancements
- [ ] Drag & drop để sắp xếp sections/lessons
- [ ] Advanced filtering và sorting
- [ ] Export danh sách học viên
- [ ] Analytics dashboard cho từng khóa học
- [ ] Comment system cho lessons
- [ ] Certificate management

## Troubleshooting

### API Errors
- Kiểm tra console browser để xem lỗi chi tiết
- Đảm bảo token authentication hợp lệ
- Kiểm tra network connectivity

### UI Issues
- Clear browser cache nếu có vấn đề với static assets
- Kiểm tra responsive design trên mobile devices

### Performance
- Sử dụng pagination để tải dữ liệu lớn
- Implement lazy loading cho images và videos nếu cần
