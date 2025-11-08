// src/pages/course/CourseManagement.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  Upload,
  Image,
  Tooltip,
  InputNumber,
} from "antd";
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
  ReloadOutlined,
} from "@ant-design/icons";
import useCourseManagement from "../../hooks/useCourseManagement";
import CourseService from "../../services/CourseService";
import CourseEnrollmentList from "../../components/course/CourseEnrollmentList";
import CreateCourseForm from "../../components/course/CreateCourseForm";
import { Editor } from "@tinymce/tinymce-react";

// TinyMCE wrapper so AntD Form can pass value/onChange
const TinyEditor = ({ value = "", onChange }) => {
  return (
    <Editor
      apiKey={process.env.REACT_APP_TINYMCE_API_KEY || ""}
      value={value}
      init={{
        height: 300,
        menubar: false,
        plugins: [
          "advlist autolink lists link image charmap preview anchor",
          "searchreplace visualblocks code fullscreen",
          "insertdatetime media table paste code help wordcount",
        ],
        toolbar:
          "undo redo | formatselect | bold italic underline | alignleft aligncenter alignright | bullist numlist outdent indent | removeformat | help",
      }}
      onEditorChange={(content) => onChange && onChange(content)}
    />
  );
};

const { Search } = Input;
const { Option } = Select;

