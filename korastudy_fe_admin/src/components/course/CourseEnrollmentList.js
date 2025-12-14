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
} from "@ant-design/icons";
import EnrollmentService from "../../services/EnrollmentService";
import LessonService from "../../services/LessonService";

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

  // Load enrollments và progress
  const loadEnrollmentsWithProgress = useCallback(
    async (page = 1, size = 5) => {
      if (!courseId) {
        message.error("Không tìm thấy khóa học");
        return;
      }

      setLoading(true);
      try {
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

          // 2. Kết hợp enrollment data với progress data
          const enrollmentsWithProgress = await Promise.all(
            enrollmentsData.map(async (enrollment) => {
              try {
                setProgressLoading((prev) => ({
                  ...prev,
                  [enrollment.userId]: true,
                }));

                let userProgress = {
                  progress: 0,
                  completedLessons: 0,
                  totalLessons: 0,
                  lastActivity: null,
                  totalDuration: 0,
                  // Thêm trường để xác định hoàn thành khóa học
                  isCourseCompleted: false,
                };

                // Load progress cho user cụ thể trong khóa học này
                try {
                  const progressResponse =
                    await LessonService.getUserProgressByCourseForAdmin(
                      courseId,
                      enrollment.userId
                    );

                  if (progressResponse.success && progressResponse.data) {
                    const progressData = progressResponse.data;

                    // Xử lý dữ liệu progress: API trả về array của từng bài học
                    if (Array.isArray(progressData)) {
                      // Tính toán tổng hợp từ danh sách bài học
                      const totalLessons = progressData.length;
                      const completedLessons = progressData.filter(
                        (item) => item.status === "COMPLETED"
                      ).length;
                      const progressPercentage =
                        totalLessons > 0
                          ? (completedLessons / totalLessons) * 100
                          : 0;

                      // Tính tổng thời gian
                      const totalDuration = progressData.reduce(
                        (sum, item) => sum + (item.timeSpent || 0),
                        0
                      );

                      // Lấy thời gian hoạt động cuối
                      const lastActivity =
                        progressData.length > 0
                          ? progressData.reduce(
                              (latest, item) =>
                                new Date(item.lastAccessed) > new Date(latest)
                                  ? item.lastAccessed
                                  : latest,
                              progressData[0].lastAccessed
                            )
                          : null;

                      userProgress = {
                        progress: progressPercentage,
                        completedLessons,
                        totalLessons,
                        lastActivity,
                        totalDuration,
                        // Xác định hoàn thành khóa học: tất cả bài học đều COMPLETED
                        isCourseCompleted:
                          totalLessons > 0 && completedLessons === totalLessons,
                      };
                    } else if (progressData.progressPercentage !== undefined) {
                      // Nếu API trả về trực tiếp tổng hợp
                      userProgress = {
                        progress: progressData.progressPercentage,
                        completedLessons: progressData.completedLessons || 0,
                        totalLessons: progressData.totalLessons || 0,
                        lastActivity:
                          progressData.lastActivity ||
                          progressData.lastAccessed,
                        totalDuration: progressData.totalDuration || 0,
                        isCourseCompleted: progressData.isCompleted || false,
                      };
                    }
                  }
                } catch (progressError) {
                  console.error(
                    `Error loading progress for user ${enrollment.userId}:`,
                    progressError
                  );
                }

                return {
                  ...enrollment,
                  ...userProgress,
                  progress: Math.min(100, Math.max(0, userProgress.progress)),
                  completedLessons: userProgress.completedLessons,
                  totalLessons: userProgress.totalLessons,
                  lastActivity: userProgress.lastActivity,
                  totalDuration: userProgress.totalDuration,
                  isCourseCompleted: userProgress.isCourseCompleted,
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
                  totalLessons: 0,
                  lastActivity: null,
                  totalDuration: 0,
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
        const response = await LessonService.getUserProgressByCourseForAdmin(
          courseId,
          userId
        );

        if (response.success && response.data) {
          const progressData = response.data;
          let progressInfo = {
            progress: 0,
            completedLessons: 0,
            totalLessons: 0,
            lastActivity: null,
            isCourseCompleted: false,
          };

          if (Array.isArray(progressData)) {
            const totalLessons = progressData.length;
            const completedLessons = progressData.filter(
              (item) => item.status === "COMPLETED"
            ).length;
            const progressPercentage =
              totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

            // FIX: Tìm lastAccessed hoặc completedDate hoặc startedDate
            let lastActivity = null;
            if (progressData.length > 0) {
              // Tìm ngày gần nhất trong các trường timestamp
              const allDates = progressData.flatMap((item) =>
                [
                  item.lastAccessed,
                  item.completedDate,
                  item.startedDate,
                  item.updatedAt,
                ].filter(Boolean)
              );

              if (allDates.length > 0) {
                // Tìm ngày mới nhất
                lastActivity = allDates.reduce((latest, date) => {
                  const date1 = new Date(latest);
                  const date2 = new Date(date);
                  return date2 > date1 ? date : latest;
                }, allDates[0]);
              }
            }

            progressInfo = {
              progress: progressPercentage,
              completedLessons,
              totalLessons,
              lastActivity,
              isCourseCompleted:
                totalLessons > 0 && completedLessons === totalLessons,
            };
          } else if (progressData.progressPercentage !== undefined) {
            // Nếu API trả về trực tiếp tổng hợp
            progressInfo = {
              progress: progressData.progressPercentage,
              completedLessons: progressData.completedLessons || 0,
              totalLessons: progressData.totalLessons || 0,
              lastActivity:
                progressData.lastActivity ||
                progressData.lastAccessed ||
                progressData.updatedAt,
              isCourseCompleted: progressData.isCompleted || false,
            };
          }

          setEnrollments((prev) =>
            prev.map((enrollment) =>
              enrollment.userId === userId
                ? {
                    ...enrollment,
                    progress: Math.min(100, Math.max(0, progressInfo.progress)),
                    completedLessons: progressInfo.completedLessons,
                    totalLessons: progressInfo.totalLessons,
                    lastActivity:
                      progressInfo.lastActivity || enrollment.lastActivity, // Giữ lại nếu null
                    isCourseCompleted: progressInfo.isCourseCompleted,
                  }
                : enrollment
            )
          );
          message.success("Đã cập nhật tiến độ");
        } else {
          message.warning("Không tìm thấy dữ liệu tiến độ");
        }
      } catch (error) {
        console.error(`Error refreshing progress for user ${userId}:`, error);
        message.error("Lỗi khi cập nhật tiến độ");
      } finally {
        setProgressLoading((prev) => ({ ...prev, [userId]: false }));
      }
    },
    [courseId]
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

  useEffect(() => {
    if (visible && courseId) {
      loadEnrollmentsWithProgress(1, pagination.pageSize);
      setSearchText("");
    }
  }, [visible, courseId, loadEnrollmentsWithProgress, pagination.pageSize]);

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
      title: "Tiến độ học tập",
      dataIndex: "progress",
      key: "progress",
      width: 200,
      render: (progress, record) => (
        <div>
          <Space direction="vertical" style={{ width: "100%" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Progress
                percent={Math.round(progress || 0)}
                size="small"
                status={progress >= 100 ? "success" : "active"}
                format={(percent) => `${percent}%`}
                style={{ flex: 1, marginRight: 8 }}
              />
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
                fontSize: "11px",
                color: "#666",
                display: "flex",
                alignItems: "center",
              }}
            >
              <PlayCircleOutlined style={{ marginRight: 4 }} />
              {record.completedLessons || 0}/{record.totalLessons || 0} bài học
            </div>
            {record.totalDuration > 0 && (
              <div style={{ fontSize: "10px", color: "#999" }}>
                Tổng thời gian: {Math.floor(record.totalDuration / 60)} phút
              </div>
            )}
          </Space>
        </div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status, record) => {
        // Ưu tiên xác định trạng thái dựa trên tiến độ học tập
        if (record.isCourseCompleted || record.progress >= 100) {
          return (
            <Tag icon={<CheckCircleOutlined />} color="green">
              Hoàn thành
            </Tag>
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

  // Statistics
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
        totalDuration: 0,
      };
    }

    const completed = data.filter(
      (e) => e.isCourseCompleted || e.progress >= 100
    ).length;
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
      width={1300}
      footer={null}
      destroyOnClose
      style={{ top: 20 }}
    >
      {/* Statistics */}
      <Row gutter={16} style={{ marginBottom: "24px" }}>
        <Col span={4}>
          <Card size="small">
            <Statistic
              title="Tổng học viên"
              value={enrollments.length}
              prefix={<UserOutlined />}
              valueStyle={{ fontSize: "24px" }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small">
            <Statistic
              title="Hoàn thành"
              value={stats.completed}
              valueStyle={{ color: "#52c41a", fontSize: "24px" }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small">
            <Statistic
              title="Đang học"
              value={stats.inProgress}
              valueStyle={{ color: "#1890ff", fontSize: "24px" }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small">
            <Statistic
              title="Chưa bắt đầu"
              value={stats.notStarted}
              valueStyle={{ color: "#faad14", fontSize: "24px" }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small">
            <Statistic
              title="Hết hạn"
              value={stats.expired}
              valueStyle={{ color: "#ff4d4f", fontSize: "24px" }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small">
            <Statistic
              title="Tiến độ TB"
              value={Math.round(stats.avgProgress)}
              suffix="%"
              prefix={<PercentageOutlined />}
              valueStyle={{ color: "#722ed1", fontSize: "24px" }}
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
        dataSource={displayData}
        loading={loading}
        rowKey="id"
        scroll={{ x: 1100 }}
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
