// src/components/course/CourseEnrollmentList.js
import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Modal,
  Table,
  Tag,
  Space,
  Button,
  Statistic,
  Row,
  Col,
  Card,
  message,
  Avatar,
  Progress,
  Empty,
  Input,
  Tooltip,
  Popover,
  Badge,
} from "antd";
import {
  UserOutlined,
  PercentageOutlined,
  ReloadOutlined,
  SearchOutlined,
  MailOutlined,
  IdcardOutlined,
  PlayCircleOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
  TrophyOutlined,
  EyeOutlined,
  ClockCircleOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import EnrollmentService from "../../services/EnrollmentService";
import CourseProgressService from "../../services/Quiz/CourseProgressService";
import LessonService from "../../services/LessonService";
import QuizService from "../../services/Quiz/QuizService";

const { Search } = Input;

const safeFormatDate = (date) => {
  if (!date) return "Chưa có ngày";
  try {
    const dateObj = new Date(date);
    return isNaN(dateObj.getTime())
      ? "Chưa có ngày"
      : new Date(date).toLocaleDateString("vi-VN");
  } catch {
    return "Chưa có ngày";
  }
};

const generateAvatarColor = (userId) => {
  const colors = [
    "#f56a00",
    "#7265e6",
    "#ffbf00",
    "#00a2ae",
    "#87d068",
    "#108ee9",
  ];
  return colors[Math.abs(userId) % colors.length];
};

// Component popover hiển thị chi tiết quiz progress
const QuizProgressDetail = ({ quizProgress }) => {
  if (!quizProgress || quizProgress.totalQuizzes === 0) {
    return (
      <div style={{ width: 280 }}>
        <p style={{ color: "#999" }}>Chưa có quiz nào</p>
      </div>
    );
  }

  return (
    <div style={{ width: 280 }}>
      <div style={{ marginBottom: 8 }}>
        <strong>Tổng số quiz: </strong>
        {quizProgress.totalQuizzes}
      </div>
      <div style={{ marginBottom: 4 }}>
        <Space>
          <Badge color="green" text="Đã pass" />
          <strong>{quizProgress.passedQuizzes}</strong>
        </Space>
      </div>
      <div style={{ marginBottom: 4 }}>
        <Space>
          <Badge color="orange" text="Đã làm (fail)" />
          <strong>{quizProgress.failedQuizzes}</strong>
        </Space>
      </div>
      <div style={{ marginBottom: 8 }}>
        <Space>
          <Badge color="default" text="Chưa làm" />
          <strong>{quizProgress.notAttemptedQuizzes}</strong>
        </Space>
      </div>

      {quizProgress.quizDetails && quizProgress.quizDetails.length > 0 && (
        <div style={{ borderTop: "1px solid #f0f0f0", paddingTop: 8 }}>
          <div style={{ fontSize: "12px", color: "#666", marginBottom: 4 }}>
            Chi tiết quiz:
          </div>
          {quizProgress.quizDetails.slice(0, 3).map((quiz, index) => (
            <div
              key={index}
              style={{
                padding: "4px 0",
                borderBottom: index < 2 ? "1px solid #f5f5f5" : "none",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div style={{ flex: 1, fontSize: "11px" }}>
                  {quiz.quizTitle}
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
                </div>
              </div>
            </div>
          ))}
          {quizProgress.quizDetails.length > 3 && (
            <div style={{ fontSize: "11px", color: "#999", marginTop: 4 }}>
              ...và {quizProgress.quizDetails.length - 3} quiz khác
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const CourseEnrollmentList = ({ visible, onClose, courseId, courseName }) => {
  const [enrollments, setEnrollments] = useState([]);
  const [filteredEnrollments, setFilteredEnrollments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [progressLoading, setProgressLoading] = useState({});
  const [searchText, setSearchText] = useState("");
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 5,
    total: 0,
  });
  const [courseStructure, setCourseStructure] = useState({
    totalLessons: 0,
    totalQuizzes: 0,
    quizzes: [],
  });

  // Load enrollments và progress
  const loadEnrollmentsWithProgress = useCallback(
    async (page = 1, size = 5) => {
      if (!courseId) {
        message.error("Không tìm thấy khóa học");
        return;
      }

      setLoading(true);
      try {
        // 1. Lấy cấu trúc khóa học (lessons & quizzes) MỘT LẦN
        let structure = { totalLessons: 0, totalQuizzes: 0, quizzes: [] };
        const structureResponse =
          await CourseProgressService.getCourseStructure(courseId);
        if (
          structureResponse.success &&
          Array.isArray(structureResponse.data)
        ) {
          let lessonCount = 0;
          let quizList = [];
          structureResponse.data.forEach((section) => {
            lessonCount += section.lessons?.length || 0;
            if (section.quizzes?.length > 0) {
              quizList.push(...section.quizzes);
            }
          });
          structure = {
            totalLessons: lessonCount,
            totalQuizzes: quizList.length,
            quizzes: quizList,
          };
        }
        setCourseStructure(structure);

        // 1. Load enrollments
        const enrollmentResponse =
          await EnrollmentService.getCourseEnrollmentsAdmin(courseId, {
            page: page - 1,
            size,
          });

        if (enrollmentResponse.success) {
          const enrollmentsData =
            enrollmentResponse.data?.content || enrollmentResponse.data || [];
          const totalElements =
            enrollmentResponse.data?.totalElements ||
            enrollmentResponse.data?.total ||
            0;

          if (!Array.isArray(enrollmentsData)) {
            console.warn("Invalid enrollments data structure");
            setEnrollments([]);
            setFilteredEnrollments([]);
            return;
          }

          // 2. Kết hợp enrollment data với progress data (bao gồm cả quiz)
          const enrollmentsWithProgress = await Promise.all(
            enrollmentsData.map(async (enrollment) => {
              try {
                setProgressLoading((prev) => ({
                  ...prev,
                  [enrollment.userId]: true,
                }));

                // Load lesson progress
                const lessonProgressResponse =
                  await LessonService.getUserProgressByCourseForAdmin(
                    courseId,
                    enrollment.userId
                  );
                const completedLessons =
                  lessonProgressResponse.success &&
                  Array.isArray(lessonProgressResponse.data)
                    ? lessonProgressResponse.data.filter(
                        (item) => item.status === "COMPLETED"
                      ).length
                    : 0;

                // Load quiz progress
                let passedQuizzes = 0;
                let failedQuizzes = 0;
                let notAttemptedQuizzes = 0;
                let quizDetails = [];

                if (structure.totalQuizzes > 0) {
                  const quizStatusPromises = structure.quizzes.map((quiz) =>
                    QuizService.getQuizStatusForUser(quiz.id, enrollment.userId)
                  );
                  const quizStatuses = await Promise.all(quizStatusPromises);

                  quizStatuses.forEach((statusRes, index) => {
                    const quizInfo = structure.quizzes[index];
                    const detail = {
                      quizId: quizInfo.id,
                      quizTitle: quizInfo.title,
                      isPassed: false,
                      isCompleted: false,
                    };
                    if (statusRes.success && statusRes.data) {
                      detail.isPassed = statusRes.data.isPassed || false;
                      detail.isCompleted = statusRes.data.isCompleted || false;
                      if (detail.isPassed) {
                        passedQuizzes++;
                      } else if (detail.isCompleted) {
                        failedQuizzes++;
                      } else {
                        notAttemptedQuizzes++;
                      }
                    } else {
                      notAttemptedQuizzes++;
                    }
                    quizDetails.push(detail);
                  });
                }

                const totalItems =
                  structure.totalLessons + structure.totalQuizzes;
                const completedItems = completedLessons + passedQuizzes;
                const progress =
                  totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

                return {
                  ...enrollment,
                  progress: Math.round(progress),
                  completedLessons: completedLessons,
                  totalLessons: structure.totalLessons,
                  quizProgress: {
                    totalQuizzes: structure.totalQuizzes,
                    passedQuizzes: passedQuizzes,
                    failedQuizzes: failedQuizzes,
                    notAttemptedQuizzes: notAttemptedQuizzes,
                    completedQuizzes: passedQuizzes + failedQuizzes,
                    quizDetails: quizDetails,
                  },
                  isCourseCompleted:
                    totalItems > 0 && completedItems === totalItems,
                };
              } catch (error) {
                console.error(
                  `Error processing enrollment for user ${enrollment.userId}:`,
                  error
                );
                return {
                  ...enrollment,
                  progress: 0,
                  completedLessons: 0,
                  totalLessons: structure.totalLessons,
                  quizProgress: {
                    totalQuizzes: structure.totalQuizzes,
                    passedQuizzes: 0,
                    failedQuizzes: 0,
                    notAttemptedQuizzes: 0,
                  },
                  isCourseCompleted: false,
                };
              } finally {
                setProgressLoading((prev) => ({
                  ...prev,
                  [enrollment.userId]: false,
                }));
              }
            })
          );

          setEnrollments(enrollmentsWithProgress);
          setFilteredEnrollments(enrollmentsWithProgress);
          setPagination({
            current: page,
            pageSize: size,
            total: totalElements,
          });
        } else {
          message.error(enrollmentResponse.message || "Lỗi khi tải dữ liệu");
        }
      } catch (error) {
        console.error("Load enrollments error:", error);
        message.error(
          error.response?.data?.message || "Lỗi khi tải danh sách đăng ký"
        );
      } finally {
        setLoading(false);
      }
    },
    [courseId]
  );

  // Refresh progress cho một user cụ thể
  const refreshUserProgress = useCallback(
    async (userId) => {
      if (!courseId) return;

      setProgressLoading((prev) => ({ ...prev, [userId]: true }));

      try {
        // Lấy lại tiến độ lesson
        const lessonProgressResponse =
          await LessonService.getUserProgressByCourseForAdmin(courseId, userId);
        const completedLessons =
          lessonProgressResponse.success &&
          Array.isArray(lessonProgressResponse.data)
            ? lessonProgressResponse.data.filter(
                (item) => item.status === "COMPLETED"
              ).length
            : 0;

        // Lấy lại tiến độ quiz
        let passedQuizzes = 0;
        let failedQuizzes = 0;
        let notAttemptedQuizzes = 0;
        let quizDetails = [];

        if (courseStructure.totalQuizzes > 0) {
          const quizStatusPromises = courseStructure.quizzes.map((quiz) =>
            QuizService.getQuizStatusForUser(quiz.id, userId)
          );
          const quizStatuses = await Promise.all(quizStatusPromises);
          quizStatuses.forEach((statusRes, index) => {
            const quizInfo = courseStructure.quizzes[index];
            const detail = {
              quizId: quizInfo.id,
              quizTitle: quizInfo.title,
              isPassed: false,
              isCompleted: false,
            };
            if (statusRes.success && statusRes.data) {
              detail.isPassed = statusRes.data.isPassed || false;
              detail.isCompleted = statusRes.data.isCompleted || false;
              if (detail.isPassed) passedQuizzes++;
              else if (detail.isCompleted) failedQuizzes++;
              else notAttemptedQuizzes++;
            } else {
              notAttemptedQuizzes++;
            }
            quizDetails.push(detail);
          });
        }

        const totalItems =
          courseStructure.totalLessons + courseStructure.totalQuizzes;
        const completedItems = completedLessons + passedQuizzes;
        const progress =
          totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

        setEnrollments((prev) =>
          prev.map((enrollment) =>
            enrollment.userId === userId
              ? {
                  ...enrollment,
                  progress: Math.round(progress),
                  completedLessons: completedLessons,
                  totalLessons: courseStructure.totalLessons,
                  quizProgress: {
                    totalQuizzes: courseStructure.totalQuizzes,
                    passedQuizzes: passedQuizzes,
                    failedQuizzes: failedQuizzes,
                    notAttemptedQuizzes: notAttemptedQuizzes,
                    completedQuizzes: passedQuizzes + failedQuizzes,
                    quizDetails: quizDetails,
                  },
                  isCourseCompleted:
                    totalItems > 0 && completedItems === totalItems,
                }
              : enrollment
          )
        );
      } catch (error) {
        console.error(`Error refreshing progress for user ${userId}:`, error);
        message.error("Lỗi khi cập nhật tiến độ");
      } finally {
        setProgressLoading((prev) => ({ ...prev, [userId]: false }));
      }
    },
    [courseId, courseStructure]
  );

  // Tìm kiếm enrollments
  const handleSearch = useCallback(
    (value) => {
      setSearchText(value);
      if (!value.trim()) {
        setFilteredEnrollments(enrollments);
        return;
      }

      const filtered = enrollments.filter(
        (enrollment) =>
          enrollment.username?.toLowerCase().includes(value.toLowerCase()) ||
          enrollment.email?.toLowerCase().includes(value.toLowerCase()) ||
          enrollment.userId?.toString().includes(value)
      );
      setFilteredEnrollments(filtered);
    },
    [enrollments]
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (visible && courseId) {
      loadEnrollmentsWithProgress(1, pagination.pageSize);
      setSearchText("");
    }
  }, [visible, courseId]);

  // Table columns
  const columns = [
    {
      title: "Học viên",
      key: "user",
      width: 200,
      render: (_, record) => (
        <Space direction="vertical" size={8} style={{ width: "100%" }}>
          <Space>
            <Avatar
              size="default"
              src={record.avatar}
              style={{
                backgroundColor: !record.avatar
                  ? generateAvatarColor(record.userId)
                  : undefined,
              }}
              icon={!record.avatar ? <UserOutlined /> : null}
            >
              {!record.avatar && record.username?.charAt(0)?.toUpperCase()}
            </Avatar>
            <div style={{ flex: 1 }}>
              <div
                style={{ fontWeight: 600, fontSize: "14px", lineHeight: "1.2" }}
              >
                {record.username || `Học viên ${record.userId}`}
              </div>
              <div
                style={{
                  fontSize: "12px",
                  color: "#1890ff",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  marginTop: "2px",
                }}
              >
                <MailOutlined style={{ fontSize: "11px" }} />
                {record.email || `user${record.userId}@example.com`}
              </div>
            </div>
          </Space>
          <div
            style={{
              fontSize: "11px",
              color: "#666",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              background: "#f5f5f5",
              padding: "2px 8px",
              borderRadius: "4px",
              marginLeft: "40px",
            }}
          >
            <IdcardOutlined style={{ fontSize: "10px" }} />
            ID: {record.userId}
          </div>
        </Space>
      ),
    },
    {
      title: "Ngày đăng ký",
      dataIndex: "enrollDate",
      key: "enrollDate",
      width: 120,
      render: (date) => (
        <Space direction="vertical" size={2}>
          <div style={{ fontSize: "12px", fontWeight: 500 }}>
            {safeFormatDate(date)}
          </div>
          <div style={{ fontSize: "10px", color: "#999" }}>
            {date
              ? new Date(date).toLocaleTimeString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : ""}
          </div>
        </Space>
      ),
    },
    {
      title: (
        <div>
          Tiến độ học tập
          <Tooltip title="Tiến độ được tính dựa trên cả lesson và quiz">
            <InfoCircleOutlined
              style={{ marginLeft: 4, color: "#1890ff", fontSize: "12px" }}
            />
          </Tooltip>
        </div>
      ),
      dataIndex: "progress",
      key: "progress",
      width: 250,
      render: (progress, record) => {
        const totalItems =
          record.totalLessons + record.quizProgress.totalQuizzes;
        const completedItems =
          record.completedLessons + record.quizProgress.passedQuizzes;

        return (
          <div>
            <Space direction="vertical" style={{ width: "100%" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Tooltip
                  title={`${completedItems}/${totalItems} mục đã hoàn thành (Lesson: ${record.completedLessons}/${record.totalLessons}, Quiz Pass: ${record.quizProgress.passedQuizzes}/${record.quizProgress.totalQuizzes})`}
                >
                  <Progress
                    percent={Math.round(progress || 0)}
                    size="small"
                    status={progress >= 100 ? "success" : "active"}
                    format={(percent) => `${percent}%`}
                    style={{ flex: 1, marginRight: 8 }}
                  />
                </Tooltip>
                <Button
                  type="text"
                  size="small"
                  icon={<ReloadOutlined />}
                  loading={progressLoading[record.userId]}
                  onClick={() => refreshUserProgress(record.userId)}
                  title="Làm mới tiến độ"
                />
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "11px",
                  color: "#666",
                }}
              >
                <div style={{ display: "flex", alignItems: "center" }}>
                  <PlayCircleOutlined style={{ marginRight: 4 }} />
                  {record.completedLessons || 0}/{record.totalLessons || 0} bài
                  học
                </div>
                <Popover
                  content={
                    <QuizProgressDetail quizProgress={record.quizProgress} />
                  }
                  title="Tiến độ Quiz"
                  trigger="hover"
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      cursor: "pointer",
                      color:
                        record.quizProgress.passedQuizzes > 0
                          ? "#52c41a"
                          : "#666",
                    }}
                  >
                    <FileTextOutlined style={{ marginRight: 4 }} />
                    {record.quizProgress.passedQuizzes || 0}/
                    {record.quizProgress.totalQuizzes || 0} quiz
                    <EyeOutlined style={{ marginLeft: 4, fontSize: 10 }} />
                  </div>
                </Popover>
              </div>

              {record.totalDuration > 0 && (
                <div style={{ fontSize: "10px", color: "#999" }}>
                  <ClockCircleOutlined style={{ marginRight: 4 }} />
                  Tổng thời gian: {Math.floor(record.totalDuration / 60)} phút
                </div>
              )}
            </Space>
          </div>
        );
      },
    },
    {
      title: "Tổng số mục",
      key: "totalItems",
      width: 100,
      render: (_, record) => {
        const totalItems =
          (record.totalLessons || 0) + (record.quizProgress?.totalQuizzes || 0);
        const completedItems =
          (record.completedLessons || 0) +
          (record.quizProgress?.passedQuizzes || 0);

        return (
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: "14px",
                fontWeight: 600,
                color:
                  completedItems === totalItems && totalItems > 0
                    ? "#52c41a"
                    : "#1890ff",
              }}
            >
              {completedItems}/{totalItems}
            </div>
            <div style={{ fontSize: "10px", color: "#999" }}>
              {totalItems === 0 ? "Chưa có nội dung" : "mục"}
            </div>
          </div>
        );
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 140,
      render: (status, record) => {
        // Kiểm tra hoàn thành khóa học
        if (record.isCourseCompleted) {
          return (
            <Tag icon={<CheckCircleOutlined />} color="green">
              Hoàn thành
            </Tag>
          );
        }

        // Kiểm tra đã pass tất cả quiz
        if (
          record.quizProgress &&
          record.quizProgress.passedQuizzes ===
            record.quizProgress.totalQuizzes &&
          record.quizProgress.totalQuizzes > 0
        ) {
          return (
            <Tooltip title="Đã pass tất cả quiz, chưa hoàn thành bài học">
              <Tag icon={<TrophyOutlined />} color="cyan">
                Đã pass quiz
              </Tag>
            </Tooltip>
          );
        }

        const statusConfig = {
          ACTIVE: {
            color: record.isExpired ? "orange" : "blue",
            text: record.isExpired ? "Sắp hết hạn" : "Đang học",
          },
          COMPLETED: { color: "green", text: "Hoàn thành" },
          CANCELLED: { color: "red", text: "Đã hủy" },
          EXPIRED: { color: "orange", text: "Hết hạn" },
        };

        const config = statusConfig[status] || {
          color: "default",
          text: status,
        };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: "Ngày hết hạn",
      dataIndex: "expiryDate",
      key: "expiryDate",
      width: 120,
      render: (date, record) => (
        <Space direction="vertical" size={2}>
          <div style={{ fontSize: "12px", fontWeight: 500 }}>
            {date ? safeFormatDate(date) : "Không giới hạn"}
          </div>
          {date && (
            <div
              style={{
                fontSize: "10px",
                color: record.isExpired ? "#ff4d4f" : "#52c41a",
                fontWeight: 500,
              }}
            >
              {record.isExpired ? "Đã hết hạn" : "Còn hiệu lực"}
            </div>
          )}
        </Space>
      ),
    },
    {
      title: "Hoạt động cuối",
      dataIndex: "lastActivity",
      key: "lastActivity",
      width: 120,
      render: (date) => (
        <Space direction="vertical" size={2}>
          <div style={{ fontSize: "12px", fontWeight: 500 }}>
            {safeFormatDate(date)}
          </div>
          {date && (
            <div style={{ fontSize: "10px", color: "#999" }}>
              {new Date(date).toLocaleTimeString("vi-VN", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          )}
        </Space>
      ),
    },
  ];

  // Statistics - bao gồm cả quiz
  const stats = useMemo(() => {
    const data = searchText ? filteredEnrollments : enrollments;

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
  }, [enrollments, filteredEnrollments, searchText]);

  const displayData = searchText ? filteredEnrollments : enrollments;
  const displayTotal = searchText
    ? filteredEnrollments.length
    : pagination.total;

  return (
    <Modal
      title={
        <div>
          <UserOutlined style={{ marginRight: 8 }} />
          Danh sách học viên - {courseName}
          <div
            style={{
              fontSize: "12px",
              color: "#666",
              fontWeight: "normal",
              marginTop: "4px",
            }}
          >
            Tổng số: {enrollments.length} học viên{" "}
            {searchText && `(Đang tìm: "${searchText}")`}
          </div>
        </div>
      }
      open={visible}
      onCancel={onClose}
      width={1400}
      footer={null}
      destroyOnClose
      style={{ top: 20 }}
    >
      {/* Statistics với quiz */}
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

      {/* Action bar với tìm kiếm */}
      <div
        style={{
          marginBottom: "16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Search
          placeholder="Tìm kiếm theo tên, email hoặc ID học viên..."
          allowClear
          enterButton={<SearchOutlined />}
          size="middle"
          style={{ width: 400 }}
          onSearch={handleSearch}
          onChange={(e) => handleSearch(e.target.value)}
        />
        <Button
          icon={<ReloadOutlined />}
          onClick={() =>
            loadEnrollmentsWithProgress(pagination.current, pagination.pageSize)
          }
          loading={loading}
        >
          Tải lại
        </Button>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        dataSource={displayData.map((item, index) => ({
          ...item,
          key: item.id || index,
        }))}
        loading={loading}
        rowKey="key"
        scroll={{ x: 1200 }}
        locale={{
          emptyText: searchText ? (
            <Empty
              description={`Không tìm thấy học viên phù hợp với "${searchText}"`}
            />
          ) : (
            <Empty description="Chưa có học viên đăng ký" />
          ),
        }}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: displayTotal,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} của ${total} học viên`,
          onChange: (page, pageSize) => {
            if (!searchText) {
              loadEnrollmentsWithProgress(page, pageSize);
            }
          },
          onShowSizeChange: (current, size) => {
            if (!searchText) {
              loadEnrollmentsWithProgress(1, size);
            }
          },
        }}
      />
    </Modal>
  );
};

export default CourseEnrollmentList;