const CourseManagement = () => {
  const navigate = useNavigate();

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
    clearError,
  } = useCourseManagement();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [form] = Form.useForm();
  const [imageUrl, setImageUrl] = useState("");
  const [uploadLoading, setUploadLoading] = useState(false);
  const [enrollmentModalVisible, setEnrollmentModalVisible] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [createModalVisible, setCreateModalVisible] = useState(false);

  // ========== MODAL ==========
  const showModal = (course = null) => {
    if (course) {
      setEditingCourse(course);
      setIsModalVisible(true);
      form.setFieldsValue({
        courseName: course.courseName,
        courseDescription: course.courseDescription,
        coursePrice: course.coursePrice,
        courseLevel: course.courseLevel,
        duration: course.duration,
        category: course.category,
        published: course.published,
      });
      setImageUrl(course.courseImageUrl || "");
    } else {
      setCreateModalVisible(true);
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingCourse(null);
    form.resetFields();
    setImageUrl("");
  };

  const handleCreateSuccess = () => loadCourses();
  const closeCreateModal = () => setCreateModalVisible(false);

  // ========== CRUD ==========
  const handleSubmit = async (values) => {
    try {
      const courseData = {
        courseName: values.courseName,
        courseDescription: values.courseDescription,
        coursePrice: values.coursePrice ? parseFloat(values.coursePrice) : 0,
        courseLevel: values.courseLevel || null,
        duration: values.duration ? parseFloat(values.duration) : null,
        category: values.category || null,
        published: values.published || false,
        courseImageUrl: imageUrl || null,
      };

      let response;
      if (editingCourse) {
        response = await updateCourse(editingCourse.id, courseData);
      } else {
        response = await createCourse(courseData);
      }

      if (response.success) {
        message.success(response.message || "Lưu khóa học thành công");
        handleCancel();
      } else {
        message.error(response.message || "Có lỗi xảy ra");
      }
    } catch {
      message.error("Có lỗi xảy ra khi lưu khóa học");
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await deleteCourse(id);
      if (response.success) message.success(response.message);
      else message.error(response.message);
    } catch {
      message.error("Có lỗi xảy ra khi xóa khóa học");
    }
  };

  const handleTogglePublish = async (id, currentStatus) => {
    try {
      // When currentStatus is true, set to false to unpublish
      const newStatus = currentStatus ? false : true;
      const response = await togglePublishCourse(id, newStatus);
      if (response.success) {
        message.success(
          newStatus ? "Đã xuất bản khóa học" : "Đã ngừng xuất bản khóa học"
        );
      } else {
        message.error(response.message);
      }
    } catch {
      message.error("Có lỗi khi thay đổi trạng thái xuất bản");
    }
  };

  // ========== IMAGE UPLOAD ==========
  const handleImageUpload = async (file) => {
    const isImage = file.type.startsWith("image/");
    if (!isImage) return message.error("Chỉ chấp nhận file hình ảnh!");
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) return message.error("Hình ảnh phải nhỏ hơn 5MB!");

    try {
      setUploadLoading(true);
      const tempUrl = URL.createObjectURL(file);
      setImageUrl(tempUrl);
      message.success("Upload hình ảnh thành công");
    } finally {
      setUploadLoading(false);
    }
  };

  // ========== ENROLLMENT ==========
  const showEnrollmentList = (course) => {
    setSelectedCourse(course);
    setEnrollmentModalVisible(true);
  };
  const closeEnrollmentModal = () => {
    setEnrollmentModalVisible(false);
    setSelectedCourse(null);
  };

  // ========== TABLE ==========
  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 60,
      sorter: true,
      fixed: "left",
    },
    {
      title: "Hình ảnh",
      dataIndex: "courseImageUrl",
      key: "courseImageUrl",
      width: 80,
      render: (url) => (
        <Image
          width={50}
          height={50}
          src={url || "/api/placeholder/50/50"}
          fallback="/api/placeholder/50/50"
          style={{ objectFit: "cover", borderRadius: 4 }}
        />
      ),
    },
    {
      title: "Tên khóa học",
      dataIndex: "courseName",
      key: "courseName",
      width: 150,
      onCell: () => ({
        style: {
          whiteSpace: "normal",
          wordBreak: "break-word",
        },
      }),
      render: (text) => (
        <div style={{ whiteSpace: "normal", wordBreak: "break-word" }}>
          <strong>{text}</strong>
        </div>
      ),
    },
    {
      title: "Mô tả",
      dataIndex: "courseDescription",
      key: "courseDescription",
      width: 250,
      onCell: () => ({
        style: {
          whiteSpace: "normal",
          wordBreak: "break-word",
        },
      }),
      render: (text) => (
        <div
          style={{
            whiteSpace: "normal",
            wordBreak: "break-word",
            maxHeight: "100px",
            overflow: "hidden",
            position: "relative",
          }}
        >
          <div
            dangerouslySetInnerHTML={{
              __html: text || "—",
            }}
            style={{
              fontSize: "14px",
              lineHeight: "1.5",
            }}
          />
          {text?.length > 150 && (
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: "24px",
                background: "linear-gradient(transparent, white)",
              }}
            />
          )}
        </div>
      ),
    },
    {
      title: "Giá",
      dataIndex: "coursePrice",
      key: "coursePrice",
      width: 100,
      render: (coursePrice) => (
        <span>
          {coursePrice ? CourseService.formatCurrency(coursePrice) : "Miễn phí"}
        </span>
      ),
    },
    {
      title: "Cấp độ",
      dataIndex: "courseLevel",
      key: "courseLevel",
      width: 100,
      render: (courseLevel) => {
        let color;
        switch (courseLevel) {
          case "BEGINNER":
            color = "green";
            break;
          case "INTERMEDIATE":
            color = "orange";
            break; // Thêm 'break' vào đây
          case "ADVANCED":
            color = "red";
            break;
          default:
            color = "gray";
        }
        return (
          <Tag color={color}>
            {courseLevel
              ? courseLevel.charAt(0) + courseLevel.slice(1).toLowerCase()
              : "Không xác định"}
          </Tag>
        );
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "published",
      key: "published",
      width: 100,
      render: (published) => (
        <Tag color={published ? "green" : "orange"}>
          {published ? "Đã xuất bản" : "Nháp"}
        </Tag>
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 120,
      render: (date) => CourseService.formatDate(date),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 200,
      fixed: "right",
      render: (_, record) => (
        <Space wrap>
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
          <Tooltip title={record.published ? "Hủy xuất bản" : "Xuất bản"}>
            <Button
              icon={
                record.published ? (
                  <ClockCircleOutlined />
                ) : (
                  <CheckCircleOutlined />
                )
              }
              size="small"
              type={record.published ? "default" : "primary"}
              onClick={() => handleTogglePublish(record.id, record.published)}
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
              <Button icon={<DeleteOutlined />} size="small" danger />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  if (error) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <Card>
          <p style={{ color: "red" }}>Lỗi: {error}</p>
          <Button
            onClick={() => {
              clearError();
              loadCourses();
            }}
          >
            Thử lại
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      {/* ==== THỐNG KÊ ==== */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
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
              valueStyle={{ color: "#3f8600" }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Chưa xuất bản"
              value={stats.unpublishedCourses}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: "#cf1322" }}
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

      {/* ==== BẢNG KHÓA HỌC ==== */}
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
        {/* Tìm kiếm */}
        <div style={{ marginBottom: 16 }}>
          <Search
            placeholder="Tìm kiếm khóa học..."
            allowClear
            enterButton={<SearchOutlined />}
            size="large"
            onSearch={(value) => searchCourses(value)}
            onChange={(e) => e.target.value === "" && searchCourses("")}
            style={{ maxWidth: 400, width: "100%" }}
          />
        </div>

        {/* Bảng danh sách khóa học */}
        <Table
          columns={columns}
          dataSource={courses}
          loading={loading}
          rowKey="id"
          tableLayout="fixed"
          scroll={{ x: "max-content" }}
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

      {/* ==== MODAL ==== */}
      <Modal
        title={editingCourse ? "Chỉnh sửa khóa học" : "Thêm khóa học mới"}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={800}
        destroyOnClose
      >
        {/* Giữ nguyên CreateForm gốc */}
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
        >
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item label="Hình ảnh khóa học" name="courseImageUrl">
                <div>
                  {imageUrl && (
                    <Image
                      width={200}
                      height={120}
                      src={imageUrl}
                      style={{ marginBottom: 16, objectFit: "cover" }}
                    />
                  )}
                  <Upload
                    name="file"
                    listType="picture"
                    maxCount={1}
                    showUploadList={false}
                    beforeUpload={(file) => {
                      handleImageUpload(file);
                      return false;
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
                rules={[{ required: true, message: "Vui lòng nhập tên!" }]}
              >
                <Input placeholder="Nhập tên khóa học" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item label="Mô tả khóa học" name="courseDescription">
                {/* Kết nối TinyMCE với AntD Form bằng cách lấy value từ form và cập nhật form khi editor thay đổi */}
                <TinyEditor
                  value={form.getFieldValue("courseDescription")}
                  onChange={(val) =>
                    form.setFieldsValue({ courseDescription: val })
                  }
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label="Giá (VND)" name="coursePrice">
                <InputNumber
                  min={0}
                  placeholder="0"
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Cấp độ" name="courseLevel">
                <Select placeholder="Chọn cấp độ" allowClear>
                  <Option value="BEGINNER">Cơ bản</Option>
                  <Option value="INTERMEDIATE">Trung cấp</Option>
                  <Option value="ADVANCED">Nâng cao</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Thời lượng (giờ)" name="duration">
                <InputNumber
                  min={0}
                  step={0.5}
                  placeholder="0"
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item style={{ textAlign: "right" }}>
            <Space>
              <Button onClick={handleCancel}>Hủy</Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingCourse ? "Cập nhật" : "Tạo mới"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <CourseEnrollmentList
        visible={enrollmentModalVisible}
        onClose={closeEnrollmentModal}
        courseId={selectedCourse?.id}
        courseName={selectedCourse?.courseName}
      />

      <CreateCourseForm
        visible={createModalVisible}
        onClose={closeCreateModal}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
};

export default CourseManagement;
