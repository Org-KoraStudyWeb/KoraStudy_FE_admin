// src/pages/admin/quiz/QuizQuestionManager.js
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Breadcrumb,
  Button,
  Space,
  List,
  Popconfirm,
  Tag,
  Tooltip,
  Row,
  Col,
  Statistic,
  message,
  Modal,
  Empty,
  Typography,
  Badge,
} from "antd";
import {
  ArrowLeftOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  QuestionCircleOutlined,
  EyeOutlined,
  FileTextOutlined,
  TrophyOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import QuizService from "../../../services/Quiz/QuizService";
import QuestionForm from "../../../components/quiz/QuestionForm";

const { Title, Text } = Typography;

const QuizQuestionManager = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [questionFormVisible, setQuestionFormVisible] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);

  // Load quiz và questions
  const loadQuizData = async () => {
    setLoading(true);
    try {
      // Load quiz info
      const quizResponse = await QuizService.getQuizById(quizId);
      if (quizResponse.success) {
        setQuiz(quizResponse.data);
      } else {
        message.error(quizResponse.message);
        return;
      }

      // Load questions
      const questionsResponse = await QuizService.getQuestionsByQuizId(quizId);
      if (questionsResponse.success) {
        setQuestions(questionsResponse.data);
      }
    } catch (error) {
      console.error("Load quiz data error:", error);
      message.error("Lỗi khi tải dữ liệu quiz");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (quizId) {
      loadQuizData();
    }
  }, [quizId]);

  // Question handlers
  const showQuestionForm = (question = null) => {
    setEditingQuestion(question);
    setQuestionFormVisible(true);
  };

  const closeQuestionForm = () => {
    setEditingQuestion(null);
    setQuestionFormVisible(false);
  };

  const handleQuestionSuccess = () => {
    closeQuestionForm();
    loadQuizData();
    message.success(
      editingQuestion
        ? "Cập nhật câu hỏi thành công!"
        : "Thêm câu hỏi thành công!"
    );
  };

  const handleDeleteQuestion = async (questionId) => {
    try {
      const response = await QuizService.deleteQuestion(questionId);
      if (response.success) {
        message.success(response.message);
        loadQuizData();
      } else {
        message.error(response.message);
      }
    } catch (error) {
      console.error("Delete question error:", error);
      message.error("Có lỗi xảy ra khi xóa câu hỏi");
    }
  };

  // Publish/Unpublish quiz
  const handleTogglePublish = async (checked) => {
    try {
      const response = await QuizService.publishQuiz(quizId, checked);
      if (response.success) {
        setQuiz((prev) => ({ ...prev, isPublished: checked }));
        message.success(checked ? "Đã công khai quiz" : "Đã ẩn quiz");
      } else {
        message.error(response.message);
      }
    } catch (error) {
      console.error("Toggle publish error:", error);
      message.error("Có lỗi xảy ra khi cập nhật trạng thái quiz");
    }
  };

  // Format text for display
  const renderFormattedText = (text) => {
    if (!text) return text;
    const html = text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/<u>(.*?)<\/u>/g, "<u>$1</u>")
      .replace(/\n/g, "<br />");
    return <span dangerouslySetInnerHTML={{ __html: html }} />;
  };

  if (loading && !quiz) {
    return (
      <div style={{ padding: "24px", textAlign: "center" }}>
        <Card loading={true}>
          <p>Đang tải thông tin quiz...</p>
        </Card>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div style={{ padding: "24px" }}>
        <Empty
          description="Không tìm thấy quiz"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Button
            type="primary"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(-1)}
          >
            Quay lại
          </Button>
        </Empty>
      </div>
    );
  }

  return (
    <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
      {/* Breadcrumb */}
      <Breadcrumb
        style={{ marginBottom: "16px" }}
        items={[
          {
            title: (
              <Button
                type="link"
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate(-1)}
                style={{ padding: 0 }}
              >
                Quản lý khóa học
              </Button>
            ),
          },
          {
            title: "Quiz: " + quiz.title,
          },
        ]}
      />

      {/* Quiz Info Header */}
      <Card
        style={{ marginBottom: "24px", borderRadius: "12px" }}
        bodyStyle={{ padding: "24px" }}
      >
        <Row gutter={24} align="middle">
          <Col flex="auto">
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 12,
                  backgroundColor: "#1890ff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: 24,
                  fontWeight: "bold",
                }}
              >
                <QuestionCircleOutlined />
              </div>
              <div>
                <Title level={3} style={{ marginBottom: 4 }}>
                  {quiz.title}
                </Title>
                <Text type="secondary">{quiz.description}</Text>
                <div style={{ marginTop: 8 }}>
                  <Space wrap>
                    <Tag color={quiz.isPublished ? "green" : "orange"}>
                      {quiz.isPublished ? "Đã công khai" : "Bản nháp"}
                    </Tag>
                    <Tag icon={<ClockCircleOutlined />}>
                      {quiz.timeLimit} phút
                    </Tag>
                    <Tag icon={<TrophyOutlined />} color="success">
                      Đạt: {quiz.passingScore}%
                    </Tag>
                    <Tag icon={<FileTextOutlined />}>
                      {questions.length} câu hỏi
                    </Tag>
                  </Space>
                </div>
              </div>
            </div>
          </Col>
          <Col>
            <Space direction="vertical">
              <div>
                <span style={{ marginRight: 8 }}>
                  {quiz.isPublished ? "Đã công khai" : "Chưa công khai"}
                </span>
                <Tooltip title="Công khai/Ẩn quiz">
                  <Button
                    type={quiz.isPublished ? "default" : "primary"}
                    onClick={() => handleTogglePublish(!quiz.isPublished)}
                  >
                    {quiz.isPublished ? "Ẩn quiz" : "Công khai"}
                  </Button>
                </Tooltip>
              </div>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => showQuestionForm()}
                size="large"
              >
                Thêm câu hỏi
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Questions List */}
      <Card
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <FileTextOutlined />
            Danh sách câu hỏi
            <Badge
              count={questions.length}
              style={{ backgroundColor: "#1890ff", marginLeft: 8 }}
            />
          </div>
        }
        extra={
          <Space>
            <Statistic
              title="Tổng điểm"
              value={questions.reduce((sum, q) => sum + (q.score || 0), 0)}
              precision={1}
              suffix="điểm"
              valueStyle={{ fontSize: 16 }}
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => showQuestionForm()}
            >
              Thêm câu hỏi
            </Button>
          </Space>
        }
      >
        {questions.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Chưa có câu hỏi nào"
            style={{ padding: "48px 0" }}
          >
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => showQuestionForm()}
              size="large"
            >
              Thêm câu hỏi đầu tiên
            </Button>
          </Empty>
        ) : (
          <List
            dataSource={questions}
            renderItem={(question, index) => (
              <List.Item
                key={question.id || index}
                actions={[
                  <Tooltip title="Chỉnh sửa" key="edit">
                    <Button
                      type="text"
                      icon={<EditOutlined />}
                      onClick={() => showQuestionForm(question)}
                    />
                  </Tooltip>,
                  <Popconfirm
                    key="delete"
                    title="Xóa câu hỏi này?"
                    onConfirm={() => handleDeleteQuestion(question.id)}
                    okText="Xóa"
                    cancelText="Hủy"
                    okType="danger"
                  >
                    <Tooltip title="Xóa">
                      <Button type="text" icon={<DeleteOutlined />} danger />
                    </Tooltip>
                  </Popconfirm>,
                ]}
                style={{
                  padding: "16px",
                  borderBottom: "1px solid #f0f0f0",
                  backgroundColor: index % 2 === 0 ? "#fafafa" : "white",
                }}
              >
                <List.Item.Meta
                  avatar={
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 18,
                        backgroundColor: "#1890ff",
                        color: "white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: "bold",
                        fontSize: 16,
                      }}
                    >
                      {index + 1}
                    </div>
                  }
                  title={
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 500, marginBottom: 4 }}>
                          {renderFormattedText(question.questionText)}
                        </div>
                        <Space size={[8, 8]} wrap>
                          <Tag color="blue">
                            {QuizService.getQuestionTypeLabel(
                              question.questionType
                            )?.label || question.questionType}
                          </Tag>
                          <Tag color="green">{question.score} điểm</Tag>
                          {question.imageUrl && (
                            <Tag color="purple" icon={<EyeOutlined />}>
                              Có ảnh
                            </Tag>
                          )}
                          {question.options && question.options.length > 0 && (
                            <Tag color="orange">
                              {question.options.length} đáp án
                            </Tag>
                          )}
                        </Space>
                      </div>
                    </div>
                  }
                  description={
                    question.explanation && (
                      <div style={{ marginTop: 8 }}>
                        <div
                          style={{
                            fontSize: 12,
                            color: "#666",
                            marginBottom: 4,
                          }}
                        >
                          Giải thích:
                        </div>
                        <div style={{ fontSize: 13, color: "#333" }}>
                          {renderFormattedText(question.explanation)}
                        </div>
                      </div>
                    )
                  }
                />
              </List.Item>
            )}
          />
        )}
      </Card>

      {/* Question Form Modal */}
      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: editingQuestion ? "#722ed1" : "#1890ff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontWeight: "bold",
              }}
            >
              {editingQuestion ? "✏️" : "➕"}
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 16 }}>
                {editingQuestion ? "Chỉnh sửa câu hỏi" : "Thêm câu hỏi mới"}
              </div>
              <div style={{ fontSize: 12, color: "#666" }}>
                Quiz: {quiz.title}
              </div>
            </div>
          </div>
        }
        open={questionFormVisible}
        onCancel={closeQuestionForm}
        footer={null}
        width={800}
        destroyOnClose
      >
        <QuestionForm
          quizId={quizId}
          onSuccess={handleQuestionSuccess}
          editingQuestion={editingQuestion}
        />
      </Modal>
    </div>
  );
};

export default QuizQuestionManager;
