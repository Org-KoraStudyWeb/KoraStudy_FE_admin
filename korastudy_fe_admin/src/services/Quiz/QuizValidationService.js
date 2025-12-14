// src/services/quiz/QuizValidationService.js
import { QUESTION_TYPES } from "./constants";

class QuizValidationService {
  validateQuizData(quizData, isCreate = true) {
    const errors = [];

    // Validate basic fields
    if (!quizData.title?.trim()) {
      errors.push("Tiêu đề quiz không được để trống");
    }

    if (!quizData.sectionId) {
      errors.push("Section ID không được để trống");
    }

    if (quizData.timeLimit === undefined || quizData.timeLimit < 1) {
      errors.push("Thời gian làm bài phải từ 1 phút trở lên");
    }

    if (
      quizData.passingScore === undefined ||
      quizData.passingScore < 1 ||
      quizData.passingScore > 100
    ) {
      errors.push("Điểm đạt phải từ 1 đến 100%");
    }

    // Validate questions if provided
    if (quizData.questions && Array.isArray(quizData.questions)) {
      if (quizData.questions.length === 0 && !isCreate) {
        errors.push("Quiz phải có ít nhất 1 câu hỏi");
      } else {
        quizData.questions.forEach((question, index) => {
          if (!question) {
            errors.push(`Câu hỏi ${index + 1} không hợp lệ`);
            return;
          }

          const questionValidation = this.validateQuestionData(question);
          if (!questionValidation.isValid) {
            errors.push(
              `Câu hỏi ${index + 1}: ${questionValidation.errors.join(", ")}`
            );
          }
        });
      }
    }

    return { isValid: errors.length === 0, errors };
  }

  validateQuestionData(questionData) {
    const errors = [];

    if (!questionData.questionText?.trim()) {
      errors.push("Nội dung câu hỏi không được để trống");
    }

    if (!questionData.questionType) {
      errors.push("Loại câu hỏi không được để trống");
    } else if (
      !Object.values(QUESTION_TYPES).includes(questionData.questionType)
    ) {
      errors.push("Loại câu hỏi không hợp lệ");
    }

    if (!questionData.score || questionData.score < 0.5) {
      errors.push("Điểm số phải từ 0.5 trở lên");
    }

    // Validate based on question type
    switch (questionData.questionType) {
      case QUESTION_TYPES.SINGLE_CHOICE:
      case QUESTION_TYPES.MULTIPLE_CHOICE:
      case QUESTION_TYPES.TRUE_FALSE:
        if (!questionData.options || questionData.options.length < 2) {
          errors.push("Câu hỏi trắc nghiệm phải có ít nhất 2 lựa chọn");
        } else {
          // Validate TRUE_FALSE must have exactly 2 options
          if (
            questionData.questionType === QUESTION_TYPES.TRUE_FALSE &&
            questionData.options.length !== 2
          ) {
            errors.push("Câu hỏi Đúng/Sai phải có đúng 2 lựa chọn");
          }

          // Count correct answers
          const correctCount = questionData.options.filter(
            (opt) => opt.isCorrect
          ).length;

          if (
            questionData.questionType === QUESTION_TYPES.SINGLE_CHOICE &&
            correctCount !== 1
          ) {
            errors.push("Câu hỏi chọn 1 đáp án phải có đúng 1 đáp án đúng");
          }

          if (
            questionData.questionType === QUESTION_TYPES.MULTIPLE_CHOICE &&
            correctCount < 1
          ) {
            errors.push(
              "Câu hỏi chọn nhiều đáp án phải có ít nhất 1 đáp án đúng"
            );
          }

          if (
            questionData.questionType === QUESTION_TYPES.TRUE_FALSE &&
            correctCount !== 1
          ) {
            errors.push("Câu hỏi Đúng/Sai phải có đúng 1 đáp án đúng");
          }
        }
        break;

      case QUESTION_TYPES.FILL_IN_BLANK:
        // FILL_IN_BLANK cần ít nhất 1 option (đáp án đúng)
        if (!questionData.options || questionData.options.length === 0) {
          errors.push("Câu hỏi điền từ phải có ít nhất 1 đáp án đúng");
        } else {
          // Tất cả options của FILL_IN_BLANK phải là correct
          const allCorrect = questionData.options.every((opt) => opt.isCorrect);
          if (!allCorrect) {
            errors.push(
              "Câu hỏi điền từ chỉ có đáp án đúng, không có đáp án sai"
            );
          }
        }
        break;

      case QUESTION_TYPES.ESSAY:
        // ESSAY không cần options (hoặc có thể có 1 option làm đáp án mẫu)
        // Không validate options cho ESSAY
        break;

      default:
        break;
    }

    return { isValid: errors.length === 0, errors };
  }

  validateOptionData(optionData) {
    const errors = [];

    if (!optionData.optionText?.trim()) {
      errors.push("Nội dung đáp án không được để trống");
    }

    return { isValid: errors.length === 0, errors };
  }
}

const quizValidationService = new QuizValidationService();
export default quizValidationService;
