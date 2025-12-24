// src/components/course/enrollmentComponents/ProgressDetailModal.js
import React, { useCallback, useEffect, useState } from "react";
import {
  Modal,
  Progress,
  Statistic,
  Row,
  Col,
  Card,
  message,
  Empty,
  Space,
  Tag,
} from "antd";
import { BarChartOutlined, TrophyOutlined } from "@ant-design/icons";
import CourseProgressService from "../../../services/CourseProgressService";
import quizService from "../../../services/Quiz/QuizService";

const ProgressDetailModal = ({
  visible = false,
  onClose = () => {},
  courseId = null,
  userId = null,
  username = "",
}) => {
  const [loading, setLoading] = useState(false);
  const [progressData, setProgressData] = useState(null);
  const [averageQuizScore, setAverageQuizScore] = useState(null);

  const loadProgressDetail = useCallback(async () => {
    if (!courseId || !userId) return;

    setLoading(true);
    setAverageQuizScore(null);
    try {
      const [progressResponse, avgScoreResponse] = await Promise.all([
        CourseProgressService.getUserProgressDetail(courseId, userId),
        quizService.getUserSimpleAverageScoreInCourse(courseId, userId),
      ]);

      if (progressResponse.success) {
        setProgressData(progressResponse.data);
      } else {
        message.error(
          progressResponse.message || "Không thể lấy chi tiết tiến độ"
        );
      }

      if (avgScoreResponse.success && avgScoreResponse.data) {
        setAverageQuizScore(avgScoreResponse.data.averageScore);
      } else {
        console.warn(
          "Không thể lấy điểm trung bình quiz:",
          avgScoreResponse.message
        );
      }
    } catch (error) {
      console.error("Error loading progress detail:", error);
      message.error("Lỗi khi tải chi tiết tiến độ");
    } finally {
      setLoading(false);
    }
  }, [courseId, userId]);

  useEffect(() => {
    if (visible) {
      loadProgressDetail();
    }
  }, [visible, loadProgressDetail]);

  const renderProgressStats = () => {
    if (!progressData) return null;

    const { summary } = progressData;
    return (
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="Tiến độ tổng"
              value={summary?.overallProgress?.progressPercentage || 0}
              suffix="%"
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="Bài học hoàn thành"
              value={
                summary?.overallProgress?.lessonProgress
                  ? `${summary.overallProgress.lessonProgress}%`
                  : "0%"
              }
              valueStyle={{ color: "#13c2c2" }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="Quiz pass"
              value={
                summary?.overallProgress?.quizProgress
                  ? `${summary.overallProgress.quizProgress}%`
                  : "0%"
              }
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="Thời gian học"
              value={Math.floor((summary?.timeSpent || 0) / 60)}
              suffix="phút"
              valueStyle={{ color: "#722ed1" }}
            />
          </Card>
        </Col>
      </Row>
    );
  };

  return (
    <Modal
      title={
        <Space>
          <BarChartOutlined />
          Chi tiết tiến độ học tập
          <Tag color="blue">{username}</Tag>
        </Space>
      }
      open={visible}
      onCancel={onClose}
      width={1200}
      footer={null}
    >
      {loading ? (
        <div style={{ textAlign: "center", padding: 50 }}>
          <Progress type="circle" percent={30} />
          <div style={{ marginTop: 16 }}>Đang tải dữ liệu tiến độ...</div>
        </div>
      ) : progressData ? (
        <div>
          {renderProgressStats()}

          {/* Hiển thị section progress */}
          {progressData.sectionProgress &&
            progressData.sectionProgress.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <h4>Tiến độ theo chương</h4>
                {progressData.sectionProgress.map((section) => (
                  <Card
                    key={section.sectionId}
                    size="small"
                    style={{ marginBottom: 8 }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 500, marginBottom: 4 }}>
                          {section.sectionTitle}
                        </div>
                        <div style={{ fontSize: "12px", color: "#666" }}>
                          {section.completedItems}/{section.totalItems} mục đã
                          hoàn thành
                        </div>
                      </div>
                      <div style={{ width: 200 }}>
                        <Progress
                          percent={section.progressPercentage || 0}
                          size="small"
                        />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

          {/* Hiển thị quiz chi tiết */}
          {progressData.quizProgress && progressData.quizProgress.analysis && (
            <div style={{ marginBottom: 24 }}>
              <h4>
                <TrophyOutlined style={{ marginRight: 8 }} />
                Thống kê Quiz
              </h4>
              <Row gutter={16}>
                <Col span={8}>
                  <Card size="small">
                    <Statistic
                      title="Quiz đã pass"
                      value={progressData.quizProgress.analysis.passedQuizzes}
                      suffix={`/${progressData.quizProgress.analysis.totalQuizzes}`}
                      valueStyle={{ color: "#52c41a" }}
                    />
                  </Card>
                </Col>
                <Col span={8}>
                  <Card size="small">
                    <Statistic
                      title="Điểm TB Quiz"
                      value={
                        averageQuizScore !== null ? averageQuizScore : "..."
                      }
                      precision={2}
                      suffix={averageQuizScore !== null ? "điểm" : ""}
                      valueStyle={{ color: "#1890ff" }}
                    />
                  </Card>
                </Col>
                <Col span={8}>
                  <Card size="small">
                    <Statistic
                      title="Tỷ lệ hoàn thành"
                      value={progressData.quizProgress.analysis.completionRate}
                      suffix="%"
                      valueStyle={{ color: "#13c2c2" }}
                    />
                  </Card>
                </Col>
              </Row>
            </div>
          )}
        </div>
      ) : (
        <Empty description="Không có dữ liệu tiến độ" />
      )}
    </Modal>
  );
};

export default ProgressDetailModal;
