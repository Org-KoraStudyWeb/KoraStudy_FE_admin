// src/components/quiz/QuestionForm.js
import React, { useState, useEffect } from "react";
import {
  Card,
  Form,
  InputNumber,
  Select,
  Button,
  Space,
  message,
  Row,
  Col,
  Upload,
  Tag,
  Divider,
  Input,
  List,
  Tooltip,
} from "antd";
import {
  PictureOutlined,
  PlusOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EditOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import TextEditor from "../common/TextEditor";
import QuizService from "../../services/Quiz/QuizService";
import {
  QUESTION_TYPES,
  QUESTION_TYPE_LABELS,
} from "../../services/Quiz/constants";

const { TextArea } = Input;
const { Option } = Select;

const QuestionForm = ({ quizId, onSuccess, editingQuestion }) => {
  const [form] = Form.useForm();
  const [questionType, setQuestionType] = useState(
    QUESTION_TYPES.SINGLE_CHOICE
  );
  const [questionImage, setQuestionImage] = useState(null);
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [optionText, setOptionText] = useState("");
  const [optionImage, setOptionImage] = useState(null);
  const [isCorrect, setIsCorrect] = useState(false);

  // ⭐ THÊM: State cho FILL_IN_BLANK
  const [fillInBlankAnswers, setFillInBlankAnswers] = useState([]);
  const [fillInBlankAnswerText, setFillInBlankAnswerText] = useState("");
  const [useSlashSeparator, setUseSlashSeparator] = useState(false); // ⭐ THÊM: Option dùng dấu /

  // Initialize form with editing data
  useEffect(() => {
    if (editingQuestion) {
      form.setFieldsValue({
        questionText: editingQuestion.questionText,
        questionType: editingQuestion.questionType,
        score: editingQuestion.score,
        explanation: editingQuestion.explanation,
      });
      setQuestionType(editingQuestion.questionType);
      setQuestionImage(editingQuestion.imageUrl);
      setOptions(editingQuestion.options || []);

      // ⭐ THÊM: Xử lý FILL_IN_BLANK options
      if (
        editingQuestion.questionType === QUESTION_TYPES.FILL_IN_BLANK &&
        editingQuestion.options &&
        editingQuestion.options.length > 0
      ) {
        // Lấy tất cả đáp án đúng từ options
        const correctAnswers = editingQuestion.options
          .filter((opt) => opt.isCorrect)
          .map((opt) => ({
            text: opt.optionText,
            id: opt.id || Date.now() + Math.random(),
          }));
        setFillInBlankAnswers(correctAnswers);

        // ⭐ THÊM: Kiểm tra nếu có thể hiển thị dạng chuỗi với dấu /
        if (correctAnswers.length > 0) {
          const combinedText = correctAnswers
            .map((ans) => ans.text)
            .join(" / ");
          setFillInBlankAnswerText(combinedText);
          setUseSlashSeparator(true);
        }
      }
    }
  }, [editingQuestion, form]);

  // Handle submit
  const handleSubmit = async (values) => {
    // Validation
    if (
      questionType === QUESTION_TYPES.SINGLE_CHOICE &&
      options.filter((opt) => opt.isCorrect).length !== 1
    ) {
      message.error("Câu hỏi trắc nghiệm đơn phải có đúng 1 đáp án đúng!");
      return;
    }

    if (
      questionType === QUESTION_TYPES.MULTIPLE_CHOICE &&
      options.filter((opt) => opt.isCorrect).length === 0
    ) {
      message.error("Câu hỏi trắc nghiệm nhiều phải có ít nhất 1 đáp án đúng!");
      return;
    }

    if (questionType === QUESTION_TYPES.TRUE_FALSE && options.length !== 2) {
      message.error("Câu hỏi Đúng/Sai phải có đúng 2 đáp án!");
      return;
    }

    // ⭐ SỬA: Validation cho FILL_IN_BLANK
    if (questionType === QUESTION_TYPES.FILL_IN_BLANK) {
      let finalAnswers = [];

      if (useSlashSeparator) {
        // Phân tách bằng dấu /
        const answers = fillInBlankAnswerText
          .split("/")
          .map((item) => item.trim())
          .filter((item) => item.length > 0);

        if (answers.length === 0) {
          message.error("Vui lòng nhập ít nhất 1 đáp án đúng!");
          return;
        }
        finalAnswers = answers;
      } else {
        // Lấy từ danh sách riêng lẻ
        if (fillInBlankAnswers.length === 0) {
          message.error("Câu hỏi điền từ phải có ít nhất 1 đáp án đúng!");
          return;
        }
        finalAnswers = fillInBlankAnswers.map((ans) => ans.text);
      }

      // Validate từng đáp án
      const emptyAnswers = finalAnswers.filter((text) => !text.trim());
      if (emptyAnswers.length > 0) {
        message.error("Đáp án không được để trống!");
        return;
      }
    }

    // ⭐ SỬA: Validation cho ESSAY - không cần validation đặc biệt
    if (questionType === QUESTION_TYPES.ESSAY) {
      // ESSAY có thể không có đáp án mẫu
    }

    setLoading(true);

    try {
      // ⭐ THÊM: Xử lý options cho FILL_IN_BLANK
      let finalOptions = [...options];
      if (questionType === QUESTION_TYPES.FILL_IN_BLANK) {
        let finalAnswers = [];

        if (useSlashSeparator) {
          // Phân tách bằng dấu /
          finalAnswers = fillInBlankAnswerText
            .split("/")
            .map((item) => item.trim())
            .filter((item) => item.length > 0);
        } else {
          // Lấy từ danh sách riêng lẻ
          finalAnswers = fillInBlankAnswers.map((ans) => ans.text);
        }

        // Tạo options từ đáp án (tất cả đều isCorrect = true)
        finalOptions = finalAnswers.map((answer, index) => ({
          optionText: answer,
          isCorrect: true,
          orderIndex: index + 1,
        }));
      } else if (
        questionType === QUESTION_TYPES.ESSAY &&
        values.correctAnswer
      ) {
        // ⭐ SỬA: ESSAY có thể có 1 đáp án mẫu (option)
        finalOptions = [
          {
            optionText: values.correctAnswer.trim(),
            isCorrect: true,
            orderIndex: 1,
          },
        ];
      }

      const questionData = {
        ...values,
        questionType,
        imageUrl: questionImage,
        options: finalOptions,
      };

      // ⭐ XÓA: Xóa correctAnswer nếu không phải ESSAY
      if (questionType !== QUESTION_TYPES.ESSAY) {
        delete questionData.correctAnswer;
      }

      let response;
      if (editingQuestion) {
        response = await QuizService.updateQuestion(
          editingQuestion.id,
          questionData
        );
      } else {
        response = await QuizService.addQuestionToQuiz(quizId, questionData);
      }

      if (response.success) {
        message.success(response.message);
        resetForm();
        onSuccess();
      } else {
        message.error(response.message);
      }
    } catch (error) {
      console.error("Save question error:", error);
      message.error("Có lỗi xảy ra khi lưu câu hỏi");
    } finally {
      setLoading(false);
    }
  };

  // ⭐ THÊM: Xử lý đáp án cho FILL_IN_BLANK (dạng danh sách riêng lẻ)
  const handleAddFillInBlankAnswer = () => {
    if (!fillInBlankAnswerText.trim()) {
      message.error("Vui lòng nhập đáp án!");
      return;
    }

    const newAnswer = {
      id: Date.now() + Math.random(),
      text: fillInBlankAnswerText.trim(),
    };

    setFillInBlankAnswers([...fillInBlankAnswers, newAnswer]);
    setFillInBlankAnswerText("");
  };

  const handleRemoveFillInBlankAnswer = (id) => {
    setFillInBlankAnswers(fillInBlankAnswers.filter((ans) => ans.id !== id));
  };

  // ⭐ THÊM: Chuyển đổi giữa 2 chế độ nhập
  const toggleInputMode = () => {
    if (useSlashSeparator) {
      // Chuyển từ dấu / sang danh sách riêng
      const answers = fillInBlankAnswerText
        .split("/")
        .map((item) => item.trim())
        .filter((item) => item.length > 0);

      setFillInBlankAnswers(
        answers.map((text, index) => ({
          id: Date.now() + index,
          text,
        }))
      );
      setFillInBlankAnswerText("");
    } else {
      // Chuyển từ danh sách sang dấu /
      const combinedText = fillInBlankAnswers
        .map((ans) => ans.text)
        .join(" / ");
      setFillInBlankAnswerText(combinedText);
    }
    setUseSlashSeparator(!useSlashSeparator);
  };

  // Handle options cho các loại câu hỏi khác
  const handleAddOption = () => {
    if (!optionText.trim()) {
      message.error("Vui lòng nhập nội dung đáp án!");
      return;
    }

    const newOption = {
      optionText: optionText.trim(),
      isCorrect,
      imageUrl: optionImage,
    };

    setOptions([...options, newOption]);
    setOptionText("");
    setOptionImage(null);
    setIsCorrect(false);
  };

  const handleRemoveOption = (index) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleImageUpload = (setter) => (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setter(e.target.result);
      message.success("Tải ảnh thành công!");
    };
    reader.readAsDataURL(file);
    return false;
  };

  const resetForm = () => {
    form.resetFields();
    setQuestionType(QUESTION_TYPES.SINGLE_CHOICE);
    setQuestionImage(null);
    setOptions([]);
    setOptionText("");
    setOptionImage(null);
    setIsCorrect(false);
    // ⭐ THÊM: Reset FILL_IN_BLANK
    setFillInBlankAnswers([]);
    setFillInBlankAnswerText("");
    setUseSlashSeparator(false);
  };

  const getQuestionTypeLabel = (type) => {
    const labels = {
      [QUESTION_TYPES.SINGLE_CHOICE]: "Chọn 1 đáp án",
      [QUESTION_TYPES.MULTIPLE_CHOICE]: "Chọn nhiều đáp án",
      [QUESTION_TYPES.TRUE_FALSE]: "Đúng/Sai",
      [QUESTION_TYPES.FILL_IN_BLANK]: "Điền từ",
      [QUESTION_TYPES.ESSAY]: "Tự luận",
    };
    return labels[type] || type;
  };

  return (
    <div style={{ padding: "16px 0" }}>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          questionType: QUESTION_TYPES.SINGLE_CHOICE,
          score: 1.0,
        }}
      >
        {/* Question Type and Score */}
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Loại câu hỏi"
              name="questionType"
              rules={[
                { required: true, message: "Vui lòng chọn loại câu hỏi" },
              ]}
            >
              <Select
                onChange={(value) => {
                  setQuestionType(value);
                  // Reset các state khi đổi loại câu hỏi
                  if (value !== QUESTION_TYPES.FILL_IN_BLANK) {
                    setFillInBlankAnswers([]);
                    setFillInBlankAnswerText("");
                    setUseSlashSeparator(false);
                  }
                }}
              >
                {Object.values(QUESTION_TYPES).map((type) => (
                  <Option key={type} value={type}>
                    {getQuestionTypeLabel(type)}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Điểm số"
              name="score"
              rules={[
                { required: true, message: "Vui lòng nhập điểm số" },
                { type: "number", min: 0.5, message: "Tối thiểu 0.5 điểm" },
              ]}
            >
              <InputNumber
                min={0.5}
                max={10}
                step={0.5}
                style={{ width: "100%" }}
                placeholder="1.0"
              />
            </Form.Item>
          </Col>
        </Row>

        {/* Question Text */}
        <Form.Item
          label="Nội dung câu hỏi"
          name="questionText"
          rules={[
            { required: true, message: "Vui lòng nhập nội dung câu hỏi" },
          ]}
        >
          <TextEditor
            placeholder="Nhập nội dung câu hỏi..."
            rows={3}
            maxLength={500}
            showPreview={false}
          />
        </Form.Item>

        {/* Question Image */}
        <Form.Item label="Ảnh minh họa (tùy chọn)">
          <Upload
            accept="image/*"
            showUploadList={false}
            beforeUpload={handleImageUpload(setQuestionImage)}
          >
            <div
              style={{
                border: "2px dashed #d9d9d9",
                borderRadius: 8,
                padding: 16,
                textAlign: "center",
                cursor: "pointer",
                backgroundColor: questionImage ? "transparent" : "#fafafa",
              }}
            >
              {questionImage ? (
                <div>
                  <img
                    src={questionImage}
                    alt="Question"
                    style={{
                      maxWidth: "100%",
                      maxHeight: 200,
                      borderRadius: 4,
                    }}
                  />
                  <div style={{ marginTop: 8 }}>
                    <Button onClick={() => setQuestionImage(null)} danger>
                      Xóa ảnh
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <PictureOutlined style={{ fontSize: 32, color: "#999" }} />
                  <div style={{ color: "#666", marginTop: 8 }}>
                    Nhấn để tải ảnh lên
                  </div>
                </>
              )}
            </div>
          </Upload>
        </Form.Item>

        {/* ⭐ SỬA: Options for MCQ (giữ nguyên) */}
        {[
          QUESTION_TYPES.SINGLE_CHOICE,
          QUESTION_TYPES.MULTIPLE_CHOICE,
          QUESTION_TYPES.TRUE_FALSE,
        ].includes(questionType) && (
          <>
            <Divider orientation="left">
              <span style={{ fontWeight: 600 }}>Đáp án</span>
              <Tag color="blue" style={{ marginLeft: 8 }}>
                {options.length} đáp án
              </Tag>
            </Divider>

            {/* Add Option Form */}
            <Card
              size="small"
              style={{ marginBottom: 16, border: "1px solid #40a9ff" }}
            >
              <Row gutter={16} align="middle">
                <Col span={14}>
                  <TextArea
                    placeholder="Nhập nội dung đáp án..."
                    value={optionText}
                    onChange={(e) => setOptionText(e.target.value)}
                    rows={2}
                    maxLength={200}
                  />
                </Col>
                <Col span={4}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ marginBottom: 4 }}>Trạng thái</div>
                    <Button
                      type={isCorrect ? "primary" : "default"}
                      danger={!isCorrect}
                      icon={
                        isCorrect ? (
                          <CheckCircleOutlined />
                        ) : (
                          <CloseCircleOutlined />
                        )
                      }
                      onClick={() => setIsCorrect(!isCorrect)}
                      style={{ width: "100%" }}
                    >
                      {isCorrect ? "Đúng" : "Sai"}
                    </Button>
                  </div>
                </Col>
                <Col span={6}>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleAddOption}
                    block
                  >
                    Thêm đáp án
                  </Button>
                </Col>
              </Row>

              {/* Option Image Upload */}
              <div style={{ marginTop: 16 }}>
                <Upload
                  accept="image/*"
                  showUploadList={false}
                  beforeUpload={handleImageUpload(setOptionImage)}
                >
                  <div
                    style={{
                      border: "1px dashed #d9d9d9",
                      borderRadius: 4,
                      padding: 8,
                      textAlign: "center",
                      cursor: "pointer",
                      backgroundColor: optionImage ? "transparent" : "#fafafa",
                    }}
                  >
                    {optionImage ? (
                      <div>
                        <img
                          src={optionImage}
                          alt="Option"
                          style={{
                            maxWidth: 120,
                            maxHeight: 80,
                            borderRadius: 4,
                          }}
                        />
                        <Button
                          size="small"
                          onClick={() => setOptionImage(null)}
                          danger
                          style={{ marginTop: 4 }}
                        >
                          Xóa ảnh
                        </Button>
                      </div>
                    ) : (
                      <div>
                        <PictureOutlined
                          style={{ fontSize: 20, color: "#999" }}
                        />
                        <div style={{ fontSize: 12, color: "#666" }}>
                          Tải ảnh cho đáp án
                        </div>
                      </div>
                    )}
                  </div>
                </Upload>
              </div>
            </Card>

            {/* Options List */}
            {options.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
                  Danh sách đáp án:
                </div>
                {options.map((option, index) => (
                  <Card
                    key={index}
                    size="small"
                    style={{
                      marginBottom: 8,
                      borderLeft: `4px solid ${
                        option.isCorrect ? "#52c41a" : "#ff4d4f"
                      }`,
                    }}
                    extra={
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleRemoveOption(index)}
                      />
                    }
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 12 }}
                    >
                      <div
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: 12,
                          backgroundColor: option.isCorrect
                            ? "#52c41a"
                            : "#ff4d4f",
                          color: "white",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 12,
                          fontWeight: "bold",
                        }}
                      >
                        {index + 1}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div>{option.optionText}</div>
                        {option.imageUrl && (
                          <div style={{ marginTop: 8 }}>
                            <img
                              src={option.imageUrl}
                              alt="Option"
                              style={{
                                maxWidth: 100,
                                maxHeight: 60,
                                borderRadius: 4,
                              }}
                            />
                          </div>
                        )}
                      </div>
                      <Tag color={option.isCorrect ? "success" : "error"}>
                        {option.isCorrect ? "Đúng" : "Sai"}
                      </Tag>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}

        {/* ⭐ CẢI TIẾN: Phần cho FILL_IN_BLANK với 2 chế độ nhập */}
        {questionType === QUESTION_TYPES.FILL_IN_BLANK && (
          <>
            <Divider orientation="left">
              <span style={{ fontWeight: 600 }}>Đáp án đúng</span>
              <Tooltip title="Câu hỏi điền từ có thể có nhiều đáp án đúng. Sử dụng dấu '/' để phân cách các đáp án.">
                <InfoCircleOutlined
                  style={{ marginLeft: 8, color: "#1890ff" }}
                />
              </Tooltip>
              <Tag color="green" style={{ marginLeft: 8 }}>
                {useSlashSeparator
                  ? fillInBlankAnswerText
                      .split("/")
                      .filter((item) => item.trim().length > 0).length || 0
                  : fillInBlankAnswers.length}{" "}
                đáp án
              </Tag>
            </Divider>

            <Card
              size="small"
              style={{ marginBottom: 16, border: "1px solid #52c41a" }}
            >
              <div style={{ marginBottom: 16 }}>
                {/* ⭐ THÊM: Nút chuyển đổi chế độ nhập */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 12,
                  }}
                >
                  <span style={{ fontWeight: 500 }}>
                    {useSlashSeparator
                      ? "Nhập nhiều đáp án bằng dấu /"
                      : "Thêm từng đáp án riêng"}
                  </span>
                  <Button type="link" onClick={toggleInputMode} size="small">
                    {useSlashSeparator
                      ? "↶ Chuyển sang từng đáp án"
                      : "↷ Chuyển sang dùng dấu /"}
                  </Button>
                </div>

                {useSlashSeparator ? (
                  <>
                    <TextArea
                      placeholder="Nhập các đáp án đúng cách nhau bằng dấu '/'. Ví dụ: 학생 / 회사원 / 선생님 / 요리사"
                      value={fillInBlankAnswerText}
                      onChange={(e) => setFillInBlankAnswerText(e.target.value)}
                      rows={3}
                      maxLength={500}
                    />
                    <div style={{ marginTop: 8, color: "#666", fontSize: 12 }}>
                      ⭐ Các đáp án sẽ được tự động tách bằng dấu '/'. Ví dụ:
                      "안녕하세요 / 안녕 / 안녕히 가세요"
                    </div>
                  </>
                ) : (
                  <>
                    <TextArea
                      placeholder="Nhập một đáp án đúng..."
                      value={fillInBlankAnswerText}
                      onChange={(e) => setFillInBlankAnswerText(e.target.value)}
                      rows={2}
                      maxLength={100}
                      onPressEnter={(e) => {
                        e.preventDefault();
                        handleAddFillInBlankAnswer();
                      }}
                    />
                    <div style={{ marginTop: 8, color: "#666", fontSize: 12 }}>
                      ⭐ Nhập từng đáp án riêng lẻ và nhấn "Thêm đáp án"
                    </div>
                  </>
                )}
              </div>

              {!useSlashSeparator && (
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleAddFillInBlankAnswer}
                  block
                  style={{ marginTop: 8 }}
                >
                  Thêm đáp án
                </Button>
              )}

              {/* ⭐ THÊM: Preview khi dùng dấu / */}
              {useSlashSeparator && fillInBlankAnswerText.trim() && (
                <div
                  style={{
                    marginTop: 16,
                    padding: 12,
                    backgroundColor: "#f6ffed",
                    borderRadius: 4,
                  }}
                >
                  <div
                    style={{
                      fontWeight: 500,
                      marginBottom: 4,
                      color: "#52c41a",
                    }}
                  >
                    Preview (
                    {
                      fillInBlankAnswerText
                        .split("/")
                        .filter((item) => item.trim().length > 0).length
                    }{" "}
                    đáp án):
                  </div>
                  <div style={{ color: "#666" }}>
                    {fillInBlankAnswerText
                      .split("/")
                      .map((item, index) => item.trim())
                      .filter((item) => item.length > 0)
                      .map((item, index) => (
                        <Tag
                          key={index}
                          color="success"
                          style={{ margin: "2px", fontSize: "13px" }}
                        >
                          <CheckCircleOutlined style={{ marginRight: 4 }} />
                          {item}
                        </Tag>
                      ))}
                  </div>
                </div>
              )}
            </Card>

            {/* Danh sách đáp án đúng (chỉ hiển thị khi không dùng dấu /) */}
            {!useSlashSeparator && fillInBlankAnswers.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
                  Danh sách đáp án đúng:
                </div>
                <List
                  size="small"
                  dataSource={fillInBlankAnswers}
                  renderItem={(answer) => (
                    <List.Item
                      actions={[
                        <Button
                          type="text"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() =>
                            handleRemoveFillInBlankAnswer(answer.id)
                          }
                        />,
                      ]}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <CheckCircleOutlined style={{ color: "#52c41a" }} />
                        <span>{answer.text}</span>
                      </div>
                    </List.Item>
                  )}
                />
              </div>
            )}
          </>
        )}

        {/* ⭐ SỬA: Phần cho ESSAY (giữ 1 đáp án mẫu) */}
        {questionType === QUESTION_TYPES.ESSAY && (
          <>
            <Divider orientation="left">
              <span style={{ fontWeight: 600 }}>Đáp án mẫu (tùy chọn)</span>
              <Tooltip title="Đáp án mẫu để tham khảo, không bắt buộc">
                <InfoCircleOutlined
                  style={{ marginLeft: 8, color: "#1890ff" }}
                />
              </Tooltip>
            </Divider>
            <Form.Item
              name="correctAnswer"
              help="Câu trả lời mẫu để học viên tham khảo"
            >
              <TextArea
                placeholder="Nhập câu trả lời mẫu (tùy chọn)..."
                rows={4}
                maxLength={1000}
              />
            </Form.Item>
          </>
        )}

        {/* Explanation */}
        <Form.Item label="Giải thích (tùy chọn)" name="explanation">
          <TextArea
            placeholder="Nhập giải thích cho đáp án..."
            rows={2}
            maxLength={300}
          />
        </Form.Item>

        {/* Submit Button */}
        <Form.Item style={{ textAlign: "right", marginBottom: 0 }}>
          <Space>
            <Button onClick={resetForm}>Hủy</Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              icon={editingQuestion ? <EditOutlined /> : <PlusOutlined />}
            >
              {editingQuestion ? "Cập nhật câu hỏi" : "Thêm câu hỏi"}
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </div>
  );
};

export default QuestionForm;
