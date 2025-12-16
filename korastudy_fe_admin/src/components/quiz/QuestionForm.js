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
  Spin,
  Switch,
} from "antd";
import {
  PictureOutlined,
  PlusOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EditOutlined,
  UploadOutlined,
  LoadingOutlined,
  FileImageOutlined,
  FontSizeOutlined,
} from "@ant-design/icons";
import TextEditor from "../common/TextEditor";
import QuizService from "../../services/Quiz/QuizService";
import cloudinaryService from "../../services/CloudinaryService";
import { QUESTION_TYPES } from "../../services/Quiz/constants";

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

  // State mới: Cho phép option chỉ có ảnh
  const [optionIsImageOnly, setOptionIsImageOnly] = useState(false);

  // State cho upload
  const [uploadingQuestionImage, setUploadingQuestionImage] = useState(false);
  const [uploadingOptionImage, setUploadingOptionImage] = useState(false);

  // State cho FILL_IN_BLANK
  const [fillInBlankAnswers, setFillInBlankAnswers] = useState([]);
  const [fillInBlankAnswerText, setFillInBlankAnswerText] = useState("");
  const [useSlashSeparator, setUseSlashSeparator] = useState(false);

  // ==================== INITIALIZE ====================

  // Initialize form với editing data - FIXED
  useEffect(() => {
    if (editingQuestion) {
      console.log("🔄 Editing Question Data:", {
        id: editingQuestion.id,
        imageUrl: editingQuestion.imageUrl,
        image: editingQuestion.image,
        questionText: editingQuestion.questionText,
        questionType: editingQuestion.questionType,
        options: editingQuestion.options,
      });

      // Thử cả 2 field name (có thể BE dùng 'image' thay vì 'imageUrl')
      const imageUrl = editingQuestion.imageUrl || editingQuestion.image;
      console.log("📸 Found Question Image URL:", imageUrl);

      form.setFieldsValue({
        questionText: editingQuestion.questionText,
        questionType: editingQuestion.questionType,
        score: editingQuestion.score,
        explanation: editingQuestion.explanation,
      });

      setQuestionType(editingQuestion.questionType);
      setQuestionImage(imageUrl);

      // Xử lý options với debug
      if (editingQuestion.options && editingQuestion.options.length > 0) {
        console.log("📊 Options raw data:", editingQuestion.options);

        const processedOptions = editingQuestion.options.map((opt, index) => {
          const optionImageUrl = opt.imageUrl || opt.image;
          console.log(`Option ${index + 1}:`, {
            text: opt.optionText,
            imageUrl: optionImageUrl,
            isCorrect: opt.isCorrect,
          });

          return {
            ...opt,
            imageUrl: optionImageUrl,
          };
        });

        setOptions(processedOptions);
      }

      // Xử lý FILL_IN_BLANK options
      if (
        editingQuestion.questionType === QUESTION_TYPES.FILL_IN_BLANK &&
        editingQuestion.options &&
        editingQuestion.options.length > 0
      ) {
        const correctAnswers = editingQuestion.options
          .filter((opt) => opt.isCorrect)
          .map((opt) => ({
            text: opt.optionText,
            id: opt.id || Date.now() + Math.random(),
          }));
        setFillInBlankAnswers(correctAnswers);

        if (correctAnswers.length > 0) {
          const combinedText = correctAnswers
            .map((ans) => ans.text)
            .join(" / ");
          setFillInBlankAnswerText(combinedText);
          setUseSlashSeparator(true);
        }
      }
    } else {
      // Reset khi tạo mới
      setQuestionImage(null);
      setOptions([]);
    }
  }, [editingQuestion, form]);

  // ==================== HANDLE IMAGE UPLOADS ====================

  // Upload ảnh câu hỏi lên Cloudinary
  const handleQuestionImageUpload = async (file) => {
    setUploadingQuestionImage(true);
    try {
      // Validate file
      cloudinaryService.validateFile(file, "image");

      // Upload lên Cloudinary
      console.log("📤 Uploading question image to Cloudinary:", file.name);
      const result = await cloudinaryService.uploadImage(file);
      console.log("✅ Question image uploaded:", result.url);

      // Cập nhật state với Cloudinary URL
      setQuestionImage(result.url);

      message.success("Upload ảnh câu hỏi thành công!");
      return false; // Ngăn antd tự upload
    } catch (error) {
      console.error("❌ Upload question image error:", error);
      message.error(`Lỗi upload ảnh: ${error.message}`);
      return false;
    } finally {
      setUploadingQuestionImage(false);
    }
  };

  // Upload ảnh option lên Cloudinary
  const handleOptionImageUpload = async (file) => {
    setUploadingOptionImage(true);
    try {
      // Validate file
      cloudinaryService.validateFile(file, "image");

      // Upload lên Cloudinary
      console.log("📤 Uploading option image to Cloudinary:", file.name);
      const result = await cloudinaryService.uploadImage(file);
      console.log("✅ Option image uploaded:", result.url);

      // Cập nhật state với Cloudinary URL
      setOptionImage(result.url);

      // Nếu đang ở chế độ image only, tự động thêm option
      if (optionIsImageOnly && result.url) {
        handleAddOptionWithImageOnly(result.url);
      }

      message.success("Upload ảnh đáp án thành công!");
      return false; // Ngăn antd tự upload
    } catch (error) {
      console.error("❌ Upload option image error:", error);
      message.error(`Lỗi upload ảnh: ${error.message}`);
      return false;
    } finally {
      setUploadingOptionImage(false);
    }
  };

  // ==================== HANDLE OPTIONS (CẢI TIẾN) ====================

  const handleAddOption = () => {
    // CHO PHÉP: Chỉ có ảnh mà không có text
    if (!optionText.trim() && !optionImage) {
      message.error("Vui lòng nhập nội dung đáp án hoặc chọn ảnh!");
      return;
    }

    // Kiểm tra nếu optionImage là base64 (chưa upload)
    if (optionImage && optionImage.startsWith("data:")) {
      message.warning("Vui lòng upload ảnh đáp án trước khi thêm!");
      return;
    }

    const newOption = {
      optionText: optionText.trim() || "[HÌNH ẢNH]", // Nếu chỉ có ảnh
      isCorrect,
      imageUrl: optionImage, // Đây là Cloudinary URL (nếu đã upload)
      isImageOnly: !optionText.trim() && optionImage, // Đánh dấu option chỉ có ảnh
    };

    setOptions([...options, newOption]);
    setOptionText("");
    setOptionImage(null);
    setIsCorrect(false);
    setOptionIsImageOnly(false);
  };

  // Thêm option chỉ có ảnh (tự động gọi sau khi upload)
  const handleAddOptionWithImageOnly = (imageUrl) => {
    const newOption = {
      optionText: "[HÌNH ẢNH]",
      isCorrect,
      imageUrl: imageUrl,
      isImageOnly: true,
    };

    setOptions([...options, newOption]);
    setOptionImage(null);
    setIsCorrect(false);
    setOptionIsImageOnly(false);

    message.success("Đã thêm đáp án hình ảnh!");
  };

  const handleRemoveOption = (index) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  // ==================== HANDLE SUBMIT (CẢI TIẾN) ====================

  const handleSubmit = async (values) => {
    // Validation - CHO PHÉP OPTION CHỈ CÓ ẢNH
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

    // Validation cho FILL_IN_BLANK
    if (questionType === QUESTION_TYPES.FILL_IN_BLANK) {
      let finalAnswers = [];

      if (useSlashSeparator) {
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
        if (fillInBlankAnswers.length === 0) {
          message.error("Câu hỏi điền từ phải có ít nhất 1 đáp án đúng!");
          return;
        }
        finalAnswers = fillInBlankAnswers.map((ans) => ans.text);
      }

      const emptyAnswers = finalAnswers.filter((text) => !text.trim());
      if (emptyAnswers.length > 0) {
        message.error("Đáp án không được để trống!");
        return;
      }
    }

    setLoading(true);

    try {
      // Xử lý options cho FILL_IN_BLANK
      let finalOptions = [...options];
      if (questionType === QUESTION_TYPES.FILL_IN_BLANK) {
        let finalAnswers = [];

        if (useSlashSeparator) {
          finalAnswers = fillInBlankAnswerText
            .split("/")
            .map((item) => item.trim())
            .filter((item) => item.length > 0);
        } else {
          finalAnswers = fillInBlankAnswers.map((ans) => ans.text);
        }

        // Tạo options từ đáp án (tất cả đều isCorrect = true)
        finalOptions = finalAnswers.map((answer, index) => ({
          optionText: answer,
          isCorrect: true,
          orderIndex: index + 1,
        }));
      } else {
        // Thêm orderIndex cho các options
        finalOptions = finalOptions.map((option, index) => ({
          ...option,
          orderIndex: index + 1,
        }));
      }

      // Tạo question data với Cloudinary URL
      const questionData = {
        ...values,
        questionType,
        imageUrl: questionImage, // Cloudinary URL đã upload
        options: finalOptions,
      };

      console.log("📝 Submitting question data:", questionData);

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
      console.error("❌ Save question error:", error);
      message.error("Có lỗi xảy ra khi lưu câu hỏi");
    } finally {
      setLoading(false);
    }
  };

  // ==================== UTILITY FUNCTIONS ====================

  const resetForm = () => {
    form.resetFields();
    setQuestionType(QUESTION_TYPES.SINGLE_CHOICE);
    setQuestionImage(null);
    setOptions([]);
    setOptionText("");
    setOptionImage(null);
    setIsCorrect(false);
    setOptionIsImageOnly(false);
    setFillInBlankAnswers([]);
    setFillInBlankAnswerText("");
    setUseSlashSeparator(false);
    setUploadingQuestionImage(false);
    setUploadingOptionImage(false);
  };

  const getQuestionTypeLabel = (type) => {
    const labels = {
      [QUESTION_TYPES.SINGLE_CHOICE]: "Chọn 1 đáp án",
      [QUESTION_TYPES.MULTIPLE_CHOICE]: "Chọn nhiều đáp án",
      [QUESTION_TYPES.TRUE_FALSE]: "Đúng/Sai",
      [QUESTION_TYPES.FILL_IN_BLANK]: "Điền từ",
    };
    return labels[type] || type;
  };

  // ==================== RENDER ====================

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

        {/* Question Image - UPLOAD TO CLOUDINARY */}
        <Form.Item label="Ảnh minh họa câu hỏi (tùy chọn)">
          <Upload
            accept="image/*"
            showUploadList={false}
            beforeUpload={handleQuestionImageUpload}
            disabled={uploadingQuestionImage}
            maxCount={1}
          >
            <div
              style={{
                border: "2px dashed #d9d9d9",
                borderRadius: 8,
                padding: 16,
                textAlign: "center",
                cursor: uploadingQuestionImage ? "not-allowed" : "pointer",
                backgroundColor: questionImage ? "transparent" : "#fafafa",
                opacity: uploadingQuestionImage ? 0.6 : 1,
                transition: "all 0.3s",
                "&:hover": !uploadingQuestionImage
                  ? {
                      borderColor: "#1890ff",
                      backgroundColor: "#e6f7ff",
                    }
                  : {},
              }}
            >
              {uploadingQuestionImage ? (
                <div>
                  <Spin
                    indicator={
                      <LoadingOutlined
                        style={{ fontSize: 24, color: "#1890ff" }}
                        spin
                      />
                    }
                  />
                  <div style={{ marginTop: 8, color: "#1890ff" }}>
                    Đang upload ảnh lên Cloudinary...
                  </div>
                  <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
                    Vui lòng đợi
                  </div>
                </div>
              ) : questionImage ? (
                <div>
                  <div
                    style={{ marginBottom: 8, fontWeight: 500, color: "#666" }}
                  >
                    Ảnh đã upload:
                  </div>
                  <img
                    src={questionImage}
                    alt="Question"
                    style={{
                      maxWidth: "100%",
                      maxHeight: 200,
                      borderRadius: 4,
                      border: "1px solid #f0f0f0",
                    }}
                    onError={(e) => {
                      console.error("❌ Image load error:", questionImage);
                      e.target.style.display = "none";
                      e.target.parentElement.innerHTML = `
                        <div style="color: #ff4d4f;">
                          <PictureOutlined style={{ fontSize: 32 }} />
                          <div style="margin-top: 8px;">Không thể tải ảnh</div>
                          <div style="font-size: 11px; margin-top: 4px;">${questionImage}</div>
                        </div>
                      `;
                    }}
                  />
                  <div style={{ marginTop: 8 }}>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        setQuestionImage(null);
                      }}
                      danger
                      size="small"
                    >
                      Xóa ảnh
                    </Button>
                    <div style={{ fontSize: 11, color: "#999", marginTop: 4 }}>
                      {questionImage && questionImage.substring(0, 60)}...
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <PictureOutlined style={{ fontSize: 32, color: "#999" }} />
                  <div style={{ color: "#666", marginTop: 8 }}>
                    Nhấn để tải ảnh câu hỏi lên Cloudinary
                  </div>
                  <div style={{ fontSize: 12, color: "#999", marginTop: 4 }}>
                    Hỗ trợ: JPG, PNG, GIF, WebP • Tối đa 5MB
                  </div>
                  <div style={{ fontSize: 11, color: "#1890ff", marginTop: 4 }}>
                    <UploadOutlined /> Upload to Cloudinary
                  </div>
                </>
              )}
            </div>
          </Upload>
        </Form.Item>

        {/* Options for MCQ */}
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

            {/* Add Option Form - CẢI TIẾN */}
            <Card
              size="small"
              style={{ marginBottom: 16, border: "1px solid #40a9ff" }}
            >
              <div style={{ marginBottom: 12 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 8,
                  }}
                >
                  <FontSizeOutlined style={{ color: "#1890ff" }} />
                  <span style={{ fontWeight: 500 }}>Nội dung đáp án:</span>
                </div>
                <TextArea
                  placeholder={
                    optionIsImageOnly
                      ? "Chỉ upload ảnh (không cần text)"
                      : "Nhập nội dung đáp án hoặc chỉ upload ảnh..."
                  }
                  value={optionText}
                  onChange={(e) => setOptionText(e.target.value)}
                  rows={2}
                  maxLength={200}
                  disabled={optionIsImageOnly}
                />
              </div>

              <Row gutter={16} align="middle">
                <Col span={8}>
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
                <Col span={8}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ marginBottom: 4 }}>Chỉ ảnh</div>
                    <Switch
                      checked={optionIsImageOnly}
                      onChange={(checked) => {
                        setOptionIsImageOnly(checked);
                        if (checked) {
                          setOptionText(""); // Xóa text khi chọn chỉ ảnh
                        }
                      }}
                      checkedChildren={<FileImageOutlined />}
                      unCheckedChildren={<FontSizeOutlined />}
                    />
                    <div style={{ fontSize: 10, color: "#666", marginTop: 2 }}>
                      {optionIsImageOnly ? "Chỉ ảnh" : "Có text"}
                    </div>
                  </div>
                </Col>
                <Col span={8}>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleAddOption}
                    block
                    disabled={
                      (!optionText.trim() && !optionImage) ||
                      (optionIsImageOnly && !optionImage)
                    }
                  >
                    {optionIsImageOnly ? "Thêm ảnh" : "Thêm đáp án"}
                  </Button>
                </Col>
              </Row>

              {/* Option Image Upload - CẢI TIẾN */}
              <div style={{ marginTop: 16 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 4,
                  }}
                >
                  <FileImageOutlined style={{ color: "#52c41a" }} />
                  <span style={{ fontSize: 12, fontWeight: 500 }}>
                    Ảnh cho đáp án {optionIsImageOnly && "(Chỉ ảnh)"}:
                  </span>
                </div>
                <Upload
                  accept="image/*"
                  showUploadList={false}
                  beforeUpload={handleOptionImageUpload}
                  disabled={uploadingOptionImage}
                  maxCount={1}
                >
                  <div
                    style={{
                      border: "1px dashed #d9d9d9",
                      borderRadius: 4,
                      padding: 8,
                      textAlign: "center",
                      cursor: uploadingOptionImage ? "not-allowed" : "pointer",
                      backgroundColor: optionImage ? "transparent" : "#fafafa",
                      minHeight: 80,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexDirection: "column",
                    }}
                  >
                    {uploadingOptionImage ? (
                      <div>
                        <Spin size="small" />
                        <div
                          style={{ fontSize: 11, color: "#666", marginTop: 4 }}
                        >
                          Đang upload...
                        </div>
                      </div>
                    ) : optionImage ? (
                      <div>
                        <img
                          src={optionImage}
                          alt="Option"
                          style={{
                            maxWidth: 120,
                            maxHeight: 60,
                            borderRadius: 4,
                          }}
                          onError={(e) => {
                            console.error(
                              "❌ Option image load error:",
                              optionImage
                            );
                            e.target.style.display = "none";
                          }}
                        />
                        <div style={{ marginTop: 4 }}>
                          <Button
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOptionImage(null);
                            }}
                            danger
                          >
                            Xóa ảnh
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <PictureOutlined
                          style={{ fontSize: 20, color: "#999" }}
                        />
                        <div style={{ fontSize: 12, color: "#666" }}>
                          {optionIsImageOnly
                            ? "Tải ảnh (không cần text)"
                            : "Tải ảnh cho đáp án (tùy chọn)"}
                        </div>
                        <div
                          style={{ fontSize: 10, color: "#999", marginTop: 2 }}
                        >
                          (Cloudinary)
                        </div>
                      </div>
                    )}
                  </div>
                </Upload>
                {optionIsImageOnly && (
                  <div
                    style={{
                      fontSize: 11,
                      color: "#666",
                      marginTop: 4,
                      fontStyle: "italic",
                    }}
                  >
                    ⭐ Chế độ "Chỉ ảnh": Upload ảnh sẽ tự động thêm vào danh
                    sách đáp án
                  </div>
                )}
              </div>
            </Card>

            {/* Options List - CẢI TIẾN */}
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
                        <div style={{ fontWeight: 500 }}>
                          {option.optionText}
                          {option.isImageOnly && (
                            <Tag
                              color="purple"
                              style={{ marginLeft: 8, fontSize: 10 }}
                            >
                              Chỉ ảnh
                            </Tag>
                          )}
                        </div>
                        {option.imageUrl && (
                          <div style={{ marginTop: 8 }}>
                            <img
                              src={option.imageUrl}
                              alt="Option"
                              style={{
                                maxWidth: 100,
                                maxHeight: 60,
                                borderRadius: 4,
                                border: "1px solid #f0f0f0",
                              }}
                              onError={(e) => {
                                console.error(
                                  "❌ Option image load error in list:",
                                  option.imageUrl
                                );
                                e.target.style.display = "none";
                                e.target.parentElement.innerHTML = `
                                  <div style="color: #ff4d4f; padding: 8px; background: #fff2f0; border-radius: 4px;">
                                    <div style="font-size: 11px;">Không thể tải ảnh</div>
                                    <div style="font-size: 10px; color: #999;">${option.imageUrl.substring(
                                      0,
                                      40
                                    )}...</div>
                                  </div>
                                `;
                              }}
                            />
                            <div
                              style={{
                                fontSize: 10,
                                color: "#999",
                                marginTop: 2,
                              }}
                            >
                              Ảnh đã upload
                            </div>
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

        {/* Phần cho FILL_IN_BLANK (giữ nguyên) */}
        {/* ... (giữ nguyên phần FILL_IN_BLANK từ code trước) ... */}

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
