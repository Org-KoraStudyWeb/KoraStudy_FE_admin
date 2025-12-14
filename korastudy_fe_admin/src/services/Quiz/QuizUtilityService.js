// src/services/quiz/QuizUtilityService.js
import { QUESTION_TYPES, QUESTION_TYPE_LABELS } from "./constants";

class QuizUtilityService {
  prepareQuizPayload(quizData) {
    const payload = {
      title: quizData.title?.trim(),
      description: quizData.description?.trim() || "",
      sectionId: quizData.sectionId,
      timeLimit: quizData.timeLimit || 30,
      passingScore: quizData.passingScore || 60,
      isPublished:
        quizData.isPublished !== undefined ? quizData.isPublished : true,
      isActive: quizData.isActive !== undefined ? quizData.isActive : true,
    };

    if (quizData.questions && quizData.questions.length > 0) {
      payload.questions = quizData.questions.map((q) =>
        this.prepareQuestionPayload(q)
      );
    }

    return payload;
  }

  prepareQuestionPayload(questionData) {
    const payload = {
      questionText: questionData.questionText?.trim(),
      questionType: questionData.questionType,
      score: questionData.score || 1.0,
      orderIndex: questionData.orderIndex || 0,
      imageUrl: questionData.imageUrl || "",
      explanation: questionData.explanation || "",
      // ⚠️ KHÔNG CÓ correctAnswer nữa
    };

    // Xử lý options dựa trên loại câu hỏi
    if (questionData.options && questionData.options.length > 0) {
      payload.options = questionData.options.map((opt, index) => ({
        optionText: opt.optionText?.trim(),
        isCorrect: opt.isCorrect || false,
        imageUrl: opt.imageUrl || "",
        orderIndex: opt.orderIndex || index + 1,
      }));
    } else if (questionData.questionType === QUESTION_TYPES.FILL_IN_BLANK) {
      // Tạo options mặc định cho FILL_IN_BLANK từ correctAnswer cũ
      if (questionData.correctAnswer) {
        payload.options = [
          {
            optionText: questionData.correctAnswer.trim(),
            isCorrect: true,
            orderIndex: 1,
          },
        ];
      }
    } else if (questionData.questionType === QUESTION_TYPES.ESSAY) {
      // ESSAY có thể không có options, hoặc có 1 option làm đáp án mẫu
      if (questionData.correctAnswer) {
        payload.options = [
          {
            optionText: questionData.correctAnswer.trim(),
            isCorrect: true,
            orderIndex: 1,
          },
        ];
      }
    }

    return payload;
  }

  prepareOptionPayload(optionData) {
    return {
      optionText: optionData.optionText?.trim(),
      isCorrect: optionData.isCorrect || false,
      imageUrl: optionData.imageUrl || "",
    };
  }

  getQuestionTypeLabel(questionType) {
    return (
      QUESTION_TYPE_LABELS[questionType] || {
        label: questionType,
        color: "default",
      }
    );
  }

  getAllQuestionTypes() {
    return Object.keys(QUESTION_TYPES).map((key) => ({
      value: QUESTION_TYPES[key],
      label: QUESTION_TYPE_LABELS[QUESTION_TYPES[key]]?.label || key,
      color: QUESTION_TYPE_LABELS[QUESTION_TYPES[key]]?.color || "default",
    }));
  }

  createSampleOptions(questionType) {
    switch (questionType) {
      case QUESTION_TYPES.SINGLE_CHOICE:
        return [
          { optionText: "Đáp án A", isCorrect: true, orderIndex: 1 },
          { optionText: "Đáp án B", isCorrect: false, orderIndex: 2 },
          { optionText: "Đáp án C", isCorrect: false, orderIndex: 3 },
          { optionText: "Đáp án D", isCorrect: false, orderIndex: 4 },
        ];
      case QUESTION_TYPES.MULTIPLE_CHOICE:
        return [
          { optionText: "Đáp án A", isCorrect: true, orderIndex: 1 },
          { optionText: "Đáp án B", isCorrect: true, orderIndex: 2 },
          { optionText: "Đáp án C", isCorrect: false, orderIndex: 3 },
          { optionText: "Đáp án D", isCorrect: false, orderIndex: 4 },
        ];
      case QUESTION_TYPES.TRUE_FALSE:
        return [
          { optionText: "Đúng", isCorrect: true, orderIndex: 1 },
          { optionText: "Sai", isCorrect: false, orderIndex: 2 },
        ];
      case QUESTION_TYPES.FILL_IN_BLANK:
        // FILL_IN_BLANK có thể có nhiều đáp án đúng
        return [
          { optionText: "đáp án 1", isCorrect: true, orderIndex: 1 },
          { optionText: "đáp án 2", isCorrect: true, orderIndex: 2 },
          { optionText: "đáp án 3", isCorrect: true, orderIndex: 3 },
        ];
      case QUESTION_TYPES.ESSAY:
        // ESSAY có thể có 1 đáp án mẫu
        return [
          {
            optionText: "Câu trả lời mẫu cho bài luận",
            isCorrect: true,
            orderIndex: 1,
          },
        ];
      default:
        return [];
    }
  }

