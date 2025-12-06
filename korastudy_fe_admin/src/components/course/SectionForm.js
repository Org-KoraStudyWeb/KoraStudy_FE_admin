// src/components/course/SectionForm.js
import React, { useState } from "react";
import { Modal, Form, Input, InputNumber, Button, Space, message } from "antd";
import SectionService from "../../services/SectionService";

const SectionForm = ({
  visible,
  onClose,
  onSuccess,
  courseId,
  editingSection = null,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values) => {
    console.log("Section form submitted:", values);

    setLoading(true);
    try {
      const sectionData = {
        sectionName: values.sectionName,
        orderIndex: values.orderIndex || 1,
        courseId: courseId,
      };

      console.log("Section data:", sectionData);

      let response;
      if (editingSection) {
        response = await SectionService.updateSection(
          editingSection.id,
          sectionData
        );
      } else {
        response = await SectionService.createSection(sectionData);
      }

      console.log("Section API response:", response);

      if (response.success) {
        message.success(response.message || "Lưu chương học thành công!");
        form.resetFields();
        onClose();
        onSuccess && onSuccess();
      } else {
        message.error(response.message || "Có lỗi xảy ra");
      }
    } catch (error) {
      console.error("Section form error:", error);
      message.error("Có lỗi xảy ra khi lưu chương học");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  // Set form values when editing
  React.useEffect(() => {
    if (visible && editingSection) {
      form.setFieldsValue({
        sectionName: editingSection.sectionName, // ✅ Sửa thành sectionName
        orderIndex: editingSection.orderIndex,
      });
    } else if (visible && !editingSection) {
      form.resetFields();
    }
  }, [visible, editingSection, form]);

  return (
    <Modal
      title={editingSection ? "Chỉnh sửa chương học" : "Thêm chương học mới"}
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={600}
      destroyOnHidden
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        autoComplete="off"
      >
        <Form.Item
          label="Tên chương học"
          name="sectionName" // ✅ Sửa thành sectionName
          rules={[
            { required: true, message: "Vui lòng nhập tên chương học!" },
            { max: 200, message: "Tên không được vượt quá 200 ký tự!" },
          ]}
        >
          <Input placeholder="Nhập tên chương học" />
        </Form.Item>

        {/* ✅ XÓA sectionDescription vì không có trong DTO */}

        <Form.Item
          label="Thứ tự hiển thị"
          name="orderIndex"
          rules={[
            { type: "number", min: 1, message: "Thứ tự phải lớn hơn 0!" },
          ]}
        >
          <InputNumber
            min={1}
            placeholder="Nhập thứ tự hiển thị"
            style={{ width: "100%" }}
          />
        </Form.Item>

        <Form.Item style={{ textAlign: "right", marginTop: "24px" }}>
          <Space>
            <Button onClick={handleCancel}>Hủy</Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              {editingSection ? "Cập nhật" : "Tạo mới"}
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default SectionForm;
