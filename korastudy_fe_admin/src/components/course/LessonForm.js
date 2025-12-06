// src/components/course/LessonForm.js
import React, { useState } from "react";
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Button,
  Space,
  Upload,
  message,
  Row,
  Col,
  Progress,
} from "antd";
import { UploadOutlined, DeleteOutlined } from "@ant-design/icons";
import LessonService from "../../services/LessonService";

const { TextArea } = Input;
const { Option } = Select;

const LessonForm = ({
  visible,
  onClose,
  onSuccess,
  sectionId,
  editingLesson = null,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [documentUrl, setDocumentUrl] = useState("");
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleSubmit = async (values) => {
    console.log("Lesson form submitted:", values);

    setLoading(true);
    try {
      const lessonData = {
        lessonTitle: values.lessonTitle,
        content: values.content || "",
        videoUrl: videoUrl || null,
        documentUrl: documentUrl || null,
        contentType: values.contentType,
        orderIndex: values.orderIndex,
        duration: values.duration || 0,
        sectionId: sectionId,
      };

      console.log("Lesson data:", lessonData);

      let response;
      if (editingLesson) {
        response = await LessonService.updateLesson(
          editingLesson.id,
          lessonData
        );
      } else {
        response = await LessonService.createLesson(lessonData);
      }

      console.log("Lesson API response:", response);

      if (response.success) {
        message.success(response.message || "Lưu bài học thành công!");
        form.resetFields();
        setVideoUrl("");
        setDocumentUrl("");
        onClose();
        onSuccess && onSuccess();
      } else {
        message.error(response.message || "Có lỗi xảy ra");
      }
    } catch (error) {
      console.error("Lesson form error:", error);
      message.error("Có lỗi xảy ra khi lưu bài học");
    } finally {
      setLoading(false);
    }
  };

  //  Upload video thật lên server
  const handleVideoUpload = async (file) => {
    console.log("Uploading video to server:", file);

    // Validate file type
    const isVideo = file.type.startsWith("video/");
    if (!isVideo) {
      message.error("Chỉ chấp nhận file video!");
      return false;
    }

    // Validate file size (max 500MB)
    const isLt500M = file.size / 1024 / 1024 < 500;
    if (!isLt500M) {
      message.error("Video phải nhỏ hơn 500MB!");
      return false;
    }

    try {
      setUploadLoading(true);
      setUploadProgress(0);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // UPLOAD THẬT LÊN SERVER
      const response = await LessonService.uploadVideo(file, file.name);

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (response.success) {
        const uploadedVideoUrl = response.data;
        setVideoUrl(uploadedVideoUrl);
        message.success("Upload video lên thành công!");

        // TỰ ĐỘNG TÍNH THỜI LƯỢNG (nếu backend trả về duration)
        // Có thể gọi API để lấy video metadata hoặc để backend tính
        console.log("Video uploaded to:", uploadedVideoUrl);
      } else {
        message.error(response.message || "Upload video thất bại");
      }
    } catch (error) {
      console.error("Upload video error:", error);
      message.error("Lỗi khi upload video");
    } finally {
      setUploadLoading(false);
      setUploadProgress(0);
    }

    return false; // Prevent default upload
  };

  //Upload document thật lên server
  const handleDocumentUpload = async (file) => {
    console.log("Uploading document to server:", file);

    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ];

    if (!allowedTypes.includes(file.type)) {
      message.error(
        "Chỉ chấp nhận file tài liệu (PDF, DOC, DOCX, TXT, PPT, PPTX)"
      );
      return false;
    }

    // Validate file size (max 50MB)
    const isLt50M = file.size / 1024 / 1024 < 50;
    if (!isLt50M) {
      message.error("Tài liệu phải nhỏ hơn 50MB!");
      return false;
    }

    try {
      setUploadLoading(true);
      setUploadProgress(0);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // UPLOAD THẬT LÊN SERVER
      const response = await LessonService.uploadDocument(file, file.name);

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (response.success) {
        const uploadedDocumentUrl = response.data;
        setDocumentUrl(uploadedDocumentUrl);
        message.success("Upload tài liệu lên thành công!");
        console.log("Document uploaded to:", uploadedDocumentUrl);
      } else {
        message.error(response.message || "Upload tài liệu thất bại");
      }
    } catch (error) {
      console.error("Upload document error:", error);
      message.error("Lỗi khi upload tài liệu");
    } finally {
      setUploadLoading(false);
      setUploadProgress(0);
    }

    return false; // Prevent default upload
  };

  // Xóa file khỏi Cloudinary
  const handleDeleteVideo = async () => {
    if (!videoUrl) return;

    try {
      const response = await LessonService.deleteFile(videoUrl);
      if (response.success) {
        setVideoUrl("");
        message.success("Đã xóa video khỏi Cloudinary");
      } else {
        message.error(response.message || "Xóa video thất bại");
      }
    } catch (error) {
      console.error("Delete video error:", error);
      message.error("Lỗi khi xóa video");
    }
  };

  const handleDeleteDocument = async () => {
    if (!documentUrl) return;

    try {
      const response = await LessonService.deleteFile(documentUrl);
      if (response.success) {
        setDocumentUrl("");
        message.success("Đã xóa tài liệu khỏi Cloudinary");
      } else {
        message.error(response.message || "Xóa tài liệu thất bại");
      }
    } catch (error) {
      console.error("Delete document error:", error);
      message.error("Lỗi khi xóa tài liệu");
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setVideoUrl("");
    setDocumentUrl("");
    setUploadProgress(0);
    onClose();
  };

  // Format duration từ giây sang phút:giây
  const formatDuration = (seconds) => {
    if (!seconds) return "0:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  // Set form values when editing
  React.useEffect(() => {
    if (visible && editingLesson) {
      form.setFieldsValue({
        lessonTitle: editingLesson.lessonTitle,
        content: editingLesson.content,
        contentType: editingLesson.contentType,
        orderIndex: editingLesson.orderIndex,
        duration: editingLesson.duration,
      });
      setVideoUrl(editingLesson.videoUrl || "");
      setDocumentUrl(editingLesson.documentUrl || "");
    } else if (visible && !editingLesson) {
      form.resetFields();
      setVideoUrl("");
      setDocumentUrl("");
    }
  }, [visible, editingLesson, form]);

  return (
    <Modal
      title={editingLesson ? "Chỉnh sửa bài học" : "Thêm bài học mới"}
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
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              label="Tiêu đề bài học"
              name="lessonTitle"
              rules={[
                { required: true, message: "Vui lòng nhập tiêu đề bài học!" },
                { max: 200, message: "Tiêu đề không được vượt quá 200 ký tự!" },
              ]}
            >
              <Input placeholder="Nhập tiêu đề bài học" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Loại nội dung"
              name="contentType"
              rules={[
                { required: true, message: "Vui lòng chọn loại nội dung!" },
              ]}
            >
              <Select placeholder="Chọn loại nội dung">
                <Option value="VIDEO">Video</Option>
                <Option value="TEXT">Văn bản</Option>
                <Option value="QUIZ">Bài kiểm tra</Option>
                <Option value="ASSIGNMENT">Bài tập</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              label="Thứ tự hiển thị"
              name="orderIndex"
              rules={[
                { required: true, message: "Vui lòng nhập thứ tự!" },
                { type: "number", min: 1, message: "Thứ tự phải lớn hơn 0!" },
              ]}
            >
              <InputNumber
                min={1}
                placeholder="Thứ tự"
                style={{ width: "100%" }}
              />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              label="Thời lượng (giây)"
              name="duration"
              rules={[
                {
                  type: "number",
                  min: 0,
                  message: "Thời lượng không được âm!",
                },
              ]}
            >
              <InputNumber
                min={0}
                placeholder="Giây"
                style={{ width: "100%" }}
                formatter={(value) => formatDuration(value)}
                parser={(value) => value.replace(/[^\d]/g, "")}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          label="Nội dung bài học"
          name="content"
          rules={[
            { required: true, message: "Vui lòng nhập nội dung bài học!" },
          ]}
        >
          <TextArea
            rows={6}
            placeholder="Nhập nội dung bài học chi tiết..."
            showCount
            maxLength={2000}
          />
        </Form.Item>

        {/* Video Upload Section */}
        <Form.Item label="Video bài học">
          <div>
            {videoUrl && (
              <div style={{ marginBottom: 16 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: 8,
                  }}
                >
                  <span style={{ color: "#52c41a", marginRight: 8 }}>✅</span>
                  <span style={{ color: "#666" }}>
                    Video đã upload: {videoUrl.split("/").pop()}
                  </span>
                </div>
                <video
                  width="100%"
                  height="200"
                  controls
                  src={videoUrl}
                  style={{
                    borderRadius: 8,
                    backgroundColor: "#f0f0f0",
                    border: "1px solid #d9d9d9",
                  }}
                >
                  Your browser does not support the video tag.
                </video>
                <Button
                  type="link"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={handleDeleteVideo}
                  style={{ marginTop: 8 }}
                >
                  Xóa video
                </Button>
              </div>
            )}

            {uploadProgress > 0 && uploadProgress < 100 && (
              <Progress percent={uploadProgress} status="active" />
            )}

            <Upload
              name="file"
              accept="video/*"
              maxCount={1}
              showUploadList={false}
              beforeUpload={handleVideoUpload}
              disabled={uploadLoading}
            >
              <Button
                icon={<UploadOutlined />}
                loading={uploadLoading}
                type={videoUrl ? "default" : "primary"}
              >
                {videoUrl ? "Thay đổi video" : "Upload video "}
              </Button>
            </Upload>
            <div style={{ fontSize: "12px", color: "#666", marginTop: 4 }}>
              Hỗ trợ: MP4, MOV, AVI, MKV (tối đa 500MB)
            </div>
          </div>
        </Form.Item>

        {/* Document Upload Section */}
        <Form.Item label="Tài liệu bài học">
          <div>
            {documentUrl && (
              <div style={{ marginBottom: 16 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: 8,
                  }}
                >
                  <span style={{ color: "#52c41a", marginRight: 8 }}>✅</span>
                  <span style={{ color: "#666" }}>
                    Tài liệu đã upload: {documentUrl.split("/").pop()}
                  </span>
                </div>
                <Button
                  type="link"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={handleDeleteDocument}
                >
                  Xóa tài liệu
                </Button>
              </div>
            )}

            <Upload
              name="file"
              accept=".pdf,.doc,.docx,.txt,.ppt,.pptx"
              maxCount={1}
              showUploadList={false}
              beforeUpload={handleDocumentUpload}
              disabled={uploadLoading}
            >
              <Button
                icon={<UploadOutlined />}
                loading={uploadLoading}
                type={documentUrl ? "default" : "primary"}
              >
                {documentUrl ? "Thay đổi tài liệu" : "Upload tài liệu"}
              </Button>
            </Upload>
            <div style={{ fontSize: "12px", color: "#666", marginTop: 4 }}>
              Hỗ trợ: PDF, DOC, DOCX, TXT, PPT, PPTX (tối đa 50MB)
            </div>
          </div>
        </Form.Item>

        <Form.Item style={{ textAlign: "right", marginTop: "24px" }}>
          <Space>
            <Button onClick={handleCancel}>Hủy</Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              {editingLesson ? "Cập nhật" : "Tạo bài học"}
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default LessonForm;
