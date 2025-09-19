// src/pages/course/CourseManagement.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table, 
  Button, 
  Space, 
  Popconfirm, 
  message, 
  Input, 
  Tag, 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Modal, 
  Form, 
  Select,
  Switch,
  Upload,
  Image,
  Tooltip,
  InputNumber
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  SearchOutlined, 
  EyeOutlined,
  BookOutlined,
  UserOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  UploadOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import useCourseManagement from '../../hooks/useCourseManagement';
import CourseService from '../../services/CourseService';
import CourseEnrollmentList from '../../components/course/CourseEnrollmentList';
import CreateCourseForm from '../../components/course/CreateCourseForm';

const { Search } = Input;
const { Option } = Select;
const { TextArea } = Input;

const CourseManagement = () => {
  const navigate = useNavigate();
  
  // Hook để quản lý khóa học
  const {
    courses,
    loading,
    error,
    pagination,
    stats,
    loadCourses,
    createCourse,
    updateCourse,
    deleteCourse,
    togglePublishCourse,
    searchCourses,
    changePage,
    clearError
  } = useCourseManagement();

  // States cho modal
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [form] = Form.useForm();
  const [imageUrl, setImageUrl] = useState('');
  const [uploadLoading, setUploadLoading] = useState(false);
  const [enrollmentModalVisible, setEnrollmentModalVisible] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [createModalVisible, setCreateModalVisible] = useState(false);

  // Hiển thị modal thêm/sửa khóa học
  const showModal = (course = null) => {
    if (course) {
      // Chỉnh sửa khóa học
      setEditingCourse(course);
      setIsModalVisible(true);
      
      form.setFieldsValue({
        courseName: course.courseName,
        courseDescription: course.courseDescription,
        price: course.price,
        level: course.level,
        duration: course.duration,
        category: course.category,
        isPublished: course.isPublished
      });
      setImageUrl(course.thumbnailUrl || '');
    } else {
      // Thêm khóa học mới
      setCreateModalVisible(true);
    }
  };

  // Đóng modal
  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingCourse(null);
    form.resetFields();
    setImageUrl('');
  };

  // Xử lý submit form
  const handleSubmit = async (values) => {
    console.log('Form values:', values); // Debug log
    
    try {
      // Chuyển đổi dữ liệu form
      const courseData = {
        courseName: values.courseName,
        courseDescription: values.courseDescription,
        price: values.price ? parseFloat(values.price) : 0,
        level: values.level || null,
        duration: values.duration ? parseFloat(values.duration) : null,
        category: values.category || null,
        isPublished: values.isPublished || false,
        thumbnailUrl: imageUrl || null
      };

      console.log('Course data to submit:', courseData); // Debug log

      let response;
      if (editingCourse) {
        response = await updateCourse(editingCourse.id, courseData);
      } else {
        response = await createCourse(courseData);
      }

      console.log('API response:', response); // Debug log

      if (response.success) {
        message.success(response.message || 'Lưu khóa học thành công');
        handleCancel();
      } else {
        message.error(response.message || 'Có lỗi xảy ra');
      }
    } catch (err) {
      console.error('Form submit error:', err);
      message.error('Có lỗi xảy ra khi lưu khóa học');
    }
  };

  // Xử lý xóa khóa học
  const handleDelete = async (id) => {
    try {
      const response = await deleteCourse(id);
      if (response.success) {
        message.success(response.message);
      } else {
        message.error(response.message);
      }
    } catch (err) {
      message.error('Có lỗi xảy ra khi xóa khóa học');
    }
  };

  // Xử lý thay đổi trạng thái xuất bản
  const handleTogglePublish = async (id, currentStatus) => {
    try {
      const response = await togglePublishCourse(id, !currentStatus);
      if (response.success) {
        message.success(response.message);
      } else {
        message.error(response.message);
      }
    } catch (err) {
      message.error('Có lỗi xảy ra khi thay đổi trạng thái xuất bản');
    }
  };

  // Xử lý upload hình ảnh
  const handleImageUpload = async (file) => {
    // Validate file type
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('Chỉ chấp nhận file hình ảnh!');
      return;
    }

    // Validate file size (max 5MB)
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error('Hình ảnh phải nhỏ hơn 5MB!');
      return;
    }

    try {
      setUploadLoading(true);
      
      // Tạo URL tạm thời để preview
      const tempUrl = URL.createObjectURL(file);
      setImageUrl(tempUrl);
      message.success('Upload hình ảnh thành công');
      
      // TODO: Implement actual upload to server
      // const formData = new FormData();
      // formData.append('file', file);
      // const response = await CourseService.uploadCourseImage(file);
      // if (response.success) {
      //   setImageUrl(response.data.url);
      //   message.success('Upload hình ảnh thành công');
      // }
    } catch (error) {
      console.error('Upload error:', error);
      message.error('Lỗi khi upload hình ảnh');
    } finally {
      setUploadLoading(false);
    }
  };

  // Hiển thị danh sách học viên
  const showEnrollmentList = (course) => {
    setSelectedCourse(course);
    setEnrollmentModalVisible(true);
  };

  // Đóng modal danh sách học viên
  const closeEnrollmentModal = () => {
    setEnrollmentModalVisible(false);
    setSelectedCourse(null);
  };

  // Đóng modal tạo khóa học
  const closeCreateModal = () => {
    setCreateModalVisible(false);
  };

  // Xử lý sau khi tạo khóa học thành công
  const handleCreateSuccess = () => {
    loadCourses(); // Reload danh sách
  };

  // Cấu hình columns cho bảng
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60,
      sorter: true,
    },
    {
      title: 'Hình ảnh',
      dataIndex: 'thumbnailUrl',
      key: 'thumbnailUrl',
      width: 80,
      render: (url) => (
        <Image
          width={50}
          height={50}
          src={url || '/api/placeholder/50/50'}
          fallback="/api/placeholder/50/50"
          style={{ objectFit: 'cover', borderRadius: 4 }}
        />
      ),
    },
    {
      title: 'Tên khóa học',
      dataIndex: 'courseName',
      key: 'courseName',
      ellipsis: {
        showTitle: false,
      },
      render: (text) => (
        <Tooltip title={text}>
          <span>{text}</span>
        </Tooltip>
      ),
    },
    {
      title: 'Mô tả',
      dataIndex: 'courseDescription',
      key: 'courseDescription',
      width: 200,
      ellipsis: {
        showTitle: false,
      },
      render: (text) => (
        <Tooltip title={text}>
          <span>{text}</span>
        </Tooltip>
      ),
    },
    {
      title: 'Giá',
      dataIndex: 'price',
      key: 'price',
      width: 100,
      render: (price) => (
        <span>
          {price ? CourseService.formatCurrency(price) : 'Miễn phí'}
        </span>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isPublished',
      key: 'isPublished',
      width: 100,
      render: (isPublished) => (
        <Tag color={isPublished ? 'green' : 'orange'}>
          {isPublished ? 'Đã xuất bản' : 'Nháp'}
        </Tag>
      ),
    },
    {
      title: 'Số học viên',
      dataIndex: 'enrollmentCount',
      key: 'enrollmentCount',
      width: 100,
      render: (count) => (
        <span>{count || 0} học viên</span>
      ),
    },
    {
      title: 'Lượt xem',
      dataIndex: 'viewCount',
      key: 'viewCount',
      width: 100,
      render: (count) => (
        <span>{count || 0} lượt xem</span>
      ),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (date) => CourseService.formatDate(date),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button 
              icon={<EyeOutlined />} 
              size="small"
              onClick={() => navigate(`/admin/courses/${record.id}`)}
            />
          </Tooltip>
          <Tooltip title="Xem học viên">
            <Button 
              icon={<UserOutlined />} 
              size="small"
              onClick={() => showEnrollmentList(record)}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button 
              icon={<EditOutlined />} 
              size="small"
              onClick={() => showModal(record)}
            />
          </Tooltip>
          <Tooltip title={record.isPublished ? "Hủy xuất bản" : "Xuất bản"}>
            <Button 
              icon={record.isPublished ? <ClockCircleOutlined /> : <CheckCircleOutlined />}
              size="small"
              type={record.isPublished ? "default" : "primary"}
              onClick={() => handleTogglePublish(record.id, record.isPublished)}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Popconfirm
              title="Bạn có chắc chắn muốn xóa khóa học này?"
              description="Hành động này không thể hoàn tác."
              onConfirm={() => handleDelete(record.id)}
              okText="Xóa"
              cancelText="Hủy"
              okType="danger"
            >
              <Button 
                icon={<DeleteOutlined />} 
                size="small"
                danger
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  // Hiển thị lỗi nếu có
  if (error) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <Card>
          <p style={{ color: 'red' }}>Lỗi: {error}</p>
          <Button onClick={() => {
            clearError();
            loadCourses();
          }}>
            Thử lại
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      {/* Thống kê */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng khóa học"
              value={stats.totalCourses}
              prefix={<BookOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Đã xuất bản"
              value={stats.publishedCourses}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Chưa xuất bản"
              value={stats.unpublishedCourses}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng học viên"
              value={stats.totalEnrollments}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Header và các nút thao tác */}
      <Card 
        title="Quản lý khóa học"
        extra={
          <Space>
            <Button 
              icon={<ReloadOutlined />}
              onClick={() => loadCourses()}
              loading={loading}
            >
              Tải lại
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => showModal()}
            >
              Thêm khóa học
            </Button>
          </Space>
        }
      >
        {/* Thanh tìm kiếm */}
        <div style={{ marginBottom: '16px' }}>
          <Search
            placeholder="Tìm kiếm khóa học..."
            allowClear
            enterButton={<SearchOutlined />}
            size="large"
            onSearch={searchCourses}
            style={{ width: 400 }}
          />
        </div>

        {/* Bảng danh sách khóa học */}
        <Table
          columns={columns}
          dataSource={courses}
          loading={loading}
          rowKey="id"
          scroll={{ x: 1500 }}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} khóa học`,
            onChange: changePage,
            onShowSizeChange: changePage,
          }}
        />
      </Card>

      {/* Modal thêm/sửa khóa học */}
      <Modal
        title={editingCourse ? 'Chỉnh sửa khóa học' : 'Thêm khóa học mới'}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={800}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
        >
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                label="Hình ảnh khóa học"
                name="thumbnailUrl"
              >
                <div>
                  {imageUrl && (
                    <Image
                      width={200}
                      height={120}
                      src={imageUrl}
                      style={{ marginBottom: 16, objectFit: 'cover' }}
                    />
                  )}
                  <Upload
                    name="file"
                    listType="picture"
                    maxCount={1}
                    showUploadList={false}
                    beforeUpload={(file) => {
                      handleImageUpload(file);
                      return false; // Prevent automatic upload
                    }}
                  >
                    <Button icon={<UploadOutlined />} loading={uploadLoading}>
                      Upload hình ảnh
                    </Button>
                  </Upload>
                </div>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                label="Tên khóa học"
                name="courseName"
                rules={[
                  { required: true, message: 'Vui lòng nhập tên khóa học!' },
                  { max: 100, message: 'Tên khóa học không được vượt quá 100 ký tự!' }
                ]}
              >
                <Input placeholder="Nhập tên khóa học" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                label="Mô tả khóa học"
                name="courseDescription"
                rules={[
                  { required: true, message: 'Vui lòng nhập mô tả khóa học!' },
                  { max: 1000, message: 'Mô tả không được vượt quá 1000 ký tự!' }
                ]}
              >
                <TextArea
                  rows={4}
                  placeholder="Nhập mô tả khóa học"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="Giá khóa học (VND)"
                name="price"
              >
                <InputNumber
                  min={0}
                  placeholder="0"
                  style={{ width: '100%' }}
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/\$\s?|(,*)/g, '')}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Cấp độ"
                name="level"
              >
                <Select placeholder="Chọn cấp độ" allowClear>
                  <Option value="BEGINNER">Cơ bản</Option>
                  <Option value="INTERMEDIATE">Trung cấp</Option>
                  <Option value="ADVANCED">Nâng cao</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Thời lượng (giờ)"
                name="duration"
              >
                <InputNumber
                  min={0}
                  step={0.5}
                  placeholder="0"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Danh mục"
                name="category"
              >
                <Select placeholder="Chọn danh mục khóa học" allowClear>
                  <Option value="programming">Lập trình</Option>
                  <Option value="design">Thiết kế</Option>
                  <Option value="marketing">Marketing</Option>
                  <Option value="business">Kinh doanh</Option>
                  <Option value="language">Ngoại ngữ</Option>
                  <Option value="other">Khác</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Xuất bản ngay"
                name="isPublished"
                valuePropName="checked"
                tooltip="Bật để xuất bản khóa học ngay sau khi tạo"
              >
                <Switch checkedChildren="Có" unCheckedChildren="Không" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item style={{ marginTop: '24px', textAlign: 'right' }}>
            <Space>
              <Button onClick={handleCancel}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingCourse ? 'Cập nhật' : 'Tạo mới'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal danh sách học viên */}
      <CourseEnrollmentList
        visible={enrollmentModalVisible}
        onClose={closeEnrollmentModal}
        courseId={selectedCourse?.id}
        courseName={selectedCourse?.courseName}
      />

      {/* Modal tạo khóa học mới */}
      <CreateCourseForm
        visible={createModalVisible}
        onClose={closeCreateModal}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
};

export default CourseManagement;
