// src/components/course/enrollmentComponents/CertificateModal.js
import React, { useState, useEffect, useCallback } from "react";
import {
  Modal,
  Button,
  message,
  Space,
  Card,
  Tag,
  Statistic,
  Row,
  Col,
  Alert,
  Descriptions,
  Empty,
  Spin,
  Popconfirm,
} from "antd";
import {
  SafetyCertificateOutlined,
  DeleteOutlined,
  DownloadOutlined,
  EyeOutlined,
  ExclamationCircleOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import CertificateService from "../../../services/CertificateService";

const CertificateModal = ({
  visible = false,
  onClose = () => {},
  username = "",
  userId = null,
  courseId = null,
  courseName = "",
  progress = 0,
}) => {
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const loadCertificate = useCallback(async () => {
    if (!userId || !courseId) return;

    setLoading(true);
    try {
      const result = await CertificateService.getUserCertificate(
        userId,
        courseId
      );

      if (result.success) {
        setCertificate(result.certificate);
        message.success("Đã tải thông tin certificate");
      } else {
        setCertificate(null);
        if (result.message !== "Certificate không tồn tại") {
          message.warning(result.message || "Không tìm thấy certificate");
        }
      }
    } catch (error) {
      console.error("Error loading certificate:", error);
      message.error("Lỗi khi tải certificate");
    } finally {
      setLoading(false);
    }
  }, [userId, courseId]);

  // Load certificate khi mở modal
  useEffect(() => {
    if (visible && userId && courseId) {
      loadCertificate();
    } else {
      setCertificate(null);
    }
  }, [visible, userId, courseId, loadCertificate]);

  const handleDeleteCertificate = async () => {
    if (!certificate) return;

    setDeleting(true);
    try {
      const result = await CertificateService.deleteCertificate(certificate.id);

      if (result.success) {
        message.success("Đã xóa certificate thành công");
        setCertificate(null);
        onClose();
      } else {
        message.error(result.message || "Không thể xóa certificate");
      }
    } catch (error) {
      console.error("Error deleting certificate:", error);
      message.error("Lỗi khi xóa certificate");
    } finally {
      setDeleting(false);
    }
  };
  const handleViewCertificate = () => {
    if (certificate?.certificateCode) {
      window.open(
        `/certificates/code/${certificate.certificateCode}`,
        "_blank"
      );
    }
  };

  const handleDownloadCertificate = () => {
    message.info("Chức năng download đang được phát triển");
    // TODO: Implement download certificate
  };

  return (
    <Modal
      title={
        <Space>
          <SafetyCertificateOutlined />
          Quản lý Certificate
          <Tag color="blue">{username}</Tag>
        </Space>
      }
      open={visible}
      onCancel={onClose}
      width={700}
      footer={[
        <Button key="close" onClick={onClose}>
          Đóng
        </Button>,
        certificate && (
          <Popconfirm
            key="delete"
            title="Xóa Certificate"
            description="Bạn có chắc chắn muốn xóa certificate này?"
            icon={<ExclamationCircleOutlined style={{ color: "red" }} />}
            onConfirm={handleDeleteCertificate}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true, loading: deleting }}
          >
            <Button danger icon={<DeleteOutlined />} loading={deleting}>
              Xóa Certificate
            </Button>
          </Popconfirm>
        ),
      ]}
    >
      {/* Thông tin khóa học và user */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={12}>
            <Statistic
              title="Khóa học"
              value={courseName}
              valueStyle={{ fontSize: "14px" }}
            />
          </Col>
          <Col span={12}>
            <Statistic
              title="Học viên"
              value={username}
              valueStyle={{ fontSize: "14px" }}
            />
          </Col>
        </Row>
        <Row gutter={16} style={{ marginTop: 16 }}>
          <Col span={12}>
            <Statistic
              title="Tiến độ hoàn thành"
              value={progress}
              suffix="%"
              valueStyle={{
                fontSize: "14px",
                color: progress >= 100 ? "#52c41a" : "#faad14",
              }}
            />
          </Col>
          <Col span={12}>
            <Statistic
              title="User ID"
              value={userId || "N/A"}
              valueStyle={{ fontSize: "14px" }}
            />
          </Col>
        </Row>
      </Card>

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
          <p style={{ marginTop: 16 }}>Đang tải thông tin certificate...</p>
        </div>
      )}

      {/* Không có certificate */}
      {!loading && !certificate && (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <span>
              Học viên chưa có certificate cho khóa học này
              {progress < 100 && (
                <Alert
                  message="Học viên chưa hoàn thành khóa học"
                  description={`Tiến độ hiện tại: ${progress}%. Certificate chỉ được cấp khi hoàn thành 100% khóa học.`}
                  type="warning"
                  showIcon
                  style={{ marginTop: 16 }}
                />
              )}
            </span>
          }
        />
      )}

      {/* Hiển thị certificate */}
      {!loading && certificate && (
        <>
          <Alert
            message="✅ Học viên đã có certificate"
            description="Certificate đã được cấp cho học viên này."
            type="success"
            showIcon
            style={{ marginBottom: 16 }}
          />

          <Card
            title={
              <Space>
                <SafetyCertificateOutlined />
                Thông tin Certificate
              </Space>
            }
            style={{ marginBottom: 16 }}
            extra={
              <Space>
                <Button
                  icon={<EyeOutlined />}
                  onClick={handleViewCertificate}
                  size="small"
                >
                  Xem
                </Button>
                <Button
                  icon={<DownloadOutlined />}
                  onClick={handleDownloadCertificate}
                  size="small"
                >
                  Tải
                </Button>
              </Space>
            }
          >
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="Tên Certificate">
                <strong>{certificate.certificateName}</strong>
              </Descriptions.Item>
              <Descriptions.Item label="Mã số">
                <Tag color="blue">{certificate.certificateCode}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Ngày cấp">
                {certificate.formattedDate}
              </Descriptions.Item>
              <Descriptions.Item label="Xếp loại">
                <Tag
                  color={
                    certificate.grade === "EXCELLENT"
                      ? "gold"
                      : certificate.grade === "GOOD"
                      ? "green"
                      : certificate.grade === "FAIR"
                      ? "blue"
                      : "default"
                  }
                >
                  {certificate.gradeDisplayName}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Điểm trung bình">
                <strong style={{ color: certificate.gradeColor }}>
                  {certificate.averageScoreFormatted}
                </strong>
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag color="green">Đã cấp</Tag>
              </Descriptions.Item>
            </Descriptions>
          </Card>

          <Alert
            message="⚠️ Cảnh báo"
            description="Việc xóa certificate sẽ xóa vĩnh viễn chứng chỉ của học viên. Hành động này không thể hoàn tác."
            type="warning"
            showIcon
          />
        </>
      )}
    </Modal>
  );
};

export default CertificateModal;
