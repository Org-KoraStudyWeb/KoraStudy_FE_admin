// src/components/course/enrollmentComponents/EnrollmentTable.js
import React from "react";
import {
  Table,
  Space,
  Avatar,
  Button,
  Tag,
  Progress,
  Tooltip,
  Popover,
  Empty,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  IdcardOutlined,
  PlayCircleOutlined,
  FileTextOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  ReloadOutlined,
  TrophyOutlined,
  InfoCircleOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import QuizProgressDetail from "./QuizProgressDetail";
import EnrollmentActions from "./EnrollmentActions";

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

const EnrollmentTable = ({
  enrollments = [],
  loading = false,
  pagination = { current: 1, pageSize: 5, total: 0 },
  progressLoading = {},
  onRefreshProgress = () => {},
  onViewProgressDetail = () => {},
  onViewQuizResults = () => {},
  onIssueCertificate = () => {},
  onTableChange = () => {},
}) => {
  const columns = [
    {
      title: "Học viên",
      key: "user",
      width: 200,
      fixed: "left",
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
                style={{
                  fontWeight: 600,
                  fontSize: "14px",
                  lineHeight: "1.2",
                }}
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
              style={{
                marginLeft: 4,
                color: "#1890ff",
                fontSize: "12px",
              }}
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
                  onClick={() => onRefreshProgress(record.userId)}
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
        if (record.isCourseCompleted) {
          return (
            <Tag icon={<CheckCircleOutlined />} color="green">
              Hoàn thành
            </Tag>
          );
        }

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
    {
      title: "Thao tác",
      key: "action",
      width: 80,
      fixed: "right",
      render: (_, record) => (
        <EnrollmentActions
          record={record}
          onViewProgressDetail={onViewProgressDetail}
          onViewQuizResults={onViewQuizResults}
          onIssueCertificate={onIssueCertificate}
        />
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={
        Array.isArray(enrollments)
          ? enrollments.map((item, index) => ({
              ...item,
              key: item.id || index,
            }))
          : []
      }
      loading={loading}
      rowKey="key"
      scroll={{ x: 1300 }}
      locale={{
        emptyText: <Empty description="Không có dữ liệu để hiển thị" />,
      }}
      pagination={{
        current: pagination?.current || 1,
        pageSize: pagination?.pageSize || 5,
        total: pagination?.total || 0,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total, range) =>
          `${range[0]}-${range[1]} của ${total} học viên`,
        onChange: onTableChange,
      }}
    />
  );
};

export default EnrollmentTable;
