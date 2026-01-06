// src/components/quiz/QuizForm.js - CHỈ TẠO QUIZ CƠ BẢN
import React, { useState, useEffect, useCallback } from "react";
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Button,
  message,
  Row,
  Col,
  Card,
  Divider,
  Tooltip,
  Alert,
  Switch,
} from "antd";
import {
  ClockCircleOutlined,
  TrophyOutlined,
  QuestionCircleOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import QuizService from "../../services/Quiz/QuizService";
import TextEditor from "../common/TextEditor";

const QuizForm = ({ visible, onClose, onSuccess, sectionId, editingQuiz }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [publishStatus, setPublishStatus] = useState(
    editingQuiz ? editingQuiz.isPublished : false
  );

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const quizData = {
        ...values,
        sectionId,
        isPublished: publishStatus,
      };

      const response = editingQuiz
        ? await QuizService.updateQuiz(editingQuiz.id, quizData)
        : await QuizService.createQuiz(quizData);

      if (response.success) {
        message.success(response.message || "Lưu quiz thành công!");
        form.resetFields();
        onClose();
        onSuccess();
      } else {
        message.error(response.message || "Có lỗi xảy ra");
      }
    } catch (error) {
      console.error("Quiz form error:", error);
      message.error("Có lỗi xảy ra khi lưu quiz");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = useCallback(() => {
    form.resetFields();
    setPublishStatus(false);
  }, [form]);

  useEffect(() => {
    if (visible && editingQuiz) {
      form.setFieldsValue({
        title: editingQuiz.title,
        description: editingQuiz.description,
        timeLimit: editingQuiz.timeLimit,
        passingScore: editingQuiz.passingScore,
      });
      setPublishStatus(editingQuiz.isPublished);
    } else if (visible) {
      resetForm();
    }
  }, [visible, editingQuiz, form, resetForm]);

  return (
    <Modal
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 8,
              backgroundColor: editingQuiz ? "#722ed1" : "#1890ff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: "bold",
              fontSize: 18,
            }}
          >
            {editingQuiz ? "✏️" : "📝"}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 18 }}>
              {editingQuiz ? "Chỉnh sửa quiz" : "Tạo quiz mới"}
            </div>
            <div style={{ fontSize: 12, color: "#666" }}>
              {sectionId ? `Section: ${sectionId}` : "Quiz thuộc khóa học"}
            </div>
          </div>
        </div>
      }
      open={visible}
      onCancel={onClose}
      width={800}
      destroyOnHidden
      bodyStyle={{ padding: "24px 0", maxHeight: "80vh", overflow: "auto" }}
      footer={[
        <Button key="cancel" onClick={onClose} size="large">
          Hủy
        </Button>,
        <Button
          key="submit"
          type="primary"
          size="large"
          loading={loading}
          onClick={() => form.submit()}
          style={{
            backgroundColor: editingQuiz ? "#722ed1" : "#1890ff",
            borderColor: editingQuiz ? "#722ed1" : "#1890ff",
          }}
        >
          {editingQuiz ? "Cập nhật quiz" : "Tạo quiz"}
        </Button>,
      ]}
    >
      <div style={{ padding: "0 24px" }}>
        <Alert
          message="Tạo quiz cơ bản"
          description={
            editingQuiz
              ? "Chỉnh sửa thông tin quiz. Câu hỏi sẽ được quản lý riêng."
              : "Tạo quiz trước, sau đó thêm câu hỏi trong trang quản lý quiz."
          }
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
        >
          <Row gutter={32}>
            <Col span={16}>
              <Card
                title={
                  <span style={{ fontWeight: 600 }}>📋 Thông tin chung</span>
                }
                style={{ marginBottom: 24 }}
              >
                <Form.Item
                  label={
                    <span style={{ fontWeight: 600, fontSize: 14 }}>
                      Tiêu đề quiz *
                      <Tooltip title="Tiêu đề ngắn gọn, hấp dẫn cho quiz">
                        <QuestionCircleOutlined
                          style={{ marginLeft: 8, color: "#999" }}
                        />
                      </Tooltip>
                    </span>
                  }
                  name="title"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng nhập tiêu đề quiz!",
                    },
                    { max: 200, message: "Tiêu đề tối đa 200 ký tự!" },
                  ]}
                >
                  <Input
                    placeholder="Nhập tiêu đề quiz"
                    size="large"
                    style={{
                      borderRadius: 8,
                      padding: "12px 16px",
                    }}
                  />
                </Form.Item>

                <Form.Item
                  label={
                    <span style={{ fontWeight: 600, fontSize: 14 }}>
                      📝 Mô tả quiz
                    </span>
                  }
                  name="description"
                  extra={
                    <div
                      style={{
                        fontSize: 12,
                        color: "#666",
                        marginTop: 4,
                      }}
                    >
                      Mô tả về nội dung và mục tiêu của quiz
                    </div>
                  }
                >
                  <TextEditor
                    placeholder="Mô tả chi tiết về nội dung quiz, mục tiêu học tập..."
                    rows={4}
                    maxLength={1000}
                    showPreview={true}
                  />
                </Form.Item>
              </Card>
            </Col>

            <Col span={8}>
              <Card
                title={<span style={{ fontWeight: 600 }}>⚙️ Cài đặt</span>}
                style={{ marginBottom: 24 }}
              >
                <div style={{ padding: 8 }}>
                  <div style={{ marginBottom: 24 }}>
                    <label
                      style={{
                        display: "block",
                        marginBottom: 8,
                        fontWeight: 600,
                      }}
                    >
                      Trạng thái
                    </label>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <Switch
                        checked={publishStatus}
                        onChange={setPublishStatus}
                      />
                      <span>{publishStatus ? "Đã công khai" : "Bản nháp"}</span>
                    </div>
                    <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
                      {publishStatus
                        ? "Quiz có thể được học viên truy cập"
                        : "Chỉ admin có thể xem và chỉnh sửa"}
                    </div>
                  </div>

                  <Divider style={{ margin: "16px 0" }} />

                  <div
                    style={{
                      padding: "12px",
                      backgroundColor: "#f6ffed",
                      borderRadius: 8,
                      border: "1px solid #b7eb8f",
                    }}
                  >
                    <div style={{ fontSize: 12, color: "#666" }}>
                      <FileTextOutlined style={{ marginRight: 4 }} />
                      Sau khi tạo quiz, bạn có thể:
                    </div>
                    <ul
                      style={{
                        fontSize: 11,
                        color: "#666",
                        paddingLeft: 16,
                        margin: "8px 0 0 0",
                      }}
                    >
                      <li>Thêm câu hỏi và đáp án</li>
                      <li>Cài đặt thời gian làm bài</li>
                      <li>Xem kết quả và thống kê</li>
                    </ul>
                  </div>
                </div>
              </Card>
            </Col>
          </Row>

          <Divider orientation="left">
            <span style={{ fontWeight: 600, fontSize: 14 }}>
              ⚙️ Cài đặt làm bài
            </span>
          </Divider>

          <Row gutter={24}>
            <Col span={12}>
              <Card
                size="small"
                style={{
                  border: "1px solid #91d5ff",
                  backgroundColor: "#f0f9ff",
                  borderRadius: 8,
                }}
              >
                <Form.Item
                  label={
                    <span style={{ fontWeight: 600 }}>
                      <ClockCircleOutlined style={{ marginRight: 8 }} />
                      Thời gian làm bài (phút) *
                    </span>
                  }
                  name="timeLimit"
                  rules={[
                    { required: true, message: "Vui lòng nhập thời gian!" },
                    { type: "number", min: 1, message: "Tối thiểu 1 phút!" },
                  ]}
                  initialValue={30}
                  extra="Thời gian tối đa để hoàn thành quiz"
                >
                  <InputNumber
                    min={1}
                    max={180}
                    placeholder="Ví dụ: 30"
                    style={{ width: "100%" }}
                    size="large"
                    addonAfter="phút"
                  />
                </Form.Item>
              </Card>
            </Col>
            <Col span={12}>
              <Card
                size="small"
                style={{
                  border: "1px solid #b7eb8f",
                  backgroundColor: "#f6ffed",
                  borderRadius: 8,
                }}
              >
                <Form.Item
                  label={
                    <span style={{ fontWeight: 600 }}>
                      <TrophyOutlined style={{ marginRight: 8 }} />
                      Điểm đạt (%) *
                    </span>
                  }
                  name="passingScore"
                  rules={[
                    { required: true, message: "Vui lòng nhập điểm đạt!" },
                    {
                      type: "number",
                      min: 1,
                      max: 100,
                      message: "Từ 1 đến 100%!",
                    },
                  ]}
                  initialValue={60}
                  extra="Điểm tối thiểu để vượt qua quiz"
                >
                  <InputNumber
                    min={1}
                    max={100}
                    placeholder="Ví dụ: 60"
                    style={{ width: "100%" }}
                    size="large"
                    addonAfter="%"
                  />
                </Form.Item>
              </Card>
            </Col>
          </Row>
        </Form>
      </div>
    </Modal>
  );
};

export default QuizForm;
