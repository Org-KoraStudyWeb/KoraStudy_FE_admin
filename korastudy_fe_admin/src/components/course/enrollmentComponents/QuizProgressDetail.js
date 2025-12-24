// src/components/course/enrollmentComponents/QuizProgressDetail.js
import React from "react";
import { Progress, Tag } from "antd";

const QuizProgressDetail = ({ quizProgress = {} }) => {
  if (
    !quizProgress ||
    !quizProgress.totalQuizzes ||
    quizProgress.totalQuizzes === 0
  ) {
    return (
      <div style={{ width: 320 }}>
        <p style={{ color: "#999" }}>Chưa có quiz nào</p>
      </div>
    );
  }

  const passedRate =
    quizProgress.totalQuizzes > 0
      ? Math.round(
          (quizProgress.passedQuizzes / quizProgress.totalQuizzes) * 100
        )
      : 0;

  return (
    <div style={{ width: 320 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <div>
          <div style={{ fontSize: "12px", color: "#666" }}>Tổng số quiz</div>
          <div style={{ fontSize: "16px", fontWeight: "bold" }}>
            {quizProgress.totalQuizzes}
          </div>
        </div>
        <div>
          <div style={{ fontSize: "12px", color: "#666" }}>Tỷ lệ pass</div>
          <div
            style={{ fontSize: "16px", fontWeight: "bold", color: "#52c41a" }}
          >
            {passedRate}%
          </div>
        </div>
        <div>
          <div style={{ fontSize: "12px", color: "#666" }}>Đã làm</div>
          <div style={{ fontSize: "16px", fontWeight: "bold" }}>
            {quizProgress.completedQuizzes}
          </div>
        </div>
      </div>

      <div style={{ marginBottom: 8 }}>
        <Progress
          percent={passedRate}
          size="small"
          strokeColor="#52c41a"
          format={(percent) => `${percent}% pass`}
        />
      </div>

      <div style={{ borderTop: "1px solid #f0f0f0", paddingTop: 8 }}>
        <div style={{ fontSize: "12px", color: "#666", marginBottom: 4 }}>
          Chi tiết quiz:
        </div>
        <div style={{ maxHeight: 200, overflowY: "auto" }}>
          {quizProgress.quizDetails && quizProgress.quizDetails.length > 0 ? (
            quizProgress.quizDetails.map((quiz, index) => (
              <div
                key={quiz.quizId || index}
                style={{
                  padding: "6px 0",
                  borderBottom:
                    index < quizProgress.quizDetails.length - 1
                      ? "1px solid #f5f5f5"
                      : "none",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div style={{ flex: 1, fontSize: "12px" }}>
                    <div style={{ fontWeight: 500 }}>
                      {quiz.quizTitle || `Quiz ${index + 1}`}
                    </div>
                    {quiz.score !== undefined && (
                      <div style={{ fontSize: "11px", color: "#666" }}>
                        Điểm: <strong>{quiz.score}</strong>/100
                      </div>
                    )}
                  </div>
                  <div>
                    <Tag
                      color={
                        quiz.isPassed
                          ? "green"
                          : quiz.isCompleted
                          ? "orange"
                          : "default"
                      }
                      size="small"
                    >
                      {quiz.isPassed
                        ? "Pass"
                        : quiz.isCompleted
                        ? "Fail"
                        : "Chưa làm"}
                    </Tag>
                    {quiz.attemptCount > 0 && (
                      <div
                        style={{
                          fontSize: "10px",
                          color: "#999",
                          textAlign: "center",
                          marginTop: 2,
                        }}
                      >
                        {quiz.attemptCount} lần
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div
              style={{
                fontSize: "11px",
                color: "#999",
                textAlign: "center",
                padding: 8,
              }}
            >
              Chưa có thông tin chi tiết quiz
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizProgressDetail;