  reorderOptions(options, fromIndex, toIndex) {
    const newOptions = [...options];
    const [movedOption] = newOptions.splice(fromIndex, 1);
    newOptions.splice(toIndex, 0, movedOption);

    return newOptions.map((option, index) => ({
      ...option,
      orderIndex: index + 1,
    }));
  }

  addNewOption(options, optionText = "", isCorrect = false) {
    const maxOrderIndex =
      options.length > 0
        ? Math.max(...options.map((opt) => opt.orderIndex || 0))
        : 0;

    return [
      ...options,
      {
        optionText,
        isCorrect,
        orderIndex: maxOrderIndex + 1,
      },
    ];
  }

  removeOption(options, index) {
    const newOptions = options.filter((_, i) => i !== index);

    return newOptions.map((option, idx) => ({
      ...option,
      orderIndex: idx + 1,
    }));
  }

  calculateScorePercentage(earnedPoints, totalPoints) {
    if (!totalPoints || totalPoints === 0) return 0;
    return Math.round((earnedPoints / totalPoints) * 100);
  }

  isQuizPassed(score, passingScore) {
    return score >= passingScore;
  }

  sortQuestionsByOrder(questions) {
    if (!questions) return [];
    return [...questions].sort(
      (a, b) => (a.orderIndex || 0) - (b.orderIndex || 0)
    );
  }

  calculateTotalPoints(questions) {
    if (!questions || questions.length === 0) return 0;
    return questions.reduce((total, q) => total + (q.score || 0), 0);
  }

  countQuestionsByType(questions) {
    const counts = {};
    Object.values(QUESTION_TYPES).forEach((type) => {
      counts[type] = 0;
    });

    questions?.forEach((q) => {
      if (q.questionType) {
        counts[q.questionType] = (counts[q.questionType] || 0) + 1;
      }
    });

    return counts;
  }

  createSampleQuiz(sectionId) {
    return {
      title: "Bài quiz mẫu - Tiếng Hàn Sơ Cấp",
      description: "Bài quiz kiểm tra kiến thức tiếng Hàn sơ cấp",
      sectionId: sectionId,
      timeLimit: 30,
      passingScore: 70,
      isPublished: true,
      isActive: true,
      questions: [
        {
          questionText: "안녕하세요 có nghĩa là gì?",
          questionType: QUESTION_TYPES.SINGLE_CHOICE,
          score: 2.0,
          orderIndex: 1,
          options: [
            { optionText: "Xin chào", isCorrect: true, orderIndex: 1 },
            { optionText: "Tạm biệt", isCorrect: false, orderIndex: 2 },
            { optionText: "Cảm ơn", isCorrect: false, orderIndex: 3 },
            { optionText: "Xin lỗi", isCorrect: false, orderIndex: 4 },
          ],
          explanation: "안녕하세요 là cách chào thông dụng trong tiếng Hàn.",
        },
        {
          questionText: "Chào buổi sáng tiếng Hàn là ________.",
          questionType: QUESTION_TYPES.FILL_IN_BLANK,
          score: 1.0,
          orderIndex: 2,
          options: [
            { optionText: "좋은 아침", isCorrect: true, orderIndex: 1 },
            { optionText: "안녕히 주무세요", isCorrect: true, orderIndex: 2 },
          ],
          explanation: "좋은 아침 nghĩa là chào buổi sáng.",
        },
      ],
    };
  }

  // Helper để chuyển đổi từ format cũ (có correctAnswer) sang format mới (options)
  convertLegacyQuestionToNewFormat(questionData) {
    const newData = { ...questionData };

    // Nếu có correctAnswer cũ, chuyển thành options
    if (newData.correctAnswer && !newData.options) {
      if (
        newData.questionType === QUESTION_TYPES.FILL_IN_BLANK ||
        newData.questionType === QUESTION_TYPES.ESSAY
      ) {
        newData.options = [
          {
            optionText: newData.correctAnswer,
            isCorrect: true,
            orderIndex: 1,
          },
        ];
      }
      delete newData.correctAnswer;
    }

    return newData;
  }

  // Helper để lấy tất cả đáp án đúng từ options (dùng cho FILL_IN_BLANK)
  getCorrectAnswersFromOptions(options) {
    if (!options || options.length === 0) return [];
    return options
      .filter((opt) => opt.isCorrect)
      .map((opt) => opt.optionText)
      .filter((text) => text?.trim());
  }

  // Helper để hiển thị đáp án đúng (dùng cho UI)
  formatCorrectAnswersForDisplay(options) {
    const correctAnswers = this.getCorrectAnswersFromOptions(options);
    if (correctAnswers.length === 0) return "Chưa có đáp án";
    if (correctAnswers.length === 1) return correctAnswers[0];
    return correctAnswers.join(", ");
  }
}

const quizUtilityService = new QuizUtilityService();
export default quizUtilityService;
