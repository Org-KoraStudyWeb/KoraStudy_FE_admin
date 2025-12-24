// src/pages/admin/PaymentManagement.js
import React, { useState, useEffect, useCallback } from "react";
import {
  Table,
  Tag,
  Space,
  Button,
  Card,
  Row,
  Col,
  Statistic,
  Input,
  message,
  Tooltip,
  DatePicker,
  Select,
  Modal,
  Descriptions,
  Badge,
  Typography,
  Divider,
} from "antd";
import {
  ReloadOutlined,
  DollarCircleOutlined,
  FilePdfOutlined,
  FileExcelOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  SearchOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import paymentService from "../services/PaymentService";
import PageHeader from "../components/common/PageHeader";

const { Search } = Input;
const { RangePicker } = DatePicker;
const { Option } = Select;
const { Text } = Typography;

const PaymentManagement = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
    pageSizeOptions: ["10", "20", "50", "100"],
  });
  const [filters, setFilters] = useState({
    keyword: "",
    status: null,
    paymentMethod: null,
    dateRange: null,
  });
  const [stats, setStats] = useState({
    totalRevenue: 0,
    statusCounts: {},
  });
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  // Fetch payments with current filters
  const fetchPayments = useCallback(
    async (page = 1, pageSize = 10) => {
      setLoading(true);
      try {
        // Convert AntD page (1-based) to API page (0-based)
        const apiPage = Math.max(0, page - 1);
        const apiSize = pageSize;

        // Build params based on whether we have filters
        const hasFilters =
          filters.keyword ||
          filters.status ||
          filters.paymentMethod ||
          filters.dateRange;

        let params = {};

        if (hasFilters) {
          // Use search endpoint with filters
          params = {
            page: apiPage,
            size: apiSize,
            sort: ["dateTransaction,desc"],
          };

          if (filters.keyword) params.keyword = filters.keyword;
          if (filters.status) params.status = filters.status;
          if (filters.paymentMethod)
            params.paymentMethod = filters.paymentMethod;
          if (filters.dateRange && filters.dateRange.length === 2) {
            const [startDate, endDate] = filters.dateRange;
            params.fromDate = startDate.format("YYYY-MM-DD");
            params.toDate = endDate.format("YYYY-MM-DD");
          }

          console.log("🔍 Searching with params:", params);

          const response = await paymentService.searchPayments(params);

          if (response.success) {
            const paymentsData = response.data.payments || [];
            const paginationData = response.data.pagination || {};

            setPayments(paymentsData);
            setPagination((prev) => ({
              ...prev,
              current: page,
              pageSize: pageSize,
              total: paginationData.totalItems || 0,
            }));

            if (paymentsData.length === 0 && page > 1) {
              // If no results on current page, go to first page
              fetchPayments(1, pageSize);
            }
          } else {
            message.error(response.message || "Tìm kiếm thất bại");
          }
        } else {
          // Use getAllPayments endpoint (no filters)
          params = {
            page: apiPage,
            size: apiSize,
            sortBy: "dateTransaction",
            sortDirection: "desc",
          };

          console.log("📋 Getting all payments with params:", params);

          const response = await paymentService.getAllPayments(params);

          if (response.success) {
            const paymentsData = response.data.payments || [];
            const paginationData = response.data.pagination || {};

            setPayments(paymentsData);
            setPagination((prev) => ({
              ...prev,
              current: page,
              pageSize: pageSize,
              total: paginationData.totalItems || 0,
            }));
          } else {
            message.error(
              response.message || "Lỗi khi tải danh sách thanh toán"
            );
          }
        }
      } catch (error) {
        console.error("Error fetching payments:", error);
        message.error("Đã xảy ra lỗi không mong muốn");
      } finally {
        setLoading(false);
      }
    },
    [filters]
  );

  // Fetch statistics
  const fetchStats = useCallback(async () => {
    try {
      const [revenueRes, statusRes] = await Promise.all([
        paymentService.getTotalRevenue(),
        paymentService.getPaymentStatusStats(),
      ]);

      let totalRevenue = 0;
      if (revenueRes.success && revenueRes.data) {
        totalRevenue = revenueRes.data.totalRevenue || revenueRes.data || 0;
      }

      let statusCounts = {};
      if (statusRes.success && statusRes.data) {
        statusCounts = statusRes.data.statusStats || statusRes.data || {};
      }

      setStats({
        totalRevenue: totalRevenue,
        statusCounts: statusCounts,
      });
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  }, []);

  // Initial load and when filters change
  useEffect(() => {
    fetchPayments(1, pagination.pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Handle table pagination change
  const handleTableChange = (newPagination) => {
    fetchPayments(newPagination.current, newPagination.pageSize);
  };

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  // Handle date range change
  const handleDateChange = (dates) => {
    setFilters((prev) => ({ ...prev, dateRange: dates }));
  };

  // Handle export
  const handleExport = async (type) => {
    try {
      message.loading(`Đang xuất file ${type.toUpperCase()}...`, 0);

      const exportParams = {};
      if (filters.dateRange && filters.dateRange.length === 2) {
        const [startDate, endDate] = filters.dateRange;
        exportParams.fromDate = startDate.format("YYYY-MM-DD");
        exportParams.toDate = endDate.format("YYYY-MM-DD");
      }

      let response;
      if (type === "pdf") {
        response = await paymentService.exportToPdf(exportParams);
      } else {
        response = await paymentService.exportToExcel(exportParams);
      }

      message.destroy();

      if (response.success) {
        message.success(response.message);
      } else {
        message.error(response.message);
      }
    } catch (error) {
      message.destroy();
      message.error("Xuất file thất bại");
    }
  };

  // Handle view payment details
  const handleViewDetail = async (paymentId) => {
    try {
      const response = await paymentService.getPaymentDetails(paymentId);
      if (response.success) {
        setSelectedPayment(response.data);
        setDetailModalVisible(true);
      } else {
        message.error(response.message);
      }
    } catch (error) {
      message.error("Lỗi khi lấy chi tiết thanh toán");
    }
  };

  // Reset all filters
  const handleResetFilters = () => {
    setFilters({
      keyword: "",
      status: null,
      paymentMethod: null,
      dateRange: null,
    });
  };

  // Table columns
  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 70,
      align: "center",
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: "Người mua",
      dataIndex: "buyerName",
      key: "buyerName",
      width: 180,
      render: (name, record) => (
        <div>
          <div style={{ fontWeight: "500" }}>{name}</div>
          <Text type="secondary" style={{ fontSize: "12px" }}>
            {record.buyerEmail}
          </Text>
        </div>
      ),
    },
    {
      title: "Khóa học",
      dataIndex: "courseTitle",
      key: "courseTitle",
      width: 200,
      ellipsis: true,
    },
    {
      title: "Số tiền",
      dataIndex: "amount",
      key: "amount",
      width: 140,
      render: (amount) => (
        <Text strong style={{ color: "#1890ff" }}>
          {paymentService.formatCurrency(amount)}
        </Text>
      ),
      align: "right",
      sorter: (a, b) => a.amount - b.amount,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status) => {
        const { color, text } = paymentService.getPaymentStatusTag(status);
        return <Tag color={color}>{text}</Tag>;
      },
      filters: [
        { text: "Thành công", value: "SUCCESS" },
        { text: "Đang chờ", value: "PENDING" },
        { text: "Thất bại", value: "FAILED" },
        { text: "Đã hủy", value: "CANCELLED" },
        { text: "Đã hoàn tiền", value: "REFUNDED" },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: "Phương thức",
      dataIndex: "paymentMethod",
      key: "paymentMethod",
      width: 120,
      render: (method) => (
        <Tag color={method === "VNPAY" ? "blue" : "green"}>
          {method || "N/A"}
        </Tag>
      ),
    },
    {
      title: "Ngày giao dịch",
      dataIndex: "transactionDate",
      key: "transactionDate",
      width: 180,
      render: (date) => paymentService.formatDate(date),
      sorter: (a, b) =>
        new Date(a.transactionDate) - new Date(b.transactionDate),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 100,
      fixed: "right",
      render: (_, record) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => handleViewDetail(record.id)}
          style={{ color: "#1890ff" }}
        >
          Chi tiết
        </Button>
      ),
    },
  ];

  // Payment Detail Modal
  const renderPaymentDetail = () => {
    if (!selectedPayment) return null;

    const { color, text } = paymentService.getPaymentStatusTag(
      selectedPayment.status
    );

    return (
      <Modal
        title="Chi tiết Thanh toán"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Đóng
          </Button>,
        ]}
        width={700}
      >
        <Descriptions bordered column={1} size="small">
          <Descriptions.Item label="Mã giao dịch">
            <Text copyable>{selectedPayment.transactionCode || "N/A"}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="ID thanh toán">
            {selectedPayment.id}
          </Descriptions.Item>
          <Descriptions.Item label="Trạng thái">
            <Badge color={color} text={text} />
          </Descriptions.Item>
          <Descriptions.Item label="Số tiền">
            <Text strong style={{ fontSize: "16px", color: "#1890ff" }}>
              {paymentService.formatCurrency(selectedPayment.amount)}
            </Text>
          </Descriptions.Item>
          <Descriptions.Item label="Người mua">
            <div>
              <div>
                <strong>{selectedPayment.buyerName}</strong>
              </div>
              <div>{selectedPayment.buyerEmail}</div>
              <div>{selectedPayment.buyerPhone || "N/A"}</div>
            </div>
          </Descriptions.Item>
          <Descriptions.Item label="Người dùng">
            {selectedPayment.userFullName} (ID: {selectedPayment.userId})
          </Descriptions.Item>
          <Descriptions.Item label="Khóa học">
            <div>
              <div>
                <strong>{selectedPayment.courseTitle}</strong>
              </div>
              <div>ID: {selectedPayment.courseId}</div>
              <div>
                Giá:{" "}
                {paymentService.formatCurrency(selectedPayment.coursePrice)}
              </div>
            </div>
          </Descriptions.Item>
          <Descriptions.Item label="Phương thức thanh toán">
            {selectedPayment.paymentMethod || "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label="Thời gian giao dịch">
            {paymentService.formatDate(selectedPayment.transactionDate)}
          </Descriptions.Item>
          <Descriptions.Item label="Ngày tạo">
            {paymentService.formatDate(selectedPayment.createdAt)}
          </Descriptions.Item>
          <Descriptions.Item label="Cập nhật lần cuối">
            {paymentService.formatDate(selectedPayment.updatedAt)}
          </Descriptions.Item>
        </Descriptions>
      </Modal>
    );
  };

  return (
    <div style={{ padding: 24, backgroundColor: "#f0f2f5" }}>
      <PageHeader
        title="Quản lý Thanh toán"
        subtitle="Quản lý và theo dõi tất cả giao dịch thanh toán"
      />

      {/* Stats Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} className="stats-card" hoverable>
            <Statistic
              title="Tổng doanh thu"
              value={stats.totalRevenue}
              precision={0}
              formatter={(value) => paymentService.formatCurrency(value)}
              prefix={<DollarCircleOutlined style={{ color: "#52c41a" }} />}
              valueStyle={{ color: "#52c41a", fontSize: "24px" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} className="stats-card" hoverable>
            <Statistic
              title="Thành công"
              value={stats.statusCounts.SUCCESS || 0}
              valueStyle={{ color: "#3f8600" }}
              prefix={<CheckCircleOutlined style={{ color: "#3f8600" }} />}
              suffix={
                <Badge
                  count={stats.statusCounts.SUCCESS || 0}
                  style={{ backgroundColor: "#52c41a" }}
                />
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} className="stats-card" hoverable>
            <Statistic
              title="Đang chờ"
              value={stats.statusCounts.PENDING || 0}
              valueStyle={{ color: "#1890ff" }}
              prefix={<ClockCircleOutlined style={{ color: "#1890ff" }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} className="stats-card" hoverable>
            <Statistic
              title="Thất bại"
              value={stats.statusCounts.FAILED || 0}
              valueStyle={{ color: "#cf1322" }}
              prefix={<CloseCircleOutlined style={{ color: "#cf1322" }} />}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Card with Filters and Table */}
      <Card
        title={
          <Space>
            <FilterOutlined />
            <span>Bộ lọc và Tìm kiếm</span>
          </Space>
        }
        extra={
          <Space>
            <Tooltip title="Xuất PDF">
              <Button
                type="primary"
                danger
                icon={<FilePdfOutlined />}
                onClick={() => handleExport("pdf")}
                disabled={payments.length === 0}
              >
                PDF
              </Button>
            </Tooltip>
            <Tooltip title="Xuất Excel">
              <Button
                type="primary"
                icon={<FileExcelOutlined />}
                onClick={() => handleExport("excel")}
                disabled={payments.length === 0}
              >
                Excel
              </Button>
            </Tooltip>
            <Tooltip title="Làm mới">
              <Button
                icon={<ReloadOutlined />}
                onClick={() => fetchPayments(1, pagination.pageSize)}
                loading={loading}
              />
            </Tooltip>
          </Space>
        }
        bordered={false}
        style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.1)" }}
      >
        {/* Filter Row */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} md={6}>
            <Search
              placeholder="Tìm kiếm theo tên, email, mã GD..."
              prefix={<SearchOutlined />}
              value={filters.keyword}
              onChange={(e) => handleFilterChange("keyword", e.target.value)}
              onSearch={() => fetchPayments(1, pagination.pageSize)}
              allowClear
              enterButton="Tìm"
              size="middle"
            />
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Select
              placeholder="Trạng thái"
              style={{ width: "100%" }}
              value={filters.status}
              onChange={(value) => handleFilterChange("status", value)}
              allowClear
              size="middle"
            >
              <Option value="SUCCESS">Thành công</Option>
              <Option value="PENDING">Đang chờ</Option>
              <Option value="FAILED">Thất bại</Option>
              <Option value="CANCELLED">Đã hủy</Option>
              <Option value="REFUNDED">Đã hoàn tiền</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Select
              placeholder="Phương thức"
              style={{ width: "100%" }}
              value={filters.paymentMethod}
              onChange={(value) => handleFilterChange("paymentMethod", value)}
              allowClear
              size="middle"
            >
              <Option value="VNPAY">VNPay</Option>
              <Option value="MOMO">MoMo</Option>
              <Option value="ZALOPAY">ZaloPay</Option>
              <Option value="CASH">Tiền mặt</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <RangePicker
              style={{ width: "100%" }}
              value={filters.dateRange}
              onChange={handleDateChange}
              format="DD/MM/YYYY"
              placeholder={["Từ ngày", "Đến ngày"]}
              size="middle"
            />
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Space>
              <Button
                type="primary"
                onClick={() => fetchPayments(1, pagination.pageSize)}
                loading={loading}
                icon={<SearchOutlined />}
              >
                Áp dụng
              </Button>
              <Button onClick={handleResetFilters}>Xóa bộ lọc</Button>
            </Space>
          </Col>
        </Row>

        <Divider style={{ margin: "16px 0" }} />

        {/* Results Summary */}
        <div
          style={{
            marginBottom: 16,
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <Text type="secondary">
            Hiển thị {payments.length} kết quả
            {filters.keyword && ` cho từ khóa: "${filters.keyword}"`}
            {filters.status && `, trạng thái: ${filters.status}`}
          </Text>
          <Text strong>Tổng cộng: {pagination.total} thanh toán</Text>
        </div>

        {/* Table */}
        <Table
          columns={columns}
          dataSource={payments}
          rowKey="id"
          loading={loading}
          pagination={{
            ...pagination,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} thanh toán`,
          }}
          onChange={handleTableChange}
          scroll={{ x: 1300 }}
          size="middle"
          bordered
        />
      </Card>

      {/* Payment Detail Modal */}
      {renderPaymentDetail()}
    </div>
  );
};

// Add some CSS for better appearance
const styles = `
  .stats-card {
    transition: all 0.3s;
  }
  .stats-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }
  .ant-table-thead > tr > th {
    background-color: #fafafa !important;
    font-weight: 600 !important;
  }
`;

// Add styles to head
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

export default PaymentManagement;
