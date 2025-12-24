// src/components/course/enrollmentComponents/EnrollmentStats.js
import React, { useMemo } from "react";
import { Row, Col, Card, Statistic } from "antd";
import {
  UserOutlined,
  PercentageOutlined,
  PlayCircleOutlined,
  TrophyOutlined,
  FileTextOutlined,
} from "@ant-design/icons";

const EnrollmentStats = ({ enrollments = [], searchText = "" }) => {
  const stats = useMemo(() => {
    if (!enrollments || !Array.isArray(enrollments)) {
      return {
        completed: 0,
        inProgress: 0,
        notStarted: 0,
        avgProgress: 0,
        expired: 0,
        totalLessonsCompleted: 0,
        totalQuizzesPassed: 0,
        totalQuizzesAttempted: 0,
        totalDuration: 0,
      };
    }

    const data = searchText
      ? enrollments.filter(
          (e) =>
            e.username?.toLowerCase().includes(searchText.toLowerCase()) ||
            e.email?.toLowerCase().includes(searchText.toLowerCase()) ||
            e.userId?.toString().includes(searchText)
        )
      : enrollments;

    if (!data.length) {
      return {
        completed: 0,
        inProgress: 0,
        notStarted: 0,
        avgProgress: 0,
        expired: 0,
        totalLessonsCompleted: 0,
        totalQuizzesPassed: 0,
        totalQuizzesAttempted: 0,
        totalDuration: 0,
      };
    }

    const completed = data.filter((e) => e.isCourseCompleted).length;
    const inProgress = data.filter(
      (e) =>
        e.status === "ACTIVE" &&
        !e.isExpired &&
        (e.progress || 0) > 0 &&
        (e.progress || 0) < 100
    ).length;
    const notStarted = data.filter(
      (e) => e.status === "ACTIVE" && (e.progress || 0) === 0
    ).length;
    const expired = data.filter((e) => e.isExpired).length;

    const avgProgress =
      data.reduce((sum, e) => sum + (e.progress || 0), 0) / data.length;
    const totalLessonsCompleted = data.reduce(
      (sum, e) => sum + (e.completedLessons || 0),
      0
    );
    const totalQuizzesPassed = data.reduce(
      (sum, e) => sum + (e.quizProgress?.passedQuizzes || 0),
      0
    );
    const totalQuizzesAttempted = data.reduce(
      (sum, e) => sum + (e.quizProgress?.completedQuizzes || 0),
      0
    );
    const totalDuration = data.reduce(
      (sum, e) => sum + (e.totalDuration || 0),
      0
    );

    return {
      completed,
      inProgress,
      notStarted,
      avgProgress,
      expired,
      totalLessonsCompleted,
      totalQuizzesPassed,
      totalQuizzesAttempted,
      totalDuration,
    };
  }, [enrollments, searchText]);

  return (
    <Row gutter={16} style={{ marginBottom: "24px" }}>
      <Col span={3}>
        <Card size="small">
          <Statistic
            title="Tổng học viên"
            value={enrollments.length}
            prefix={<UserOutlined />}
            valueStyle={{ fontSize: "20px" }}
          />
        </Card>
      </Col>
      <Col span={3}>
        <Card size="small">
          <Statistic
            title="Hoàn thành KH"
            value={stats.completed}
            valueStyle={{ color: "#52c41a", fontSize: "20px" }}
          />
        </Card>
      </Col>
      <Col span={3}>
        <Card size="small">
          <Statistic
            title="Đang học"
            value={stats.inProgress}
            valueStyle={{ color: "#1890ff", fontSize: "20px" }}
          />
        </Card>
      </Col>
      <Col span={3}>
        <Card size="small">
          <Statistic
            title="Tiến độ TB"
            value={Math.round(stats.avgProgress)}
            suffix="%"
            prefix={<PercentageOutlined />}
            valueStyle={{ color: "#722ed1", fontSize: "20px" }}
          />
        </Card>
      </Col>
      <Col span={3}>
        <Card size="small">
          <Statistic
            title="Bài học HT"
            value={stats.totalLessonsCompleted}
            prefix={<PlayCircleOutlined />}
            valueStyle={{ color: "#13c2c2", fontSize: "20px" }}
          />
        </Card>
      </Col>
      <Col span={3}>
        <Card size="small">
          <Statistic
            title="Quiz pass"
            value={stats.totalQuizzesPassed}
            prefix={<TrophyOutlined />}
            valueStyle={{ color: "#fa8c16", fontSize: "20px" }}
          />
        </Card>
      </Col>
      <Col span={3}>
        <Card size="small">
          <Statistic
            title="Quiz đã làm"
            value={stats.totalQuizzesAttempted}
            prefix={<FileTextOutlined />}
            valueStyle={{ color: "#eb2f96", fontSize: "20px" }}
          />
        </Card>
      </Col>
      <Col span={3}>
        <Card size="small">
          <Statistic
            title="Chưa bắt đầu"
            value={stats.notStarted}
            valueStyle={{ color: "#faad14", fontSize: "20px" }}
          />
        </Card>
      </Col>
    </Row>
  );
};

export default EnrollmentStats;
