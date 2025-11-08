// src/components/course/CreateCourseForm.js
import React, { useState } from "react";
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Switch,
  Upload,
  Button,
  Row,
  Col,
  message,
  Image,
  Space,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import CourseService from "../../services/CourseService";
import courseApi from "../../api/courseApi";
import { Editor } from "@tinymce/tinymce-react";

// TinyMCE wrapper để dễ bind với AntD Form
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

const CreateCourseForm = ({ visible, onClose, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [uploadLoading, setUploadLoading] = useState(false);
  const [fileList, setFileList] = useState([]);

  const handleSubmit = async (values) => {
    console.log("Form submitted with values:", values);

    setLoading(true);
    try {
      // ✅ GỬI ĐÚNG KEY mà BE mong đợi (CourseCreateRequest)
      const courseData = {
        courseName: values.courseName,
        courseDescription: values.courseDescription,
        courseImageUrl: imageUrl || null, // ✅ Đúng key
        courseLevel: values.level || null, // ✅ Đúng key (String)
        coursePrice: values.price || 0, // ✅ Đúng key (Double)
        isFree: false, // hoặc thêm field trong form nếu cần
        published: values.published || false,
      };

      console.log("Sending course data:", courseData);

      const response = await CourseService.createCourse(courseData);
      console.log("Service response:", response);

      if (response.success) {
        message.success(response.message || "Tạo khóa học thành công!");
        form.resetFields();
        setImageUrl("");
        setFileList([]);
        onClose();
        onSuccess && onSuccess();
      } else {
        message.error(response.message || "Có lỗi xảy ra");
      }
    } catch (error) {
      console.error("Create course error:", error);
      message.error("Có lỗi xảy ra khi tạo khóa học");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (file) => {
    console.log("Uploading file:", file);

    // Validate file
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      message.error("Chỉ chấp nhận file hình ảnh!");
      return false;
    }

    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error("Hình ảnh phải nhỏ hơn 5MB!");
      return false;
    }

    try {
      setUploadLoading(true);
      setFileList([file]); // hiển thị file đang upload

      // Gọi API để upload hình ảnh
      const response = await courseApi.uploadCourseImage(file);

      // ✅ Đọc đúng cấu trúc response từ UploadController: { url: "https://..." }
      const uploadedImageUrl = response?.data?.url;
      if (!uploadedImageUrl) {
        throw new Error("API không trả về URL của hình ảnh.");
      }

      setImageUrl(uploadedImageUrl);
      console.log("Image URL set:", uploadedImageUrl);
      message.success("Upload hình ảnh thành công!");
      return false;
    } catch (error) {
      console.error("Upload error:", error);
      message.error("Lỗi khi upload hình ảnh");
      setFileList([]);
      return false;
    } finally {
      setUploadLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setImageUrl("");
    setFileList([]);
    onClose();
  };

  return (
    <Modal
      title="Thêm khóa học mới"
      open={visible}
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
        {/* Hình ảnh */}
        <Form.Item label="Hình ảnh khóa học">
          <div>
            {imageUrl && (
              <div style={{ marginBottom: 16 }}>
                <Image
                  width={200}
                  height={120}
                  src={imageUrl}
                  style={{ objectFit: "cover", borderRadius: 8 }}
                />
              </div>
            )}
            <Upload
              name="file"
              listType="picture"
              maxCount={1}
              fileList={fileList}
              onRemove={() => setFileList([])}
              beforeUpload={(file) => {
                handleImageUpload(file);
                return false; // chặn upload tự động của antd
              }}
            >
              <Button icon={<UploadOutlined />} loading={uploadLoading}>
                {imageUrl ? "Thay đổi hình ảnh" : "Upload hình ảnh"}
              </Button>
            </Upload>
          </div>
        </Form.Item>

        {/* Tên khóa học */}
        <Form.Item
          label="Tên khóa học"
          name="courseName"
          rules={[
            { required: true, message: "Vui lòng nhập tên khóa học!" },
            {
              max: 100,
              message: "Tên khóa học không được vượt quá 100 ký tự!",
            },
          ]}
        >
          <Input placeholder="Nhập tên khóa học" />
        </Form.Item>

        {/* Mô tả (TinyMCE) */}
        <Form.Item
          label="Mô tả khóa học"
          name="courseDescription"
          rules={[
            { required: true, message: "Vui lòng nhập mô tả khóa học!" },
            { max: 10000, message: "Mô tả quá dài!" },
          ]}
        >
          <TinyEditor
            value={form.getFieldValue("courseDescription")}
            onChange={(val) => form.setFieldsValue({ courseDescription: val })}
          />
        </Form.Item>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item label="Giá khóa học (VND)" name="price" initialValue={0}>
              <InputNumber
                min={0}
                precision={0} //  không có phần thập phân
                stringMode // tránh lỗi chính xác số lớn
                style={{ width: "100%" }}
                formatter={(v) =>
                  (v ?? "").toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                parser={(v) => (v ?? "").toString().replace(/,/g, "")}
                onWheel={(e) => e.currentTarget.blur()} // tránh lăn chuột làm nhảy số
              />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item label="Cấp độ" name="level">
              <Select placeholder="Chọn cấp độ" allowClear>
                <Option value="BEGINNER">Cơ bản</Option>
                <Option value="INTERMEDIATE">Trung cấp</Option>
                <Option value="ADVANCED">Nâng cao</Option>
              </Select>
            </Form.Item>
          </Col>

          <Col span={8}>
            {/* Giữ lại UI thời lượng nếu bạn cần cho FE, 
                nhưng KHÔNG gửi lên BE trong payload */}
            <Form.Item
              label="Thời lượng (giờ)"
              name="duration"
              initialValue={0}
            >
              <InputNumber
                min={0}
                step={0.5}
                precision={1} //  hiển thị & giữ 1 chữ số thập phân (0.5)
                style={{ width: "100%" }}
                onWheel={(e) => e.currentTarget.blur()} //  tránh lăn chuột
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            {/* Tương tự, chỉ dùng nội bộ FE – không gửi lên BE */}
            <Form.Item label="Danh mục" name="category">
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
              name="published"
              valuePropName="checked"
              tooltip="Bật để xuất bản khóa học ngay sau khi tạo"
            >
              <Switch checkedChildren="Có" unCheckedChildren="Không" />
            </Form.Item>
          </Col>
        </Row>

        {/* Buttons */}
        <Form.Item style={{ marginTop: "24px", textAlign: "right" }}>
          <Space>
            <Button onClick={handleCancel}>Hủy</Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              Tạo khóa học
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateCourseForm;
