// src/pages/admin/quiz/QuizQuestionManager.js
import React, { useState, useEffect, useCallback } from "react";
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
  FloatButton,
  Upload,
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
  UpOutlined,
  UploadOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
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
  const [showBackToTop, setShowBackToTop] = useState(false);

  // ==================== DOWNLOAD TEMPLATE ====================
  const handleDownloadTemplate = () => {
    // 1. Define headers
    const headers = [
      "Question Text",
      "Question Type",
      "Score",
      "Order",
      "Explanation",
      "Answer 1",
      "Is Correct 1",
      "Answer 2",
      "Is Correct 2",
      "Answer 3",
      "Is Correct 3",
      "Answer 4",
      "Is Correct 4",
      "Answer 5",
      "Is Correct 5",
    ];

    // 2. Define sample rows
    const data = [
      [
        "Câu hỏi mẫu 1: Chọn đáp án đúng",
        "SINGLE_CHOICE",
        1.0,
        1,
        "Giải thích cho câu 1",
        "Đáp án A",
        "TRUE",
        "Đáp án B",
        "FALSE",
        "Đáp án C",
        "FALSE",
        "Đáp án D",
        "FALSE",
      ],
      [
        "Câu hỏi mẫu 2: Chọn nhiều đáp án",
        "MULTIPLE_CHOICE",
        1.0,
        2,
        "Giải thích cho câu 2",
        "Đáp án A",
        "TRUE",
        "Đáp án B",
        "FALSE",
        "Đáp án C",
        "TRUE",
        "Đáp án D",
        "FALSE",
      ],
      [
        "Câu hỏi mẫu 3: Điền vào chỗ trống",
        "FILL_IN_BLANK",
        1.0,
        3,
        "Giải thích cho câu 3",
        "đáp án chính xác",
        "TRUE",
        "từ đồng nghĩa 1",
        "TRUE",
      ],
      [
        "Câu hỏi mẫu 4: Đúng/Sai",
        "TRUE_FALSE",
        1.0,
        4,
        "Giải thích cho câu 4",
        "True",
        "TRUE",
        "False",
        "FALSE",
      ],
    ];

    // 3. Create worksheet
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data]);

    // 4. Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Template");

    // 5. Generate buffer
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    // 6. Save file
    const dataBlob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
    });
    saveAs(dataBlob, "quiz_questions_template.xlsx");
  };

  // ==================== FIX ESLINT WARNING ====================
  // Dùng useCallback để wrap loadQuizData
  const loadQuizData = useCallback(async () => {
    if (!quizId) return;

    setLoading(true);
    try {
      // Load quiz info
      const quizResponse = await QuizService.getQuizByIdForAdmin(quizId);
      if (quizResponse.success) {
        setQuiz(quizResponse.data);
      } else {
        message.error(quizResponse.message);
        return;
      }

      // Load questions
      const questionsResponse = await QuizService.getQuestionsByQuizIdForAdmin(
        quizId
      );
      if (questionsResponse.success) {
        setQuestions(questionsResponse.data);
      }
    } catch (error) {
      console.error("Load quiz data error:", error);
      message.error("Lỗi khi tải dữ liệu quiz");
    } finally {
      setLoading(false);
    }
  }, [quizId]); // Chỉ phụ thuộc vào quizId

  useEffect(() => {
    loadQuizData();
  }, [loadQuizData]); // Sửa từ [quizId] thành [loadQuizData]

  // ==================== BACK TO TOP FUNCTION ====================
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ==================== QUESTION HANDLERS ====================
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

  // ==================== QUIZ PUBLISH HANDLER ====================
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

  // ==================== FORMAT TEXT FOR DISPLAY ====================
  const renderFormattedText = (text) => {
    if (!text) return text;
    const html = text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/<u>(.*?)<\/u>/g, "<u>$1</u>")
      .replace(/\n/g, "<br />");
    return <span dangerouslySetInnerHTML={{ __html: html }} />;
  };

  // ==================== RENDER ====================
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

  const totalPoints = questions.reduce((sum, q) => sum + (q.score || 0), 0);

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

              {/* NÚT IMPORT EXCEL & DOWNLOAD TEMPLATE */}
              <div style={{ display: "flex", gap: 8 }}>
                <Button
                  icon={<DownloadOutlined />}
                  onClick={handleDownloadTemplate}
                  size="large"
                >
                  Tải mẫu
                </Button>

                <Upload
                  accept=".xlsx, .xls"
                  showUploadList={false}
                  beforeUpload={async (file) => {
                    // Validation
                    const isExcel =
                      file.type ===
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
                      file.type === "application/vnd.ms-excel" ||
                      file.name.endsWith(".xlsx") ||
                      file.name.endsWith(".xls");

                    if (!isExcel) {
                      message.error("Chỉ chấp nhận file Excel (.xlsx, .xls)!");
                      return Upload.LIST_IGNORE;
                    }

                    const isLt5M = file.size / 1024 / 1024 < 5;
                    if (!isLt5M) {
                      message.error("File phải nhỏ hơn 5MB!");
                      return Upload.LIST_IGNORE;
                    }

                    const hide = message.loading("Đang import câu hỏi...", 0);
                    try {
                      const response = await QuizService.importQuestions(
                        quizId,
                        file
                      );
                      if (response.success) {
                        message.success(response.message);
                        loadQuizData();
                      } else {
                        message.error(response.message);
                      }
                    } catch (error) {
                      message.error("Lỗi khi import file");
                    } finally {
                      hide();
                    }
                    return false;
                  }}
                >
                  <Button icon={<UploadOutlined />} size="large">
                    Import Excel
                  </Button>
                </Upload>

                {/* NÚT THÊM CÂU HỎI TẠI ĐÂY (CHO NGƯỜI DÙNG SCROLL LÊN) */}
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => showQuestionForm()}
                  size="large"
                >
                  Thêm câu hỏi
                </Button>
              </div>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Questions List */}
      <Card
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <FileTextOutlined />
            <span>Danh sách câu hỏi</span>
            <Badge
              count={questions.length}
              style={{ backgroundColor: "#1890ff", marginLeft: 8 }}
            />
          </div>
        }
        extra={
          <Statistic
            title="Tổng điểm"
            value={totalPoints}
            precision={1}
            suffix="điểm"
            valueStyle={{ fontSize: 16 }}
          />
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
          <>
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
                      description="Các đáp án và dữ liệu liên quan sẽ bị xóa."
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
                    transition: "background-color 0.3s",
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
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
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
                            {question.options &&
                              question.options.length > 0 && (
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

            {/*  NÚT THÊM CÂU HỎI Ở DƯỚI DANH SÁCH */}
            <div
              style={{
                marginTop: 24,
                padding: 16,
                textAlign: "center",
                borderTop: "1px dashed #d9d9d9",
              }}
            >
              <div style={{ marginBottom: 16 }}>
                <div
                  style={{
                    fontSize: 14,
                    color: "#666",
                    marginBottom: 8,
                  }}
                >
                  Đã có {questions.length} câu hỏi • Tổng {totalPoints} điểm
                </div>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => showQuestionForm()}
                  size="large"
                  style={{ minWidth: 200 }}
                >
                  Thêm câu hỏi mới
                </Button>
                <div
                  style={{
                    fontSize: 12,
                    color: "#999",
                    marginTop: 8,
                  }}
                >
                  Câu hỏi mới sẽ được thêm vào cuối danh sách
                </div>
              </div>
            </div>
          </>
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
        destroyOnHidden
      >
        <QuestionForm
          quizId={quizId}
          onSuccess={handleQuestionSuccess}
          editingQuestion={editingQuestion}
        />
      </Modal>

      {/*  BACK TO TOP */}
      {showBackToTop && (
        <FloatButton
          icon={<UpOutlined />}
          onClick={scrollToTop}
          tooltip="Lên đầu trang"
          style={{ right: 24, bottom: 100 }}
        />
      )}

      {/* ADD QUESTION (LUÔN HIỂN THỊ) */}
      <FloatButton
        icon={<PlusOutlined />}
        onClick={() => showQuestionForm()}
        tooltip="Thêm câu hỏi"
        type="primary"
        style={{ right: 24, bottom: 40 }}
      />
    </div>
  );
};

export default QuizQuestionManager;
