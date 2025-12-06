// src/pages/course/CourseManagement.js
import React, { useState } from "react";
import {
  Button,
  Space,
  message,
  Modal,
  Form,
  Select,
  Upload,
  Image,
  InputNumber,
  Card,
  Row,
  Col,
  Input,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import useCourseManagement from "../../hooks/useCourseManagement";
import CourseEnrollmentList from "../../components/course/CourseEnrollmentList";
import CreateCourseForm from "../../components/course/CreateCourseForm";
import CourseList from "../../components/course/CourseList";
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

const { Option } = Select;

const CourseManagement = () => {
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
    <>
      <CourseList
        courses={courses}
        loading={loading}
        stats={stats}
        pagination={pagination}
        onLoadCourses={loadCourses}
        onSearchCourses={searchCourses}
        onChangePage={changePage}
        onShowModal={showModal}
        onDeleteCourse={handleDelete}
        onTogglePublish={handleTogglePublish}
        onShowEnrollmentList={showEnrollmentList}
      />

      {/* ==== MODAL ==== */}
      <Modal
        title={editingCourse ? "Chỉnh sửa khóa học" : "Thêm khóa học mới"}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={800}
        destroyOnHidden
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
    </>
  );
};

export default CourseManagement;
