// src/components/course/CreateCourseForm.js
import React, { useState } from 'react';
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Switch,
  Upload,
  Button,
  Row,
  Col,
  message,
  Image,
  Space
} from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import CourseService from '../../services/CourseService';

const { TextArea } = Input;
const { Option } = Select;

const CreateCourseForm = ({ visible, onClose, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [uploadLoading, setUploadLoading] = useState(false);

  const handleSubmit = async (values) => {
    console.log('Form submitted with values:', values);
    
    setLoading(true);
    try {
      // Chuẩn bị dữ liệu
      const courseData = {
        courseName: values.courseName,
        courseDescription: values.courseDescription,
        price: values.price || 0,
        level: values.level || null,
        duration: values.duration || null,
        category: values.category || null,
        isPublished: values.isPublished || false,
        thumbnailUrl: imageUrl || null
      };

      console.log('Sending course data:', courseData);

      const response = await CourseService.createCourse(courseData);
      console.log('Service response:', response);

      if (response.success) {
        message.success(response.message || 'Tạo khóa học thành công!');
        form.resetFields();
        setImageUrl('');
        onClose();
        onSuccess && onSuccess();
      } else {
        message.error(response.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('Create course error:', error);
      message.error('Có lỗi xảy ra khi tạo khóa học');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (file) => {
    console.log('Uploading file:', file);
    
    // Validate file
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('Chỉ chấp nhận file hình ảnh!');
      return;
    }

    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error('Hình ảnh phải nhỏ hơn 5MB!');
      return;
    }

    try {
      setUploadLoading(true);
      
      // Tạo URL tạm thời
      const tempUrl = URL.createObjectURL(file);
      setImageUrl(tempUrl);
      
      console.log('Image URL set:', tempUrl);
      message.success('Upload hình ảnh thành công');
    } catch (error) {
      console.error('Upload error:', error);
      message.error('Lỗi khi upload hình ảnh');
    } finally {
      setUploadLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setImageUrl('');
    onClose();
  };

  return (
    <Modal
      title="Thêm khóa học mới"
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={800}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        autoComplete="off"
      >
        {/* Hình ảnh */}
        <Form.Item label="Hình ảnh khóa học">
          <div>
            {imageUrl && (
              <div style={{ marginBottom: 16 }}>
                <Image
                  width={200}
                  height={120}
                  src={imageUrl}
                  style={{ objectFit: 'cover', borderRadius: 8 }}
                />
              </div>
            )}
            <Upload
              name="file"
              listType="picture"
              maxCount={1}
              showUploadList={false}
              beforeUpload={(file) => {
                handleImageUpload(file);
                return false; // Prevent automatic upload
              }}
            >
              <Button icon={<UploadOutlined />} loading={uploadLoading}>
                {imageUrl ? 'Thay đổi hình ảnh' : 'Upload hình ảnh'}
              </Button>
            </Upload>
          </div>
        </Form.Item>

        {/* Tên khóa học */}
        <Form.Item
          label="Tên khóa học"
          name="courseName"
          rules={[
            { required: true, message: 'Vui lòng nhập tên khóa học!' },
            { max: 100, message: 'Tên khóa học không được vượt quá 100 ký tự!' }
          ]}
        >
          <Input placeholder="Nhập tên khóa học" />
        </Form.Item>

        {/* Mô tả */}
        <Form.Item
          label="Mô tả khóa học"
          name="courseDescription"
          rules={[
            { required: true, message: 'Vui lòng nhập mô tả khóa học!' },
            { max: 1000, message: 'Mô tả không được vượt quá 1000 ký tự!' }
          ]}
        >
          <TextArea
            rows={4}
            placeholder="Nhập mô tả khóa học"
          />
        </Form.Item>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item label="Giá khóa học (VND)" name="price">
              <InputNumber
                min={0}
                placeholder="0"
                style={{ width: '100%' }}
                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={value => value.replace(/\$\s?|(,*)/g, '')}
              />
            </Form.Item>
          </Col>
          
          <Col span={8}>
            <Form.Item label="Cấp độ" name="level">
              <Select placeholder="Chọn cấp độ" allowClear>
                <Option value="BEGINNER">Cơ bản</Option>
                <Option value="INTERMEDIATE">Trung cấp</Option>
                <Option value="ADVANCED">Nâng cao</Option>
              </Select>
            </Form.Item>
          </Col>
          
          <Col span={8}>
            <Form.Item label="Thời lượng (giờ)" name="duration">
              <InputNumber
                min={0}
                step={0.5}
                placeholder="0"
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Danh mục" name="category">
              <Select placeholder="Chọn danh mục khóa học" allowClear>
                <Option value="programming">Lập trình</Option>
                <Option value="design">Thiết kế</Option>
                <Option value="marketing">Marketing</Option>
                <Option value="business">Kinh doanh</Option>
                <Option value="language">Ngoại ngữ</Option>
                <Option value="other">Khác</Option>
              </Select>
            </Form.Item>
          </Col>
          
          <Col span={12}>
            <Form.Item
              label="Xuất bản ngay"
              name="isPublished"
              valuePropName="checked"
              tooltip="Bật để xuất bản khóa học ngay sau khi tạo"
            >
              <Switch checkedChildren="Có" unCheckedChildren="Không" />
            </Form.Item>
          </Col>
        </Row>

        {/* Buttons */}
        <Form.Item style={{ marginTop: '24px', textAlign: 'right' }}>
          <Space>
            <Button onClick={handleCancel}>
              Hủy
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              Tạo khóa học
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateCourseForm;
