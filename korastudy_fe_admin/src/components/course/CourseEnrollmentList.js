// src/components/course/CourseEnrollmentList.js
import React, { useState, useEffect } from 'react';
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
  Progress
} from 'antd';
import {
  UserOutlined,
  CalendarOutlined,
  PercentageOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import CourseService from '../../services/CourseService';

const CourseEnrollmentList = ({ visible, onClose, courseId, courseName }) => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });

  // Load enrollments
  const loadEnrollments = async (page = 1, size = 10) => {
    if (!courseId) return;
    
    setLoading(true);
    try {
      const response = await CourseService.getCourseEnrollments(courseId, {
        page: page - 1,
        size
      });

      if (response.success) {
        setEnrollments(response.data.content || response.data);
        setPagination({
          current: page,
          pageSize: size,
          total: response.data.totalElements || response.data.length
        });
      } else {
        message.error(response.message);
      }
    } catch (error) {
      message.error('Lỗi khi tải danh sách đăng ký');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchEnrollments = async () => {
      if (visible && courseId) {
        setLoading(true);
        try {
          const response = await CourseService.getCourseEnrollments(courseId, {
            page: 0,
            size: 10
          });

          if (response.success) {
            setEnrollments(response.data.content || response.data);
            setPagination({
              current: 1,
              pageSize: 10,
              total: response.data.totalElements || response.data.length
            });
          } else {
            message.error(response.message);
          }
        } catch (error) {
          message.error('Lỗi khi tải danh sách đăng ký');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchEnrollments();
  }, [visible, courseId]);

  // Table columns
  const columns = [
    {
      title: 'Học viên',
      key: 'user',
      render: (_, record) => (
        <Space>
          <Avatar 
            src={record.user?.avatar} 
            icon={<UserOutlined />}
            size="small"
          />
          <div>
            <div style={{ fontWeight: 500 }}>
              {record.user?.fullName || record.user?.username}
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              {record.user?.email}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Ngày đăng ký',
      dataIndex: 'enrollmentDate',
      key: 'enrollmentDate',
      width: 120,
      render: (date) => (
        <Space>
          <CalendarOutlined />
          {CourseService.formatDate(date)}
        </Space>
      ),
    },
    {
      title: 'Tiến độ',
      dataIndex: 'progress',
      key: 'progress',
      width: 150,
      render: (progress) => (
        <div>
          <Progress
            percent={Math.round(progress || 0)}
            size="small"
            status={progress >= 100 ? 'success' : 'active'}
          />
          <span style={{ fontSize: '12px', color: '#666' }}>
            {Math.round(progress || 0)}% hoàn thành
          </span>
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status, record) => {
        const progress = record.progress || 0;
        if (progress >= 100) {
          return <Tag color="green">Hoàn thành</Tag>;
        } else if (progress > 0) {
          return <Tag color="blue">Đang học</Tag>;
        } else {
          return <Tag color="orange">Chưa bắt đầu</Tag>;
        }
      },
    },
    {
      title: 'Ngày hoàn thành',
      dataIndex: 'completedAt',
      key: 'completedAt',
      width: 120,
      render: (date) => (
        date ? CourseService.formatDate(date) : '-'
      ),
    }
  ];

  // Statistics
  const getStatistics = () => {
    const completed = enrollments.filter(e => (e.progress || 0) >= 100).length;
    const inProgress = enrollments.filter(e => (e.progress || 0) > 0 && (e.progress || 0) < 100).length;
    const notStarted = enrollments.filter(e => (e.progress || 0) === 0).length;
    const avgProgress = enrollments.length > 0 
      ? enrollments.reduce((sum, e) => sum + (e.progress || 0), 0) / enrollments.length 
      : 0;

    return { completed, inProgress, notStarted, avgProgress };
  };

  const stats = getStatistics();

  return (
    <Modal
      title={`Danh sách học viên - ${courseName}`}
      open={visible}
      onCancel={onClose}
      width={1000}
      footer={null}
      destroyOnClose
    >
      {/* Statistics */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng học viên"
              value={enrollments.length}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Hoàn thành"
              value={stats.completed}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Đang học"
              value={stats.inProgress}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tiến độ TB"
              value={Math.round(stats.avgProgress)}
              suffix="%"
              prefix={<PercentageOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Action bar */}
      <div style={{ marginBottom: '16px', textAlign: 'right' }}>
        <Button
          icon={<ReloadOutlined />}
          onClick={() => loadEnrollments(pagination.current, pagination.pageSize)}
          loading={loading}
        >
          Tải lại
        </Button>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        dataSource={enrollments}
        loading={loading}
        rowKey="id"
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} của ${total} học viên`,
          onChange: (page, pageSize) => {
            loadEnrollments(page, pageSize);
          },
          onShowSizeChange: (current, size) => {
            loadEnrollments(1, size);
          },
        }}
      />
    </Modal>
  );
};

export default CourseEnrollmentList;
