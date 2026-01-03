// src/components/course/CourseList.js
import React, { useState } from "react";
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
  Select,
  InputNumber,
  Radio,
  Collapse,
  Badge,
  Form,
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
  FilterOutlined,
  ClearOutlined,
} from "@ant-design/icons";
import CourseService from "../../services/CourseService";

const { Search } = Input;
const { Option } = Select;


const CourseList = ({
  courses,
  loading,
  stats,
  pagination,
  filters,          // NEW: Current filter values
  onLoadCourses,
  onSearchCourses,
  onChangePage,
  onShowModal,
  onDeleteCourse,
  onTogglePublish,
  onShowEnrollmentList,
  onApplyFilters,   // NEW: Apply filters handler
  onResetFilters,   // NEW: Reset filters handler
}) => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  
  // Local state for active filter count
  const [activeFilterCount, setActiveFilterCount] = useState(0);

  // Calculate active filters count
  React.useEffect(() => {
    let count = 0;
    if (filters?.level) count++;
    if (filters?.minPrice !== null && filters?.minPrice !== undefined) count++;
    if (filters?.maxPrice !== null && filters?.maxPrice !== undefined) count++;
    if (filters?.isPublished !== null && filters?.isPublished !== undefined) count++;
    setActiveFilterCount(count);
  }, [filters]);

  // Handle filter form submit
  const handleFilterSubmit = (values) => {
    const filterParams = {
      level: values.level || null,
      minPrice: values.minPrice || null,
      maxPrice: values.maxPrice || null,
      isPublished: values.isPublished !== undefined ? values.isPublished : null,
    };
    onApplyFilters(filterParams);
  };

  // Handle reset filters
  const handleResetFilters = () => {
    form.resetFields();
    onResetFilters();
  };

  // Handle sort change
  const handleSortChange = (value) => {
    const [sortBy, sortDir] = value.split("-");
    onApplyFilters({ sortBy, sortDir });
  };

  // Handle table change (for sorting via column headers)
  const handleTableChange = (pagination, filters, sorter) => {
    if (sorter.field) {
      // Map frontend field names to backend field names
      let sortBy = sorter.field;
      if (sorter.field === "published") {
        sortBy = "isPublished";
      }
      const sortDir = sorter.order === "ascend" ? "asc" : "desc";
      onApplyFilters({ sortBy, sortDir });
    }
  };

  // ========== TABLE ==========
  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 60,
      sorter: true,
      sortOrder: filters?.sortBy === "id" ? (filters?.sortDir === "asc" ? "ascend" : "descend") : null,
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
      sorter: true,
      sortOrder: filters?.sortBy === "courseName" ? (filters?.sortDir === "asc" ? "ascend" : "descend") : null,
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
      sorter: true,
      sortOrder: filters?.sortBy === "coursePrice" ? (filters?.sortDir === "asc" ? "ascend" : "descend") : null,
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
      sorter: true,
      sortOrder: filters?.sortBy === "courseLevel" ? (filters?.sortDir === "asc" ? "ascend" : "descend") : null,
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
      sorter: true,
      sortOrder: filters?.sortBy === "isPublished" ? (filters?.sortDir === "asc" ? "ascend" : "descend") : null,
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
      sorter: true,
      sortOrder: filters?.sortBy === "createdAt" ? (filters?.sortDir === "asc" ? "ascend" : "descend") : null,
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
        {/* ==== FILTER PANEL ==== */}
        <Collapse
          style={{ marginBottom: 16 }}
          items={[
            {
              key: "1",
              label: (
                <Space>
                  <FilterOutlined />
                  <span>Bộ lọc nâng cao</span>
                  {activeFilterCount > 0 && (
                    <Badge count={activeFilterCount} style={{ backgroundColor: "#52c41a" }} />
                  )}
                </Space>
              ),
              children: (
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={handleFilterSubmit}
                  initialValues={{
                    level: filters?.level,
                    minPrice: filters?.minPrice,
                    maxPrice: filters?.maxPrice,
                    isPublished: filters?.isPublished,
                  }}
                >
                  <Row gutter={16}>
                    <Col xs={24} sm={12} md={6}>
                      <Form.Item label="Cấp độ" name="level">
                        <Select placeholder="Chọn cấp độ" allowClear>
                          <Option value="Beginner">Cơ bản</Option>
                          <Option value="Intermediate">Trung cấp</Option>
                          <Option value="Advanced">Nâng cao</Option>
                        </Select>
                      </Form.Item>
                    </Col>

                    <Col xs={24} sm={12} md={6}>
                      <Form.Item label="Giá tối thiểu (VND)" name="minPrice">
                        <InputNumber
                          placeholder="0"
                          min={0}
                          style={{ width: "100%" }}
                          formatter={(value) =>
                            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                          }
                          parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                        />
                      </Form.Item>
                    </Col>

                    <Col xs={24} sm={12} md={6}>
                      <Form.Item label="Giá tối đa (VND)" name="maxPrice">
                        <InputNumber
                          placeholder="0"
                          min={0}
                          style={{ width: "100%" }}
                          formatter={(value) =>
                            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                          }
                          parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                        />
                      </Form.Item>
                    </Col>

                    <Col xs={24} sm={12} md={6}>
                      <Form.Item label="Trạng thái xuất bản" name="isPublished">
                        <Radio.Group>
                          <Radio value={null}>Tất cả</Radio>
                          <Radio value={true}>Đã xuất bản</Radio>
                          <Radio value={false}>Chưa xuất bản</Radio>
                        </Radio.Group>
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row>
                    <Col span={24}>
                      <Space>
                        <Button
                          type="primary"
                          htmlType="submit"
                          icon={<FilterOutlined />}
                          loading={loading}
                        >
                          Áp dụng
                        </Button>
                        <Button
                          icon={<ClearOutlined />}
                          onClick={handleResetFilters}
                        >
                          Xóa bộ lọc
                        </Button>
                      </Space>
                    </Col>
                  </Row>
                </Form>
              ),
            },
          ]}
        />

        {/* ==== SORT & SEARCH ==== */}
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={12} md={8}>
            <Space direction="vertical" style={{ width: "100%" }}>
              <span style={{ fontWeight: 500 }}>Sắp xếp theo:</span>
              <Select
                style={{ width: "100%" }}
                placeholder="Chọn cách sắp xếp"
                value={`${filters?.sortBy || "id"}-${filters?.sortDir || "desc"}`}
                onChange={handleSortChange}
              >
                <Option value="id-desc">ID (Giảm dần)</Option>
                <Option value="id-asc">ID (Tăng dần)</Option>
                <Option value="courseName-asc">Tên (A-Z)</Option>
                <Option value="courseName-desc">Tên (Z-A)</Option>
                <Option value="coursePrice-asc">Giá (Thấp đến cao)</Option>
                <Option value="coursePrice-desc">Giá (Cao đến thấp)</Option>
                <Option value="courseLevel-asc">Cấp độ (Thấp đến cao)</Option>
                <Option value="courseLevel-desc">Cấp độ (Cao đến thấp)</Option>
                <Option value="isPublished-desc">Đã xuất bản trước</Option>
                <Option value="isPublished-asc">Chưa xuất bản trước</Option>
                <Option value="createdAt-desc">Mới nhất</Option>
                <Option value="createdAt-asc">Cũ nhất</Option>
                <Option value="viewCount-desc">Lượt xem (Cao đến thấp)</Option>
                <Option value="viewCount-asc">Lượt xem (Thấp đến cao)</Option>
              </Select>
            </Space>
          </Col>

          <Col xs={24} sm={12} md={16}>
            <Space direction="vertical" style={{ width: "100%" }}>
              <span style={{ fontWeight: 500 }}>Tìm kiếm:</span>
              <Search
                placeholder="Tìm kiếm theo tên hoặc mô tả khóa học..."
                allowClear
                enterButton={<SearchOutlined />}
                size="large"
                onSearch={(value) => onSearchCourses(value)}
                onChange={(e) => e.target.value === "" && onSearchCourses("")}
                style={{ width: "100%" }}
              />
            </Space>
          </Col>
        </Row>

        {/* Bảng danh sách khóa học */}
        <Table
          columns={columns}
          dataSource={courses}
          loading={loading}
          rowKey="id"
          tableLayout="fixed"
          scroll={{ x: "max-content" }}
          onChange={handleTableChange}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            pageSizeOptions: ["5", "20", "50"],
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
