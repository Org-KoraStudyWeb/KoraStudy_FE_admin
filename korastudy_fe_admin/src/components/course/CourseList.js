// src/components/course/CourseList.js
import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  Button,
  Space,
  Popconfirm,
  Input,
  Tag,
  Card,
  Row,
  Col,
  Statistic,
  Tooltip,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  EyeOutlined,
  BookOutlined,
  UserOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import CourseService from "../../services/CourseService";

const { Search } = Input;

const CourseList = ({
  courses,
  loading,
  stats,
  pagination,
  onLoadCourses,
  onSearchCourses,
  onChangePage,
  onShowModal,
  onDeleteCourse,
  onTogglePublish,
  onShowEnrollmentList,
}) => {
  const navigate = useNavigate();

  // ========== TABLE ==========
  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 60,
      sorter: true,
      fixed: "left",
    },
    {
      title: "Hình ảnh",
      dataIndex: "courseImageUrl",
      key: "courseImageUrl",
      width: 80,
      render: (url) => (
        <div
          style={{
            width: 50,
            height: 50,
            backgroundColor: "#f0f0f0",
            borderRadius: 4,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          {url ? (
            <img
              src={url}
              alt="Course"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          ) : (
            <BookOutlined style={{ fontSize: 20, color: "#999" }} />
          )}
        </div>
      ),
    },
    {
      title: "Tên khóa học",
      dataIndex: "courseName",
      key: "courseName",
      width: 150,
      onCell: () => ({
        style: {
          whiteSpace: "normal",
          wordBreak: "break-word",
        },
      }),
      render: (text) => (
        <div style={{ whiteSpace: "normal", wordBreak: "break-word" }}>
          <strong>{text}</strong>
        </div>
      ),
    },
    {
      title: "Mô tả",
      dataIndex: "courseDescription",
      key: "courseDescription",
      width: 250,
      onCell: () => ({
        style: {
          whiteSpace: "normal",
          wordBreak: "break-word",
        },
      }),
      render: (text) => (
        <div
          style={{
            whiteSpace: "normal",
            wordBreak: "break-word",
            maxHeight: "100px",
            overflow: "hidden",
            position: "relative",
          }}
        >
          <div
            dangerouslySetInnerHTML={{
              __html: text || "—",
            }}
            style={{
              fontSize: "14px",
              lineHeight: "1.5",
            }}
          />
          {text?.length > 150 && (
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: "24px",
                background: "linear-gradient(transparent, white)",
              }}
            />
          )}
        </div>
      ),
    },
    {
      title: "Giá",
      dataIndex: "coursePrice",
      key: "coursePrice",
      width: 100,
      render: (coursePrice) => (
        <span>
          {coursePrice ? CourseService.formatCurrency(coursePrice) : "Miễn phí"}
        </span>
      ),
    },
    {
      title: "Cấp độ",
      dataIndex: "courseLevel",
      key: "courseLevel",
      width: 100,
      render: (courseLevel) => {
        let color;
        switch (courseLevel) {
          case "BEGINNER":
            color = "green";
            break;
          case "INTERMEDIATE":
            color = "orange";
            break;
          case "ADVANCED":
            color = "red";
            break;
          default:
            color = "gray";
        }
        return (
          <Tag color={color}>
            {courseLevel
              ? courseLevel.charAt(0) + courseLevel.slice(1).toLowerCase()
              : "Không xác định"}
          </Tag>
        );
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "published",
      key: "published",
      width: 100,
      render: (published) => (
        <Tag color={published ? "green" : "orange"}>
          {published ? "Đã xuất bản" : "Nháp"}
        </Tag>
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 120,
      render: (date) => CourseService.formatDate(date),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 200,
      fixed: "right",
      render: (_, record) => (
        <Space wrap>
          <Tooltip title="Xem chi tiết">
            <Button
              icon={<EyeOutlined />}
              size="small"
              onClick={() => navigate(`/admin/courses/${record.id}`)}
            />
          </Tooltip>
          <Tooltip title="Xem học viên">
            <Button
              icon={<UserOutlined />}
              size="small"
              onClick={() => onShowEnrollmentList(record)}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              icon={<EditOutlined />}
              size="small"
              onClick={() => onShowModal(record)}
            />
          </Tooltip>
          <Tooltip title={record.published ? "Hủy xuất bản" : "Xuất bản"}>
            <Button
              icon={
                record.published ? (
                  <ClockCircleOutlined />
                ) : (
                  <CheckCircleOutlined />
                )
              }
              size="small"
              type={record.published ? "default" : "primary"}
              onClick={() => onTogglePublish(record.id, record.published)}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Popconfirm
              title="Bạn có chắc chắn muốn xóa khóa học này?"
              description="Hành động này không thể hoàn tác."
              onConfirm={() => onDeleteCourse(record.id)}
              okText="Xóa"
              cancelText="Hủy"
              okType="danger"
            >
              <Button icon={<DeleteOutlined />} size="small" danger />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      {/* ==== THỐNG KÊ ==== */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng khóa học"
              value={stats.totalCourses}
              prefix={<BookOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Đã xuất bản"
              value={stats.publishedCourses}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: "#3f8600" }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Chưa xuất bản"
              value={stats.unpublishedCourses}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: "#cf1322" }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng học viên"
              value={stats.totalEnrollments}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* ==== BẢNG KHÓA HỌC ==== */}
      <Card
        title="Quản lý khóa học"
        extra={
          <Space>
            <Button
              icon={<ReloadOutlined />}
              onClick={onLoadCourses}
              loading={loading}
            >
              Tải lại
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => onShowModal()}
            >
              Thêm khóa học
            </Button>
          </Space>
        }
      >
        {/* Tìm kiếm */}
        <div style={{ marginBottom: 16 }}>
          <Search
            placeholder="Tìm kiếm khóa học..."
            allowClear
            enterButton={<SearchOutlined />}
            size="large"
            onSearch={(value) => onSearchCourses(value)}
            onChange={(e) => e.target.value === "" && onSearchCourses("")}
            style={{ maxWidth: 400, width: "100%" }}
          />
        </div>

        {/* Bảng danh sách khóa học */}
        <Table
          columns={columns}
          dataSource={courses}
          loading={loading}
          rowKey="id"
          tableLayout="fixed"
          scroll={{ x: "max-content" }}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} khóa học`,
            onChange: onChangePage,
            onShowSizeChange: onChangePage,
          }}
        />
      </Card>
    </div>
  );
};

export default CourseList;
