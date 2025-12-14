// src/services/quiz/constants.js
export const QUESTION_TYPES = {
  SINGLE_CHOICE: "SINGLE_CHOICE",
  MULTIPLE_CHOICE: "MULTIPLE_CHOICE",
  TRUE_FALSE: "TRUE_FALSE",
  FILL_IN_BLANK: "FILL_IN_BLANK",
  ESSAY: "ESSAY",
};

export const QUESTION_TYPE_LABELS = {
  SINGLE_CHOICE: { label: "Chọn 1 đáp án", color: "primary" },
  MULTIPLE_CHOICE: { label: "Chọn nhiều đáp án", color: "secondary" },
  TRUE_FALSE: { label: "Đúng/Sai", color: "info" },
  FILL_IN_BLANK: { label: "Điền từ", color: "warning" },
  ESSAY: { label: "Tự luận", color: "success" },
};

export const QUIZ_STATUS = {
  DRAFT: "DRAFT",
  PUBLISHED: "PUBLISHED",
  ARCHIVED: "ARCHIVED",
};

export const SUBMISSION_STATUS = {
  PENDING: "PENDING",
  SUBMITTED: "SUBMITTED",
  GRADED: "GRADED",
};
