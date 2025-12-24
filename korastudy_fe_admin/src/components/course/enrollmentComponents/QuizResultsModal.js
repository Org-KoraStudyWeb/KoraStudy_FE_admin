// src/components/course/enrollmentComponents/QuizResultsModal.js
import React, { useCallback, useEffect, useState } from "react";
import {
  Modal,
  Table,
  Tag,
  Statistic,
  Row,
  Col,
  Card,
  message,
  Empty,
  Space,
  Progress,
} from "antd";
import { TrophyOutlined } from "@ant-design/icons";
import QuizProgressService from "../../../services/Quiz/QuizProgressService";
import quizService from "../../../services/Quiz/QuizService";

const QuizResultsModal = ({
  visible = false,
  onClose = () => {},
  courseId = null,
  userId = null,
  username = "",
}) => {
  const [loading, setLoading] = useState(false);
  const [quizResults, setQuizResults] = useState([]);
  const [overallStats, setOverallStats] = useState(null);

  const loadQuizResults = useCallback(async () => {
    if (!courseId || !userId) return;

    setLoading(true);
    try {
      // Lấy đồng thời cả tiến độ (để có isPassed) và điểm trung bình chi tiết
      const [progressResponse, detailedScoreResponse] = await Promise.all([
        QuizProgressService.getUserQuizProgressInCourseForAdmin(
          courseId,
          userId
        ),
        quizService.getUserDetailedAverageScoreInCourse(courseId, userId),
      ]);

      if (!progressResponse.success) {
        message.error(
          progressResponse.message || "Không thể lấy danh sách quiz"
        );
        return;
      }

      const progressList = progressResponse.data;
      const detailedData = detailedScoreResponse.success
        ? detailedScoreResponse.data
        : null;

      // Set thống kê tổng quan từ API chi tiết nếu có
      if (detailedData) {
        setOverallStats({
          overallAverageScore: detailedData.overallAverageScore,
          totalQuizzes: detailedData.totalQuizzes,
          attemptedQuizzes: detailedData.attemptedQuizzes,
        });
      }

      const quizAverages = detailedData?.quizAverages || [];

      // Merge dữ liệu: Lấy danh sách từ progress làm gốc và bổ sung thông tin điểm trung bình
      const mergedResults = progressList.map((progress) => {
        const avgData = quizAverages.find(
          (avg) => avg.quizId === progress.quizId
        );
        return {
          ...progress, // Dữ liệu gốc: isPassed, isCompleted, totalPoints, passingScore, score (lần cuối)
          // Dữ liệu bổ sung:
          averageScore: avgData?.averageScore,
          bestScore: avgData?.bestScore,
          attemptCount: avgData?.attemptCount ?? progress.attemptCount, // Ưu tiên số lần làm từ API chi tiết
        };
      });

      setQuizResults(mergedResults);
    } catch (error) {
      console.error("Error loading quiz results:", error);
      message.error("Lỗi khi tải kết quả quiz");
    } finally {
      setLoading(false);
    }
  }, [courseId, userId]);

  useEffect(() => {
    if (visible) {
      loadQuizResults();
    }
  }, [visible, loadQuizResults]);

  const passedCount = React.useMemo(
    () => quizResults.filter((q) => q.isPassed).length,
    [quizResults]
  );

  const columns = [
    {
      title: "Tên Quiz",
      dataIndex: "quizTitle",
      key: "quizTitle",
      width: 200,
      render: (text) => <span style={{ fontWeight: 500 }}>{text}</span>,
    },
    {
      title: "Điểm (TB / Cao nhất)",
      key: "score",
      width: 150,
      render: (_, record) => {
        if (!record.isCompleted) {
          return <div style={{ textAlign: "center" }}>-</div>;
        }
        return (
          <div>
            <div style={{ fontSize: "14px", fontWeight: "bold" }}>
              {record.averageScore !== null &&
              record.averageScore !== undefined ? (
                record.averageScore.toFixed(2)
              ) : (
                <i>Chưa có</i>
              )}
            </div>
            <div style={{ fontSize: "11px", color: "#666" }}>
              <TrophyOutlined style={{ marginRight: 4, color: "#faad14" }} />
              {record.bestScore !== null && record.bestScore !== undefined
                ? record.bestScore.toFixed(2)
                : "N/A"}
            </div>
          </div>
        );
      },
    },
    {
      title: "Tỷ lệ (Điểm TB)",
      key: "percentage",
      width: 150,
      render: (_, record) => {
        // Sử dụng điểm trung bình để hiển thị progress, giả định thang 100
        const percentage = record.averageScore ?? 0;
        return (
          <div>
            <Progress
              type="circle"
              percent={Math.round(Math.min(percentage, 100))}
              width={50}
              format={(percent) => `${percent}%`}
              status={
                record.isPassed
                  ? "success"
                  : record.isCompleted
                  ? "normal"
                  : "exception"
              }
            />
          </div>
        );
      },
    },
    {
      title: "Trạng thái",
      key: "status",
      width: 120,
      align: "center",
      render: (_, record) => {
        if (!record.isCompleted) {
          return <Tag color="default">Chưa làm</Tag>;
        }

        // Ưu tiên sử dụng cờ isPassed từ backend nếu có
        if (record.isPassed === true) {
          return (
            <Tag icon={<TrophyOutlined />} color="green">
              Pass
            </Tag>
          );
        }
        if (record.isPassed === false) {
          return <Tag color="red">Fail</Tag>;
        }

        // Nếu isPassed là null, tự tính toán dựa trên bestScore (giả định là thang 100)
        if (record.bestScore !== null && record.passingScore !== null) {
          if (record.bestScore >= record.passingScore) {
            return (
              <Tag icon={<TrophyOutlined />} color="green">
                Pass
              </Tag>
            );
          }
        }

        // Mặc định là Fail nếu đã hoàn thành nhưng không pass
        return <Tag color="red">Fail</Tag>;
      },
    },
    {
      title: "Lần làm",
      dataIndex: "attemptCount",
      key: "attemptCount",
      width: 80,
      align: "center",
      render: (count) => (
        <Tag color={count > 1 ? "blue" : "default"} style={{ fontSize: 14 }}>
          {count || 0}
        </Tag>
      ),
    },
    {
      title: "Thời gian làm",
      dataIndex: "timeSpent",
      key: "timeSpent",
      width: 120,
      render: (time) => {
        if (!time) return "N/A";
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        return `${minutes}:${seconds.toString().padStart(2, "0")}`;
      },
    },
  ];

  return (
    <Modal
      title={
        <Space>
          <TrophyOutlined />
          Kết quả quiz
          <Tag color="blue">{username}</Tag>
        </Space>
      }
      open={visible}
      onCancel={onClose}
      width={1200}
      footer={null}
    >
      {overallStats && (
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={6}>
            <Card size="small">
              <Statistic
                title="Tổng số quiz"
                value={overallStats.totalQuizzes}
                valueStyle={{ color: "#1890ff" }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small">
              <Statistic
                title="Điểm trung bình chung"
                value={overallStats.overallAverageScore ?? 0}
                valueStyle={{ color: "#722ed1" }}
                precision={2}
                suffix="điểm"
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small">
              <Statistic
                title="Quiz đã làm"
                value={overallStats.attemptedQuizzes}
                suffix={`/ ${overallStats.totalQuizzes}`}
                valueStyle={{ color: "#13c2c2" }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small">
              <Statistic
                title="Quiz đã Pass"
                value={passedCount}
                suffix={`/ ${overallStats.attemptedQuizzes}`}
                valueStyle={{ color: "#52c41a" }}
              />
            </Card>
          </Col>
        </Row>
      )}

      <Table
        columns={columns}
        dataSource={quizResults.map((item, idx) => ({
          ...item,
          key: item.quizId || idx,
        }))}
        loading={loading}
        pagination={false}
        locale={{
          emptyText: <Empty description="Chưa có kết quả quiz" />,
        }}
        scroll={{ x: 800 }}
      />
    </Modal>
  );
};

export default QuizResultsModal;
