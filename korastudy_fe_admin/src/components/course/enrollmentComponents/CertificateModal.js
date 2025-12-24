// src/components/course/enrollmentComponents/CertificateModal.js
import React, { useState } from "react";
import {
  Modal,
  Form,
  Input,
  DatePicker,
  Select,
  Button,
  message,
  Space,
  Card,
  Tag,
  Statistic,
  Row,
  Col,
  Alert,
} from "antd";
import {
  FileTextOutlined,
  CheckCircleOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";

const CertificateModal = ({
  visible = false,
  onClose = () => {},
  username = "",
  userId = null,
  courseId = null,
  courseName = "",
  progress = 0,
  onIssueCertificate = () => {},
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values) => {
    if (!onIssueCertificate) {
      message.error("Chức năng chưa được triển khai");
      return;
    }

    setLoading(true);
    try {
      await onIssueCertificate({
        userId,
        courseId,
        ...values,
      });

      message.success("Trao certificate thành công");
      form.resetFields();
      onClose();
    } catch (error) {
      console.error("Error issuing certificate:", error);
      message.error("Lỗi khi trao certificate");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={
        <Space>
          <SafetyCertificateOutlined />
          Trao Certificate
          <Tag color="blue">{username}</Tag>
        </Space>
      }
      open={visible}
      onCancel={onClose}
      width={700}
      footer={null}
    >
      {progress < 100 && (
        <Alert
          message="⚠️ Học viên chưa hoàn thành khóa học"
          description={`Tiến độ hiện tại: ${progress}%. Bạn có chắc chắn muốn trao certificate?`}
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

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
              title="Tiến độ hoàn thành"
              value={progress}
              suffix="%"
              valueStyle={{
                fontSize: "14px",
                color: progress >= 100 ? "#52c41a" : "#faad14",
              }}
            />
          </Col>
        </Row>
      </Card>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          certificateType: "completion",
        }}
      >
        <Form.Item
          label="Loại Certificate"
          name="certificateType"
          rules={[
            { required: true, message: "Vui lòng chọn loại certificate" },
          ]}
        >
          <Select placeholder="Chọn loại certificate">
            <Select.Option value="completion">
              <FileTextOutlined /> Hoàn thành khóa học
            </Select.Option>
            <Select.Option value="excellence">
              <SafetyCertificateOutlined /> Xuất sắc
            </Select.Option>
            <Select.Option value="participation">
              <CheckCircleOutlined /> Tham gia
            </Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="Ngày cấp"
          name="issuedDate"
          rules={[{ required: true, message: "Vui lòng chọn ngày cấp" }]}
        >
          <DatePicker style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item
          label="Số hiệu Certificate"
          name="certificateNumber"
          rules={[
            { required: true, message: "Vui lòng nhập số hiệu certificate" },
          ]}
          extra="Ví dụ: CERT-2024-001"
        >
          <Input placeholder="CERT-YYYY-XXX" />
        </Form.Item>

        <Form.Item label="Ghi chú (tùy chọn)" name="notes">
          <Input.TextArea placeholder="Ghi chú thêm về certificate" rows={3} />
        </Form.Item>

        <div style={{ textAlign: "right" }}>
          <Space>
            <Button onClick={onClose}>Hủy</Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              icon={<SafetyCertificateOutlined />}
            >
              Trao Certificate
            </Button>
          </Space>
        </div>
      </Form>

      <Alert
        message="ℹ️ Lưu ý"
        description="Certificate sẽ được lưu trong hệ thống. Học viên có thể xem và tải certificate từ tài khoản của họ."
        type="info"
        showIcon
        style={{ marginTop: 16 }}
      />
    </Modal>
  );
};

export default CertificateModal;
